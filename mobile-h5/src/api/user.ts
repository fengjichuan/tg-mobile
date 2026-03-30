import { apiGet } from './http';

export type RoleItem = {
  id?: number;
  name?: string;
  permissions?: string;
};

export type CurrentUser = {
  id?: number;
  name?: string;
  username?: string;
  last_login_ip?: string;
  last_login_time?: string;
  role_list?: RoleItem[];
};

export function fetchCurrentUser() {
  return apiGet<CurrentUser>('/users/-');
}
