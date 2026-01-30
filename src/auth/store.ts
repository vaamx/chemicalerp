import { create } from 'zustand';
import type { Session, User, Permission } from '../shared/types';
import { MOCK_USERS } from '../shared/mock/users';

interface AuthState {
  session: Session | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchMode: (mode: 'office' | 'plant') => void;
  hasPermission: (permission: Permission) => boolean;
}

export const useAuth = create<AuthState>((set, get) => ({
  session: null,

  login: async (username: string, _password: string) => {
    // Mock: find user by username, accept any password
    const user = MOCK_USERS.find(u => u.username === username && u.active);
    if (!user) return false;

    const session: Session = {
      user,
      token: `mock-token-${user.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8h shift
      mode: user.defaultMode,
    };

    set({ session });
    return true;
  },

  logout: () => set({ session: null }),

  switchMode: (mode) => {
    const { session } = get();
    if (session) set({ session: { ...session, mode } });
  },

  hasPermission: (permission: Permission) => {
    const { session } = get();
    if (!session) return false;
    return session.user.permissions.includes(permission);
  },
}));
