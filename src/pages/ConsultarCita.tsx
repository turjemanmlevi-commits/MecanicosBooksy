import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Clock, Car, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ConsultarCita() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!phone.trim()) return;
        setLoading(true);
        setSearched(true);
        setAppointments([]);

        try {
            // 1. Find client by phone
            const { data: client } = await supabase
                .from('clientes')
                .select('id')
                .eq('telefono', phone)
                .single();

            if (client) {
                // 2. Find appointments
                const { data: appts } = await supabase
                    .from('citas')
                    .select(`
            *,
            vehiculos (matricula, marca, modelo),
            tecnicos (nombre)
          `)
                    .eq('cliente_id', client.id)
                    .gte('fecha_hora_inicio', new Date().toISOString()) // Only future
                    .neq('estado', 'cancelada')
                    .order('fecha_hora_inicio');

                if (appts) setAppointments(appts);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!window.confirm('¿Seguro que desea cancelar esta cita?')) return;

        const { error } = await supabase
            .from('citas')
            .update({ estado: 'cancelada' })
            .eq('id', id);

        if (!error) {
            setAppointments(appointments.filter(a => a.id !== id));
            alert('Cita cancelada correctamente');
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-6">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => navigate('/')} className="p-1 -ml-1 text-gray-400 hover:text-white">
                    <ChevronLeft />
                </button>
                <h2 className="text-2xl font-bold">Mis Citas</h2>
            </div>

            <div className="flex gap-2 mb-8">
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Introduzca su teléfono"
                    className="flex-1 bg-[var(--bg-card)] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
                />
                <button
                    onClick={handleSearch}
                    disabled={loading || !phone}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white p-3 rounded-lg disabled:opacity-50"
                >
                    {loading ? <Clock className="animate-spin" /> : <Search />}
                </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
                {searched && appointments.length === 0 && !loading && (
                    <div className="text-center text-gray-400 py-10">
                        No se encontraron citas futuras para este teléfono.
                    </div>
                )}

                {appointments.map((appt) => (
                    <div key={appt.id} className="bg-[var(--bg-card)] rounded-xl p-4 border border-white/5 relative">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-lg font-bold text-white capitalize">
                                    {format(new Date(appt.fecha_hora_inicio), 'EEEE d MMMM', { locale: es })}
                                </p>
                                <p className="text-2xl font-bold text-[var(--color-primary)]">
                                    {format(new Date(appt.fecha_hora_inicio), 'HH:mm')}
                                </p>
                            </div>
                            <button
                                onClick={() => handleCancel(appt.id)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg text-xs font-bold uppercase transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>

                        <div className="space-y-1 text-sm text-gray-400 mt-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <Car size={14} className="text-white" />
                                <span>{appt.vehiculos?.matricula} - {appt.vehiculos?.marca} {appt.vehiculos?.modelo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={14} className="text-white" />
                                <span>{appt.tecnicos?.nombre || 'Cualquier técnico'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
