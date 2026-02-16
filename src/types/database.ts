export interface Tecnico {
    id: string;
    nombre: string;
    especialidad: string;
    activo: boolean;
    foto_url: string;
    created_at: string;
}

export interface Cliente {
    id: string;
    nombre: string;
    telefono: string;
    email: string | null;
    consentimiento_rgpd: boolean;
    created_at: string;
}

export interface Vehiculo {
    id: string;
    cliente_id: string;
    matricula: string;
    marca: string;
    modelo: string;
    anio: string;
    notas: string;
    created_at: string;
}

export type CitaEstado = 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_show';

export interface Cita {
    id: string;
    cliente_id: string;
    vehiculo_id: string;
    tecnico_id: string | null;
    fecha_hora_inicio: string;
    duracion: number;
    estado: CitaEstado;
    codigo_acceso: string;
    created_at: string;
    updated_at: string;
    // Joins
    clientes?: Cliente;
    vehiculos?: Vehiculo;
    tecnicos?: Tecnico;
}

export interface Bloqueo {
    id: string;
    tecnico_id: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    motivo: string;
    created_at: string;
}

export interface Configuracion {
    key: string;
    value: any;
    created_at: string;
}

export interface Servicio {
    id: string;
    type: string;
    name: string;
    description: string | null;
    duration: number;
    price: string | null;
    is_active: boolean;
    created_at: string;
}
