import { X, User, AlertTriangle, CalendarPlus, Settings } from 'lucide-react';
import { format, isTomorrow, isToday, parseISO } from 'date-fns';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <div className="bg-[#1A1A1A] rounded-3xl w-full max-w-lg border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h3 className="text-lg font-bold text-white uppercase tracking-widest">{t.appointment_detail.title}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Warning Box */}
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 flex gap-4 ltr:text-left rtl:text-right">
                        <AlertTriangle className="text-cyan-400 shrink-0 mt-1" size={20} />
                        <div>
                            <p className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{t.appointment_detail.important}</p>
                            <p className="text-cyan-100/70 text-xs leading-relaxed">
                                {t.appointment_detail.warning}
                            </p>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="flex flex-col items-center gap-3 py-2">
                        <div className="w-16 h-16 rounded-full border-2 border-[var(--color-primary)] p-0.5 bg-black/40 shadow-xl">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-2xl font-black uppercase">
                                    {user?.email?.[0]}
                                </div>
                            )}
                        </div>
                        <p className="text-xl font-black text-white">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4 text-center">
                        <p className="text-2xl font-black text-white capitalize">
                            {formatApptTime(appointment.fecha_hora_inicio)}
                        </p>

                        <div className="flex flex-col items-center gap-1 py-3 border-y border-white/5">
                            <div className="flex items-center gap-2 text-[var(--color-primary)] opacity-80">
                                <Settings size={14} />
                                <p className="font-extrabold uppercase tracking-widest text-[10px]">
                                    {language === 'he' ? 'טיפול' : 'Servicio'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold text-white">
                                    {appointment.servicio_nombre || appointment.servicios?.name || 'Mantenimiento Motobox'}
                                </p>
                                {appointment.servicios?.price && (
                                    <span className="text-lg font-bold text-[var(--color-primary)]">
                                        {appointment.servicios.price}€
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                <span className="font-bold">{appointment.tecnicos?.nombre || (language === 'he' ? 'כל טכנאי' : 'Cualquier técnico')}</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-2 px-5 rounded-full mx-auto transition-all border border-white/10 text-sm">
                                <CalendarPlus size={16} />
                                {t.appointment_detail.add_to_calendar}
                            </button>
                        </div>
                    </div>

                    {/* Lower Buttons */}
                    <div className="flex flex-col items-center gap-3 pt-2">
                        <div className="flex gap-6">
                            <button
                                onClick={() => navigate('/booking/servicios')}
                                className="text-yellow-500 hover:text-yellow-400 font-black transition-colors uppercase tracking-[0.2em] text-[10px]"
                            >
                                {t.appointment_detail.change}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="text-red-500 hover:text-red-400 font-black transition-colors uppercase tracking-[0.2em] text-[10px]"
                            >
                                {t.appointment_detail.cancel}
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/booking/servicios')}
                            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-black font-black py-4 px-8 rounded-2xl text-sm uppercase tracking-widest transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl mt-4"
                        >
                            {t.home.book_another}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
