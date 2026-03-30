import { Button, Form, Input, Toast } from 'antd-mobile';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { loginRequest } from '../api/auth';
import { setToken } from '../auth/session';
import { useI18n } from '../i18n/i18n';

import styles from './Login.module.css';

type LoginForm = {
  username: string;
  password: string;
};

export function Login() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? '/home';

  async function onSubmit(values: LoginForm) {
    if (!values.username?.trim() || !values.password) {
      Toast.show({ content: t('login.toast_missing'), icon: 'fail' });
      return;
    }
    setLoading(true);
    try {
      const res = await loginRequest(values.username.trim(), values.password);
      if (!res.ok || !res.data?.token) {
        Toast.show({
          content: res.message || t('login.toast_failed'),
          icon: 'fail',
        });
        return;
      }
      setToken(res.data.token);
      Toast.show({ content: t('login.toast_success'), icon: 'success' });
      navigate(from, { replace: true });
    } catch {
      Toast.show({ content: t('login.toast_unknown'), icon: 'fail' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.brand}>
        <div className={styles.logo} aria-hidden>
          T
        </div>
        <p className={styles.subtitle}>
          {t('login.subtitle')}
        </p>
      </header>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{t('login.title')}</h2>

        <Form
          layout="vertical"
          onFinish={onSubmit}
          footer={
            <Button
              className={styles.submit}
              block
              type="submit"
              color="primary"
              size="large"
              loading={loading}
            >
              {t('login.submit')}
            </Button>
          }
        >
          <Form.Item
            name="username"
            label={<span className={styles.fieldLabel}>{t('login.username')}</span>}
            rules={[{ required: true, message: t('login.toast_missing') }]}
          >
            <Input
              placeholder={t('login.username_placeholder')}
              clearable
              autoComplete="username"
              enterKeyHint="next"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className={styles.fieldLabel}>{t('login.password')}</span>}
            rules={[{ required: true, message: t('login.toast_missing') }]}
          >
            <Input
              placeholder={t('login.password_placeholder')}
              clearable
              type="password"
              autoComplete="current-password"
              enterKeyHint="done"
            />
          </Form.Item>
        </Form>

        <p className={styles.hint}>{t('login.hint')}</p>
      </div>
    </div>
  );
}
