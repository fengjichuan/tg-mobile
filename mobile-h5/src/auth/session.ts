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
  // 仅用于与 PC 端保持一致的 token 存储；同域不同端口可共享
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getToken(): string | null {
  // 优先复用 PC 端 token（若用户已在 PC 登录），避免同账号多 token 造成后端上下文差异
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
