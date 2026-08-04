import { 
  Abogado, 
  Expediente, 
  ActuacionSIGED, 
  PruebaExpediente, 
  AudienciaExpediente, 
  TareaEstudio, 
  DiaInhabil, 
  DocumentoEstudio, 
  PlantillaDocx,
  OidcSessionState,
  NotificacionPushSiged,
  RegistroSincronizacionSiged
} from '../types';

export const DEFAULT_OIDC_SESSION: OidcSessionState = {
  autenticado: true,
  metodoAutenticacion: 'OIDC_SSO',
  fechaAutenticacion: '2026-08-03 09:15:00',
  tokenJwt: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkcl9wb3NhZGFzXzQxMDIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJqcG9zYWRhcyIsImVtYWlsIjoianBvc2FkYXNAZXN0dWRpb3Bvc2FkYXMuY29tLmFyIiwibmFtZSI6IkRyLiBKdWFuIE1hbnVlbCBQb3NhZGFzIiwibWF0cmljdWxhX2NwYW0iOiJNUDQxMDIiLCJyb2xlcyI6WyJTb2NpbyIsIkFib2dhZG9fQXBvZGVyYWRvIl0sImNpcmN1bnNjcmlwY2lvbiI6IlByaW1lcmEgKFBvc2FkYXMpIiwiZXhwZWRpZW50ZXNfYWNyZWRpdGFkb3MiOlsiRVhQLTE0MjAiLCJFWFAtODgyIiwiRVhQLTMxMDUiLCJFWFAtOTk0MSIsIkVYUC01MDQiXX0',
  claims: {
    sub: 'dr_posadas_4102',
    preferred_username: 'jposadas',
    email: 'jposadas@estudioposadas.com.ar',
    name: 'Dr. Juan Manuel Posadas',
    matricula_cpam: 'MP 4102 - CADAM',
    roles: ['Socio', 'Abogado_Apoderado'],
    circunscripcion: 'Primera (Posadas)',
    expedientes_acreditados: ['EXP-1420', 'EXP-882', 'EXP-3105', 'EXP-9941', 'EXP-504'],
    iat: 1785830000,
    exp: 1785866000,
  }
};

export const INITIAL_ACTUACIONES: ActuacionSIGED[] = [
  {
    id: 'ACT-001',
    expediente_id: 'EXP-1420',
    fecha: '2026-08-01',
    tipo_actuacion: 'Cédula Digital SIGED',
    firmante: 'Secretaría N° 2 - Dra. Carmen Benítez',
    texto_completo: 'Atento al estado de las actuaciones, del traslado de la contestación de demanda deducida por la demandada córrase traslado a la parte actora por el término de CINCO (5) DÍAS HÁBILES judicialmente computables.',
    procesado: true,
  },
  {
    id: 'ACT-002',
    expediente_id: 'EXP-3105',
    fecha: '2026-08-02',
    tipo_actuacion: 'Intimación de Pago SIGED',
    firmante: 'Juez Dr. Ricardo Alvarenga',
    texto_completo: 'Intímese al ejecutado al pago del capital e intereses reclamados bajo apercibimiento de ley en el plazo de TRES (3) DÍAS HÁBILES.',
    procesado: false,
  },
];

export const INITIAL_ABOGADOS: Abogado[] = [
  {
    id: 'ABG-001',
    nombre: 'Dr. Juan Manuel Posadas',
    matricula: 'MP 4102 - CADAM',
    rol: 'Socio',
    email: 'jposadas@estudioposadas.com.ar',
    password: '123456',
    telefono: '+5493764123456',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    credencialesSiged: {
      usuarioSiged: 'jposadas.cadam',
      claveSiged: '••••••••••••',
      pinCertificadoDigital: '884192',
      estadoConexion: 'Conectado',
      ultimaSincronizacion: '2026-08-03 16:45:00',
      sincronizacionAutomatica: true,
      frecuenciaMinutos: 15,
      notificacionesPushWeb: true,
    },
  },
  {
    id: 'ABG-002',
    nombre: 'Dra. María Elena Gómez',
    matricula: 'MP 5890 - CADAM',
    rol: 'Asociado',
    email: 'mgomez@estudioposadas.com.ar',
    password: '123456',
    telefono: '+5493764987654',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    credencialesSiged: {
      usuarioSiged: 'mgomez.siged',
      claveSiged: '••••••••••••',
      pinCertificadoDigital: '441092',
      estadoConexion: 'Conectado',
      ultimaSincronizacion: '2026-08-03 15:30:00',
      sincronizacionAutomatica: true,
      frecuenciaMinutos: 30,
      notificacionesPushWeb: true,
    },
  },
  {
    id: 'ABG-003',
    nombre: 'Dr. Carlos Alberto Ruiz',
    matricula: 'MP 6214 - CADAM',
    rol: 'Asociado',
    email: 'cruiz@estudioposadas.com.ar',
    password: '123456',
    telefono: '+5493764554433',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    credencialesSiged: {
      usuarioSiged: 'cruiz.siged',
      claveSiged: '••••••••••••',
      pinCertificadoDigital: '109283',
      estadoConexion: 'Pendiente',
      ultimaSincronizacion: '2026-08-02 18:00:00',
      sincronizacionAutomatica: false,
      frecuenciaMinutos: 60,
      notificacionesPushWeb: true,
    },
  },
];

export const INITIAL_NOTIFICACIONES_PUSH: NotificacionPushSiged[] = [
  {
    id: 'NOT-001',
    abogado_id: 'ABG-001',
    expediente_id: 'EXP-1420',
    expediente_numero: '1420/2025',
    caratula: 'GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L.',
    titulo: '🔔 Cédula Digital SIGED Recibida',
    mensaje: 'Dra. Carmen Benítez dictó providencia de traslado por 5 días hábiles.',
    tipo: 'CEDULA',
    fecha: '2026-08-03 16:45:00',
    leida: false,
    actuacion_id: 'ACT-001',
  },
  {
    id: 'NOT-002',
    abogado_id: 'ABG-001',
    expediente_id: 'EXP-3105',
    expediente_numero: '3105/2024',
    caratula: 'BANCO MACRO S.A. C/ KRAMER HUGO S/ EJECUTIVO',
    titulo: '⚡ Intimación Judicial Registrada',
    mensaje: 'Se ordena intimación de pago por 3 días hábiles bajo apercibimiento de embargo.',
    tipo: 'INTIMACION',
    fecha: '2026-08-03 14:10:00',
    leida: true,
    actuacion_id: 'ACT-002',
  },
];

export const INITIAL_REGISTROS_SINCRONIZACION: RegistroSincronizacionSiged[] = [
  {
    id: 'SYNC-001',
    fecha: '2026-08-03 16:45:00',
    expedientesAnalizados: 5,
    nuevosMovimientosDetectados: 1,
    estado: 'Con Novedades',
    detalles: 'Se detectó 1 cédula de traslado en expediente 1420/2025 (Juzgado Civil N° 1).',
  },
  {
    id: 'SYNC-002',
    fecha: '2026-08-03 14:10:00',
    expedientesAnalizados: 5,
    nuevosMovimientosDetectados: 1,
    estado: 'Con Novedades',
    detalles: 'Se registró orden de intimación en causa ejecutorio 3105/2024.',
  },
  {
    id: 'SYNC-003',
    fecha: '2026-08-03 09:00:00',
    expedientesAnalizados: 5,
    nuevosMovimientosDetectados: 0,
    estado: 'Exitoso',
    detalles: 'Monitoreo de mesa de entradas virtual SIGED sin nuevos movimientos decretados.',
  },
];

export const INITIAL_EXPEDIENTES: Expediente[] = [
  {
    id: 'EXP-1420',
    numero: '1420/2025',
    caratula: 'GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L. S/ DAÑOS Y PERJUICIOS',
    juzgado: 'Juzgado Civil y Comercial N° 1 - Posadas',
    fuero: 'Civil y Comercial',
    circunscripcion: 'Primera (Posadas)',
    etapa_procesal: 'Apertura a Prueba',
    abogados_autorizados: ['ABG-001', 'ABG-002'],
    letrado_patrocinante: 'ABG-002',
    apoderado: 'ABG-001',
    fecha_inicio: '2025-03-10',
    estado: 'Con plazo pendiente',
    cliente: 'Alberto Gómez',
    partes: [
      { id: 'P-1', nombre: 'Alberto Gómez', rol: 'Actor/a', dni_cuit: '20-28491029-7', letrado_patrocinante: 'Dra. María Elena Gómez' },
      { id: 'P-2', nombre: 'Supermercados Misiones S.R.L.', rol: 'Demandado/a', dni_cuit: '30-68910293-4', letrado_patrocinante: 'Dr. Fernando M. Sola' },
      { id: 'P-3', nombre: 'La Segunda Seguros S.A.', rol: 'Citado/a en Garantía', letrado_patrocinante: 'Dr. Horacio Rossi' },
      { id: 'P-4', nombre: 'Ing. Carlos Medina', rol: 'Perito', domicilio_constituido: 'Av. Corrientes 1420 - Posadas' },
    ],
    movimientos: [
      { id: 'M-1', fecha: '2026-08-01', tipo: 'Cédula Digital SIGED', descripcion: 'Traslado de contestación de demanda por 5 días hábiles.', firmante: 'Secretaría N° 2 - Dra. Carmen Benítez' },
      { id: 'M-2', fecha: '2026-07-28', tipo: 'Contestación de Demanda', descripcion: 'Presentación letrada de la demandada oponiendo excepciones.', firmante: 'Dr. Fernando M. Sola' },
      { id: 'M-3', fecha: '2025-03-10', tipo: 'Demanda Inicial', descripcion: 'Sorteo de causa e inicio de actuaciones en Juzgado Civil 1 Posadas.', firmante: 'Dr. Juan Manuel Posadas' },
    ],
    financiero: {
      honorariosPactados: 4500000,
      honorariosRegulados: 0,
      honorariosCobrados: 1500000,
      tasaDeJusticiaMisiones: 67500,
      tasaJusticiaPagada: true,
      aportesCajaForense: 15000,
      aportesCajaAbogados: 12000,
      gastosDiligenciamiento: 25000,
      saldoPendiente: 3000000,
    },
  },
  {
    id: 'EXP-882',
    numero: '882/2024',
    caratula: 'SILVA ROXANA C/ TRANSPORTES URQUIZA S.A. S/ ACCIDENTE DE TRABAJO',
    juzgado: 'Juzgado de Primera Instancia en lo Laboral N° 2 - Posadas',
    fuero: 'Laboral',
    circunscripcion: 'Primera (Posadas)',
    etapa_procesal: 'Apertura a Prueba',
    abogados_autorizados: ['ABG-001', 'ABG-002'],
    letrado_patrocinante: 'ABG-002',
    fecha_inicio: '2024-08-15',
    estado: 'En trámite',
    cliente: 'Roxana Silva',
    partes: [
      { id: 'P-10', nombre: 'Roxana Silva', rol: 'Actor/a', dni_cuit: '27-33102948-2' },
      { id: 'P-11', nombre: 'Transportes Urquiza S.A.', rol: 'Demandado/a', dni_cuit: '30-55910291-8' },
      { id: 'P-12', nombre: 'Experta ART S.A.', rol: 'Citado/a en Garantía' },
    ],
    movimientos: [
      { id: 'M-10', fecha: '2026-07-20', tipo: 'Audiencia de Vista de Causa', descripcion: 'Se fija audiencia testimonial de partes para el 12/08/2026.', firmante: 'Juez Dr. Esteban Ramos' },
    ],
    financiero: {
      honorariosPactados: 6000000,
      honorariosRegulados: 5200000,
      honorariosCobrados: 2000000,
      tasaDeJusticiaMisiones: 0, // Exenta por fuero laboral
      tasaJusticiaPagada: true,
      aportesCajaForense: 20000,
      aportesCajaAbogados: 18000,
      gastosDiligenciamiento: 35000,
      saldoPendiente: 3200000,
    },
  },
  {
    id: 'EXP-3105',
    numero: '3105/2025',
    caratula: 'BANCO MACRO S.A. C/ KOWALSKI MARTIN S/ EJECUCION PRENDARIA',
    juzgado: 'Juzgado Civil, Comercial y de Familia N° 1 - Oberá',
    fuero: 'Civil y Comercial',
    circunscripcion: 'Segunda (Oberá)',
    etapa_procesal: 'Ejecución de Sentencia',
    abogados_autorizados: ['ABG-001', 'ABG-003'],
    letrado_patrocinante: 'ABG-003',
    apoderado: 'ABG-001',
    fecha_inicio: '2025-05-20',
    estado: 'Con plazo pendiente',
    cliente: 'Banco Macro S.A.',
    partes: [
      { id: 'P-20', nombre: 'Banco Macro S.A.', rol: 'Actor/a', dni_cuit: '30-50001008-2' },
      { id: 'P-21', nombre: 'Martín Kowalski', rol: 'Demandado/a', dni_cuit: '20-22194820-9' },
    ],
    movimientos: [
      { id: 'M-20', fecha: '2026-08-02', tipo: 'Intimación de Pago SIGED', descripcion: 'Resolución de intimación por 3 días hábiles.', firmante: 'Juez Dr. Ricardo Alvarenga' },
    ],
    financiero: {
      honorariosPactados: 3200000,
      honorariosRegulados: 3200000,
      honorariosCobrados: 3200000,
      tasaDeJusticiaMisiones: 48000,
      tasaJusticiaPagada: true,
      aportesCajaForense: 10000,
      aportesCajaAbogados: 9000,
      gastosDiligenciamiento: 15000,
      saldoPendiente: 0,
    },
  },
  {
    id: 'EXP-9941',
    numero: '9941/2025',
    caratula: 'FERREYRA PATRICIA C/ RUIZ MARCELO S/ DIVORCIO VINCULAR Y ALIMENTOS',
    juzgado: 'Juzgado de Familia N° 2 - Eldorado',
    fuero: 'Familia',
    circunscripcion: 'Tercera (Eldorado)',
    etapa_procesal: 'Traba de la Litis / Contestación',
    abogados_autorizados: ['ABG-001', 'ABG-003'],
    letrado_patrocinante: 'ABG-003',
    fecha_inicio: '2025-02-14',
    estado: 'Dictamen pendiente',
    cliente: 'Patricia Ferreyra',
    partes: [
      { id: 'P-30', nombre: 'Patricia Ferreyra', rol: 'Actor/a' },
      { id: 'P-31', nombre: 'Marcelo Ruiz', rol: 'Demandado/a' },
    ],
    movimientos: [
      { id: 'M-30', fecha: '2026-07-29', tipo: 'Vista Fiscal SIGED', descripcion: 'Vista a la parte actora por 10 días procesales.', firmante: 'Dra. Silvina Masi - Fiscal' },
    ],
    financiero: {
      honorariosPactados: 2500000,
      honorariosRegulados: 0,
      honorariosCobrados: 1000000,
      tasaDeJusticiaMisiones: 25000,
      tasaJusticiaPagada: true,
      aportesCajaForense: 8000,
      aportesCajaAbogados: 7000,
      gastosDiligenciamiento: 12000,
      saldoPendiente: 1500000,
    },
  },
  {
    id: 'EXP-504',
    numero: '504/2026',
    caratula: 'COOPERATIVA AGRICOLA ELDORADO LTDA. S/ CONCURSO PREVENTIVO',
    juzgado: 'Juzgado Civil y Comercial N° 3 - Posadas',
    fuero: 'Caducidades y Concursos',
    circunscripcion: 'Primera (Posadas)',
    etapa_procesal: 'Iniciación / Demanda',
    abogados_autorizados: ['ABG-001', 'ABG-002'],
    letrado_patrocinante: 'ABG-001',
    apoderado: 'ABG-002',
    fecha_inicio: '2026-01-22',
    estado: 'En trámite',
    cliente: 'Cooperativa Agrícola Eldorado',
    partes: [
      { id: 'P-40', nombre: 'Cooperativa Agrícola Eldorado Ltda.', rol: 'Actor/a' },
      { id: 'P-41', nombre: 'Cr. Gustavo Maidana', rol: 'Perito' },
    ],
    movimientos: [
      { id: 'M-40', fecha: '2026-07-15', tipo: 'Informe de Síndico', descripcion: 'Presentación del informe individual de créditos.', firmante: 'Cr. Gustavo Maidana' },
    ],
    financiero: {
      honorariosPactados: 12000000,
      honorariosRegulados: 0,
      honorariosCobrados: 4000000,
      tasaDeJusticiaMisiones: 180000,
      tasaJusticiaPagada: false,
      aportesCajaForense: 40000,
      aportesCajaAbogados: 35000,
      gastosDiligenciamiento: 50000,
      saldoPendiente: 8000000,
    },
  },
];

export const INITIAL_PRUEBAS: PruebaExpediente[] = [
  {
    id: 'PRU-001',
    expediente_id: 'EXP-1420',
    caratula_expte: '1420/2025 - GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES',
    tipo: 'Informativa (Oficio)',
    descripcion: 'Oficio a la Municipalidad de Posadas para remisión de habilitación comercial e inspecciones edilicias.',
    oferente: 'Parte Actora',
    estado: 'Diligenciada / Oficiada',
    fecha_proveido: '2026-07-25',
    fecha_vencimiento_procesal: '2026-08-08',
    dias_restantes: 5,
    semaforo: 'amarillo',
    responsable_id: 'ABG-002',
    detalles_oficio_pericia: 'Oficio digital N° 402/2026 enviado por SIGED. Pendiente de contestación por mesa de entradas municipal.',
    observaciones: 'Monitorear vencimiento para solicitar reiteración bajo apercibimiento de astreintes.',
  },
  {
    id: 'PRU-002',
    expediente_id: 'EXP-1420',
    caratula_expte: '1420/2025 - GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES',
    tipo: 'Pericial',
    descripcion: 'Pericia Médica Traumatológica sobre las secuelas físicas del actor por caída en local.',
    oferente: 'Parte Actora',
    estado: 'Proveída',
    fecha_proveido: '2026-07-28',
    fecha_vencimiento_procesal: '2026-08-05',
    dias_restantes: 2,
    semaforo: 'rojo',
    responsable_id: 'ABG-002',
    detalles_oficio_pericia: 'Perito designado: Dr. Jorge Benítez. Se debe intimar la aceptación de cargo en 3 días.',
  },
  {
    id: 'PRU-003',
    expediente_id: 'EXP-882',
    caratula_expte: '882/2024 - SILVA ROXANA C/ TRANSPORTES URQUIZA',
    tipo: 'Testimonial',
    descripcion: 'Declaración de testigos presenciales del accidente de trabajo (Sres. Maidana y Benítez).',
    oferente: 'Parte Actora',
    estado: 'Diligenciada / Oficiada',
    fecha_proveido: '2026-07-15',
    fecha_vencimiento_procesal: '2026-08-12',
    dias_restantes: 9,
    semaforo: 'verde',
    responsable_id: 'ABG-001',
    detalles_oficio_pericia: 'Testigos citados mediante cédula diligenciada en domicilio real.',
  },
  {
    id: 'PRU-004',
    expediente_id: 'EXP-3105',
    caratula_expte: '3105/2025 - BANCO MACRO C/ KOWALSKI MARTIN',
    tipo: 'Documental',
    descripcion: 'Contrato de prenda y pagaré ejecutable original digitalizado e inscripto en el Registro del Automotor Misiones.',
    oferente: 'Parte Actora',
    estado: 'Firme',
    fecha_proveido: '2025-06-01',
    fecha_vencimiento_procesal: '2025-06-15',
    dias_restantes: 0,
    semaforo: 'verde',
    responsable_id: 'ABG-003',
  },
];

export const INITIAL_AUDIENCIAS: AudienciaExpediente[] = [
  {
    id: 'AUD-001',
    expediente_id: 'EXP-882',
    caratula_expte: '882/2024 - SILVA ROXANA C/ TRANSPORTES URQUIZA S.A.',
    tipo: 'Testimonial',
    fecha_hora: '2026-08-12 09:30',
    juzgado_sala: 'Juzgado Laboral N° 2 Posadas - Sala 1',
    modalidad: 'Presencial',
    personas_citadas: [
      { id: 'CIT-1', nombre: 'Roxana Silva (Actora)', rolCitado: 'Absolvente / Parte', estadoNotificacion: 'Diligenciada / Notificado', fechaNotificacionManual: '2026-07-30' },
      { id: 'CIT-2', nombre: 'Juan Ramón Maidana (Testigo)', rolCitado: 'Testigo', estadoNotificacion: 'Enviada a Oficina Notificaciones', fechaNotificacionManual: '2026-08-01' },
      { id: 'CIT-3', nombre: 'Carlos Benítez (Testigo)', rolCitado: 'Testigo', estadoNotificacion: 'Cédula Confeccionada' },
    ],
    pruebas_vinculadas_ids: ['PRU-003'],
    notas_audiencia: 'Llevar pliego de preguntas cerrado e interrogatorio de repreguntas preparado.',
    estado: 'Programada',
  },
  {
    id: 'AUD-002',
    expediente_id: 'EXP-1420',
    caratula_expte: '1420/2025 - GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES',
    tipo: 'Art. 360 / Preliminar CPCCyM',
    fecha_hora: '2026-08-18 10:00',
    juzgado_sala: 'Juzgado Civil y Comercial N° 1 Posadas - Videoconferencia SIGED Webex',
    modalidad: 'Virtual (SIGED Webex)',
    personas_citadas: [
      { id: 'CIT-10', nombre: 'Alberto Gómez', rolCitado: 'Absolvente / Parte', estadoNotificacion: 'Diligenciada / Notificado', fechaNotificacionManual: '2026-07-28' },
      { id: 'CIT-11', nombre: 'Rep. Legal Supermercados Misiones', rolCitado: 'Absolvente / Parte', estadoNotificacion: 'Enviada a Oficina Notificaciones' },
    ],
    pruebas_vinculadas_ids: ['PRU-001', 'PRU-002'],
    notas_audiencia: 'Audiencia de conciliación y traba de hechos litigiosos.',
    estado: 'Programada',
  },
  {
    id: 'AUD-003',
    expediente_id: 'EXP-9941',
    caratula_expte: '9941/2025 - FERREYRA PATRICIA C/ RUIZ MARCELO',
    tipo: 'Conciliación / Mediación Judicial',
    fecha_hora: '2026-08-22 11:00',
    juzgado_sala: 'Centro de Mediación del Poder Judicial Misiones - Eldorado',
    modalidad: 'Híbrida',
    personas_citadas: [
      { id: 'CIT-20', nombre: 'Dra. Patricia Varela (Mediadora)', rolCitado: 'Mediador/a', estadoNotificacion: 'Diligenciada / Notificado' },
      { id: 'CIT-21', nombre: 'Patricia Ferreyra', rolCitado: 'Absolvente / Parte', estadoNotificacion: 'Diligenciada / Notificado' },
      { id: 'CIT-22', nombre: 'Marcelo Ruiz', rolCitado: 'Absolvente / Parte', estadoNotificacion: 'Fracasada / Devuelta sin notificar', observacionesNotificacion: 'Se cambió de domicilio a San Vicente.' },
    ],
    pruebas_vinculadas_ids: [],
    notas_audiencia: 'Revisar informe socioambiental previo.',
    estado: 'Programada',
  },
];

export const INITIAL_TAREAS: TareaEstudio[] = [
  {
    id: 'TAR-001',
    titulo: 'Contestar Traslado de Documental en Expte Gomez',
    descripcion: 'Elaborar escrito de contestación de observaciones planteadas por la demandada y adjuntar prueba de reproducciones fotográficas.',
    expediente_id: 'EXP-1420',
    expediente_caratula: '1420/2025 - GOMEZ C/ SUPERMERCADOS MISIONES',
    responsable_id: 'ABG-002',
    prioridad: 'Urgente',
    estado: 'En Progreso',
    fecha_vencimiento: '2026-08-06',
    creada_por: 'Dr. Juan Manuel Posadas',
    fecha_creacion: '2026-08-01',
    comentarios: [
      { id: 'COM-1', autor: 'Dra. María Elena Gómez', fecha: '2026-08-02 14:20', texto: 'Revisando los precedentes del STJ Misiones sobre caída en locales comerciales.' },
    ],
  },
  {
    id: 'TAR-002',
    titulo: 'Diligenciar Oficio a Municipalidad de Posadas',
    descripcion: 'Retirar cédula firmada digitalmente de SIGED y enviar por mesa de entradas electrónica comunal.',
    expediente_id: 'EXP-1420',
    expediente_caratula: '1420/2025 - GOMEZ C/ SUPERMERCADOS MISIONES',
    responsable_id: 'ABG-002',
    prioridad: 'Media',
    estado: 'Por Hacer',
    fecha_vencimiento: '2026-08-08',
    creada_por: 'Dra. María Elena Gómez',
    fecha_creacion: '2026-08-02',
    comentarios: [],
  },
  {
    id: 'TAR-003',
    titulo: 'Solicitar Subasta de Bien Prendado - Banco Macro',
    descripcion: 'Presentar escrito solicitando fecha de remate al Juzgado de Oberá.',
    expediente_id: 'EXP-3105',
    expediente_caratula: '3105/2025 - BANCO MACRO C/ KOWALSKI',
    responsable_id: 'ABG-003',
    prioridad: 'Alta',
    estado: 'En Revisión',
    fecha_vencimiento: '2026-08-10',
    creada_por: 'Dr. Carlos Alberto Ruiz',
    fecha_creacion: '2026-07-30',
    comentarios: [
      { id: 'COM-2', autor: 'Dr. Juan Manuel Posadas', fecha: '2026-08-01 11:00', texto: 'Aprobado borrador. Falta adjuntar constancia de pago de tasa de justicia de Oberá.' },
    ],
  },
  {
    id: 'TAR-004',
    titulo: 'Liquidación de Aportes Ley Forense Misiones',
    descripcion: 'Generar comprobante de pago de bonos de derecho fijo para el expediente de divorcio en Eldorado.',
    expediente_id: 'EXP-9941',
    expediente_caratula: '9941/2025 - FERREYRA C/ RUIZ',
    responsable_id: 'ABG-003',
    prioridad: 'Baja',
    estado: 'Completada',
    fecha_vencimiento: '2026-07-29',
    creada_por: 'Dr. Carlos Alberto Ruiz',
    fecha_creacion: '2026-07-25',
    comentarios: [],
  },
];

export const INITIAL_DIAS_INHABILES: DiaInhabil[] = [
  // Feriados Misiones & Nacionales
  { id: 'INH-001', fecha: '2026-08-17', descripcion: 'Paso a la Inmortalidad del Gral. José de San Martín', tipo: 'Feriado Nacional' },
  { id: 'INH-002', fecha: '2026-10-12', descripcion: 'Día del Respeto a la Diversidad Cultural', tipo: 'Feriado Nacional' },
  { id: 'INH-003', fecha: '2026-11-16', descripcion: 'Día del Empleado Judicial Misiones (Ley Prov.)', tipo: 'Feriado Provincial Misiones' },
  { id: 'INH-004', fecha: '2026-11-30', descripcion: 'Aniversario Nacimiento Andrés Guacurarí - Prócer Misionero', tipo: 'Feriado Provincial Misiones' },
  { id: 'INH-005', fecha: '2026-12-08', descripcion: 'Inmaculada Concepción de María', tipo: 'Feriado Nacional' },
  { id: 'INH-006', fecha: '2026-12-25', descripcion: 'Navidad', tipo: 'Feriado Nacional' },
  
  // Ferias Judiciales Misiones
  { id: 'INH-FERIA-INV-1', fecha: '2026-07-13', descripcion: 'Feria Judicial de Invierno Poder Judicial Misiones', tipo: 'Feria Judicial' },
  { id: 'INH-FERIA-INV-2', fecha: '2026-07-14', descripcion: 'Feria Judicial de Invierno Poder Judicial Misiones', tipo: 'Feria Judicial' },
  { id: 'INH-FERIA-INV-3', fecha: '2026-07-15', descripcion: 'Feria Judicial de Invierno Poder Judicial Misiones', tipo: 'Feria Judicial' },
  { id: 'INH-FERIA-INV-4', fecha: '2026-07-16', descripcion: 'Feria Judicial de Invierno Poder Judicial Misiones', tipo: 'Feria Judicial' },
  { id: 'INH-FERIA-INV-5', fecha: '2026-07-17', descripcion: 'Feria Judicial de Invierno Poder Judicial Misiones', tipo: 'Feria Judicial' },

  // Asuetos / Paros configurables por el estudio
  { id: 'INH-EST-001', fecha: '2026-08-28', descripcion: 'Asueto Extraordinario STJ Misiones por Aniversario Poder Judicial', tipo: 'Asueto / Paro Judicial Configurable', configurablePorEstudio: true },
];

export const INITIAL_DOCUMENTOS: DocumentoEstudio[] = [
  {
    id: 'DOC-001',
    nombre: 'Demanda_Inicial_Gomez_Alberto_CPCCyM.docx',
    expediente_id: 'EXP-1420',
    carpeta: 'EXP-1420',
    tipoArchivo: 'docx',
    tamanio: '48 KB',
    fecha_modificacion: '2025-03-09',
    autor: 'Dra. María Elena Gómez',
    contenidoTexto: `SEÑOR JUEZ DE PRIMERA INSTANCIA EN LO CIVIL Y COMERCIAL N° 1 DE POSADAS (MISIONES):

Dra. María Elena Gómez, Abogada, Matrícula Profesional N° 5890 CADAM, constituyendo domicilio legal en calle Colón 1420 de la ciudad de Posadas y domicilio electrónico en SIGED "mgomez@estudioposadas.com.ar", en representación de ALBERTO GOMEZ, a V.I. me presento y digo:

I. OBJETO:
Que vengo en tiempo y forma a promover formal demanda por DAÑOS Y PERJUICIOS contra SUPERMERCADOS MISIONES S.R.L. con domicilio en Av. Quaranta 2300 de Posadas, por la suma de $ 12.500.000.- o lo que en más o en menos resulte de las pruebas a producirse, con más sus intereses y costas.

II. HECHOS:
Con fecha 15 de Enero de 2025 mi mandante concurrió al establecimiento comercial...

III. DERECHO Y FUNDAMENTACIÓN CPCCYM MISIONES:
Fundo el derecho de mi parte en las disposiciones de los Arts. 1716, 1757, 1758 y ccs. del Código Civil y Comercial de la Nación, Art. 330 y ccs. del CPCCyM de la Provincia de Misiones.

IV. PETITORIO:
1) Me tenga por presentada, por parte y por constituido el domicilio legal y electrónico SIGED.
2) Se corra traslado de la demanda a la contraria por el término de ley.
3) Oportunamente se haga lugar a la demanda con costas.

PROVEER DE CONFORMIDAD. SERA JUSTICIA.`
  },
  {
    id: 'DOC-002',
    nombre: 'Cedula_Notificacion_Traslado_1420-2025.pdf',
    expediente_id: 'EXP-1420',
    carpeta: 'EXP-1420',
    tipoArchivo: 'pdf',
    tamanio: '240 KB',
    fecha_modificacion: '2026-08-01',
    autor: 'Secretaría N° 2 - Juzgado Civil 1 Posadas',
    pdfSimuladoUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    contenidoTexto: 'FIRMA DIGITAL SIGED - Dra. Carmen Benítez (Secretaria Judicial) - Notificación de traslado por 5 días hábiles.'
  },
  {
    id: 'DOC-003',
    nombre: 'Modelo_Contestacion_Demanda_Laboral_Misiones.docx',
    carpeta: 'Modelos Escritos',
    tipoArchivo: 'docx',
    tamanio: '35 KB',
    fecha_modificacion: '2026-06-15',
    autor: 'Dr. Juan Manuel Posadas',
    contenidoTexto: `SEÑOR JUEZ EN LO LABORAL N° [JUZGADO] DE POSADAS:

[ABOGADO_NOMBRE], Matrícula [MATRICULA], en representación de [DEMANDADO], en autos caratulados "[CARATULA]", Expediente N° [EXPEDIENTE], a V.S. digo:

I. OBJETO:
Vengo a contestar en tiempo y forma la improcedente demanda laboral...`
  },
  {
    id: 'DOC-004',
    nombre: 'Oficio_Municipalidad_Habilitacion_Posadas.docx',
    expediente_id: 'EXP-1420',
    carpeta: 'EXP-1420',
    tipoArchivo: 'docx',
    tamanio: '28 KB',
    fecha_modificacion: '2026-07-26',
    autor: 'Dra. María Elena Gómez',
    contenidoTexto: `OFICIO JUDICIAL DIGITAL SIGED
Posadas, Misiones.

AL SEÑOR INTENDENTE DE LA MUNICIPALIDAD DE POSADAS
S. / D.

Tengo el agrado de dirigirme a Ud. en los autos "[CARATULA]", Expte. N° [EXPEDIENTE], que tramitan ante el Juzgado Civil y Comercial N° 1 de Posadas, a fin de solicitarle que en el plazo de 5 (cinco) días hábiles informe...`
  }
];

export const INITIAL_PLANTILLAS_DOCX: PlantillaDocx[] = [
  {
    id: 'PLT-001',
    nombre: 'Demanda Ordinaria Civil (CPCCyM Misiones)',
    categoria: 'Demandas',
    contenidoPlantilla: `SEÑOR JUEZ DE PRIMERA INSTANCIA EN LO CIVIL Y COMERCIAL DE POSADAS:

{{ABOGADO_NOMBRE}}, Matrícula Profesional {{MATRICULA}}, por la parte {{ROL_PARTE}}, en los autos caratulados "{{CARATULA}}", Expediente N° {{EXPEDIENTE}}, tramitados ante el {{JUZGADO}}, a V.I. digo:

I. OBJETO:
Que vengo en tiempo y forma a promover formal demanda de {{TIPO_PROCESO}} contra {{DEMANDADO}}, con domicilio en {{DOMICILIO_DEMANDADO}}, reclamando la suma de $ {{SUMA_RECLAMADA}}.- con más sus intereses y costas.

II. HECHOS:
[Describir los hechos sucintamente aquí...]

III. PRUEBA:
1. Documental: Se acompaña contrato, comprobantes y fotocopias.
2. Informativa: Se remitan oficios a las reparticiones públicas.
3. Testimonial: Se cite a declarar a los testigos del hecho.

IV. PETITORIO:
1. Me tenga por presentado/a y por constituido el domicilio legal y electrónico SIGED.
2. Se dé traslado de la demanda por el término de ley.
3. Se dicte sentencia haciendo lugar a la demanda en todas sus partes.

PROVEER DE CONFORMIDAD. SERÁ JUSTICIA.`
  },
  {
    id: 'PLT-002',
    nombre: 'Contestación de Demanda con Excepciones',
    categoria: 'Contestaciones',
    contenidoPlantilla: `SEÑOR JUEZ CIVIL Y COMERCIAL:

{{ABOGADO_NOMBRE}}, M.P. {{MATRICULA}}, apoderado de {{DEMANDADO}}, en el Expte. N° {{EXPEDIENTE}} "{{CARATULA}}", respetuosamente me presento y digo:

I. OBJETO:
Vengo a contestar la demanda interpuesta por {{ACTOR}}, solicitando su íntegro rechazo con expresa imposición de costas.

II. NEGATIVA GENERAL Y PARTICULAR:
Niego todos y cada uno de los hechos expuestos en el escrito inicial salvo los que sean objeto de expreso reconocimiento en esta pieza...

III. EXCEPCION DE FALTA DE LEGITIMACION:
Planteo la falta de legitimación pasiva para obrar de mi mandante por los motivos que a continuación se exponen...

SERÁ JUSTICIA.`
  },
  {
    id: 'PLT-003',
    nombre: 'Oficio Informativo Digital (SIGED Misiones)',
    categoria: 'Oficios',
    contenidoPlantilla: `PODER JUDICIAL DE MISIONES - OFICIO JUDICIAL DIGITAL SIGED

AL SEÑOR DIRECTOR / JEFE DE {{ENTIDAD_DESTINO}}:
S. / D.

Tengo el agrado de dirigirme a Ud. en el marco del Expediente N° {{EXPEDIENTE}} caratulado "{{CARATULA}}", en trámite por ante el {{JUZGADO}}, a fin de requerirle remita dentro del plazo de CINCO (5) DÍAS HÁBILES el siguiente informe:

1) {{PUNTO_INFORMATIVO_1}}
2) {{PUNTO_INFORMATIVO_2}}

El presente oficio digital ha sido librado mediante resolución de fecha {{FECHA_RESOLUCION}} y firmado electrónicamente en el portal SIGED Misiones.`
  }
];
