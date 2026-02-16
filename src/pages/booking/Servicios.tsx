import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore, ServiceType } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { ChevronLeft, Wrench, Calendar, Droplets, Clock, Disc, StopCircle, Zap, ClipboardCheck } from 'lucide-react';
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
        const baseClass = "w-12 h-12 mb-4 group-hover:scale-110 transition-transform";
        switch (type) {
            case 'cambio_aceite': return <Droplets className={`${baseClass} text-yellow-500`} />;
            case 'pedir_cita': return <Calendar className={`${baseClass} text-blue-400`} />;
            case 'mantenimiento': return <Wrench className={`${baseClass} text-green-400`} />;
            case 'frenos': return <StopCircle className={`${baseClass} text-red-500`} />;
            case 'bateria': return <Zap className={`${baseClass} text-blue-500`} />;
            case 'itv': return <ClipboardCheck className={`${baseClass} text-purple-400`} />;
            case 'neumaticos': return <Disc className={`${baseClass} text-gray-500`} />;
            default: return <Wrench className={`${baseClass} text-gray-400`} />;
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in pb-20">
            <StepIndicator currentStep={1} />

            <div className="flex items-center gap-2 mb-8">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors">
                    <ChevronLeft size={28} />
                </button>
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Servicios Disponibles</h2>
                    <p className="text-gray-400 text-sm">Elige el mantenimiento que necesita tu vehículo</p>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400 bg-white/5 rounded-2xl border border-white/5">
                    <div className="relative">
                        <Clock className="animate-spin w-12 h-12 mb-4 text-[var(--color-primary)]" />
                        <div className="absolute inset-0 blur-lg bg-[var(--color-primary)]/20 animate-pulse"></div>
                    </div>
                    <p className="font-medium">Cargando catálogo de servicios...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => handleSelectService(service)}
                            className="group relative flex flex-col p-8 bg-[#1a1a1a] border border-white/10 rounded-2xl hover:border-[var(--color-primary)]/50 transition-all duration-300 text-left overflow-hidden hover:shadow-[0_0_40px_-15px_rgba(255,215,0,0.15)]"
                        >
                            {/* Accent Background Overlay */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Offer Badge */}
                            {service.type === 'cambio_aceite' && (
                                <div className="absolute top-0 right-0 bg-[var(--color-primary)] text-black text-[10px] font-black px-4 py-1 rounded-bl-xl shadow-lg transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                                    MÁS POPULAR
                                </div>
                            )}

                            <div className="mb-6 relative">
                                <div className="p-4 bg-white/5 rounded-2xl w-fit group-hover:bg-[var(--color-primary)]/10 transition-colors duration-300">
                                    {getIcon(service.type)}
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                <h3 className="text-xl font-black text-white group-hover:text-[var(--color-primary)] transition-colors leading-tight uppercase tracking-wide">
                                    {service.name}
                                </h3>
                                <p className="text-gray-400 text-sm line-clamp-2 min-h-[40px] leading-relaxed">
                                    {service.description || 'Consulta los detalles de este servicio con nuestros expertos.'}
                                </p>
                            </div>

                            <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Precio</span>
                                    <span className="text-2xl font-black text-white tracking-tighter">
                                        {service.price ? `${service.price}€` : 'Consultar'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 group-hover:border-[var(--color-primary)]/20 transition-colors">
                                    <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                    <span className="text-xs font-bold text-gray-300">{service.duration} min</span>
                                </div>
                            </div>

                            {/* Hover Arrow */}
                            <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                <ChevronLeft className="w-5 h-5 text-[var(--color-primary)] rotate-180" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
