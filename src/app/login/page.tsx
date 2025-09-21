
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon, TripWiseLogo } from '@/components/icons';
import { Loader2, User, LogIn, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});


export default function LoginPage() {
  const { 
    user, 
    loading, 
    signInWithGoogle, 
    signInAsGuest, 
    signInWithEmailAndPassword,
    registerWithEmailAndPassword,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push(redirect);
    }
  }, [user, loading, router, redirect]);

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await signInWithGoogle();
    setIsSubmitting(false);
  }

  const handleGuestSignIn = async () => {
    setIsSubmitting(true);
    await signInAsGuest();
    setIsSubmitting(false);
  }

  const handleEmailSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    const success = await signInWithEmailAndPassword(values.email, values.password);
    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: 'Invalid email or password. Please try again.',
      });
    }
    setIsSubmitting(false);
  }

  const handleEmailRegister = async (values: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    const success = await registerWithEmailAndPassword(values.name, values.email, values.password);
    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'Could not create account. The email might already be in use.',
      });
    } else {
       toast({
        title: 'Registration Successful!',
        description: 'You can now sign in with your new account.',
      });
      // In a real app you might automatically sign them in.
      // Here we just let them know it worked.
    }
    setIsSubmitting(false);
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
              TripWise
            </span>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Plan your next adventure.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="signin">
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="signin" className="space-y-4">
                     <Form {...signInForm}>
                      <form onSubmit={signInForm.handleSubmit(handleEmailSignIn)} className="space-y-4 pt-4">
                        <FormField
                          control={signInForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signInForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="animate-spin" /> : <LogIn />}
                          Sign In
                        </Button>
                      </form>
                    </Form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                        <Button variant="outline" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                            <GoogleIcon className="mr-2 h-4 w-4" /> Google
                        </Button>
                        <Button variant="secondary" onClick={handleGuestSignIn} disabled={isSubmitting}>
                            <User className="mr-2 h-4 w-4" /> Guest
                        </Button>
                    </div>

                </TabsContent>
                <TabsContent value="register">
                    <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(handleEmailRegister)} className="space-y-4 pt-4">
                            <FormField
                                control={registerForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={registerForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={registerForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
                                Create Account
                            </Button>
                        </form>
                    </Form>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
