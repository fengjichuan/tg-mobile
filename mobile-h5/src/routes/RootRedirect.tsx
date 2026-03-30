import { Navigate } from 'react-router-dom';

import { getToken } from '../auth/session';

export function RootRedirect() {
  const token = getToken();
  return <Navigate to={token ? '/home' : '/login'} replace />;
}
