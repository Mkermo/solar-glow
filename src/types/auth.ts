export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  role: UserRole;
  email: string;
  full_name?: string;
  avatar_url?: string;
}