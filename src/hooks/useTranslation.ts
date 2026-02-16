import { useBookingStore } from '../store/bookingStore';
import { translations } from '../translations';

export function useTranslation() {
    const language = useBookingStore((state) => state.language);
    const t = translations[language] || translations.es;

    return { t, language };
}
