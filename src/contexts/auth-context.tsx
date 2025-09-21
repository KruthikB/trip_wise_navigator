
'use client';

import type { User } from 'firebase/auth';
import { createContext, useEffect, useState, type ReactNode } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  AuthError, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  registerWithEmailAndPassword: (name: string, email: string, password: string) => Promise<boolean>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/popup-closed-by-user') {
        // Do nothing, user cancelled.
      } else {
        console.error('Error signing in with Google', error);
         toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'An unexpected error occurred during sign-in.',
        });
      }
    }
  };

  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Error signing in as guest', error);
      toast({
        variant: 'destructive',
        title: 'Guest Login Failed',
        description: 'Could not sign you in as a guest.',
      });
    }
  };

  const registerWithEmailAndPassword = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // Reload user to get the new display name
      await userCredential.user.reload();
      setUser(auth.currentUser);
      return true;
    } catch(error) {
      console.error('Error registering with email and password', error);
      return false;
    }
  }

  const signInWithEmailAndPassword = async (email: string, password: string): Promise<boolean> => {
     try {
      await firebaseSignInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Error signing in with email and password', error);
      return false;
    }
  }


  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // force reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const value = { user, loading, signInWithGoogle, signInAsGuest, signOut, registerWithEmailAndPassword, signInWithEmailAndPassword };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
