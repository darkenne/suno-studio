'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export default function SettingsPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/login'); return; }
      setAccessToken(data.session.access_token);
    });
  }, [router]);

  if (!accessToken) return null;

  return <SettingsPanel accessToken={accessToken} onBack={() => router.replace('/')} />;
}
