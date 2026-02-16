import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PendingAppointmentsModal from '../components/PendingAppointmentsModal';
import { useTranslation } from '../hooks/useTranslation';

export default function Home() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
    const [checkingAppointments, setCheckingAppointments] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setIsLoggingIn(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/mi-perfil`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                }
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('Error logging in:', error.message);
            alert(t.common.error + ': ' + error.message);
            setIsLoggingIn(false);
        }
    };

    const handleBookClick = async () => {
        setCheckingAppointments(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Check if client exists
                const { data: client } = await supabase
                    .from('clientes')
                    .select('id')
                    .eq('email', user.email)
                    .maybeSingle();

                if (client) {
                    const { data: appointments } = await supabase
                        .from('citas')
                        .select(`
                            *,
                            vehiculos (matricula, marca, modelo),
                            tecnicos (nombre)
                        `)
                        .eq('cliente_id', client.id)
                        .eq('estado', 'pendiente')
                        .gte('fecha_hora_inicio', new Date().toISOString())
                        .order('fecha_hora_inicio', { ascending: true });

                    if (appointments && appointments.length > 0) {
                        setPendingAppointments(appointments);
                        setShowPendingModal(true);
                        setCheckingAppointments(false);
                        return;
                    }
                }
            }

            navigate('/booking/servicios');
        } catch (error) {
            console.error("Error checking appointments:", error);
            navigate('/booking/servicios');
        } finally {
            setCheckingAppointments(false);
        }
    };

    const handleCancelAppointment = async (id: string) => {
        if (!confirm('¿Estás seguro?')) return;

        try {
            const { error } = await supabase
                .from('citas')
                .update({ estado: 'cancelada' })
                .eq('id', id);

            if (error) throw error;

            setPendingAppointments(prev => prev.filter(a => a.id !== id));
            if (pendingAppointments.length === 1) {
                setShowPendingModal(false);
            }
        } catch (error) {
            console.error("Error canceling appointment:", error);
            alert(t.common.error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen relative">
            <PendingAppointmentsModal
                isOpen={showPendingModal}
                onClose={() => setShowPendingModal(false)}
                appointments={pendingAppointments}
                onContinueBooking={() => navigate('/booking/servicios')}
                onCancelAppointment={handleCancelAppointment}
            />

            <div className="absolute inset-0 bg-[#0B0B0B] bg-[url('/hero.jpg')] bg-cover bg-center bg-no-repeat">
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center pt-20 pb-10 gap-8">
                <div className="animate-fade-in">
                    <h1 className="text-6xl font-bold mb-2 tracking-tighter leading-none">
                        {t.home.title} <span className="text-[var(--color-primary)]">{t.home.subtitle}</span>
                    </h1>
                    <p className="text-xl text-gray-400 tracking-widest uppercase">{t.home.motto}</p>
                </div>

                <div className="w-full max-w-sm flex flex-col gap-4">
                    <button
                        onClick={handleBookClick}
                        disabled={checkingAppointments}
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-5 px-8 rounded-xl text-xl uppercase tracking-wider transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(192,0,0,0.3)] disabled:opacity-70 disabled:cursor-wait"
                    >
                        {checkingAppointments ? t.common.loading : t.home.book}
                    </button>

                    <button
                        onClick={() => navigate('/consultar')}
                        className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider border-b border-gray-600 hover:border-white pb-1 self-center"
                    >
                        {t.home.check}
                    </button>
                </div>

                <div className="w-full max-w-sm bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=Av+de+los+Lirios+78+Las+Lagunas+de+Mijas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 text-left mb-3 hover:bg-white/5 p-2 -m-2 rounded-lg transition-colors group"
                    >
                        <MapPin className="text-[var(--color-primary)] shrink-0 mt-1 group-hover:scale-110 transition-transform" size={18} />
                        <div>
                            <p className="text-white font-medium text-sm group-hover:text-[var(--color-primary)] transition-colors">Av. de los Lirios, 78</p>
                            <p className="text-gray-400 text-xs">29651 Las Lagunas de Mijas, Málaga</p>
                        </div>
                    </a>
                    <div className="flex items-center gap-3 text-left p-2 -m-2 mb-3">
                        <Clock className="text-[var(--color-primary)] shrink-0" size={18} />
                        <div>
                            <p className="text-white font-medium text-sm">Lunes - Viernes</p>
                            <p className="text-gray-400 text-xs">09:00 - 19:00</p>
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-3 mt-1">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoggingIn}
                            className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 font-bold py-3 px-4 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingIn ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <LogIn size={18} />
                            )}
                            {isLoggingIn ? t.home.connecting : t.home.login}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
