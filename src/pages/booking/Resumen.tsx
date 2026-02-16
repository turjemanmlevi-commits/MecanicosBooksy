import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { ChevronLeft, AlertTriangle, Calendar, User, Car } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { es, enUS, he } from 'date-fns/locale';
import { useTranslation } from '../../hooks/useTranslation';

const dateLocales: Record<string, any> = {
    es: es,
    en: enUS,
    he: he
};

export default function Resumen() {
    const navigate = useNavigate();
    const { t, language } = useTranslation();
    const {
        client,
        vehicle,
        selectedTechnician,
        selectedDate,
        selectedTimeSlot,
        selectedService,
        reset,
        setLastBooking
    } = useBookingStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTimeSlot) return;
        setLoading(true);
        setError(null);

        try {
            const cleanPhone = client.telefono.replace(/\s/g, '');
            let clientId;

            const { data: existingClient } = await supabase
                .from('clientes')
                .select('id')
                .eq('telefono', cleanPhone)
                .maybeSingle();

            if (existingClient) {
                clientId = existingClient.id;
                await supabase.from('clientes').update({
                    nombre: client.nombre,
                    email: client.email
                }).eq('id', clientId);
            } else {
                const { data: newClient, error: clientError } = await supabase
                    .from('clientes')
                    .insert([{
                        nombre: client.nombre,
                        telefono: cleanPhone,
                        email: client.email,
                        consentimiento_rgpd: client.consentimiento
                    }])
                    .select()
                    .single();

                if (clientError) throw clientError;
                clientId = newClient.id;
            }

            const cleanPlate = vehicle.matricula.replace(/\s/g, '').toUpperCase();
            let vehicleId;
            const { data: existingVehicle } = await supabase
                .from('vehiculos')
                .select('id')
                .eq('matricula', cleanPlate)
                .maybeSingle();

            if (existingVehicle) {
                vehicleId = existingVehicle.id;
                await supabase.from('vehiculos').update({
                    marca: vehicle.marca,
                    modelo: vehicle.modelo,
                    anio: vehicle.anio,
                    notas: vehicle.motivo
                }).eq('id', vehicleId);
            } else {
                const { data: newVehicle, error: vehicleError } = await supabase
                    .from('vehiculos')
                    .insert([{
                        cliente_id: clientId,
                        matricula: cleanPlate,
                        marca: vehicle.marca,
                        modelo: vehicle.modelo,
                        anio: vehicle.anio,
                        notas: vehicle.motivo
                    }])
                    .select()
                    .single();

                if (vehicleError) throw vehicleError;
                vehicleId = newVehicle.id;
            }

            const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
            const startDate = new Date(selectedDate);
            startDate.setHours(hours, minutes, 0, 0);

            const { error: apptError } = await supabase
                .from('citas')
                .insert([{
                    cliente_id: clientId,
                    vehiculo_id: vehicleId,
                    tecnico_id: selectedTechnician?.id || null,
                    fecha_hora_inicio: startDate.toISOString(),
                    duracion: selectedService?.duration || 30,
                    estado: 'confirmada'
                }]);

            if (apptError) throw apptError;

            const sheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
            if (sheetsUrl) {
                try {
                    await fetch(sheetsUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'text/plain' },
                        body: JSON.stringify({
                            nombre: client.nombre,
                            email: client.email,
                            telefono: cleanPhone,
                            matricula: cleanPlate,
                            marca: vehicle.marca,
                            modelo: vehicle.modelo,
                            anio: vehicle.anio,
                            motivo: vehicle.motivo,
                            servicio: selectedService?.name,
                            fecha_hora: format(startDate, 'dd/MM/yyyy HH:mm'),
                            tecnico: selectedTechnician?.nombre || 'Cualquier técnico'
                        })
                    });
                } catch (sheetErr) {
                    console.error('Sheet Sync Error:', sheetErr);
                }
            }

            try {
                await supabase.functions.invoke('send-booking-confirmation', {
                    body: {
                        email: client.email,
                        nombre: client.nombre,
                        fecha_hora: format(startDate, 'dd/MM/yyyy HH:mm'),
                        servicio: selectedService?.name,
                        duracion: selectedService?.duration,
                        matricula: cleanPlate,
                        tecnico: selectedTechnician?.nombre || 'Cualquier técnico'
                    }
                });
            } catch (emailErr) {
                console.error('Email Error:', emailErr);
            }

            setLastBooking({
                date: selectedDate.toISOString(),
                time: selectedTimeSlot,
                service: selectedService?.name || 'Cita en Motobox',
                duration: selectedService?.duration || 30
            });

            reset();
            navigate('/booking/confirmada');

        } catch (err: any) {
            console.error('Error booking:', err);
            setError(err.message || t.common.error);
        } finally {
            setLoading(false);
        }
    };

    if (!client.nombre || !vehicle.matricula || !selectedDate) {
        return <div className="p-4 text-center">{language === 'he' ? 'חסרים נתונים.' : language === 'en' ? 'Missing data.' : 'Faltan datos.'} <button onClick={() => navigate('/')} className="underline">{t.common.back}</button></div>;
    }

    const locale = dateLocales[language] || es;

    return (
        <div className="flex flex-col h-full animate-fade-in pb-20" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <StepIndicator currentStep={5} totalSteps={5} />

            <div className="flex items-center gap-2 mb-6 ltr:text-left rtl:text-right">
                <button onClick={() => navigate(-1)} className={`p-1 -ml-1 text-gray-400 hover:text-white ${language === 'he' ? 'rotate-180' : ''}`}>
                    <ChevronLeft />
                </button>
                <h2 className="text-2xl font-bold text-white">{t.booking.summary}</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
                <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--color-primary)]/50 relative overflow-hidden ltr:text-left rtl:text-right">
                    <div className={`absolute top-0 ${language === 'he' ? 'left-0' : 'right-0'} p-4 opacity-10`}>
                        <Calendar size={100} />
                    </div>
                    <p className="text-sm text-[var(--color-primary)] font-bold uppercase tracking-wider mb-1">{t.booking.time}</p>
                    <h3 className="text-3xl font-bold text-white mb-2 capitalize">
                        {selectedDate && format(selectedDate, 'EEEE d MMMM', { locale })}
                    </h3>
                    <div className="text-4xl font-bold text-white tracking-tighter">
                        {selectedTimeSlot}
                    </div>
                </div>

                <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-white/5 space-y-4">
                    <div className="flex items-start gap-3 pb-4 border-b border-white/5 ltr:text-left rtl:text-right">
                        <User className="text-gray-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs text-gray-500 uppercase">{language === 'he' ? 'לקוח' : language === 'en' ? 'Client' : 'Cliente'}</p>
                            <p className="font-medium text-white">{client.nombre}</p>
                            <p className="text-sm text-gray-400">{client.telefono}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 pb-4 border-b border-white/5 ltr:text-left rtl:text-right">
                        <Car className="text-gray-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs text-gray-500 uppercase">{language === 'he' ? 'רכב' : language === 'en' ? 'Vehicle' : 'Vehículo'}</p>
                            <p className="font-medium text-white">{vehicle.matricula}</p>
                            <p className="text-sm text-gray-400">{vehicle.marca} {vehicle.modelo}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 ltr:text-left rtl:text-right">
                        <User className="text-gray-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs text-gray-500 uppercase">{language === 'he' ? 'טכנאי' : language === 'en' ? 'Technician' : 'Profesional'}</p>
                            <p className="font-medium text-white">
                                {selectedTechnician ? selectedTechnician.nombre : (language === 'he' ? 'כל טכנאי פנוי' : language === 'en' ? 'Any technician' : 'Cualquier técnico disponible')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5 ltr:text-left rtl:text-right">
                    <p className="font-bold text-lg mb-1 uppercase text-[var(--color-primary)]">
                        {selectedService?.name || 'SERVICIO TALLER'}
                    </p>
                    <p className="text-sm text-gray-400">
                        {language === 'he' ? 'זמן משוער' : language === 'en' ? 'Estimated duration' : 'Duración estimada'}: {selectedService?.duration || 30} min
                    </p>
                </div>

                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20 flex gap-3 ltr:text-left rtl:text-right">
                    <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                    <p className="text-xs text-yellow-200/80 leading-relaxed">
                        {language === 'he'
                            ? 'חשוב: נא להגיע 10 דקות לפני התור. אם אינך יכול להגיע, אנא בטל מראש כדי לפנות את המקום.'
                            : language === 'en'
                                ? 'IMPORTANT: Please arrive 10 minutes before your appointment. If you cannot attend, please cancel in advance to free up the slot.'
                                : 'IMPORTANTE: Acuda 10 minutos antes de su cita. Si no puede asistir, por favor cancele con antelación para liberar el hueco.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/20 text-red-200 p-4 rounded-lg text-sm border border-red-500/50">
                        {error}
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4">
                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                    {loading ? (language === 'he' ? 'מעבד...' : language === 'en' ? 'PROCESSING...' : 'PROCESANDO...') : (language === 'he' ? 'אישור תור' : language === 'en' ? 'CONFIRM BOOKING' : 'CONFIRMAR CITA')}
                </button>
            </div>
        </div>
    );
}
