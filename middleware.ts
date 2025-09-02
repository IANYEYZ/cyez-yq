export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/announcements/:path*",
    "/assignments/:path*",
    "/resources/:path*",
    "/discussions/:path*",
    "/confessions/:path*",
    "/fund/:path*"
  ],
};
