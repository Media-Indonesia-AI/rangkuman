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

    // Read the upstream body fully into a buffer. We pre-decode
    // any `content-encoding` (e.g. gzip) here so the buffer we
    // hand NextResponse is plain JSON/text. NextResponse then
    // does its own negotiation based on the incoming request's
    // `Accept-Encoding`, and crucially does NOT have to inherit
    // the upstream's `content-encoding` header — that would
    // otherwise pair a freshly-recompressed body with the
    // upstream's encoding label, producing the `zstd body + gzip
    // header` mismatch the browser was choking on.
    const body = await upstream.arrayBuffer();
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