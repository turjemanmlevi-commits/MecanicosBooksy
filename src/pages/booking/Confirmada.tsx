import { useNavigate } from 'react-router-dom';
import { Check, Calendar, Home } from 'lucide-react';

export default function Confirmada() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full animate-fade-in items-center justify-center text-center px-6">

            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-8 animate-bounce">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50">
                    <Check size={40} className="text-white" strokeWidth={3} />
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-2">¡Cita Confirmada!</h2>
            <p className="text-gray-400 mb-12">Hemos enviado los detalles a su contacto.</p>

            <div className="space-y-4 w-full max-w-sm">
                <button
                    onClick={() => window.alert('Funcionalidad de calendario en desarrollo')}
                    className="w-full bg-[var(--bg-card)] border border-white/10 hover:border-white hover:bg-white/5 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                    <Calendar size={20} /> AÑADIR AL CALENDARIO
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 active:scale-95"
                >
                    <Home size={20} /> VOLVER AL INICIO
                </button>
            </div>

            <p className="mt-12 text-xs text-gray-500 max-w-xs mx-auto">
                Si necesita cambiar o cancelar su cita, puede hacerlo desde la sección "Consultar mi cita" en la pantalla de inicio.
            </p>
        </div>
    );
}
