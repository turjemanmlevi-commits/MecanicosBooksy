import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Languages, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useBookingStore } from '../store/bookingStore';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const language = useBookingStore(state => state.language);
    const setLanguage = useBookingStore(state => state.setLanguage);
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
            navigate('/mi-perfil');
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-4">
            <div className="flex items-center w-1/4">
                {showBack && (
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-white hover:text-[var(--color-primary)] transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}
            </div>

            <div className="flex justify-center flex-1">
                <img
                    src="/logo-amarillo-sinbisel-5.png"
                    alt="MOTOBOX"
                    className="h-10 cursor-pointer object-contain"
                    onClick={() => navigate('/')}
                />
            </div>

            <div className="flex justify-end items-center gap-3 w-1/3">
                <div className="relative flex items-center bg-white/5 rounded-lg px-2 py-1 border border-white/10 group hover:border-white/20 transition-all">
                    <Languages size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer appearance-none px-1 min-w-[30px] text-center"
                    >
                        <option value="es" className="bg-[#1A1A1A]">ES</option>
                        <option value="en" className="bg-[#1A1A1A]">EN</option>
                        <option value="he" className="bg-[#1A1A1A]">HE</option>
                    </select>
                </div>

                <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 group p-1"
                >
                    {user && (
                        <span className="text-white text-xs font-bold hidden sm:block">
                            {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                        </span>
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${user ? 'bg-[var(--color-primary)] overflow-hidden shadow-[0_0_10px_rgba(192,0,0,0.5)]' : 'bg-white/10 group-hover:bg-white/20'}`}>
                        {user ? (
                            user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-xs font-bold uppercase">{user.email?.[0]}</span>
                            )
                        ) : (
                            <User size={16} className="text-white/70" />
                        )}
                    </div>
                    <ChevronLeft size={14} className={`text-gray-500 transition-transform ${language === 'he' ? 'rotate-90' : '-rotate-90'}`} />
                </button>
            </div>
        </header>
    );
}
