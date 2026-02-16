import { useNavigate } from 'react-router-dom';
import { Check, Calendar, Home, Smartphone } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { addMinutes } from 'date-fns';
import { useTranslation } from '../../hooks/useTranslation';

export default function Confirmada() {
    const navigate = useNavigate();
    const { lastBooking, language } = useBookingStore();
    const { t } = useTranslation();

    const formatGoogleDate = (date: Date) => {
        try {
            return date.toISOString().replace(/-|:|\.\d+/g, '');
        } catch (e) {
            return '';
        }
    };

    const generateGoogleCalendarLink = () => {
        if (!lastBooking?.date || !lastBooking?.time) return '#';

        try {
            const [hours, minutes] = lastBooking.time.split(':');
            const startDate = new Date(lastBooking.date);
            startDate.setHours(parseInt(hours), parseInt(minutes), 0);

            const duration = lastBooking.duration || 30;
            const endDate = addMinutes(startDate, duration);

            const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;

            const params = new URLSearchParams({
                action: 'TEMPLATE',
                text: `Motobox: ${lastBooking.service || (language === 'he' ? 'תור למוסך' : language === 'en' ? 'Technical Appointment' : 'Cita Técnica')}`,
                dates: dates,
                details: language === 'he' ? 'תור אושר במוסך מוטובוקס.' : language === 'en' ? 'Appointment confirmed at Motobox Garage.' : 'Cita confirmada en Motobox Garage.',
                location: 'Motobox Garage',
            });

            return `https://www.google.com/calendar/render?${params.toString()}`;
        } catch (e) {
            console.error('Error generating Google link', e);
            return '#';
        }
    };

    const generateAppleCalendarLink = () => {
        if (!lastBooking?.date || !lastBooking?.time) return '#';

        try {
            const [hours, minutes] = lastBooking.time.split(':');
            const startDate = new Date(lastBooking.date);
            startDate.setHours(parseInt(hours), parseInt(minutes), 0);
            const duration = lastBooking.duration || 30;
            const endDate = addMinutes(startDate, duration);

            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'BEGIN:VEVENT',
                `DTSTART:${formatGoogleDate(startDate)}`,
                `DTEND:${formatGoogleDate(endDate)}`,
                `SUMMARY:Motobox: ${lastBooking.service || (language === 'he' ? 'תור למוסך' : language === 'en' ? 'Technical Appointment' : 'Cita Técnica')}`,
                `DESCRIPTION:${language === 'he' ? 'תור אושר במוסך מוטובוקס.' : language === 'en' ? 'Appointment confirmed at Motobox Garage.' : 'Cita confirmada en Motobox Garage.'}`,
                'LOCATION:Motobox Garage',
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\n');

            return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
        } catch (e) {
            console.error('Error generating Apple link', e);
            return '#';
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in items-center justify-center text-center px-6 py-12" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-8">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50">
                    <Check size={40} className="text-white" strokeWidth={3} />
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-2 text-white">
                {language === 'he' ? 'התור אושר!' : language === 'en' ? 'Booking Confirmed!' : '¡Cita Confirmada!'}
            </h2>
            <p className="text-gray-400 mb-12">
                {language === 'he' ? 'שלחנו את הפרטים לאיש הקשר שלך.' : language === 'en' ? 'We have sent the details to your contact.' : 'Hemos enviado los detalles a su contacto.'}
            </p>

            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                {lastBooking && (
                    <>
                        <a
                            href={generateGoogleCalendarLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#4285F4] hover:bg-[#357abd] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg text-sm"
                        >
                            <Calendar size={20} /> {language === 'he' ? 'הוסף ליומן גוגל' : language === 'en' ? 'ADD TO GOOGLE CALENDAR' : 'AÑADIR A GOOGLE CALENDAR'}
                        </a>

                        <a
                            href={generateAppleCalendarLink()}
                            download="cita-motobox.ics"
                            className="w-full bg-white text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-200 shadow-md text-sm"
                        >
                            <Smartphone size={20} /> {language === 'he' ? 'יומן אפל' : language === 'en' ? 'APPLE CALENDAR' : 'APPLE CALENDARIO'}
                        </a>
                    </>
                )}

                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-sm"
                >
                    <Home size={20} /> {language === 'he' ? 'חזרה לדף הבית' : language === 'en' ? 'BACK TO HOME' : 'VOLVER AL INICIO'}
                </button>
            </div>

            <p className="mt-12 text-xs text-gray-500 max-w-xs mx-auto">
                {language === 'he'
                    ? 'אם עליך לשנות או לבטל את התור, תוכל לעשות זאת דרך סעיף "בדוק את התור שלי" במסך הבית.'
                    : language === 'en'
                        ? 'If you need to change or cancel your appointment, you can do so from the "Check my appointment" section on the home screen.'
                        : 'Si necesita cambiar o cancelar su cita, puede hacerlo desde la sección "Consultar mi cita" en la pantalla de inicio.'}
            </p>
        </div>
    );
}
