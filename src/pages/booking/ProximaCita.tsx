import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import {
    AlertTriangle,
    Calendar,
    User,
    ArrowLeft,
    CalendarPlus
} from 'lucide-react';
import { format, isTomorrow, isToday, parseISO } from 'date-fns';
import { es, enUS, he } from 'date-fns/locale';

const locales: Record<string, any> = { es, en: enUS, he };

export default function ProximaCita() {
    const navigate = useNavigate();
    const { t, language } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadAppointment = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                navigate('/');
                return;
            }
            setUser(session.user);

            const { data: client } = await supabase
                .from('clientes')
                .select('id')
                .eq('email', session.user.email)
                .maybeSingle();

            if (client) {
                const { data: appt } = await supabase
                    .from('citas')
                    .select(`
                        *,
                        vehiculos (matricula, marca, modelo),
                        tecnicos (nombre)
                    `)
                    .eq('cliente_id', client.id)
                    .eq('estado', 'confirmada')
                    .gte('fecha_hora_inicio', new Date().toISOString())
                    .order('fecha_hora_inicio', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                if (appt) {
                    setAppointment(appt);
                } else {
                    navigate('/');
                }
            } else {
                navigate('/');
            }
            setLoading(false);
        };

        loadAppointment();
    }, [navigate]);

    const handleCancel = async () => {
        if (!confirm(language === 'he' ? 'האם אתה בטוח שברצונך לבטל?' : '¿Estás seguro de que deseas cancelar?')) return;

        try {
            const { error } = await supabase
                .from('citas')
                .update({ estado: 'cancelada' })
                .eq('id', appointment.id);

            if (error) throw error;
            navigate('/');
        } catch (err) {
            console.error(err);
            alert(t.common.error);
        }
    };

    const formatApptTime = (dateStr: string) => {
        const date = parseISO(dateStr);
        const locale = locales[language] || es;

        let dayPrefix = '';
        if (isToday(date)) {
            dayPrefix = language === 'he' ? 'היום' : language === 'en' ? 'Today' : 'Hoy';
        } else if (isTomorrow(date)) {
            dayPrefix = language === 'he' ? 'מחר' : language === 'en' ? 'Tomorrow' : 'Mañana';
        } else {
            dayPrefix = format(date, 'EEEE d MMMM', { locale });
        }

        const time = format(date, 'p', { locale });

        if (language === 'he') return `${dayPrefix} ב-${time}`;
        if (language === 'en') return `${dayPrefix} at ${time}`;
        return `${dayPrefix} a las ${time}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    if (!appointment) return null;

    return (
        <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] animate-fade-in" dir={language === 'he' ? 'rtl' : 'ltr'}>
            {/* Custom Header for this page */}
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 text-white hover:text-[var(--color-primary)]">
                    <ArrowLeft size={24} className={language === 'he' ? 'rotate-180' : ''} />
                </button>
                <img src="/logo-amarillo-sinbisel-5.png" alt="MOTOBOX" className="h-8 object-contain" />
                <div className="w-10"></div> {/* Spacer */}
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-white ltr:text-left rtl:text-right">
                    {t.appointment_detail.title}
                </h2>

                {/* Important Warning Box */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex gap-4 ltr:text-left rtl:text-right">
                    <div className="shrink-0 flex flex-col items-center">
                        <AlertTriangle className="text-cyan-400" size={24} />
                    </div>
                    <div>
                        <p className="text-cyan-400 font-black text-xs uppercase tracking-widest mb-1">{t.appointment_detail.important}</p>
                        <p className="text-cyan-100/80 text-sm leading-relaxed">
                            {t.appointment_detail.warning}
                        </p>
                    </div>
                </div>

                {/* Client Profile */}
                <div className="flex flex-col items-center gap-3 pt-4">
                    <div className="w-20 h-20 rounded-full border-2 border-[var(--color-primary)] p-1 bg-black/40 shadow-[0_0_20px_rgba(192,0,0,0.3)]">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-3xl font-bold uppercase">
                                {user?.email?.[0]}
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-white">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                    </div>
                </div>

                {/* Appointment Info Card */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-6 shadow-xl text-center">
                    <div>
                        <p className="text-3xl font-black text-white capitalize">
                            {formatApptTime(appointment.fecha_hora_inicio)}
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 py-4 border-y border-white/5">
                        <div className="flex items-center gap-2 text-[var(--color-primary)]">
                            <Calendar size={18} />
                            <p className="font-black uppercase tracking-widest text-lg">
                                {language === 'he' ? 'טיפול' : 'Servicio'}
                            </p>
                        </div>
                        <p className="text-xl font-bold text-white">
                            {/* In a real app we'd get the service name from the ID or another field, using a placeholder for now */}
                            {appointment.servicio_nombre || 'Mantenimiento Motobox'}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-gray-400">
                            <User size={18} />
                            <p className="font-bold">{appointment.tecnicos?.nombre || (language === 'he' ? 'כל טכנאי' : 'Cualquier técnico')}</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-2 px-6 rounded-full mx-auto transition-all border border-white/10">
                            <CalendarPlus size={18} />
                            {t.appointment_detail.add_to_calendar}
                        </button>
                    </div>
                </div>

                {/* Action Links */}
                <div className="flex flex-col items-center gap-2 pt-2 pb-10">
                    <button
                        onClick={() => navigate('/booking/servicios')}
                        className="text-yellow-600 hover:text-yellow-500 font-bold transition-colors uppercase tracking-widest text-sm"
                    >
                        {t.appointment_detail.change}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-red-700 hover:text-red-500 font-bold transition-colors uppercase tracking-widest text-sm"
                    >
                        {t.appointment_detail.cancel}
                    </button>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="p-6 bg-gradient-to-t from-[var(--bg-primary)] to-transparent sticky bottom-0">
                <button
                    onClick={() => navigate('/booking/servicios')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-black py-5 px-8 rounded-xl text-xl uppercase tracking-widest transition-all transform hover:scale-105 shadow-2xl shadow-black/80 flex items-center justify-center gap-2"
                >
                    {t.home.book_another}
                </button>
            </div>
        </div>
    );
}
