import { authMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/api/webhook/register", "/sign-in", "/sign-up"];

export default authMiddleware({
  publicRoutes,
  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !publicRoutes.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Redirect logged in users to /dashboard if they try to access a public route
    if (auth.userId && publicRoutes.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If the user is logged in, check their role for admin routes
    if (auth.userId && req.nextUrl.pathname.startsWith("/admin")) {
      // Assuming you store the user's role in their public metadata
      // You might need to adjust this based on how you're storing roles
      return clerkClient.users.getUser(auth.userId).then((user) => {
        const role = user.publicMetadata.role as string | undefined;
        if (role !== "admin") {
          return NextResponse.redirect(new URL("/", req.url));
        }
      });
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
