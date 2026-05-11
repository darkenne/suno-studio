'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './login.module.css';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (el: HTMLElement, config: object) => void;
          cancel: () => void;
        };
      };
    };
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const oneTapRef = useRef(false);
  const nonceRef = useRef<string>('');

  useEffect(() => {
    if (searchParams.get('error')) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  }, [searchParams]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/');
    });
  }, [router]);

  /* ── Google One Tap ─────────────────────────────── */
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    // Prevent double-init from React StrictMode
    if (oneTapRef.current) return;
    oneTapRef.current = true;

    async function handleCredential(response: { credential: string }) {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce: nonceRef.current,
      });
      if (error) {
        console.error('[OneTap] signInWithIdToken error:', error);
        setError(error.message);
        setLoading(false);
      } else {
        router.replace('/');
      }
    }

    async function initOneTap() {
      // Generate nonce: raw for Supabase, SHA-256 hash for Google
      const rawNonce = btoa(
        String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))
      );
      nonceRef.current = rawNonce;

      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(rawNonce),
      );
      const hashedNonce = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        nonce: hashedNonce,
        auto_select: true,
        cancel_on_tap_outside: false,
        context: 'signin',
        itp_support: true,
      });
      window.google?.accounts.id.prompt();
    }

    if (window.google?.accounts?.id) {
      initOneTap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initOneTap();
      document.head.appendChild(script);
      return () => { script.remove(); };
    }
    return () => window.google?.accounts.id.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandMark} />
          <span className={styles.brandName}>REEL</span>
        </div>

        <div className={styles.body}>
          <p className={`h-eyebrow ${styles.eyebrow}`}>Welcome</p>
          <h1 className={`h-display ${styles.heading}`}>Sign in to continue</h1>
          <p className={styles.sub}>Your AI music creation studio.</p>

          {error && <div className={styles.errorMsg}>Sign in failed. Please try again.</div>}

          <button
            className={`btn ${styles.googleBtn}`}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {!loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {loading && <span className={styles.spinner} />}
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
        </div>

        <div className={styles.footer}>
          <span className="mono">REEL v0.4.2</span>
          <span>·</span>
          <span>Suno V5.5</span>
        </div>
      </div>

      <div className={styles.bg} aria-hidden="true">
        <div className={styles.glow} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
