import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isDemoMode: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, isDemoMode?: boolean) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isDemoMode: false,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, token, isDemoMode = false) => {
    localStorage.setItem('xenoreach_token', token);
    localStorage.setItem('xenoreach_user', JSON.stringify(user));
    set({ user, token, isDemoMode, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('xenoreach_token');
    localStorage.removeItem('xenoreach_user');
    set({ user: null, token: null, isDemoMode: false, isAuthenticated: false });
  },
  setLoading: (isLoading) => set({ isLoading }),
  hydrate: () => {
    const token = localStorage.getItem('xenoreach_token');
    const userStr = localStorage.getItem('xenoreach_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
