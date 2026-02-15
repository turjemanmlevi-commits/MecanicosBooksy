import { useNavigate } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen relative">
            <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center bg-no-repeat">
                <div className="absolute inset-0 bg-black/80"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center pt-20 pb-10 gap-8">
                <div className="animate-fade-in">
                    <h1 className="text-6xl font-bold mb-2 tracking-tighter leading-none">
                        MOTOBOX <span className="text-[var(--color-primary)]">MIJAS</span>
                    </h1>
                    <p className="text-xl text-gray-400 tracking-widest uppercase">Potencia sin límites</p>
                </div>

                <button
                    onClick={() => navigate('/booking/servicios')}
                    className="w-full max-w-sm bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-5 px-8 rounded-xl text-xl uppercase tracking-wider transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(192,0,0,0.3)]"
                >
                    Reservar Cita
                </button>

                <button
                    onClick={() => navigate('/consultar')}
                    className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider border-b border-gray-600 hover:border-white pb-1"
                >
                    Consultar mi cita
                </button>



                <div className="w-full max-w-sm bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=Av+de+los+Lirios+78+Las+Lagunas+de+Mijas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 text-left mb-3 hover:bg-white/5 p-2 -m-2 rounded-lg transition-colors group"
                    >
                        <MapPin className="text-[var(--color-primary)] shrink-0 mt-1 group-hover:scale-110 transition-transform" size={18} />
                        <div>
                            <p className="text-white font-medium text-sm group-hover:text-[var(--color-primary)] transition-colors">Av. de los Lirios, 78</p>
                            <p className="text-gray-400 text-xs">29651 Las Lagunas de Mijas, Málaga</p>
                        </div>
                    </a>
                    <div className="flex items-center gap-3 text-left p-2 -m-2">
                        <Clock className="text-[var(--color-primary)] shrink-0" size={18} />
                        <div>
                            <p className="text-white font-medium text-sm">Lunes - Viernes</p>
                            <p className="text-gray-400 text-xs">09:00 - 19:00</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
