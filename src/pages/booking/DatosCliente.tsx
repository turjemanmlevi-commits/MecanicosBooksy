import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import StepIndicator from '../../components/StepIndicator';
import { ChevronRight } from 'lucide-react';

export default function DatosCliente() {
    const navigate = useNavigate();
    const { client, setClient } = useBookingStore();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!client.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (!client.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
        if (!client.consentimiento) newErrors.consentimiento = 'Debe aceptar la política de privacidad';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            navigate('/booking/vehiculo');
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <StepIndicator currentStep={3} />

            <h2 className="text-2xl font-bold mb-6">Datos del Cliente</h2>

            <div className="flex-1 space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Nombre y Apellidos *</label>
                    <input
                        type="text"
                        value={client.nombre}
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
                        value={client.telefono}
                        onChange={(e) => setClient({ telefono: e.target.value })}
                        className={`w-full bg-[var(--bg-card)] border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors`}
                        placeholder="600 000 000"
                    />
                    {errors.telefono && <p className="text-red-500 text-xs">{errors.telefono}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Email (Opcional)</label>
                    <input
                        type="email"
                        value={client.email}
                        onChange={(e) => setClient({ email: e.target.value })}
                        className="w-full bg-[var(--bg-card)] border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        placeholder="juan@email.com"
                    />
                </div>

                <div className="pt-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mt-1 transition-colors ${client.consentimiento ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-gray-500 group-hover:border-white'}`}>
                            {client.consentimiento && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input
                            type="checkbox"
                            checked={client.consentimiento}
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
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 active:scale-95"
                >
                    CONTINUAR <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
