// /frontend/src/lib/auth/cookieUtils.ts
// SEC-001: Cookie utilities for authentication management
'use client';

/**
 * Cookie utilities for authentication
 * 
 * Features:
 * - Cookie existence checking
 * - Cookie value extraction
 * - Cookie validation
 * - Auth cookie cleanup
 */

export interface AuthCookies {
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;  // Keep for compatibility
  csrfToken: string | null;
}

/**
 * Check if authentication cookies exist
 */
export function hasAuthCookies(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const cookies = document.cookie;
  const hasAccessToken = cookies.includes('access_token=');
  const hasRefreshToken = cookies.includes('refresh_token=');
  
  return hasAccessToken && hasRefreshToken;
}

/**
 * Get authentication cookie values
 */
export function getAuthCookies(): AuthCookies {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      csrfToken: null,
    };
  }

  const cookies = document.cookie.split(';');
  const authCookies: AuthCookies = {
    accessToken: null,
    refreshToken: null,
    sessionId: null,
    csrfToken: null,
  };

  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    const cookieValue = value || '';
    
    switch (name) {
      case 'access_token':
        authCookies.accessToken = cookieValue;
        break;
      case 'refresh_token':
        authCookies.refreshToken = cookieValue;
        break;
      case 'sessionid':
        authCookies.sessionId = cookieValue;
        break;
      case 'csrftoken':
        authCookies.csrfToken = cookieValue;
        break;
    }
  });

  return authCookies;
}

/**
 * Get specific cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [cookieName, value] = cookie.trim().split('=');
    if (cookieName === name) {
      return value || null;
    }
  }
  
  return null;
}

/**
 * Check if JWT token exists and is not empty
 */
export function hasValidJWTToken(): boolean {
  const accessToken = getCookie('access_token');
  return accessToken !== null && accessToken.length > 0;
}

/**
 * Check if session cookie exists
 */
export function hasValidSession(): boolean {
  const sessionId = getCookie('sessionid');
  return sessionId !== null && sessionId.length > 0;
}

/**
 * Validate authentication cookies
 */
export function validateAuthCookies(): {
  isValid: boolean;
  missing: string[];
  present: string[];
} {
  const authCookies = getAuthCookies();
  const required = ['accessToken', 'sessionId'];
  const missing: string[] = [];
  const present: string[] = [];

  required.forEach(key => {
    const value = authCookies[key as keyof AuthCookies];
    if (value && value.length > 0) {
      present.push(key);
    } else {
      missing.push(key);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    present,
  };
}

/**
 * Clear authentication cookies (client-side only)
 * Note: Server-side cookies need to be cleared via API call
 */
export function clearClientAuthCookies(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const authCookies = ['access_token', 'refresh_token', 'sessionid', 'csrftoken'];
  
  authCookies.forEach(cookieName => {
    // Set cookie to expire in the past
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  
}

/**
 * Check if cookies are from the same domain
 */
export function isSameDomain(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const currentDomain = window.location.hostname;
  const cookies = document.cookie;
  
  // Check if cookies contain the current domain
  return cookies.includes(currentDomain) || cookies.includes('localhost');
}

/**
 * Get cookie expiration info
 */
export function getCookieExpiration(cookieName: string): Date | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith(cookieName + '=')) {
      // Extract expiration from cookie string
      const expiresMatch = trimmedCookie.match(/expires=([^;]+)/);
      if (expiresMatch) {
        try {
          return new Date(expiresMatch[1]);
        } catch {
          console.warn('Invalid cookie expiration', expiresMatch[1]);
        }
      }
    }
  }
  
  return null;
}

/**
 * Check if auth cookies are expired
 */
export function areAuthCookiesExpired(): boolean {
  const accessTokenExpiry = getCookieExpiration('access_token');
  const refreshTokenExpiry = getCookieExpiration('refresh_token');
  
  const now = new Date();
  
  // Check if access token is expired
  if (accessTokenExpiry && accessTokenExpiry < now) {
    return true;
  }
  
  // Check if refresh token is expired
  if (refreshTokenExpiry && refreshTokenExpiry < now) {
    return true;
  }
  
  return false;
}

/**
 * Debug function to log all auth cookies (development only)
 */
export function debugAuthCookies(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const authCookies = getAuthCookies();
  const validation = validateAuthCookies();
  
}

const cookieUtils = {
  hasAuthCookies,
  getAuthCookies,
  getCookie,
  hasValidJWTToken,
  hasValidSession,
  validateAuthCookies,
  clearClientAuthCookies,
  isSameDomain,
  getCookieExpiration,
  areAuthCookiesExpired,
  debugAuthCookies,
};

export default cookieUtils;
