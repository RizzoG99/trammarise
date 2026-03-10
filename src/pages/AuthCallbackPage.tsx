// src/pages/AuthCallbackPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '@/lib/supabase/client';
import { PageLoader } from '@/lib/components/ui/PageLoader/PageLoader';

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      supabaseClient.auth
        .exchangeCodeForSession(code)
        .then(() => navigate('/', { replace: true }))
        .catch(() => navigate('/', { replace: true }));
    } else {
      // Magic link or implicit flow — session is set automatically by onAuthStateChange
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return <PageLoader />;
}
