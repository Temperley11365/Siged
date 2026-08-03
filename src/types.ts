export type RolAbogado = 'Socio' | 'Asociado';

export interface Abogado {
  id: string;
  nombre: string;
  matricula: string;
  rol: RolAbogado;
  email: string;
  telefono: string;
  avatarUrl?: string;
}

export interface Expediente {
  id: string;
  numero: string;
  caratula: string;
  juzgado: string;
  fuero: 'Civil y Comercial' | 'Laboral' | 'Familia' | 'Caducidades y Concursos';
  circunscripcion: 'Primera (Posadas)' | 'Segunda (Oberá)' | 'Tercera (Eldorado)' | 'Cuarta (Puerto Rico)';
  abogados_autorizados: string[]; // List of abogado_ids with access
  letrado_patrocinante: string;
  apoderado?: string;
  fecha_inicio: string;
  estado: 'En trámite' | 'Con plazo pendiente' | 'Dictamen pendiente' | 'Archivado';
  cliente: string;
}

export interface ActuacionSIGED {
  id: string;
  expediente_id: string;
  fecha: string;
  tipo_actuacion: string;
  firmante: string;
  texto_completo: string;
  procesado: boolean;
  ultimo_analisis?: RespuestaProcesalSiged;
}

export interface ExpedienteSummary {
  numero: string;
  caratula: string;
  juzgado: string;
}

export interface AnalisisProcesal {
  requiere_accion: boolean;
  tipo_actuacion: string;
  resumen_ejecutivo: string;
  plazo_dias: number | null;
  tipo_plazo: 'hábiles' | 'corridos' | null;
  sugerencia_agenda: string | null;
}

export interface Notificaciones {
  push_short: string;
  whatsapp_text: string;
  email_subject: string;
  email_body: string;
}

export interface MetaCalculoPlazo {
  fecha_notificacion: string;
  vencimiento_fecha: string;
  vencimiento_con_gracia: string; // "Primeras 2 horas del día hábil posterior"
  dias_habiles_desglosados: string[];
}

export interface RespuestaProcesalSiged {
  autenticacion_valida: boolean;
  abogado_destino_id: string;
  expediente: ExpedienteSummary;
  analisis_procesal: AnalisisProcesal;
  notificaciones: Notificaciones;
  mensaje_seguridad?: string;
  meta_calculo?: MetaCalculoPlazo;
}

export interface PeticionProcesamientoSiged {
  abogado_autenticado: {
    abogado_id: string;
    nombre: string;
    matricula: string;
    rol: RolAbogado;
  };
  expediente?: {
    id?: string;
    numero?: string;
    caratula?: string;
    juzgado?: string;
  };
  texto_actuacion: string;
  fecha_notificacion?: string; // Optional reference date, default today YYYY-MM-DD
}
