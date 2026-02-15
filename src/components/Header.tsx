import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const showBack = location.pathname !== '/';

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
                <h1 className="text-xl font-bold tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
                    MOTOR <span className="text-[var(--color-primary)]">EXTREMO</span>
                </h1>
            </div>

            <div className="flex justify-end items-center gap-2 w-1/3">
                <div className="flex items-center gap-2">
                    {/* Placeholder for user profile if needed in future */}
                    {/* <span className="text-sm font-medium hidden sm:block">Invitado</span> */}
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <User size={16} className="text-white/70" />
                    </div>
                </div>
            </div>
        </header>
    );
}
