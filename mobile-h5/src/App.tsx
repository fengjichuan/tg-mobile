import { ConfigProvider } from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import { Route, BrowserRouter, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { useI18n } from './i18n/i18n';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { RootRedirect } from './routes/RootRedirect';

export function App() {
  const { locale } = useI18n();
  const antdLocale = locale === 'zh' ? zhCN : enUS;

  return (
    <ConfigProvider locale={antdLocale}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
          </Route>
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
