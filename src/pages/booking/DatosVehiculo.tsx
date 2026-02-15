import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { ChevronRight, ChevronLeft, Car, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DatosVehiculo() {
    const navigate = useNavigate();
    const { vehicle, setVehicle, client } = useBookingStore();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchVehicleData() {
            const { data: { user } } = await supabase.auth.getUser();
            const email = user?.email || client.email;

            if (email && !vehicle.matricula) {
                setLoading(true);

                // 1. Try to fetch from Google Sheets first
                const sheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
                if (sheetsUrl) {
                    try {
                        const response = await fetch(`${sheetsUrl}?email=${encodeURIComponent(email)}`);
                        const sheetData = await response.json();

                        if (sheetData && !sheetData.error && sheetData.matricula) {
                            // If brand and model are joined in the sheet, we try to put it in 'marca'
                            // and keep 'modelo' as is or empty.
                            setVehicle({
                                matricula: sheetData.matricula,
                                marca: sheetData.marca || '',
                                modelo: sheetData.modelo || '',
                                anio: String(sheetData.anio || ''),
                            });
                        }
                    } catch (err) {
                        console.error('Error fetching from Google Sheets:', err);
                    }
                }

                // 2. Fallback to Supabase if not found or sync
                const { data: dbClient } = await supabase
                    .from('clientes')
                    .select('id')
                    .eq('email', email)
                    .single();

                if (dbClient) {
                    const { data: dbVehicle } = await supabase
                        .from('vehiculos')
                        .select('*')
                        .eq('cliente_id', dbClient.id)
                        .order('id', { ascending: false })
                        .limit(1)
                        .single();

                    if (dbVehicle && !vehicle.matricula) { // Only fill if sheet request didn't find anything
                        setVehicle({
                            matricula: dbVehicle.matricula,
                            marca: dbVehicle.marca,
                            modelo: dbVehicle.modelo,
                            anio: dbVehicle.anio
                        });
                    }
                }
                setLoading(false);
            }
        }
        fetchVehicleData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20 text-gray-400">
                <Clock className="animate-spin mr-2" /> Cargando vehículo...
            </div>
        );
    }

    const validate = () => {
        const newErrors: Record<string, string> = {};

        // License plate: Spanish (4 numbers 3 letters OR old format)
        const plateRegex = /^(\d{4}\s?[A-Z]{3}|[A-Z]{1,2}\s?\d{4}\s?[A-Z]{1,2})$/;
        const cleanPlate = vehicle.matricula.replace(/\s/g, '').toUpperCase();

        if (!vehicle.matricula.trim()) {
            newErrors.matricula = 'La matrícula es obligatoria';
        } else if (!plateRegex.test(cleanPlate)) {
            newErrors.matricula = 'Formato de matrícula no reconocido (ej: 1234 ABC)';
        }

        if (!vehicle.marca.trim()) newErrors.marca = 'La marca es obligatoria';
        if (!vehicle.modelo.trim()) newErrors.modelo = 'El modelo es obligatorio';

        // Year: 4 digits
        if (vehicle.anio && !/^\d{4}$/.test(vehicle.anio)) {
            newErrors.anio = 'El año debe tener 4 dígitos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            navigate('/booking/resumen');
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <StepIndicator currentStep={4} />

            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-400 hover:text-white">
                    <ChevronLeft />
                </button>
                <h2 className="text-2xl font-bold">Datos del Vehículo</h2>
            </div>

            <div className="flex-1 space-y-5">
                <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-white/5 flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--color-primary)]">
                        <Car size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Servicio seleccionado</p>
                        <p className="font-bold text-white">SERVICIO MOTOBOX MILAS</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Matrícula *</label>
                    <input
                        type="text"
                        value={vehicle.matricula}
                        onChange={(e) => setVehicle({ matricula: e.target.value.toUpperCase() })}
                        className={`w-full bg-[var(--bg-card)] border ${errors.matricula ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white font-mono text-lg uppercase focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:normal-case`}
                        placeholder="0000 XXX"
                    />
                    {errors.matricula && <p className="text-red-500 text-xs">{errors.matricula}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Marca *</label>
                        <input
                            type="text"
                            value={vehicle.marca}
                            onChange={(e) => setVehicle({ marca: e.target.value })}
                            className={`w-full bg-[var(--bg-card)] border ${errors.marca ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors`}
                            placeholder="Ej. BMW"
                        />
                        {errors.marca && <p className="text-red-500 text-xs">{errors.marca}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Modelo *</label>
                        <input
                            type="text"
                            value={vehicle.modelo}
                            onChange={(e) => setVehicle({ modelo: e.target.value })}
                            className={`w-full bg-[var(--bg-card)] border ${errors.modelo ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors`}
                            placeholder="Ej. Serie 3"
                        />
                        {errors.modelo && <p className="text-red-500 text-xs">{errors.modelo}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Año (Opcional)</label>
                    <input
                        type="text"
                        value={vehicle.anio}
                        onChange={(e) => setVehicle({ anio: e.target.value })}
                        className={`w-full bg-[var(--bg-card)] border ${errors.anio ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors`}
                        placeholder="Ej. 2020"
                    />
                    {errors.anio && <p className="text-red-500 text-xs">{errors.anio}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Motivo / Síntoma (Opcional)</label>
                    <textarea
                        value={vehicle.motivo}
                        onChange={(e) => setVehicle({ motivo: e.target.value })}
                        className="w-full bg-[var(--bg-card)] border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors min-h-[100px] resize-none"
                        placeholder="Describa brevemente el problema..."
                    />
                </div>
            </div>

            <div className="mt-8 pt-4 pb-4">
                <button
                    onClick={handleNext}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 active:scale-95"
                >
                    CONTINUAR <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
