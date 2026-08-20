export type RolAbogado = 'Administrador' | 'Socio' | 'Asociado';

export interface CredencialesSIGED {
  usuarioSiged: string;
  claveSiged: string;
  pinCertificadoDigital?: string;
  estadoConexion: 'Conectado' | 'Pendiente' | 'Error' | 'Desconectado';
  ultimaSincronizacion?: string;
  sincronizacionAutomatica: boolean;
  frecuenciaMinutos: number;
  notificacionesPushWeb: boolean;
}

export interface Abogado {
  id: string;
  nombre: string;
  matricula: string;
  rol: RolAbogado;
  email: string;
  password?: string;
  telefono: string;
  avatarUrl?: string;
  credencialesSiged?: CredencialesSIGED;
  preguntaSecreta?: string;
  respuestaSecreta?: string;
  esAdmin?: boolean;
  fechaRegistro?: string;
  activo?: boolean;
}

export interface EstadoServidor {
  nombre: string;
  endpoint: string;
  estado: 'Operativo' | 'Advertencia' | 'Critico' | 'Desconectado';
  latenciaMs: number;
  uptime: string;
  detalles: string;
  ultimaVerificacion: string;
}

export interface ReporteSaludServidores {
  servidores: EstadoServidor[];
  memoriaUsoMb: number;
  cpuUsoPorcentaje: number;
  totalPeticionesHoy: number;
  sincronizacionDaemon: {
    estado: 'Corriendo' | 'En Pausa' | 'Error';
    intervaloMinutos: number;
    ultimoBarrido: string;
    proximoBarrido: string;
    expedientesMonitoreados: number;
  };
}

export interface NotificacionPushSiged {
  id: string;
  abogado_id: string;
  expediente_id: string;
  expediente_numero: string;
  caratula: string;
  titulo: string;
  mensaje: string;
  tipo: 'CEDULA' | 'RESOLUCION' | 'INTIMACION' | 'PROVEIDO' | 'CADUCIDAD' | 'GENERAL';
  fecha: string;
  leida: boolean;
  actuacion_id?: string;
}

export interface RegistroSincronizacionSiged {
  id: string;
  fecha: string;
  expedientesAnalizados: number;
  nuevosMovimientosDetectados: number;
  estado: 'Exitoso' | 'Con Novedades' | 'Error Credenciales';
  detalles: string;
}

// -------------------------------------------------------------
// 1. OIDC / Keycloak Integration (Jusmisiones IDP)
// -------------------------------------------------------------
export interface OidcConfig {
  idpUrl: string; // e.g. "https://idm.jusmisiones.gov.ar/auth/realms/poder-judicial-misiones"
  clientId: string; // "siged-oidc"
  scope: string; // "openid email profile"
  redirectUri: string;
}

export interface OidcTokenClaims {
  sub: string;
  preferred_username: string;
  email: string;
  name: string;
  matricula_cpam: string;
  roles: string[];
  circunscripcion: string;
  expedientes_acreditados: string[];
  iat: number;
  exp: number;
}

export interface OidcSessionState {
  autenticado: boolean;
  tokenJwt?: string;
  claims?: OidcTokenClaims;
  metodoAutenticacion: 'OIDC_SSO' | 'LOCAL';
  fechaAutenticacion?: string;
}

// -------------------------------------------------------------
// 2. Ficha Completa del Expediente & Estado Financiero
// -------------------------------------------------------------
export type FueroJudicial = 
  | 'Civil y Comercial' 
  | 'Laboral' 
  | 'Familia' 
  | 'Caducidades y Concursos' 
  | 'ANSES / Previsional' 
  | 'Justicia Federal';
export type CircunscripcionJudicial = 
  | 'Primera (Posadas)'
  | 'Segunda (Oberá)'
  | 'Tercera (Eldorado)'
  | 'Cuarta (Puerto Rico)'
  | 'Quinta (San Vicente)';

export type EtapaProcesal =
  | 'Iniciación / Demanda'
  | 'Traba de la Litis / Contestación'
  | 'Apertura a Prueba'
  | 'Alegatos'
  | 'Autos para Sentencia'
  | 'Ejecución de Sentencia';

export interface ParteInterviniente {
  id: string;
  nombre: string;
  rol: 'Actor/a' | 'Demandado/a' | 'Citado/a en Garantía' | 'Perito' | 'Juez/a' | 'Secretario/a' | 'Tercero';
  dni_cuit?: string;
  domicilio_constituido?: string;
  letrado_patrocinante?: string;
}

export interface MovimientoExpediente {
  id: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  firmante: string;
  adjuntoPdfUrl?: string;
}

export interface EstadoFinancieroCausa {
  honorariosPactados: number;
  honorariosRegulados: number;
  honorariosCobrados: number;
  tasaDeJusticiaMisiones: number; // 1.5% o tasa fija / monto de tasas
  montoTasas?: number; // Monto de tasas generales o administrativas
  tasaJusticiaPagada: boolean;
  aportesCajaForense: number;
  aportesCajaAbogados: number;
  gastosDiligenciamiento: number;
  gastosExtras?: number; // Gastos extras de gestoría / pericias / traslados
  saldoPendiente: number;
}

export interface Expediente {
  id: string;
  numero: string;
  caratula: string;
  juzgado: string;
  fuero: FueroJudicial;
  circunscripcion: CircunscripcionJudicial;
  etapa_procesal: EtapaProcesal;
  abogados_autorizados: string[]; // List of abogado_ids with access
  letrado_patrocinante: string;
  apoderado?: string;
  fecha_inicio: string;
  estado: 'En trámite' | 'Con plazo pendiente' | 'Dictamen pendiente' | 'Archivado' | 'Finalizado';
  cliente: string;
  partes: ParteInterviniente[];
  movimientos: MovimientoExpediente[];
  financiero: EstadoFinancieroCausa;
  sistemaOrigen?: 'SIGED Misiones' | 'ANSES e-TRAMITE' | 'PJN - Justicia Federal';
  numeroExpedienteAnses?: string;
  cuilTitularAnses?: string;
  numeroExpedientePJN?: string;
  camaraFederalPJN?: string;
  sistemaDeoxActivo?: boolean;
}

// -------------------------------------------------------------
// 3. Módulo de Pruebas y Semáforo de Plazos
// -------------------------------------------------------------
export type TipoPrueba =
  | 'Documental'
  | 'Informativa (Oficio)'
  | 'Confesional (Absolución)'
  | 'Testimonial'
  | 'Pericial'
  | 'Otras';

export type EstadoPrueba =
  | 'Ofrecida'
  | 'Proveída'
  | 'Diligenciada / Oficiada'
  | 'Contestada / Rendida'
  | 'Impugnada / Observada'
  | 'Firme';

export type SemaforoColor = 'verde' | 'amarillo' | 'rojo';

export interface PruebaExpediente {
  id: string;
  expediente_id: string;
  tipo: TipoPrueba;
  caratula_expte: string;
  descripcion: string;
  oferente: 'Parte Actora' | 'Parte Demandada' | 'De Oficio';
  estado: EstadoPrueba;
  fecha_proveido?: string;
  fecha_vencimiento_procesal?: string;
  dias_restantes?: number;
  semaforo: SemaforoColor;
  responsable_id: string;
  detalles_oficio_pericia?: string;
  observaciones?: string;
}

// -------------------------------------------------------------
// 4. Audiencias y Notificaciones Manuales
// -------------------------------------------------------------
export type TipoAudiencia =
  | 'Testimonial'
  | 'Confesional (Absolución de Posiciones)'
  | 'Pericial'
  | 'Art. 360 / Preliminar CPCCyM'
  | 'Conciliación / Mediación Judicial';

export type EstadoNotificacionAudiencia =
  | 'Cédula Confeccionada'
  | 'Enviada a Oficina Notificaciones'
  | 'Diligenciada / Notificado'
  | 'Fracasada / Devuelta sin notificar';

export interface PersonaCitada {
  id: string;
  nombre: string;
  dni?: string;
  rolCitado: 'Testigo' | 'Perito' | 'Absolvente / Parte' | 'Mediador/a';
  estadoNotificacion: EstadoNotificacionAudiencia;
  fechaNotificacionManual?: string;
  observacionesNotificacion?: string;
}

export interface AudienciaExpediente {
  id: string;
  expediente_id: string;
  caratula_expte: string;
  tipo: TipoAudiencia;
  fecha_hora: string;
  juzgado_sala: string;
  modalidad: 'Presencial' | 'Virtual (SIGED Webex)' | 'Híbrida';
  personas_citadas: PersonaCitada[];
  pruebas_vinculadas_ids: string[];
  notas_audiencia?: string;
  estado: 'Programada' | 'Realizada' | 'Suspendida / Reagendada';
}

// -------------------------------------------------------------
// 5. Tareas del Estudio & Gestión Global
// -------------------------------------------------------------
export type EstadoTarea = 'Por Hacer' | 'En Progreso' | 'En Revisión' | 'Completada';
export type PrioridadTarea = 'Baja' | 'Media' | 'Alta' | 'Urgente';

export interface ComentarioTarea {
  id: string;
  autor: string;
  fecha: string;
  texto: string;
}

export interface TareaEstudio {
  id: string;
  titulo: string;
  descripcion: string;
  expediente_id?: string;
  expediente_caratula?: string;
  responsable_id: string;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  fecha_vencimiento: string;
  creada_por: string;
  fecha_creacion: string;
  comentarios: ComentarioTarea[];
}

// -------------------------------------------------------------
// 6. Agenda Intuitiva, Días Inhábiles & Plazos
// -------------------------------------------------------------
export type VistaCalendario = 'Dia' | 'Semana' | 'Mes' | 'Año';
export type TipoDiaInhabil = 'Feria Judicial' | 'Feriado Nacional' | 'Feriado Provincial Misiones' | 'Asueto / Paro Judicial Configurable' | 'Paro Judicial' | 'Provincial' | 'Nacional' | 'Estudio Posadas';

export interface DiaInhabil {
  id: string;
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  tipo: string;
  motivo?: string;
  ambito?: string;
  configurablePorEstudio?: boolean;
}

export interface EventoCalendario {
  id: string;
  titulo: string;
  fecha: string;
  hora?: string;
  tipo: 'Vencimiento Procesal' | 'Audiencia' | 'Tarea' | 'Inhábil';
  expediente_id?: string;
  prioridad?: PrioridadTarea;
  completado?: boolean;
}

// -------------------------------------------------------------
// 7. Gestor de Documentos y Editor .docx
// -------------------------------------------------------------
export interface DocumentoEstudio {
  id: string;
  nombre: string;
  expediente_id?: string;
  carpeta: string; // e.g., "EXP-1420", "Modelos Escritos", "Jurisprudencia STJ"
  tipoArchivo: 'pdf' | 'docx' | 'doc' | 'txt';
  tamanio: string;
  fecha_modificacion: string;
  autor: string;
  contenidoTexto?: string;
  contenidoSimulado?: string;
  pdfSimuladoUrl?: string;
  fileDataUrl?: string;
}

export interface PlantillaDocx {
  id: string;
  nombre: string;
  categoria: 'Demandas' | 'Contestaciones' | 'Oficios' | 'Cédulas' | 'Recursos';
  contenidoPlantilla: string;
  contenidoDefault?: string;
}

// -------------------------------------------------------------
// 8. Repositorio de Escritos & Guías de Pasos Procesales
// -------------------------------------------------------------
export interface PasoProcesalGuia {
  id: string;
  orden: number;
  titulo: string;
  descripcion: string;
  diasEstimados?: number;
  escritoRecomendadoId?: string;
  escritoRecomendadoNombre?: string;
  obligatorio?: boolean;
}

export interface ModeloEscritoRepositorio {
  id: string;
  titulo: string;
  fuero: FueroJudicial | string;
  tematica: string; // e.g. 'Daños y Perjuicios', 'Despido e Indemnización', 'Divorcio', 'Ejecución de Honorarios', 'Sucesión Ab Intestato'
  tipoExpediente?: string; // e.g. 'Juicio Ordinario', 'Juicio Sumarísimo', 'Juicio Ejecutivo'
  etapaProcesal: EtapaProcesal;
  descripcion: string;
  contenidoPlantilla: string;
  pasosASeguir: PasoProcesalGuia[];
  autor: string;
  fechaCreacion: string;
  etiquetas?: string[];
  pdfSimuladoUrl?: string;
}

export interface ProgresoPasosExpediente {
  expediente_id: string;
  modelo_id: string;
  pasosCompletadosIds: string[];
  fechaUltimaActualizacion: string;
}

// -------------------------------------------------------------
// Portales Externos (ANSES & PJN Federal) y Alertas Programables
// -------------------------------------------------------------
export type PortalTipo = 'ANSES e-TRAMITE' | 'PJN - Justicia Federal' | 'DEOX (Oficios Digitales)' | 'AFIP / Vega' | 'AFIP / SiPyME';

export interface PasoHistorialPortal {
  id: string;
  fecha: string;
  estado: string;
  observacion: string;
  usuarioPortal?: string;
  oficinaOrganismo?: string;
}

export interface TramitePortalExterno {
  id: string;
  expediente_id?: string;
  portal: PortalTipo;
  numeroTramite: string; // e.g. "018-20-12345678-9-152-1" or "FPO 12345/2024"
  cuilDniTitular: string;
  nombreTitular: string;
  tipoTramite: string; // e.g. "Jubilación Ordinaria Ley 24.241", "Reajuste de Haberes - Badaro", "Acción de Amparo Federal", "Oficio DEOX"
  estadoActual: string;
  fechaUltimoEstado: string;
  pasosHistorial: PasoHistorialPortal[];
  observaciones?: string;
  archivosAdjuntosCount?: number;
  camaraFederal?: string;
  deoxEstado?: 'Pendiente Firma' | 'Diligenciado' | 'Contestado';
}

export interface AlertaPushProgramable {
  id: string;
  titulo: string;
  mensaje: string;
  fechaHoraProgramada: string; // YYYY-MM-DD HH:mm
  expediente_id?: string;
  expediente_numero?: string;
  clienteDniNombre?: string;
  tipo: 'CEDULA' | 'RESOLUCION' | 'INTIMACION' | 'PROVEIDO' | 'CADUCIDAD' | 'GENERAL' | 'ANSES_TURNO' | 'PJN_VENCIMIENTO';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  estado: 'Programada' | 'Enviada' | 'Cancelada';
  fechaCreacion: string;
}

// -------------------------------------------------------------
// Actuacion y Procesamiento SIGED AI
// -------------------------------------------------------------
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
  vencimiento_con_gracia: string;
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
  fecha_notificacion?: string;
}

// -------------------------------------------------------------
// 7. Respaldo Integral, Nube y Restauración en Punto en el Tiempo
// -------------------------------------------------------------
export type FrecuenciaRespaldo = 'EN_CADA_CAMBIO' | 'CADA_6_HORAS' | 'CADA_12_HORAS' | 'DIARIO' | 'SEMANAL' | 'MANUAL';
export type DestinoRespaldo = 'LOCAL_PC' | 'GOOGLE_DRIVE' | 'AMBOS';

export interface ConfiguracionRespaldoAutomatico {
  habilitado: boolean;
  destino: DestinoRespaldo;
  frecuencia: FrecuenciaRespaldo;
  mantenerMaxSnapshots: number;
  ultimoRespaldoIso?: string;
  proximoRespaldoIso?: string;
  googleDriveFolder?: string;
  googleDriveToken?: string;
  googleDriveUserEmail?: string;
  notificarAlGuardar: boolean;
}

export interface BackupSnapshotEstadisticas {
  totalExpedientes: number;
  totalActuaciones: number;
  totalAudiencias: number;
  totalPruebas: number;
  totalTareas: number;
  totalDocumentos: number;
}

// Aliases for compatibility
export type ActuacionProcesal = ActuacionSIGED;
export type Audiencia = AudienciaExpediente;
export type MedioPrueba = PruebaExpediente;

export interface BackupSnapshot {
  id: string;
  fechaIso: string;
  fechaHoraLegible: string;
  origen: 'LOCAL_AUTO' | 'LOCAL_MANUAL' | 'GOOGLE_DRIVE' | 'CLOUD_RESTORE';
  versionSistema: string;
  tamanoBytes: number;
  tamanoLegible: string;
  autorNombre: string;
  autorMatricula: string;
  descripcion: string;
  estadisticas: BackupSnapshotEstadisticas;
  googleDriveFileId?: string;
  googleDriveWebUrl?: string;
  datos: {
    expedientes: Expediente[];
    actuaciones: ActuacionSIGED[];
    audiencias: AudienciaExpediente[];
    pruebas: PruebaExpediente[];
    tareas: TareaEstudio[];
    documentos: DocumentoEstudio[];
    diasInhabiles: DiaInhabil[];
    tramitesPortales?: TramitePortalExterno[];
    modelosRepositorio?: ModeloEscritoRepositorio[];
    progresosPasos?: ProgresoPasosExpediente[];
  };
}

// -------------------------------------------------------------
// 8. Chatbot de Clientes & Asistente Virtual Inteligente
// -------------------------------------------------------------
export interface ResumenExpedienteChatbot {
  numero: string;
  caratula: string;
  juzgado: string;
  fuero: string;
  estado: string;
  etapa_procesal: string;
  abogado_responsable: string;
  ultimo_movimiento?: {
    fecha: string;
    tipo: string;
    descripcion: string;
  };
  proxima_audiencia?: {
    fecha: string;
    tipo: string;
    juzgado: string;
    modalidad: string;
  };
  saldo_financiero?: {
    honorariosPactados: number;
    honorariosCobrados: number;
    saldoPendiente: number;
  };
}

export interface MensajeChatCliente {
  id: string;
  emisor: 'cliente' | 'bot' | 'sistema';
  texto: string;
  timestamp: string;
  tipoRespuesta?: 'info' | 'audiencia' | 'movimiento' | 'financiero' | 'seguridad' | 'escalamiento';
  expedienteReferencia?: ResumenExpedienteChatbot;
  sugerencias?: string[];
}

export interface ConfiguracionChatbot {
  nombreBot: string;
  mensajeBienvenida: string;
  tonoRespuesta: 'formal' | 'cordial' | 'simplificado';
  permitirVerAudiencias: boolean;
  permitirVerFinanciero: boolean;
  permitirSolicitarLlamada: boolean;
  telefonoWhatsAppEstudio: string;
  emailContactoEstudio: string;
  nombreEstudio: string;
  horarioAtencion: string;
  whatsappWebhookUrl?: string;
  whatsappVerifyToken?: string;
}

export interface RegistroConsultaChatbot {
  id: string;
  fecha: string;
  clienteDni: string;
  clienteNombre?: string;
  expedienteNumero?: string;
  pregunta: string;
  respuesta: string;
  canal: 'web_widget' | 'portal_clientes' | 'whatsapp';
  solicitoHumano: boolean;
  atendidoPorAbogado?: boolean;
}

export interface PeticionConsultaChatbot {
  dni_cuit: string;
  consulta: string;
  expediente_id?: string;
  historial?: { emisor: 'cliente' | 'bot'; texto: string }[];
  canal?: 'web_widget' | 'portal_clientes' | 'whatsapp';
}

export interface RespuestaConsultaChatbot {
  exito: boolean;
  mensaje: string;
  expediente?: ResumenExpedienteChatbot;
  expedientesDisponibles?: { id: string; numero: string; caratula: string }[];
  sugerencias: string[];
  tipo: 'info' | 'audiencia' | 'movimiento' | 'financiero' | 'seguridad' | 'escalamiento';
  requiereContactoHumano?: boolean;
}


