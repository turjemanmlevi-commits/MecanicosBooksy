import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';

export default function DatosCliente() {
    const navigate = useNavigate();
    const { t, language } = useTranslation();

    const client = useBookingStore(state => state.client);
    const setClient = useBookingStore(state => state.setClient);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [renderError, setRenderError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchClientData() {
            try {
                const { data: authData } = await supabase.auth.getUser();
                const user = authData?.user;

                if (user) {
                    setLoading(true);

                    if (!client?.email) setClient({ email: user.email || '' });

                    const sheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
                    if (sheetsUrl && user.email) {
                        try {
                            const response = await fetch(`${sheetsUrl}?email=${encodeURIComponent(user.email)}`);
                            if (response.ok) {
                                const sheetData = await response.json();
                                if (sheetData && !sheetData.error) {
                                    if (!client?.nombre) setClient({ nombre: sheetData.nombre || '' });
                                    if (!client?.telefono) setClient({ telefono: String(sheetData.telefono || '') });
                                }
                            }
                        } catch (e) { console.error(e); }
                    }

                    try {
                        const { data: dbClient } = await supabase
                            .from('clientes')
                            .select('*')
                            .eq('email', user.email)
                            .maybeSingle();

                        if (dbClient) {
                            if (!client?.nombre) setClient({ nombre: dbClient.nombre || '' });
                            if (!client?.telefono) setClient({ telefono: dbClient.telefono || '' });
                        }
                    } catch (e) { console.error(e); }
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        }

        try {
            fetchClientData();
        } catch (e) {
            setRenderError(t.common.error);
        }
    }, []);

    if (renderError) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-red-500 gap-4">
                <AlertCircle size={48} />
                <p>{renderError}</p>
                <button onClick={() => window.location.reload()} className="bg-white text-black px-4 py-2 rounded">
                    {language === 'he' ? 'נסה שוב' : language === 'en' ? 'Retry' : 'Reintentar'}
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
                <Clock className="animate-spin text-[var(--color-primary)]" size={40} />
                <p className="font-medium">{language === 'he' ? 'מסנכרן פרופיל...' : language === 'en' ? 'Syncing profile...' : 'Sincronizando perfil...'}</p>
            </div>
        );
    }

    if (!client) {
        return <div className="p-10 text-center">{t.common.loading}...</div>;
    }

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!client.nombre?.trim()) {
            newErrors.nombre = t.common.required;
        } else if (client.nombre.trim().split(' ').length < 2) {
            newErrors.nombre = language === 'he' ? 'שם ושם משפחה' : language === 'en' ? 'Full name required' : 'Nombre y apellidos';
        }

        const phoneRegex = /^[6789]\d{8}$/;
        const cleanPhone = (client.telefono || '').replace(/\s/g, '');
        if (!client.telefono?.trim()) {
            newErrors.telefono = t.common.required;
        } else if (!phoneRegex.test(cleanPhone)) {
            newErrors.telefono = language === 'he' ? 'מספר לא תקין' : language === 'en' ? 'Invalid phone' : 'Teléfono inválido';
        }

        if (!client.email?.trim()) newErrors.email = t.common.required;
        if (!client.consentimiento) newErrors.consentimiento = language === 'he' ? 'חובה לאשר' : language === 'en' ? 'Must accept' : 'Debe aceptar';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) navigate('/booking/vehiculo');
    };

    return (
        <div className="flex flex-col h-full animate-fade-in pb-10" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <StepIndicator currentStep={3} />

            <h2 className="text-2xl font-bold mb-6 text-white ltr:text-left rtl:text-right">{t.booking.client}</h2>

            <div className="flex-1 space-y-5">
                <div className="space-y-2 ltr:text-left rtl:text-right">
                    <label className="text-sm font-medium text-gray-400">{t.common.name} *</label>
                    <input
                        type="text"
                        value={client.nombre || ''}
                        onChange={(e) => setClient({ nombre: e.target.value })}
                        className={`w-full bg-[var(--bg-card)] border ${errors.nombre ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors ltr:text-left rtl:text-right`}
                        placeholder={language === 'he' ? 'ישראל ישראלי' : 'Juan Pérez'}
                    />
                    {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
                </div>

                <div className="space-y-2 ltr:text-left rtl:text-right">
                    <label className="text-sm font-medium text-gray-400">{t.common.phone} *</label>
                    <input
                        type="tel"
                        value={client.telefono || ''}
                        onChange={(e) => setClient({ telefono: e.target.value })}
                        className={`w-full bg-[var(--bg-card)] border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors ltr:text-left rtl:text-right`}
                        placeholder="600 000 000"
                    />
                    {errors.telefono && <p className="text-red-500 text-xs">{errors.telefono}</p>}
                </div>

                <div className="space-y-2 ltr:text-left rtl:text-right">
                    <label className="text-sm font-medium text-gray-400">{t.common.email} *</label>
                    <input
                        type="email"
                        value={client.email || ''}
                        onChange={(e) => setClient({ email: e.target.value })}
                        className={`w-full bg-[var(--bg-card)] border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors ltr:text-left rtl:text-right`}
                        placeholder="tu@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>

                <div className="space-y-4 pt-4 ltr:text-left rtl:text-right">
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
                            {language === 'he' ? 'אני מאשר את מדיניות הפרטיות.' : language === 'en' ? 'I accept the privacy policy.' : 'Acepto la política de privacidad.'}
                        </span>
                    </label>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={handleNext}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-wider"
                >
                    {t.common.next}
                </button>
            </div>
        </div>
    );
}
