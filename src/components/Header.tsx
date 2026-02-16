import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const showBack = location.pathname !== '/';

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleProfileClick = () => {
        if (user) {
            navigate('/mi-perfil');
        } else {
            // If on home, maybe scroll to login? For now just go to profile which redirects if no user
            navigate('/mi-perfil');
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-4">
            <div className="flex items-center w-1/3">
                {showBack && (
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-white hover:text-[var(--color-primary)] transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}
            </div>

            <div className="flex justify-center w-1/3">
                <img
                    src="/logo-amarillo-sinbisel-5.png"
                    alt="MOTOBOX"
                    className="h-10 cursor-pointer object-contain"
                    onClick={() => navigate('/')}
                />
            </div>

            <div className="flex justify-end items-center gap-2 w-1/3">
                <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 group p-1"
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${user ? 'bg-[var(--color-primary)] shadow-[0_0_10px_rgba(192,0,0,0.5)]' : 'bg-white/10 group-hover:bg-white/20'}`}>
                        {user ? (
                            <span className="text-white text-xs font-bold uppercase">{user.email?.[0]}</span>
                        ) : (
                            <User size={16} className="text-white/70" />
                        )}
                    </div>
                </button>
            </div>
        </header>
    );
}
