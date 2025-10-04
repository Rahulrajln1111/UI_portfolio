// app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
// import { Toaster as SonnerToaster } from '@/components/ui/sonner'; // REMOVED/RENAMED
import LoadingAnimation from '@/components/common/LoadingAnimation';
// --- FIREBASE/CONTEXT IMPORTS ---
import { AuthProvider } from '@/context/auth-context'; 
// 🔥 FIX: KEEP THIS STANDARD TOASTER IMPORT
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Rahul Razz | Offensive security and Developer',
	description: 'Personal website of Rahul Razz, a B.tech  CSE student from IIT Bhilai, India, showcasing academic achievements, research projects, and professional aspirations.',
	keywords: 'Rahul Razz, Computer, Researcher, Bhilai, India,B.tech CSE, security Research, Student Portfolio',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<link rel="shortcut icon" href="./cyber-attack.png" type="image/x-icon" />
			{/* IMPORTANT: ID added for the LoadingAnimation logic */}
			<body id="root-body" className={inter.className}> 
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{/* WRAPPING the entire application with AuthProvider */}
					<AuthProvider>
						<LoadingAnimation />
						<Navbar />
						<main className="min-h-screen">
							{children}
						</main>
						<Footer />
						<ThemeToggle />
					</AuthProvider>
					{/* 🔥 FIX: Render the standard Toaster component here */}
					{/* <Toaster position="bottom-right" /> -- This was the sonner component. */}
					<Toaster /> 
				</ThemeProvider>
			</body>
		</html>
	);
}