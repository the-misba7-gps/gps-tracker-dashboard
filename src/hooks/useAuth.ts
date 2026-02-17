'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { authApi } from '@/services/api';

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: storeLogout } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    
    // In demo mode, auto-authenticate
    if (isDemoMode) {
      // If we already have a user from the store (e.g. set by login page), don't overwrite it
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setInitialized(true);
        return;
      }

      try {
        const demoUser = await authApi.getCurrentUser();
        setUser(demoUser);
      } catch (error) {
        console.error('Demo auth error:', error);
        // Still set a user in demo mode
        setUser({
          id: 'demo-user',
          email: 'admin@tracker.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setInitialized(true);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setUser(null);
      setInitialized(true);
      return;
    }

    try {
      const fetchedUser = await authApi.getCurrentUser();
      setUser(fetchedUser);
    } catch {
      localStorage.removeItem('access_token');
      setUser(null);
    }
    setInitialized(true);
  }, [setUser, setLoading]);

  const login = useCallback(() => {
    // Demo mode - auto login
    if (isDemoMode) {
      checkAuth().then(() => router.push('/'));
      return;
    }

    // OAuth2 PKCE flow
    const clientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;
    const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL;

    // Generate code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem('code_verifier', codeVerifier);

    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
      const authUrl = new URL(`${ssoUrl}/oauth2/authorize`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', clientId || '');
      authUrl.searchParams.set('redirect_uri', redirectUri || '');
      authUrl.searchParams.set('scope', 'openid profile');
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      window.location.href = authUrl.toString();
    });
  }, [router, checkAuth]);

  const handleCallback = useCallback(async (code: string) => {
    const codeVerifier = sessionStorage.getItem('code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    const clientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;
    const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL;

    const response = await fetch(`${ssoUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId || '',
        code,
        redirect_uri: redirectUri || '',
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    sessionStorage.removeItem('code_verifier');

    await checkAuth();
    router.push('/');
  }, [router, checkAuth]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    storeLogout();
    localStorage.removeItem('access_token');
    router.push('/login');
  }, [router, storeLogout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading && !initialized,
    login,
    logout,
    handleCallback,
    checkAuth,
  };
}

// PKCE helpers
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

function base64URLEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
