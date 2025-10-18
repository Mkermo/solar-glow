// Admin credentials for dashboard access
export const DASHBOARD_CREDENTIALS = {
  email: 'm@sg.com',
  password: 'mker123123123'
} as const;

// Check if user is admin
export const isAdmin = (email?: string): boolean => {
  if (!email) return false;
  return email === DASHBOARD_CREDENTIALS.email;
};