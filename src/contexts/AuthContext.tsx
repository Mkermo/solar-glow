import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseRestSelect } from '@/lib/supabaseRest';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  checkConnection: () => Promise<{ connected: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('Auth error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      let role = 'user';
      try {
        const profileData = await supabaseRestSelect<any[]>('profiles', {
          select: 'role',
          filters: [{ column: 'id', operator: 'eq', value: data.user.id }],
          limit: 1,
        });

        if (Array.isArray(profileData) && profileData[0]?.role) {
          role = profileData[0].role;
        }
      } catch (profileError) {
        console.warn('Profile fetch failed:', profileError);
      }

      setUser({ ...data.user, role });
      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to sign in') 
      };
    } finally {
      setLoading(false);
    }
  };

  // Check Supabase connection
  const checkConnection = async () => {
    try {
      await supabaseRestSelect('profiles', { select: 'id', limit: 1 });
      return { connected: true };
    } catch (error) {
      return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user profile
          let role = 'user';
          try {
            const profileData = await supabaseRestSelect<any[]>('profiles', {
              select: 'role',
              filters: [{ column: 'id', operator: 'eq', value: session.user.id }],
              limit: 1,
            });

            if (Array.isArray(profileData) && profileData[0]?.role) {
              role = profileData[0].role;
            }
          } catch (profileError) {
            console.warn('Profile fetch failed during init:', profileError);
          }

          if (mounted) {
            setUser({ ...session.user, role });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && mounted) {
        // Get user profile on auth state change
        let role = 'user';
        try {
          const profileData = await supabaseRestSelect<any[]>('profiles', {
            select: 'role',
            filters: [{ column: 'id', operator: 'eq', value: session.user.id }],
            limit: 1,
          });

          if (Array.isArray(profileData) && profileData[0]?.role) {
            role = profileData[0].role;
          }
        } catch (profileError) {
          console.warn('Profile fetch failed during auth change:', profileError);
        }

        setUser({ ...session.user, role });
      } else if (mounted) {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to sign out'
      });
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // First attempt signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'user'
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Signup failed - no user returned');
      }

      toast({
        title: "Success",
        description: "Account created successfully. You can now log in.",
      });

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create account'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin (replace with your admin email)
  const isAdmin = user?.email === 'm@sg.com';

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signOut,
    signUp,
    checkConnection
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
