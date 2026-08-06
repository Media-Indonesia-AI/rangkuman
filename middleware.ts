import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);

  if (!url.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const backend = process.env.API_BACKEND_URL;
  if (!backend) {
    return new NextResponse("API_BACKEND_URL not set", { status: 500 });
  }

  // Strip `/api`, keep the rest (e.g. /v1/auth/login/).
  const targetPath = url.pathname.replace(/^\/api/, "");
  const targetUrl = `${backend}${targetPath}${url.search}`;

  // Forward headers but drop `host` — the backend will set its own.
  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method)
        ? undefined
        : request.body,
      // @ts-expect-error — `duplex` is required to forward request bodies.
      duplex: "half",
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
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