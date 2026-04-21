import { useContext } from 'react';
export * from './AuthContext.jsx';
import { AuthContext } from './AuthContext.jsx';

export const useAuth = () => {
  const ctx = useContext(AuthContext) || {};
  if (!ctx.login) return ctx;
  return {
    ...ctx,
    login: (username, password) => ctx.login({ username, motdepasse: password }),
  };
};
