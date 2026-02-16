import { X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS, he } from 'date-fns/locale';
import { useTranslation } from '../hooks/useTranslation';

interface PendingAppointmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointments: any[];
    onContinueBooking: () => void;
    onCancelAppointment: (id: string) => void;
}

const dateLocales: Record<string, any> = {
    es: es,
    en: enUS,
    he: he
};

export default function PendingAppointmentsModal({
    isOpen,
    onClose,
    appointments,
    onContinueBooking,
    onCancelAppointment
}: PendingAppointmentsModalProps) {
    const { t, language } = useTranslation();
    if (!isOpen) return null;

    const locale = dateLocales[language] || es;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <div className="bg-[#1A1A1A] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertCircle className="text-[var(--color-primary)]" />
                        {language === 'he' ? 'תורות ממתינים' : language === 'en' ? 'Pending Appointments' : 'Citas Pendientes'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <p className="text-gray-300">
                        {language === 'he'
                            ? `יש לך ${appointments.length} תורות ממתינים. מה תרצה לעשות?`
                            : language === 'en'
                                ? `You have ${appointments.length} pending ${appointments.length === 1 ? 'appointment' : 'appointments'}. What would you like to do?`
                                : `Tienes ${appointments.length} ${appointments.length === 1 ? 'cita pendiente' : 'citas pendientes'}. ¿Qué deseas hacer?`
                        }
                    </p>

                    <div className="space-y-3">
                        {appointments.map((appt) => (
                            <div key={appt.id} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-[var(--color-primary)]/50 transition-colors text-right rtl:text-right ltr:text-left">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="ltr:text-left rtl:text-right">
                                        <p className="text-white font-bold capitalize">
                                            {format(new Date(appt.fecha_hora_inicio), "EEEE d 'de' MMMM", { locale })}
                                        </p>
                                        <p className="text-[var(--color-primary)] font-bold text-lg">
                                            {format(new Date(appt.fecha_hora_inicio), 'HH:mm')}
                                        </p>
                                    </div>
                                    <div className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs font-bold uppercase">
                                        {language === 'he' ? 'ממתין' : language === 'en' ? 'Pending' : 'Pendiente'}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-400 mb-4 ltr:text-left rtl:text-right">
                                    {appt.vehiculos && (
                                        <p>{appt.vehiculos.marca} {appt.vehiculos.modelo} - {appt.vehiculos.matricula}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onCancelAppointment(appt.id)}
                                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                                    >
                                        {t.common.cancel}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/5">
                    <button
                        onClick={onContinueBooking}
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-wider text-sm"
                    >
                        {language === 'he' ? 'תיאום תור חדש' : language === 'en' ? 'New Booking' : 'Nueva Reserva'}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full mt-3 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        {language === 'he' ? 'סגור' : language === 'en' ? 'Close' : 'Cerrar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
