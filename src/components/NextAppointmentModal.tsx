import { X, User, AlertTriangle, CalendarPlus, Settings } from 'lucide-react';
import { format, isTomorrow, isToday, parseISO, addMinutes } from 'date-fns';
import { es, enUS, he } from 'date-fns/locale';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface NextAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: any;
    user: any;
}

const locales: Record<string, any> = { es, en: enUS, he };

export default function NextAppointmentModal({
    isOpen,
    onClose,
    appointment,
    user
}: NextAppointmentModalProps) {
    const { t, language } = useTranslation();
    const navigate = useNavigate();

    if (!isOpen || !appointment) return null;

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

    const formatGoogleDate = (date: Date) => {
        try {
            return date.toISOString().replace(/-|:|\.\d+/g, '');
        } catch (e) {
            return '';
        }
    };

    const handleAddToCalendar = () => {
        if (!appointment?.fecha_hora_inicio) return;

        try {
            const startDate = parseISO(appointment.fecha_hora_inicio);
            const duration = appointment.duracion || 30;
            const endDate = addMinutes(startDate, duration);

            const params = new URLSearchParams({
                action: 'TEMPLATE',
                text: `Motobox: ${appointment.servicios?.name || 'Mantenimiento'}`,
                dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
                details: 'Cita confirmada en Motobox Garage.',
                location: 'Motobox Garage',
            });

            window.open(`https://www.google.com/calendar/render?${params.toString()}`, '_blank');
        } catch (e) {
            console.error('Error generating calendar link', e);
        }
    };

    const handleCancel = async () => {
        if (!confirm(language === 'he' ? 'האם אתה בטוח שברצונך לבטל?' : '¿Estás seguro de que deseas cancelar?')) return;

        try {
            const { error } = await supabase
                .from('citas')
                .update({ estado: 'cancelada' })
                .eq('id', appointment.id);

            if (error) throw error;
            onClose();
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert(t.common.error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <div className="bg-[#121212] rounded-[2.5rem] w-full max-w-lg border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[95vh] relative animate-scale-up">
                {/* Header Gradient Decor */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--color-primary)]/10 to-transparent pointer-events-none"></div>

                <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
                    <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] pl-2">{t.appointment_detail.title}</h3>
                    <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-all hover:rotate-90">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 custom-scrollbar">
                    {/* Warning Box */}
                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-3xl p-6 flex gap-5 ltr:text-left rtl:text-right shadow-inner">
                        <AlertTriangle className="text-cyan-400 shrink-0" size={24} />
                        <div className="space-y-1">
                            <p className="text-cyan-400 font-black text-[11px] uppercase tracking-[0.2em]">{t.appointment_detail.important}</p>
                            <p className="text-cyan-100/60 text-xs leading-relaxed font-medium">
                                {t.appointment_detail.warning}
                            </p>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="flex flex-col items-center gap-4 py-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[var(--color-primary)] blur-2xl opacity-20 rounded-full animate-pulse"></div>
                            <div className="w-24 h-24 rounded-full border-[3px] border-[var(--color-primary)] p-1 bg-[#1A1A1A] relative z-10 shadow-2xl">
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--color-primary)] to-yellow-700 flex items-center justify-center text-white text-3xl font-black uppercase">
                                        {user?.email?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-2xl font-black text-white tracking-tight">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white/[0.03] backdrop-blur-sm rounded-[2rem] p-8 border border-white/10 space-y-6 text-center shadow-2xl">
                        <p className="text-3xl font-black text-white capitalize tracking-tight">
                            {formatApptTime(appointment.fecha_hora_inicio)}
                        </p>

                        <div className="flex flex-col items-center gap-2 py-5 border-y border-white/5">
                            <div className="flex items-center gap-2 text-[var(--color-primary)]">
                                <Settings size={16} className="animate-spin-slow" />
                                <p className="font-black uppercase tracking-[0.2em] text-[12px]">
                                    {language === 'he' ? 'טיפול' : 'Servicio'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-white leading-none">
                                    {appointment.servicio_nombre || appointment.servicios?.name || 'Mantenimiento Motobox'}
                                </p>
                                {appointment.servicios?.price && (
                                    <p className="text-xl font-black text-[var(--color-primary)]">
                                        {appointment.servicios.price}€
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full border border-white/5">
                                <User size={18} className="text-[var(--color-primary)]" />
                                <span className="font-bold text-gray-300">{appointment.tecnicos?.nombre || (language === 'he' ? 'כל טכנאי' : 'Cualquier técnico')}</span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleAddToCalendar}
                                className="flex items-center gap-3 bg-white text-black hover:bg-[var(--color-primary)] hover:text-white font-black py-4 px-8 rounded-2xl mx-auto transition-all transform hover:scale-105 active:scale-95 shadow-xl group"
                            >
                                <CalendarPlus size={20} className="group-hover:rotate-12 transition-transform" />
                                {t.appointment_detail.add_to_calendar}
                            </button>
                        </div>
                    </div>

                    {/* Lower Buttons */}
                    <div className="flex flex-col items-center gap-6 pt-4 pb-4">
                        <div className="flex gap-8">
                            <button
                                onClick={() => navigate('/booking/servicios')}
                                className="text-yellow-500/80 hover:text-yellow-400 font-black transition-all uppercase tracking-[0.2em] text-[11px] border-b border-yellow-500/20 hover:border-yellow-400"
                            >
                                {t.appointment_detail.change}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="text-red-500/80 hover:text-red-400 font-black transition-all uppercase tracking-[0.2em] text-[11px] border-b border-red-500/20 hover:border-red-400"
                            >
                                {t.appointment_detail.cancel}
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/booking/servicios')}
                            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-black py-6 px-8 rounded-[1.5rem] text-lg uppercase tracking-[0.2em] transition-all transform hover:scale-[1.03] active:scale-95 shadow-[0_20px_40px_rgba(255,191,0,0.2)] mt-2"
                        >
                            {t.home.book_another}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
