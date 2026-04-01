export type LoginUserData = {
  change_password: boolean;
  pwd_strength: null;
  user_id: number;
  id_token_hint: null;
  setting_two_factor: boolean;
  logout_uri: null;
  two_factor_authen: boolean;
  token: string;
  username: null;
};

export type ApiSuccessBody<T> = {
  code: 200;
  message: 'Success';
  data: T;
  success: true;
};

export type ApiErrorBody = {
  code: number;
  message: string;
  data: null;
  success: false;
};
