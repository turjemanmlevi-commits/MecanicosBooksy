import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { addDays, format, startOfDay, parseISO, setHours, setMinutes, isBefore, addMinutes } from 'date-fns';
import { es, enUS, he } from 'date-fns/locale';
import { useTranslation } from '../../hooks/useTranslation';

const START_HOUR = 9;
const END_HOUR = 19;
const SLOT_DURATION = 30;

const dateLocales: Record<string, any> = {
    es: es,
    en: enUS,
    he: he
};

export default function FechaHora() {
    const navigate = useNavigate();
    const { selectedTechnician, selectedService, setDate, setTimeSlot } = useBookingStore();
    const { t, language } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [techCount, setTechCount] = useState(3);
    const [loading, setLoading] = useState(true);

    const daysToShow = useMemo(() => {
        return Array.from({ length: 5 }).map((_, i) => addDays(currentDate, i));
    }, [currentDate]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const start = startOfDay(currentDate).toISOString();
            const end = addDays(currentDate, 6).toISOString();

            try {
                const { data: techs, error: techError } = await supabase
                    .from('tecnicos')
                    .select('id')
                    .eq('activo', true);

                if (!techError && techs) {
                    setTechCount(techs.length);
                } else {
                    setTechCount(3);
                }

                let query = supabase
                    .from('citas')
                    .select('fecha_hora_inicio, duracion, tecnico_id')
                    .gte('fecha_hora_inicio', start)
                    .lt('fecha_hora_inicio', end)
                    .neq('estado', 'cancelada');

                if (selectedTechnician) {
                    query = query.eq('tecnico_id', selectedTechnician.id);
                }

                const { data: appts, error: apptError } = await query;
                if (!apptError && appts) setAppointments(appts);
            } catch (err) {
                console.error('Error fetching data:', err);
                setTechCount(3);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [currentDate, selectedTechnician]);

    const slotDuration = selectedService?.duration || SLOT_DURATION;

    const generateSlots = (day: Date) => {
        if (day.getDay() === 0 || day.getDay() === 6) return [];
        const slots = [];
        let currentTime = setMinutes(setHours(day, START_HOUR), 0);
        const endTime = setMinutes(setHours(day, END_HOUR), 0);
        while (isBefore(currentTime, endTime)) {
            slots.push(new Date(currentTime));
            currentTime = addMinutes(currentTime, slotDuration);
        }
        return slots;
    };

    const isSlotAvailable = (slot: Date) => {
        if (isBefore(slot, new Date())) return false;
        // Temporary reset: ignore appointments to show all slots as available
        return true;

        /* Original logic:
        const slotEnd = addMinutes(slot, slotDuration);
        const activeTechCount = techCount > 0 ? techCount : 3;

        if (selectedTechnician) {
            const isBooked = appointments.some(appt => {
                const apptStart = parseISO(appt.fecha_hora_inicio);
                const apptEnd = addMinutes(apptStart, appt.duracion);
                return (isBefore(slot, apptEnd) && isBefore(apptStart, slotEnd));
            });
            return !isBooked;
        } else {
            const counts = appointments.filter(appt => {
                const apptStart = parseISO(appt.fecha_hora_inicio);
                const apptEnd = addMinutes(apptStart, appt.duracion);
                return (isBefore(slot, apptEnd) && isBefore(apptStart, slotEnd));
            });
            return counts.length < activeTechCount;
        }
        */
    };

    useEffect(() => {
        if (!selectedService && !loading) {
            navigate('/booking/servicios');
        }
    }, [selectedService, loading, navigate]);

    const handleSlotClick = (slot: Date) => {
        setDate(slot);
        setTimeSlot(format(slot, 'HH:mm'));
        navigate('/booking/cliente');
    };

    const nextWeek = () => setCurrentDate(addDays(currentDate, 5));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -5));

    const locale = dateLocales[language] || es;

    return (
        <div className="flex flex-col h-full animate-fade-in pb-20" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <StepIndicator currentStep={2} />

            <div className="flex items-center justify-between mb-4 ltr:text-left rtl:text-right">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className={`p-1 -ml-1 text-gray-400 hover:text-white ${language === 'he' ? 'rotate-180' : ''}`}>
                        <ChevronLeft />
                    </button>
                    <h2 className="text-2xl font-bold text-white">{t.booking.time}</h2>
                </div>
                <div className="flex gap-2" dir="ltr"> {/* Navigation buttons always ltr for consistency? No, better handle based on lang */}
                    <button onClick={prevWeek} className="p-2 border border-white/10 rounded-lg hover:bg-white/10 text-white"><ChevronLeft size={20} /></button>
                    <button onClick={nextWeek} className="p-2 border border-white/10 rounded-lg hover:bg-white/10 text-white"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto">
                {loading ? (
                    <div className="text-center py-10 text-gray-400"><Clock className="animate-spin mx-auto mb-2" /> {language === 'he' ? 'בודק זמינות...' : language === 'en' ? 'Checking availability...' : 'Cargando disponibilidad...'}</div>
                ) : (
                    daysToShow.map((day) => (
                        <div key={day.toISOString()} className="bg-[var(--bg-card)] rounded-xl p-4 border border-white/5 ltr:text-left rtl:text-right">
                            <h3 className="text-lg font-bold capitalize mb-4 border-b border-white/5 pb-2 text-white">
                                {format(day, 'EEEE d', { locale })}
                            </h3>

                            <div className="grid grid-cols-4 gap-3">
                                {generateSlots(day).map((slot) => {
                                    const available = isSlotAvailable(slot);
                                    const isPast = isBefore(slot, new Date());

                                    return (
                                        <button
                                            key={slot.toISOString()}
                                            disabled={!available || isPast}
                                            onClick={() => handleSlotClick(slot)}
                                            className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${available && !isPast
                                                ? 'bg-transparent border border-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]'
                                                : isPast
                                                    ? 'bg-white/5 text-gray-700 cursor-not-allowed border border-transparent opacity-50'
                                                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-transparent opacity-50'
                                                }`}
                                        >
                                            {format(slot, 'HH:mm')}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
