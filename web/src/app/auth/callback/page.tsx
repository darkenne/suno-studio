'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get('code');
    const hash = window.location.hash;

    if (!code && hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data, error }) => {
        if (error || !data.session) {
          router.replace(`/login?error=${encodeURIComponent(error?.message ?? 'no_session')}`);
        } else {
          router.replace('/');
        }
      });
      return;
    }

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
        } else {
          router.replace('/');
        }
      });
      return;
    }

    const errParam = searchParams.get('error_description') ?? searchParams.get('error') ?? 'auth_failed';
    router.replace(`/login?error=${encodeURIComponent(errParam)}`);
  }, [router, searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      fontFamily: 'var(--mono)',
      fontSize: '11px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--fg-3)',
    }}>
      Signing in...
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
