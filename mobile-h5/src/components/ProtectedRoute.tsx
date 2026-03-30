import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { getToken } from '../auth/session';

export function ProtectedRoute() {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
