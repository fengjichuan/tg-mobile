import { http } from './http';

export type LoginResult = {
  token: string;
  user_id: number;
};

export async function loginRequest(
  username: string,
  password: string,
): Promise<{ ok: boolean; data?: LoginResult; message?: string; rawCode?: number }> {
  try {
    const res = await http.post<{
      code?: number;
      data?: LoginResult;
      message?: string;
    }>('/users/login', { username, password }, { skipAuth: true });

    const body = res.data;
    if (body.code === 200 && body.data?.token) {
      return { ok: true, data: body.data };
    }
    return {
      ok: false,
      message: body.message || 'Sign-in failed.',
      rawCode: body.code,
    };
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string; code?: number } } };
    const msg = ax.response?.data?.message || 'Sign-in request failed.';
    return {
      ok: false,
      message: msg,
      rawCode: ax.response?.data?.code,
    };
  }
}

export async function logoutRequest(): Promise<void> {
  try {
    await http.post('/users/logout', {});
  } catch {
    // ignore
  }
}
