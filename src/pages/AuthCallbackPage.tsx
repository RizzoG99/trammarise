// src/pages/AuthCallbackPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '@/lib/supabase/client';
import { PageLoader } from '@/lib/components/ui/PageLoader/PageLoader';

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const code = params.get('code');

    if (error) {
      // OAuth provider denied access or returned an error
      navigate('/?auth_error=1', { replace: true });
    } else if (code) {
      supabaseClient.auth
        .exchangeCodeForSession(code)
        .then(() => navigate('/', { replace: true }))
        .catch(() => navigate('/?auth_error=1', { replace: true }));
    } else {
      // Magic link or implicit flow — session is set automatically by onAuthStateChange
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return <PageLoader />;
}
