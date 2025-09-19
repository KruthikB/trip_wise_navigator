'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon, TripWiseLogo } from '@/components/icons';
import { Loader2, User } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInAsGuest } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [isClient, setIsClient] = useState(false);
  const [isGuestSigningIn, setIsGuestSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push(redirect);
    }
  }, [user, loading, router, redirect]);

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    await signInWithGoogle();
    setIsGoogleSigningIn(false);
  }

  const handleGuestSignIn = async () => {
    setIsGuestSigningIn(true);
    await signInAsGuest();
    setIsGuestSigningIn(false);
  }

  if (!isClient || loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-8 flex items-center gap-2">
            <TripWiseLogo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline">
              TripWise Navigator
            </span>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Sign in or continue as a guest to plan your next adventure.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading || isGuestSigningIn || isGoogleSigningIn}
          >
            {isGoogleSigningIn ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            Sign in with Google
          </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGuestSignIn}
            disabled={loading || isGuestSigningIn || isGoogleSigningIn}
          >
            {isGuestSigningIn ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <User className="mr-2 h-4 w-4" />
            )}
            Login as Guest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
