import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { ChevronLeft, AlertTriangle, Calendar, User, Car } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Resumen() {
    const navigate = useNavigate();
    const { client, vehicle, selectedTechnician, selectedDate, selectedTimeSlot, selectedService, reset } = useBookingStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTimeSlot) return;
        setLoading(true);
        setError(null);

        try {
            // 1. Get or Create Client
            let clientId;
            const { data: existingClient } = await supabase
                .from('clientes')
                .select('id')
                .eq('telefono', client.telefono)
                .single();

            if (existingClient) {
                clientId = existingClient.id;
                // Optionally update details
                await supabase.from('clientes').update({
                    nombre: client.nombre,
                    email: client.email
                }).eq('id', clientId);
            } else {
                const { data: newClient, error: clientError } = await supabase
                    .from('clientes')
                    .insert([{
                        nombre: client.nombre,
                        telefono: client.telefono,
                        email: client.email,
                        consentimiento_rgpd: client.consentimiento
                    }])
                    .select()
                    .single();

                if (clientError) throw clientError;
                clientId = newClient.id;
            }

            // 2. Get or Create Vehicle
            let vehicleId;
            const { data: existingVehicle } = await supabase
                .from('vehiculos')
                .select('id')
                .eq('matricula', vehicle.matricula)
                .single();

            if (existingVehicle) {
                vehicleId = existingVehicle.id;
            } else {
                const { data: newVehicle, error: vehicleError } = await supabase
                    .from('vehiculos')
                    .insert([{
                        cliente_id: clientId,
                        matricula: vehicle.matricula,
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

            // 3. Create Appointment
            const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
            const startDate = new Date(selectedDate);
            startDate.setHours(hours, minutes, 0, 0);

            const { error: apptError } = await supabase
                .from('citas')
                .insert([{
                    cliente_id: clientId,
                    vehiculo_id: vehicleId,
                    tecnico_id: selectedTechnician?.id || null, // Handle "Any" logic later (assign to random or leave null?)
                    fecha_hora_inicio: startDate.toISOString(),
                    duracion: selectedService?.duration || 30, // Use service duration
                    estado: 'confirmada' // Auto-confirm for MVP
                }]);

            if (apptError) throw apptError;

            // 4. Sync to Google Sheets
            const sheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
            if (sheetsUrl) {
                try {
                    await fetch(sheetsUrl, {
                        method: 'POST',
                        mode: 'no-cors', // Important for Google Apps Script
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            nombre: client.nombre,
                            email: client.email,
                            telefono: client.telefono,
                            matricula: vehicle.matricula,
                            vehiculo: `${vehicle.marca} ${vehicle.modelo}`,
                            servicio: selectedService?.name,
                            fecha_hora: format(startDate, 'dd/MM/yyyy HH:mm'),
                            tecnico: selectedTechnician?.nombre || 'Cualquier técnico'
                        })
                    });
                } catch (sheetErr) {
                    console.error('Error syncing to Google Sheets:', sheetErr);
                }
            }

            // Success
            reset(); // Clear store? Maybe keep for success screen
            navigate('/booking/confirmada');

        } catch (err: any) {
            console.error('Error booking:', err);
            setError(err.message || 'Error al procesar la reserva. Inténtelo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (!client.nombre || !vehicle.matricula || !selectedDate) {
        return <div className="p-4 text-center">Faltan datos. <button onClick={() => navigate('/')} className="underline">Volver al inicio</button></div>;
    }

    return (
        <div className="flex flex-col h-full animate-fade-in pb-20">
            <StepIndicator currentStep={5} totalSteps={5} />

            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-400 hover:text-white">
                    <ChevronLeft />
                </button>
                <h2 className="text-2xl font-bold">Resumen</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">

                {/* Date & Time Card */}
                <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--color-primary)]/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Calendar size={100} />
                    </div>
                    <p className="text-sm text-[var(--color-primary)] font-bold uppercase trackin-wider mb-1">Fecha y Hora</p>
                    <h3 className="text-3xl font-bold text-white mb-2 capitalize">
                        {selectedDate && format(selectedDate, 'EEEE d MMMM', { locale: es })}
                    </h3>
                    <div className="text-4xl font-bold text-white tracking-tighter">
                        {selectedTimeSlot}
                    </div>
                </div>

                {/* Details List */}
                <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-white/5 space-y-4">

                    <div className="flex items-start gap-3 pb-4 border-b border-white/5">
                        <User className="text-gray-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Cliente</p>
                            <p className="font-medium text-white">{client.nombre}</p>
                            <p className="text-sm text-gray-400">{client.telefono}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 pb-4 border-b border-white/5">
                        <Car className="text-gray-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Vehículo</p>
                            <p className="font-medium text-white">{vehicle.matricula}</p>
                            <p className="text-sm text-gray-400">{vehicle.marca} {vehicle.modelo}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <User className="text-gray-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Profesional</p>
                            <p className="font-medium text-white">
                                {selectedTechnician ? selectedTechnician.nombre : 'Cualquier técnico disponible'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Service Info */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="font-bold text-lg mb-1 uppercase text-[var(--color-primary)]">
                        {selectedService?.name || 'SERVICIO TALLER'}
                    </p>
                    <p className="text-sm text-gray-400">
                        Duración estimada: {selectedService?.duration || 30} min
                    </p>
                    {selectedService?.price && (
                        <p className="text-xl font-bold text-white mt-2">
                            Total: {typeof selectedService.price === 'number' ? `${selectedService.price}€` : selectedService.price}
                        </p>
                    )}
                </div>

                {/* Policy Warning */}
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20 flex gap-3">
                    <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                    <p className="text-xs text-yellow-200/80 leading-relaxed">
                        IMPORTANTE: Acuda 10 minutos antes de su cita. Si no puede asistir, por favor cancele con antelación para liberar el hueco.
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
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 active:scale-95"
                >
                    {loading ? 'PROCESANDO...' : 'CONFIRMAR CITA'}
                </button>
            </div>
        </div>
    );
}
