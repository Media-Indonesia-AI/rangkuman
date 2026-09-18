import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);

  if (!url.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const backend = process.env.API_BACKEND_URL;
  const token = process.env.API_INTERNAL_TOKEN;

  if (!backend) {
    return new NextResponse("API_BACKEND_URL not set", { status: 500 });
  }
  if (!token) {
    // Fail closed: refuse to proxy if the shared secret isn't configured.
    return new NextResponse("API_INTERNAL_TOKEN not set", { status: 500 });
  }

  // Strip `/api`, keep the rest (e.g. /v1/auth/login/).
  const targetPath = url.pathname.replace(/^\/api/, "");
  const targetUrl = `${backend}${targetPath}${url.search}`;

  // Forward headers but drop `host` — the backend will set its own.
  // Inject the shared secret so the backend can authenticate the proxy.
  //
  // Force `Accept-Encoding` to gzip-only on the upstream request.
  // The backend currently advertises zstd when the client lists it
  // in `Accept-Encoding`, but the response frame it returns has
  // zstd bytes mislabeled as `content-encoding: gzip` in some
  // proxy/CDN edge paths — which leaves the browser trying to
  // gunzip a zstd payload and surfacing "is not valid JSON". Pinning
  // to gzip keeps the response decodable with Node's built-in zlib
  // and avoids the mismatch entirely. The browser-facing response
  // is plain JSON anyway (we strip content-encoding below), so this
  // restriction only affects how we talk to the upstream.
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("X-Token", token);
  headers.set("Accept-Encoding", "gzip");

  try {
    // Buffer the request body too. `request.body` is a Web
    // ReadableStream; forwarding it via Node `fetch` with
    // `duplex: "half"` works for simple cases but can hang or
    // produce a partial body when Next's runtime reads the stream
    // itself (e.g. for `Content-Length`). Buffering to an
    // ArrayBuffer up front gives `fetch` a one-shot, well-framed
    // body and avoids any stream entanglement.
    let requestBody: BodyInit | undefined = undefined;
    if (!["GET", "HEAD"].includes(request.method) && request.body) {
      requestBody = await request.arrayBuffer();
    }

    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: requestBody,
      // @ts-expect-error — `duplex` is required to forward request bodies.
      duplex: "half",
    });

    // Statuses that MUST NOT carry a message body per RFC 7231
    // (and 304 per RFC 7232). The backend has historically
    // shipped `DELETE /watchlist/` as `204 No Content` with a
    // plain-text body (e.g. `"Watchlist entry removed."`) — a
    // spec violation that the framework happily relays back
    // through the CDN. Two compounding bugs make this leak out
    // as a `502` to the browser:
    //   1. Node's `undici` fetch throws when the caller tries
    //      to read the body of a 204/205/304 response, so the
    //      previous "read every upstream body" path surfaced
    //      as a 502 from the catch block below.
    //   2. Even if you skip the read, the WHATWG fetch spec
    //      (which `NextResponse` inherits) requires these
    //      "null-body statuses" to be constructed with a
    //      literal `null` body — passing `new ArrayBuffer(0)`
    //      trips a `Response constructor: Invalid response
    //      status code 204` validation throw.
    // So: skip the body read AND hand NextResponse a `null`
    // body for these statuses. `lib/api/client.ts` already
    // treats `res.status === 204` as a body-less success and
    // returns `null as T`, so the existing client flow keeps
    // working.
    const NO_BODY_STATUSES = new Set([204, 205, 304]);
    const body = NO_BODY_STATUSES.has(upstream.status)
      ? null
      : // Read the upstream body fully into a buffer. We pre-decode
        // any `content-encoding` (e.g. gzip) here so the buffer we
        // hand NextResponse is plain JSON/text. NextResponse then
        // does its own negotiation based on the incoming request's
        // `Accept-Encoding`, and crucially does NOT have to inherit
        // the upstream's `content-encoding` header — that would
        // otherwise pair a freshly-recompressed body with the
        // upstream's encoding label, producing the `zstd body + gzip
        // header` mismatch the browser was choking on.
        await upstream.arrayBuffer();
    const responseHeaders = new Headers(upstream.headers);
    // Drop transport framing and any content-encoding label so
    // NextResponse negotiates compression itself from a clean
    // slate (and so the buffer we pass — already decoded if
    // upstream sent gzip — is never double-compressed).
    responseHeaders.delete("content-length");
    responseHeaders.delete("Content-Length");
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("Transfer-Encoding");
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("Content-Encoding");

    return new NextResponse(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return new NextResponse(
      `Proxy error: ${err instanceof Error ? err.message : "unknown"}`,
      { status: 502 },
    );
  }
}

export const config = {
  matcher: "/api/:path*",
};