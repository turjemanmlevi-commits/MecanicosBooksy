import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Car, Calendar, User, LogOut, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MiPerfil() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [clientData, setClientData] = useState<any>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/');
                return;
            }
            setUser(user);

            // Fetch client data by email
            const { data: client } = await supabase
                .from('clientes')
                .select('*')
                .eq('email', user.email)
                .single();

            if (client) {
                setClientData(client);

                // Fetch vehicles
                const { data: v } = await supabase
                    .from('vehiculos')
                    .select('*')
                    .eq('cliente_id', client.id);
                if (v) setVehicles(v);

                // Fetch appointments
                const { data: a } = await supabase
                    .from('citas')
                    .select(`
                        *,
                        vehiculos (matricula, marca, modelo),
                        tecnicos (nombre)
                    `)
                    .eq('cliente_id', client.id)
                    .order('fecha_hora_inicio', { ascending: false });
                if (a) setAppointments(a);
            }
            setLoading(false);
        }

        getProfile();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <Clock className="animate-spin mr-2" /> Cargando perfil...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-6 pb-20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/')} className="p-1 -ml-1 text-gray-400 hover:text-white">
                        <ChevronLeft />
                    </button>
                    <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Cerrar Sesión"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Client Info */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-2xl font-bold text-white uppercase text-center align-middle">
                        {user.email?.[0]}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{clientData?.nombre || user.email?.split('@')[0]}</h3>
                        <p className="text-gray-400">{user.email}</p>
                    </div>
                </div>
                {!clientData && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-sm">
                        No hemos encontrado datos de cliente asociados a este correo. Sus futuras reservas se vincularán automáticamente.
                    </div>
                )}
            </div>

            {/* My Vehicles */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Car size={20} className="text-[var(--color-primary)]" />
                    Mis Vehículos
                </h3>
                <div className="grid gap-3">
                    {vehicles.length === 0 ? (
                        <p className="text-gray-500 italic text-sm py-4 bg-white/5 rounded-xl text-center">No hay vehículos registrados</p>
                    ) : (
                        vehicles.map(v => (
                            <div key={v.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                <div>
                                    <p className="text-white font-bold">{v.marca} {v.modelo}</p>
                                    <p className="text-gray-400 text-sm uppercase tracking-wider">{v.matricula}</p>
                                </div>
                                <div className="text-gray-500 text-xs px-2 py-1 bg-white/5 rounded">
                                    {v.anio}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* My Appointments */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-[var(--color-primary)]" />
                    Historial de Citas
                </h3>
                <div className="space-y-4">
                    {appointments.length === 0 ? (
                        <p className="text-gray-500 italic text-sm py-4 bg-white/5 rounded-xl text-center">No hay citas registradas</p>
                    ) : (
                        appointments.map(appt => (
                            <div key={appt.id} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-white font-bold capitalize">
                                            {format(new Date(appt.fecha_hora_inicio), "EEEE d 'de' MMMM", { locale: es })}
                                        </p>
                                        <p className="text-[var(--color-primary)] font-bold text-xl">
                                            {format(new Date(appt.fecha_hora_inicio), 'HH:mm')}
                                        </p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${appt.estado === 'completada' ? 'bg-green-500/10 text-green-500' :
                                            appt.estado === 'cancelada' ? 'bg-red-500/10 text-red-500' :
                                                'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {appt.estado}
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Car size={14} />
                                        <span>{appt.vehiculos?.marca} {appt.vehiculos?.modelo} ({appt.vehiculos?.matricula})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User size={14} />
                                        <span>Técnico: {appt.tecnicos?.nombre || 'General'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
