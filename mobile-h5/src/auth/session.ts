const TOKEN_KEY = 'mobile_demo_token';
const PC_TOKEN_COOKIE = 'tsg-token';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[-[\]{}()*+?.,\\\\^$|#\\s]/g, '\\\\$&')}=([^;]*)`),
  );
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  // Same token storage as PC; shared across same site, different ports
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getToken(): string | null {
  // Prefer PC token when user already logged in on PC to avoid divergent backend context
  return readCookie(PC_TOKEN_COOKIE) || sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  writeCookie(PC_TOKEN_COOKIE, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem('mobile_session_expire');
  deleteCookie(PC_TOKEN_COOKIE);
}
