import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Lock, Sparkles } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface AuthGateProps {
    children: React.ReactNode;
}

// Define the allowed users. You can add more emails here.
const ALLOWED_EMAILS = [
    'turjemanmlevi@gmail.com', // Adding your email based on previous context
];

export default function AuthGate({ children }: AuthGateProps) {
    const { t, language } = useTranslation();
    const [session, setSession] = useState<any>(undefined);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            validateSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            validateSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const validateSession = (session: any) => {
        if (session?.user) {
            // If you want to restrict to specific emails, uncomment this check:
            if (!ALLOWED_EMAILS.includes(session.user.email!)) {
                setAccessDenied(true);
                setSession(null);
                return;
            }
            setSession(session);
            setAccessDenied(false);
        } else {
            setSession(null);
        }
    };

    const handleLogin = async () => {
        setIsLoggingIn(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            }
        });
        if (error) {
            console.error('Login error:', error);
            setIsLoggingIn(false);
        }
    };

    // Loading state
    if (session === undefined) {
        return (
            <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Access Denied (Authenticated but not in allowlist)
    if (accessDenied) {
        return (
            <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-6 text-center">
                <div className="w-full max-w-sm space-y-6">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <Lock className="text-red-500" size={40} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Acceso Restringido</h1>
                        <p className="text-gray-400">Esta aplicación es privada. Tu cuenta no tiene permisos de acceso.</p>
                    </div>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all"
                    >
                        Probar con otra cuenta
                    </button>
                </div>
            </div>
        );
    }

    // Not logged in
    if (!session) {
        return (
            <div className="min-h-screen bg-[#0B0B0B] bg-[url('/hero.jpg')] bg-cover bg-center flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

                <div className="relative z-10 w-full max-w-sm space-y-12 animate-fade-in text-center">
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <img src="/logo-amarillo-sinbisel-5.png" alt="MOTOBOX" className="h-20 object-contain" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-white tracking-widest uppercase">MOTOBOX</h1>
                            <p className="text-[var(--color-primary)] font-bold tracking-[0.3em] uppercase text-sm">{t.home.motto}</p>
                        </div>
                    </div>

                    <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
                        <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-xs mb-2">
                            <Sparkles size={14} />
                            {language === 'he' ? 'גישה פרטית בלבד' : language === 'en' ? 'Private Access Only' : 'Acceso Privado Exclusivo'}
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed">
                            {language === 'he'
                                ? 'יישום זה נמצא בבניה. אנא התחבר כדי להמשיך.'
                                : language === 'en'
                                    ? 'This application is currently in development. Please sign in to continue.'
                                    : 'Esta aplicación se encuentra en desarrollo. Por favor, inicia sesión para continuar.'}
                        </p>

                        <button
                            onClick={handleLogin}
                            disabled={isLoggingIn}
                            className="w-full flex items-center justify-center gap-4 bg-white text-black hover:bg-gray-200 font-black py-5 px-6 rounded-2xl text-lg transition-all shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            {isLoggingIn ? (
                                <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={24} />
                                    {language === 'he' ? 'התחבר עם גוגל' : language === 'en' ? 'Sign in with Google' : 'Acceder con Google'}
                                </>
                            )}
                        </button>
                    </div>

                    <div className="pt-8 opacity-50">
                        <p className="text-xs text-gray-500 uppercase tracking-widest">© 2026 MOTOBOX MIJAS</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
