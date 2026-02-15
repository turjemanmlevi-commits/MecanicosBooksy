import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore, ServiceType } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { ChevronLeft, Wrench, Calendar, Droplets, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Servicio } from '../../types/database';

export default function Servicios() {
    const navigate = useNavigate();
    const { setService } = useBookingStore();
    const [services, setServices] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchServices() {
            const { data, error } = await supabase
                .from('servicios')
                .select('*')
                .eq('is_active', true)
                .order('id');

            if (!error && data) {
                setServices(data);
            }
            setLoading(false);
        }
        fetchServices();
    }, []);

    const handleSelectService = (service: Servicio) => {
        setService({
            type: service.type as ServiceType,
            duration: service.duration,
            name: service.name,
            price: service.price || 'Consultar'
        });
        navigate('/booking/fecha-hora');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'cambio_aceite': return <Droplets className="w-12 h-12 text-[var(--color-primary)] mb-4 group-hover:scale-110 transition-transform" />;
            case 'pedir_cita': return <Calendar className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />;
            case 'mantenimiento': return <Wrench className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition-transform" />;
            default: return <Wrench className="w-12 h-12 text-gray-400 mb-4 group-hover:scale-110 transition-transform" />;
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in pb-20">
            <StepIndicator currentStep={1} />

            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => navigate('/')} className="p-1 -ml-1 text-gray-400 hover:text-white">
                    <ChevronLeft />
                </button>
                <h2 className="text-2xl font-bold">Selecciona un Servicio</h2>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-400">
                    <Clock className="animate-spin mx-auto mb-2" />
                    Cargando servicios...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => handleSelectService(service)}
                            className="flex flex-col items-center justify-center p-6 bg-[#1a1a1a] border border-white/10 rounded-xl hover:bg-[var(--bg-card-hover)] hover:border-[var(--color-primary)] transition-all group text-left relative overflow-hidden"
                        >
                            {service.type === 'cambio_aceite' && (
                                <div className="absolute top-0 right-0 bg-[var(--color-primary)] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    OFERTA
                                </div>
                            )}
                            {getIcon(service.type)}
                            <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                            <p className="text-gray-400 text-sm mb-4 text-center">
                                {service.description}
                            </p>
                            <div className="mt-auto">
                                <span className={`${service.price ? 'text-2xl font-bold text-[var(--color-primary)]' : 'text-xl font-bold text-white'}`}>
                                    {service.price ? `${service.price}€` : 'Consultar'}
                                </span>
                                <span className="text-gray-500 text-xs ml-2">/ {service.duration} min</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
