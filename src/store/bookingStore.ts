import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tecnico } from '../types/database';

export type ServiceType = 'cambio_aceite' | 'pedir_cita' | 'mantenimiento' | 'frenos' | 'bateria' | 'itv';

interface Service {
    type: ServiceType;
    duration: number; // in minutes
    price?: number | string;
    name: string;
}

interface BookingState {
    client: {
        nombre: string;
        apellidos: string;
        telefono: string;
        email: string;
        consentimiento: boolean;
    };
    vehicle: {
        matricula: string;
        marca: string;
        modelo: string;
        anio: string;
        motivo: string;
    };
    selectedTechnician: Tecnico | null;
    selectedDate: Date | null;
    selectedTimeSlot: string | null;
    selectedService: Service | null;

    lastBooking: {
        date: string | null;
        time: string | null;
        service: string | null;
        duration: number;
    } | null;
    setClient: (client: Partial<BookingState['client']>) => void;
    setVehicle: (vehicle: Partial<BookingState['vehicle']>) => void;
    setTechnician: (tech: Tecnico | null) => void;
    setService: (service: Service | null) => void;
    setDate: (date: Date | null) => void;
    setTimeSlot: (slot: string | null) => void;
    setLastBooking: (booking: BookingState['lastBooking']) => void;
    reset: () => void;
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set) => ({
            client: {
                nombre: '',
                apellidos: '',
                telefono: '',
                email: '',
                consentimiento: false,
            },
            vehicle: {
                matricula: '',
                marca: '',
                modelo: '',
                anio: '',
                motivo: '',
            },
            selectedTechnician: null,
            selectedDate: null,
            selectedTimeSlot: null,
            selectedService: null,

            lastBooking: null,

            setClient: (client) => set((state) => ({ client: { ...state.client, ...client } })),
            setVehicle: (vehicle) => set((state) => ({ vehicle: { ...state.vehicle, ...vehicle } })),
            setTechnician: (tech) => set({ selectedTechnician: tech }),
            setService: (service) => set({ selectedService: service }),
            setDate: (date) => set({ selectedDate: date }),
            setTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
            setLastBooking: (booking) => set({ lastBooking: booking }),
            reset: () => set({
                client: { nombre: '', apellidos: '', telefono: '', email: '', consentimiento: false },
                vehicle: { matricula: '', marca: '', modelo: '', anio: '', motivo: '' },
                selectedTechnician: null,
                selectedDate: null,
                selectedTimeSlot: null,
                selectedService: null,
            }),
        }),
        {
            name: 'booking-storage', // name of the item in local storage
        }
    )
);
