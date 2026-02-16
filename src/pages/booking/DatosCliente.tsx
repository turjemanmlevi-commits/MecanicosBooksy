import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { ChevronRight, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DatosCliente() {
    const navigate = useNavigate();
    const { client, setClient } = useBookingStore();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchClientData() {
            try {
                const { data: authData } = await supabase.auth.getUser();
                const user = authData?.user;

                if (user) {
                    setLoading(true);
                    // Pre-fill email from auth
                    if (!client.email) setClient({ email: user.email || '' });

                    // 1. Try to fetch from Google Sheets first
                    const sheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
                    if (sheetsUrl && user.email) {
                        try {
                            const response = await fetch(`${sheetsUrl}?email=${encodeURIComponent(user.email)}`);
                            if (response.ok) {
                                const sheetData = await response.json();
                                if (sheetData && !sheetData.error) {
                                    if (!client.nombre) setClient({ nombre: sheetData.nombre || '' });
                                    if (!client.telefono) setClient({ telefono: String(sheetData.telefono || '') });
                                }
                            }
                        } catch (err) {
                            console.error('Error fetching from Google Sheets:', err);
                        }
                    }

                    // 2. Fallback or Sync with Supabase (using the correct project tables)
                    try {
                        const { data: dbClient } = await supabase
                            .from('clientes')
                            .select('*')
                            .eq('email', user.email)
                            .maybeSingle(); // maybeSingle is safer than single()

                        if (dbClient) {
                            if (!client.nombre) setClient({ nombre: dbClient.nombre || '' });
                            if (!client.telefono) setClient({ telefono: dbClient.telefono || '' });
                        }
                    } catch (dbErr) {
                        console.error('Error fetching from DB:', dbErr);
                    }
                }
            } catch (err) {
                console.error('General fetch error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchClientData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
                <Clock className="animate-spin text-[var(--color-primary)]" size={40} />
                <p>Cargando tus datos...</p>
            </div>
        );
    }

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!client.nombre?.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        } else if (client.nombre.trim().split(' ').length < 2) {
            newErrors.nombre = 'Por favor, introduce nombre y apellidos';
        }

        const phoneRegex = /^[6789]\d{8}$/;
        const cleanPhone = (client.telefono || '').replace(/\s/g, '');
        if (!client.telefono?.trim()) {
            newErrors.telefono = 'El teléfono es obligatorio';
        } else if (!phoneRegex.test(cleanPhone)) {
            newErrors.telefono = 'Introduce un número de teléfono válido (9 dígitos)';
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!client.email?.trim()) {
            newErrors.email = 'El email es obligatorio';
        } else if (!emailRegex.test(client.email)) {
            newErrors.email = 'Introduce un email válido';
        }

        if (!client.consentimiento) {
            newErrors.consentimiento = 'Debe aceptar la política de privacidad';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            navigate('/booking/vehiculo');
        }
    };

    const [isGoogleUser, setIsGoogleUser] = useState(false);
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user?.app_metadata?.provider === 'google' || user?.identities?.some(id => id.provider === 'google')) {
                setIsGoogleUser(true);
            }
        });
    }, []);

    return (
        <div className="flex flex-col h-full animate-fade-in pb-10">
            <StepIndicator currentStep={3} />

            <h2 className="text-2xl font-bold mb-6">Datos del Cliente</h2>

            <div className="flex-1 space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Nombre y Apellidos *</label>
                    <input
                        type="text"
                        value={client.nombre || ''}
                        onChange={(e) => setClient({ nombre: e.target.value })}
                        className={`w-full bg-[var(--bg-card)] border ${errors.nombre ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors`}
                        placeholder="Juan Pérez"
                    />
                    {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Teléfono Móvil *</label>
                    <input
                        type="tel"
                        value={client.telefono || ''}
                        onChange={(e) => setClient({ telefono: e.target.value })}
                        className={`w-full bg-[var(--bg-card)] border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors`}
                        placeholder="600 000 000"
                    />
                    {errors.telefono && <p className="text-red-500 text-xs">{errors.telefono}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Email *</label>
                    <input
                        type="email"
                        value={client.email || ''}
                        readOnly={isGoogleUser}
                        onChange={(e) => !isGoogleUser && setClient({ email: e.target.value })}
                        className={`w-full bg-[var(--bg-card)] border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors ${isGoogleUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                        placeholder="juan@email.com"
                    />
                    {isGoogleUser && <p className="text-[var(--color-primary)] text-[10px] uppercase font-bold">Conectado con Google</p>}
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>

                <div className="pt-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mt-1 transition-colors ${client.consentimiento ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-gray-500 group-hover:border-white'}`}>
                            {client.consentimiento && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input
                            type="checkbox"
                            checked={client.consentimiento || false}
                            onChange={(e) => setClient({ consentimiento: e.target.checked })}
                            className="hidden"
                        />
                        <span className={`text-sm ${errors.consentimiento ? 'text-red-500' : 'text-gray-400'}`}>
                            Acepto la política de privacidad y el tratamiento de mis datos personales para la gestión de la cita.
                        </span>
                    </label>
                </div>
            </div>

            <div className="mt-8 pt-4 pb-4">
                <button
                    onClick={handleNext}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                    CONTINUAR <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
