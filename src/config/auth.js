// Authentication constants
export const TOKEN_KEY = 'afari_auth_token';
export const REFRESH_TOKEN_KEY = 'afari_refresh_token';

// Default context value
export const defaultAuthContext = {
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  signup: () => {},
  updateProfile: () => {},
  isAuthenticated: false
};
