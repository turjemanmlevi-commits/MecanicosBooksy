import { ReactNode } from 'react';
import Header from './Header';
import { useBookingStore } from '../store/bookingStore';

interface LayoutProps {
    children: ReactNode;
    showFooter?: boolean;
}

export default function Layout({ children }: LayoutProps) {
    const language = useBookingStore(state => state.language);
    const isRtl = language === 'he';

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--color-text)] flex justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-[480px] min-h-screen flex flex-col bg-[var(--bg-primary)] shadow-2xl shadow-black transition-all duration-300">
                <Header />
                <main className="flex-1 p-4 flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
}
