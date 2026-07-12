import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Role-based route map — each dashboard path requires a specific role.
 */
const ROLE_ROUTES: Record<string, string[]> = {
  "/admindashboard": ["admin"],
  "/managerdashboard": ["admin", "manager"],
  "/teacherdashboard": ["admin", "manager", "teacher"],
  "/caregiverdashboard": ["admin", "manager", "caregiver"],
  "/parentdashboard": ["admin", "manager", "parent"],
};

/**
 * Check whether the request path starts with any of the protected prefixes.
 */
function isProtectedPath(pathname: string): string | false {
  const routes = Object.keys(ROLE_ROUTES);
  for (const route of routes) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return route;
    }
  }
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedBase = isProtectedPath(pathname);

  // Allow non-protected routes to pass through
  if (!protectedBase) {
    return NextResponse.next();
  }

  // Create a Supabase client using the request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );

  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated, redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Fetch the user's role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role as string | undefined;

  if (!userRole) {
    // No role found — redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Check role authorization
  const allowedRoles = ROLE_ROUTES[protectedBase];

  if (!allowedRoles.includes(userRole)) {
    // User's role doesn't match the dashboard — redirect to their own dashboard
    const roleRouteMap: Record<string, string> = {
      admin: "/admindashboard",
      manager: "/managerdashboard",
      teacher: "/teacherdashboard",
      caregiver: "/caregiverdashboard",
      parent: "/parentdashboard",
    };

    const targetDashboard = roleRouteMap[userRole];
    if (targetDashboard) {
      const url = request.nextUrl.clone();
      url.pathname = targetDashboard;
      return NextResponse.redirect(url);
    }

    // Fallback to login
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all dashboard paths:
     * - /admindashboard
     * - /managerdashboard
     * - /teacherdashboard
     * - /caregiverdashboard
     * - /parentdashboard
     *
     * And any sub-paths like /admindashboard/children
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
