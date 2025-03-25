// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware();

// // export default auth({
// //   publicRoutes: ["/"],
// //   async afterAuth(auth, req) {
// //     // If the user is logged in and trying to access a protected route
// //     if (auth.userId && auth.isPublicRoute) {
// //       try {
// //         const user = await clerkClient.users.getUser(auth.userId);
// //         const metadata = user.privateMetadata as {
// //           role?: "patient" | "doctor";
// //         };

// //         // Redirect based on user role
// //         if (metadata.role === "doctor") {
// //           return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
// //         } else if (metadata.role === "patient") {
// //           return NextResponse.redirect(new URL("/patient/dashboard", req.url));
// //         }

// //         // If no role is set, redirect to role selection
// //         return NextResponse.redirect(new URL("/select-role", req.url));
// //       } catch (error) {
// //         console.error("Error in middleware:", error);
// //       }
// //     }
// //   },
// // });

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
