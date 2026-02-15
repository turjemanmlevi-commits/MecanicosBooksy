import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { addDays, format, startOfDay, isSameDay, parseISO, setHours, setMinutes, isBefore, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

// Configuration (could be fetched from DB)
const START_HOUR = 9;
const END_HOUR = 19;
const SLOT_DURATION = 30;

export default function FechaHora() {
    const navigate = useNavigate();
    const { selectedTechnician, selectedService, setDate, setTimeSlot } = useBookingStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [techCount, setTechCount] = useState(3); // Default to 3
    const [loading, setLoading] = useState(true);

    // Generate next 5 days
    const daysToShow = useMemo(() => {
        return Array.from({ length: 5 }).map((_, i) => addDays(currentDate, i));
    }, [currentDate]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const start = startOfDay(currentDate).toISOString();
            const end = addDays(currentDate, 6).toISOString();

            // Fetch active technicians count
            const { count } = await supabase
                .from('tecnicos')
                .select('*', { count: 'exact', head: true })
                .eq('activo', true);

            if (count !== null) setTechCount(count);

            // Fetch appointments
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

            // Fetch blocks
            let blockQuery = supabase
                .from('bloqueos')
                .select('fecha_inicio, fecha_fin, tecnico_id')
                .gte('fecha_fin', start)
                .or(`fecha_inicio.lt.${end}`);

            if (selectedTechnician) {
                blockQuery = blockQuery.eq('tecnico_id', selectedTechnician.id);
            }

            const { data: blks, error: blkError } = await blockQuery;

            if (!apptError && appts) setAppointments(appts);
            setLoading(false);
        }

        fetchData();
    }, [currentDate, selectedTechnician]);

    // Use service duration or default to 30
    const slotDuration = selectedService?.duration || SLOT_DURATION;

    const generateSlots = (day: Date) => {
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
        // Check if slot is in the past
        if (isBefore(slot, new Date())) return false;

        // Check collision with appointments
        if (selectedTechnician) {
            const isBooked = appointments.some(appt => {
                const apptStart = parseISO(appt.fecha_hora_inicio);
                const apptEnd = addMinutes(apptStart, appt.duracion);
                return (isBefore(slot, apptEnd) && isBefore(apptStart, addMinutes(slot, slotDuration)));
            });
            return !isBooked;
        } else {
            const apptsAtSlot = appointments.filter(appt => {
                const apptStart = parseISO(appt.fecha_hora_inicio);
                return isSameDay(apptStart, slot) && format(apptStart, 'HH:mm') === format(slot, 'HH:mm');
            });
            return apptsAtSlot.length < techCount;
        }
    };

    const handleSlotClick = (slot: Date) => {
        setDate(slot);
        setTimeSlot(format(slot, 'HH:mm'));
        navigate('/booking/cliente');
    };

    const nextWeek = () => setCurrentDate(addDays(currentDate, 5));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -5));

    return (
        <div className="flex flex-col h-full animate-fade-in pb-20"> {/* pb-20 for bottom space */}
            <StepIndicator currentStep={2} />

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-400 hover:text-white">
                        <ChevronLeft />
                    </button>
                    <h2 className="text-2xl font-bold">Fecha y Hora</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevWeek} className="p-2 border border-white/10 rounded-lg hover:bg-white/10"><ChevronLeft size={20} /></button>
                    <button onClick={nextWeek} className="p-2 border border-white/10 rounded-lg hover:bg-white/10"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto">
                {loading ? (
                    <div className="text-center py-10 text-gray-400"><Clock className="animate-spin mx-auto mb-2" /> Cargando disponibilidad...</div>
                ) : (
                    daysToShow.map((day) => (
                        <div key={day.toISOString()} className="bg-[var(--bg-card)] rounded-xl p-4 border border-white/5">
                            <h3 className="text-lg font-bold capitalize mb-4 border-b border-white/5 pb-2">
                                {format(day, 'EEEE d', { locale: es })}
                            </h3>

                            <div className="grid grid-cols-4 gap-3">
                                {generateSlots(day).map((slot) => {
                                    const available = isSlotAvailable(slot);
                                    // Filter out past slots today
                                    if (isBefore(slot, new Date())) return null;

                                    return (
                                        <button
                                            key={slot.toISOString()}
                                            disabled={!available}
                                            onClick={() => handleSlotClick(slot)}
                                            className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${available
                                                ? 'bg-transparent border border-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]'
                                                : 'bg-white/5 text-gray-600 cursor-not-allowed border border-transparent'
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
