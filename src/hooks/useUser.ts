// src/hooks/useUser.ts
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase/client';

interface UseUserReturn {
  user: User | null;
  isSignedIn: boolean;
  isLoaded: boolean;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isSignedIn: !!user,
    isLoaded,
  };
}
