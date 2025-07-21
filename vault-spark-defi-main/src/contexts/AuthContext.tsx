import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  connectWallet: () => Promise<void>;
  walletAddress: string | null;
  isConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated, fetching profile...');
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log('Fetching user profile for:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('user_id', userId)
        .single();
      
      console.log('Profile data:', data, 'Error:', error);
      
      if (data?.wallet_address) {
        setWalletAddress(data.wallet_address);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('Attempting to sign up with email:', email);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    console.log('Sign up result:', { error });
    
    if (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Check your email to confirm your account",
      });
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with email:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log('Sign in result:', { error });
    
    if (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      console.log('Sign in successful!');
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
    setWalletAddress(null);
    setIsConnected(false);
  };

  const connectWallet = async () => {
    console.log('Attempting to connect wallet...');
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        const address = accounts[0];
        console.log('Wallet connected:', address);
        setWalletAddress(address);
        setIsConnected(true);
        
        // Update user profile with wallet address
        if (user) {
          await supabase
            .from('profiles')
            .update({ wallet_address: address })
            .eq('user_id', user.id);
        }
        
        toast({
          title: "Success",
          description: "Wallet connected successfully!",
        });
      } else {
        console.error('MetaMask not found');
        toast({
          title: "Error",
          description: "MetaMask is not installed",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    connectWallet,
    walletAddress,
    isConnected
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
