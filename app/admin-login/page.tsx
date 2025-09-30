'use client';

import React, { useState, useEffect } from 'react'; // <--- Added useEffect
import SectionContainer from '@/components/common/SectionContainer';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Component to handle the login form
const AdminLoginForm: React.FC<{ signIn: (email: string, password: string) => Promise<void> }> = ({ signIn }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await signIn(email, password);
            // On successful sign-in, the 'user' context state updates, triggering the useEffect below.
        } catch (err) {
            console.error("Login error:", err);
            setError("Login failed. Check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-2xl border border-border">
            <h2 className="text-3xl font-bold text-center text-primary flex items-center justify-center">
                <LogIn className="w-7 h-7 mr-3" />
                Admin Sign-In
            </h2>
            <p className="text-center text-muted-foreground">Enter your admin credentials.</p>
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : 'Sign In'}
                </Button>
                {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}
            </form>
        </div>
    );
};

export default function AdminLoginPage() {
    const { user, isAuthReady, signIn } = useAuth();
    const router = useRouter();
    
    // --- FIX: Move Redirection to useEffect ---
    useEffect(() => {
        // Only attempt to redirect after Firebase has finished loading the auth status AND a user is present.
        if (isAuthReady && user) {
            router.replace('/admin');
        }
    }, [isAuthReady, user, router]); 
    // ------------------------------------------

    if (!isAuthReady) {
        return (
            <SectionContainer className="pt-24 min-h-[500px] flex justify-center items-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" /> 
                Loading authentication status...
            </SectionContainer>
        );
    }
    
    // If the user is logged in, return null immediately. 
    // The useEffect hook will handle the navigation in the background.
    if (user) {
        return null; 
    }

    // If not logged in, show the login form
    return (
        <SectionContainer className="pt-24 min-h-[500px] flex justify-center">
            <AdminLoginForm signIn={signIn} />
        </SectionContainer>
    );
}