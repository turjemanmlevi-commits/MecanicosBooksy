import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, LogIn, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PendingAppointmentsModal from '../components/PendingAppointmentsModal';
import NextAppointmentModal from '../components/NextAppointmentModal';
import { useTranslation } from '../hooks/useTranslation';

export default function Home() {
    const navigate = useNavigate();
    const { t, language } = useTranslation();

    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
    const [checkingAppointments, setCheckingAppointments] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [nextAppointment, setNextAppointment] = useState<any>(null);
    const [showNextApptModal, setShowNextApptModal] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                fetchNextAppointment(session.user.email!);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                fetchNextAppointment(session.user.email!);
            } else {
                setUser(null);
                setNextAppointment(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchNextAppointment = async (email: string) => {
        try {
            const { data: client } = await supabase
                .from('clientes')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            if (client) {
                const { data: appt } = await supabase
                    .from('citas')
                    .select(`
                        *,
                        vehiculos (matricula, marca, modelo),
                        tecnicos (nombre),
                        servicios (name, price)
                    `)
                    .eq('cliente_id', client.id)
                    .eq('estado', 'confirmada')
                    .gte('fecha_hora_inicio', new Date().toISOString())
                    .order('fecha_hora_inicio', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                setNextAppointment(appt);
            }
        } catch (err) {
            console.error("Error fetching next appointment:", err);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoggingIn(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'https://mecanicos-booksy.vercel.app/'
                }
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('Error logging in:', error.message);
            setIsLoggingIn(false);
        }
    };

    const handleBookClick = async () => {
        if (nextAppointment) {
            setShowNextApptModal(true);
            return;
        }

        setCheckingAppointments(true);
        try {
            if (user) {
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
                        .eq('estado', 'confirmada')
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
            navigate('/booking/servicios');
        } finally {
            setCheckingAppointments(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen relative" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <PendingAppointmentsModal
                isOpen={showPendingModal}
                onClose={() => setShowPendingModal(false)}
                appointments={pendingAppointments}
                onContinueBooking={() => navigate('/booking/servicios')}
                onCancelAppointment={() => { }}
            />

            <NextAppointmentModal
                isOpen={showNextApptModal}
                onClose={() => setShowNextApptModal(false)}
                appointment={nextAppointment}
                user={user}
            />

            <div className="absolute inset-0 bg-[#0B0B0B] bg-[url('/hero.jpg')] bg-cover bg-center bg-no-repeat opacity-40"></div>

            <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center py-12 gap-12">
                <div className="space-y-4 animate-fade-in mb-4">
                    <img src="/logo-amarillo-sinbisel-5.png" alt="MOTOBOX" className="h-40 mx-auto mb-6 object-contain" />
                    <p className="text-xl text-white font-bold tracking-[0.4em] uppercase">{t.home.motto}</p>
                </div>

                <div className="w-full max-w-sm flex flex-col gap-6">
                    <button
                        onClick={handleBookClick}
                        disabled={checkingAppointments}
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-black font-black py-6 px-8 rounded-2xl text-2xl uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-yellow-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {checkingAppointments ? t.common.loading : (nextAppointment ? t.home.next_appointment : t.home.book)}
                        {!checkingAppointments && <ChevronRight size={28} className={language === 'he' ? 'rotate-180' : ''} />}
                    </button>

                    {!user && (
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoggingIn}
                            className="bg-white/10 hover:bg-white/20 text-white font-black py-4 px-6 rounded-2xl text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 w-full max-w-[200px] self-center uppercase tracking-widest"
                        >
                            {isLoggingIn ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <LogIn size={18} />
                            )}
                            {isLoggingIn ? t.home.connecting : t.home.login}
                        </button>
                    )}
                </div>

                <div className="w-full max-w-md grid grid-cols-1 gap-4 mt-8">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-4 shadow-2xl">
                        <a
                            href="https://www.google.com/maps/search/?api=1&query=Av+de+los+Lirios+78+Las+Lagunas+de+Mijas"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 text-left p-3 hover:bg-white/5 rounded-2xl transition-all group"
                        >
                            <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center group-hover:bg-[var(--color-primary)] transition-colors">
                                <MapPin className="text-[var(--color-primary)] group-hover:text-black transition-colors" size={20} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Av. de los Lirios, 78</p>
                                <p className="text-gray-500 text-xs">Las Lagunas de Mijas, Málaga</p>
                            </div>
                        </a>

                        <div className="flex items-center gap-4 text-left p-3">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                                <Clock className="text-gray-400" size={20} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{language === 'he' ? 'שני - שישי' : 'Lunes - Viernes'}</p>
                                <p className="text-gray-500 text-xs">09:00 - 19:00</p>
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col items-center">
                            <button
                                onClick={() => navigate('/consultar')}
                                className="text-gray-400 hover:text-white transition-all text-sm font-bold uppercase tracking-widest border-b border-transparent hover:border-white pb-1"
                            >
                                {t.home.check}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 opacity-30">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">© 2026 MOTOBOX MIJAS</p>
                </div>
            </div>
        </div>
    );
}
