'use client';

import React, { useState, useEffect } from 'react';
import SectionContainer from '@/components/common/SectionContainer'; 
import { useAuth } from '@/context/auth-context'; 
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, LogIn } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// --- Interface Assumption ---
interface AuthUser { 
    uid: string;
    email: string;
    isAdmin?: boolean; 
}
interface AuthContext {
    user: AuthUser | null;
    isAuthReady: boolean; 
    signIn: (email: string, password: string) => Promise<void>; 
    signOut: () => Promise<void>; 
}
// ----------------------------


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
        } catch (err) {
            console.error("Login failed:", err);
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
    const { user, isAuthReady, signIn } = useAuth() as AuthContext; 
    const router = useRouter();
    const pathname = usePathname();
    
    const isAdmin = user && user.isAdmin; 
    const targetPath = '/admin';

    
    // --- Redirection Logic (Handles users already logged in) ---
    useEffect(() => {
        const shouldRedirect = isAuthReady && user && isAdmin;
        
        console.log(`[AdminLoginPage] EFFECT RUN (Login Check): Path=${pathname} | Ready=${isAuthReady} | User=${!!user} | Admin=${isAdmin}`);

        if (shouldRedirect && pathname !== targetPath) {
            console.log('>>> ALREADY LOGGED IN. REDIRECTING TO ADMIN! <<<');
            router.replace(targetPath);
        }
    }, [isAuthReady, user, isAdmin, router, pathname]);
    
    
    // --- Rendering Logic ---

    if (!isAuthReady) {
        return (
            <SectionContainer className="pt-24 min-h-[500px] flex justify-center items-center text-primary text-lg">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" /> 
                Loading authentication status...
            </SectionContainer>
        );
    }
    
    return (
        <SectionContainer className="pt-24 min-h-[500px] flex justify-center">
            <AdminLoginForm signIn={signIn} /> 
        </SectionContainer>
    );
}