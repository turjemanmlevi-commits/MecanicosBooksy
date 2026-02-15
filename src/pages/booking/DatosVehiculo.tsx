import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { ChevronRight, ChevronLeft, Car } from 'lucide-react';

export default function DatosVehiculo() {
    const navigate = useNavigate();
    const { vehicle, setVehicle } = useBookingStore();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!vehicle.matricula.trim()) newErrors.matricula = 'La matrícula es obligatoria';
        // Other fields optional but recommended
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
                        <label className="text-sm font-medium text-gray-400">Marca</label>
                        <input
                            type="text"
                            value={vehicle.marca}
                            onChange={(e) => setVehicle({ marca: e.target.value })}
                            className="w-full bg-[var(--bg-card)] border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                            placeholder="Ej. BMW"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Modelo</label>
                        <input
                            type="text"
                            value={vehicle.modelo}
                            onChange={(e) => setVehicle({ modelo: e.target.value })}
                            className="w-full bg-[var(--bg-card)] border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                            placeholder="Ej. Serie 3"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Año (Opcional)</label>
                    <input
                        type="text"
                        value={vehicle.anio}
                        onChange={(e) => setVehicle({ anio: e.target.value })}
                        className="w-full bg-[var(--bg-card)] border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        placeholder="Ej. 2020"
                    />
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
