import { authMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/api/webhook/register", "/sign-in", "/sign-up"];

export default authMiddleware({
  publicRoutes,
  async afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !publicRoutes.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    if (auth.userId) {
      try {
        const user = await clerkClient.users.getUser(auth.userId);
        const role = user.publicMetadata.role as string | undefined;

        // Redirect admin users to admin dashboard
        if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }

        // Redirect non-admin users away from admin routes
        if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Redirect logged in users to appropriate dashboard if they try to access a public route
        if (publicRoutes.includes(req.nextUrl.pathname)) {
          return NextResponse.redirect(
            new URL(
              role === "admin" ? "/admin/dashboard" : "/dashboard",
              req.url
            )
          );
        }
      } catch (error) {
        console.error("Error fetching user data from Clerk:", error);
        // Redirect to the new error page
        return NextResponse.redirect(new URL("/error", req.url));
      }
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
