import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
    showFooter?: boolean;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--color-text)] flex justify-center">
            <div className="w-full max-w-[480px] min-h-screen flex flex-col bg-[var(--bg-primary)] shadow-2xl shadow-black">
                <Header />
                <main className="flex-1 p-4 flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
}
