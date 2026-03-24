import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login (except public routes)
  const publicRoutes = ['/', '/auth'];
  const isPublicRoute = publicRoutes.some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith('/auth')
  );

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users who haven't completed onboarding
  if (
    user &&
    !request.nextUrl.pathname.startsWith('/onboarding') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api')
  ) {
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (profile && !profile.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
