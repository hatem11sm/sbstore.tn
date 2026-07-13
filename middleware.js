import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const withSecurityHeaders = (response) => {
  if (!response) return response;

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  return response;
};

export const middleware = async (request) => {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value || "";
  let path = request.nextUrl.pathname;
  if (
    path === "/api/login" ||
    path === "/api/signup" ||
    path === "/api/login-user" ||
    path === "/api/product" ||
    /^\/api\/product\/\w+$/.test(path) ||
    path === "/api/cart" ||
    path === "/api/category" ||
    /^\/api\/category\/[\w-]+$/.test(path) ||
    path === "/api/vendors" ||
    /^\/api\/reviews\/[\w-]+$/.test(path) ||
    path === "/api/promos/validate" ||
    path === "/api/relatedProducts" ||
    /^\/api\/relatedProducts\/\w+$/.test(path)
  ) {
    return withSecurityHeaders(NextResponse.next());
  }
  const loggedInUserNotAccessPath =
    path === "/loginpage" || path === "/signupPage";

  if (loggedInUserNotAccessPath) {
    if (authToken) {
      return withSecurityHeaders(
        NextResponse.redirect(new URL("/", request.nextUrl))
      );
    }
  } else {
    if (!authToken) {
      if (path.startsWith("/api") || path === "/dashboard") {
        return withSecurityHeaders(
          NextResponse.redirect(new URL("/", request.nextUrl))
        );
      }
    }
  }

  return withSecurityHeaders(NextResponse.next());
};
export const config = {
  matcher: ["/", "/loginpage", "/signupPage", "/dashboard", "/api/:path*"],
};
