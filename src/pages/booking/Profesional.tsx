import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { ChevronLeft, User, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Tecnico } from '../../types/database';
import { useTranslation } from '../../hooks/useTranslation';

export default function Profesional() {
    const navigate = useNavigate();
    const { setTechnician } = useBookingStore();
    const { t, language } = useTranslation();
    const [technicians, setTechnicians] = useState<Tecnico[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTechnicians() {
            const { data, error } = await supabase
                .from('tecnicos')
                .select('*')
                .eq('activo', true)
                .order('nombre');

            if (!error && data) {
                setTechnicians(data);
            }
            setLoading(false);
        }
        fetchTechnicians();
    }, []);

    const handleSelect = (tech: Tecnico | null) => {
        setTechnician(tech);
        navigate('/booking/fecha-hora');
    };

    return (
        <div className="flex flex-col h-full animate-fade-in" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <StepIndicator currentStep={3} />

            <div className="flex items-center gap-2 mb-6 ltr:text-left rtl:text-right">
                <button onClick={() => navigate(-1)} className={`p-1 -ml-1 text-gray-400 hover:text-white ${language === 'he' ? 'rotate-180' : ''}`}>
                    <ChevronLeft />
                </button>
                <h2 className="text-2xl font-bold text-white">{t.booking.pro}</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pb-4">
                {loading ? (
                    <div className="text-center text-gray-400 py-10">{t.common.loading}</div>
                ) : (
                    <>
                        {/* Option: Anyone */}
                        <div
                            onClick={() => handleSelect(null)}
                            className="relative h-40 rounded-xl overflow-hidden cursor-pointer group border border-white/10 hover:border-[var(--color-primary)] transition-all"
                        >
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599256621730-d33261511511?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            <div className={`absolute bottom-4 ${language === 'he' ? 'right-4' : 'left-4'} ltr:text-left rtl:text-right`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="text-[var(--color-primary)]" size={20} />
                                    <h3 className="text-xl font-bold text-white">{language === 'he' ? 'כל אחד' : language === 'en' ? 'Anyone' : 'Cualquiera'}</h3>
                                </div>
                                <p className="text-sm text-gray-300">{language === 'he' ? 'טכנאי ראשון פנוי' : language === 'en' ? 'First available technician' : 'Primer técnico disponible'}</p>
                            </div>
                        </div>

                        {/* Individual Technicians */}
                        {technicians.map((tech) => (
                            <div
                                key={tech.id}
                                onClick={() => handleSelect(tech)}
                                className="relative h-40 rounded-xl overflow-hidden cursor-pointer group border border-white/10 hover:border-[var(--color-primary)] transition-all"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${tech.foto_url || 'https://images.unsplash.com/photo-1537368910025-bc005ca68d5d?auto=format&fit=crop&q=80&w=400'})` }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                <div className={`absolute bottom-4 ${language === 'he' ? 'right-4' : 'left-4'} ltr:text-left rtl:text-right`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="text-[var(--color-primary)]" size={20} />
                                        <h3 className="text-xl font-bold text-white">{tech.nombre}</h3>
                                    </div>
                                    <p className="text-sm text-gray-300">{tech.especialidad}</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
