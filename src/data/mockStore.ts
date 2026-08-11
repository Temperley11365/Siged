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
  RegistroSincronizacionSiged,
  ModeloEscritoRepositorio,
  ProgresoPasosExpediente
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
  {
    id: 'EXP-5001',
    numero: '024-20384192-3/1',
    caratula: 'MARTINEZ ROSA C/ ANSES S/ REAJUSTE DE HABERES Y MOBILIDAD JUBILATORIA',
    juzgado: 'Unidad de Atención Virtual ANSES - UDAI Posadas',
    fuero: 'ANSES / Previsional',
    circunscripcion: 'Primera (Posadas)',
    etapa_procesal: 'Iniciación / Demanda',
    abogados_autorizados: ['ABG-001', 'ABG-002'],
    letrado_patrocinante: 'ABG-002',
    apoderado: 'ABG-001',
    fecha_inicio: '2026-05-10',
    estado: 'En trámite',
    cliente: 'Rosa Martínez',
    sistemaOrigen: 'ANSES e-TRAMITE',
    numeroExpedienteAnses: '024-20384192-3/1',
    cuilTitularAnses: '27-05839201-4',
    partes: [
      { id: 'P-50', nombre: 'Rosa Martínez', rol: 'Actor/a', dni_cuit: '27-05839201-4', letrado_patrocinante: 'Dra. María Elena Gómez' },
      { id: 'P-51', nombre: 'ANSES (Administración Nacional de la Seguridad Social)', rol: 'Demandado/a', dni_cuit: '33-63761744-9' },
    ],
    movimientos: [
      { id: 'M-50', fecha: '2026-08-01', tipo: 'Atención Virtual ANSES', descripcion: 'Presentación de vista de liquidación Badaro/Elliff con Clave de Seguridad Social Nivel 3.', firmante: 'Estudio Jurídico Posadas & Asoc.' },
      { id: 'M-51', fecha: '2026-05-10', tipo: 'Generación e-Trámite', descripcion: 'Alta de Reclamo Administrativo Previsional en Plataforma ANSES Digital.', firmante: 'ANSES UDAI Posadas' },
    ],
    financiero: {
      honorariosPactados: 1800000,
      honorariosRegulados: 0,
      honorariosCobrados: 600000,
      tasaDeJusticiaMisiones: 0,
      tasaJusticiaPagada: true,
      aportesCajaForense: 0,
      aportesCajaAbogados: 0,
      gastosDiligenciamiento: 15000,
      saldoPendiente: 1200000,
    },
  },
  {
    id: 'EXP-5002',
    numero: 'FPO 48291/2026',
    caratula: 'MARTINEZ ROSA C/ ESTADO NACIONAL - ANSES S/ AMPARO POR MORA PREVISIONAL',
    juzgado: 'Juzgado Federal de Primera Instancia N° 1 de Posadas',
    fuero: 'Justicia Federal',
    circunscripcion: 'Primera (Posadas)',
    etapa_procesal: 'Traba de la Litis / Contestación',
    abogados_autorizados: ['ABG-001', 'ABG-002'],
    letrado_patrocinante: 'ABG-001',
    apoderado: 'ABG-002',
    fecha_inicio: '2026-06-18',
    estado: 'Con plazo pendiente',
    cliente: 'Rosa Martínez',
    sistemaOrigen: 'PJN - Justicia Federal',
    numeroExpedientePJN: 'FPO 048291/2026',
    camaraFederalPJN: 'Cámara Federal de Apelaciones de Resistencia',
    sistemaDeoxActivo: true,
    partes: [
      { id: 'P-60', nombre: 'Rosa Martínez', rol: 'Actor/a', dni_cuit: '27-05839201-4', letrado_patrocinante: 'Dr. Juan Manuel Posadas' },
      { id: 'P-61', nombre: 'Estado Nacional - ANSES Legales', rol: 'Demandado/a', dni_cuit: '33-63761744-9', domicilio_constituido: 'DEOX - Dirección General de Asuntos Jurídicos ANSES' },
      { id: 'P-62', nombre: 'Fiscalía Federal N° 1 Posadas', rol: 'Tercero' },
    ],
    movimientos: [
      { id: 'M-60', fecha: '2026-08-02', tipo: 'Diligenciamiento DEOX Digital', descripcion: 'Emisión y transmisión de cédula electrónica DEOX a ANSES con traslado por 5 días hábiles.', firmante: 'Secretaría N° 1 Juzgado Federal Posadas' },
      { id: 'M-61', fecha: '2026-06-18', tipo: 'Carga Portal PJN', descripcion: 'Sorteo e inicio de demanda de Amparo por Mora Ley 19.549 en fuero Federal.', firmante: 'Dr. Juan Manuel Posadas' },
    ],
    financiero: {
      honorariosPactados: 3500000,
      honorariosRegulados: 2800000,
      honorariosCobrados: 1000000,
      tasaDeJusticiaMisiones: 0,
      tasaJusticiaPagada: true,
      aportesCajaForense: 15000,
      aportesCajaAbogados: 12000,
      gastosDiligenciamiento: 20000,
      saldoPendiente: 2500000,
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

export const INITIAL_REPOSITORIO_ESCRITOS: ModeloEscritoRepositorio[] = [
  {
    id: 'REP-001',
    titulo: 'Demanda por Daños y Perjuicios (Accidente de Tránsito)',
    fuero: 'Civil y Comercial',
    tematica: 'Daños y Perjuicios',
    tipoExpediente: 'Juicio Ordinario',
    etapaProcesal: 'Iniciación / Demanda',
    descripcion: 'Modelo completo para interposición de demanda por siniestro vial con Citación en Garantía a Aseguradora bajo CPCCyM Misiones.',
    autor: 'Dr. Juan Manuel Posadas',
    fechaCreacion: '2026-07-15',
    etiquetas: ['Civil', 'Accidente', 'Aseguradora', 'Daño Moral', 'Tasa DGR'],
    contenidoPlantilla: `SEÑOR JUEZ DE PRIMERA INSTANCIA EN LO CIVIL Y COMERCIAL DE POSADAS:

{LETRADO_PATROCINANTE}, Matrícula Profesional CADAM, apoderado de {CLIENTE}, constituyendo domicilio legal en calle Posadas N° 1240 y electrónico en portal SIGED Misiones, en los autos caratulados "{CARATULA}", Expediente N° {NUMERO_EXPTE}, tramitados ante el {JUZGADO}, a V.I. respetuosamente digo:

I. OBJETO:
Que vengo en tiempo y forma a promover formal demanda por Daños y Perjuicios derivados de accidente de tránsito contra {DEMANDADO}, con domicilio constituido en la provincia de Misiones, y citando en garantía a la Compañía Aseguradora, reclamando la suma total indemnizatoria con más sus intereses y costas.

II. HECHOS:
Con fecha [FECHA DE HECHO], la víctima circulaba reglamentariamente cuando fue embestida por el vehículo conducido por el demandado...

III. RUBROS INDEMNIZATORIOS:
1. Valor de Reparación del Vehículo y Privación de Uso.
2. Incapacidad Sobreviniente Física y Psíquica.
3. Daño Moral y Gastos Médicos / Farmacéuticos.

IV. LIQUIDACIÓN DE TASAS DGR MISIONES Y CAJA FORENSE:
Se adjunta comprobante de pago de Tasa de Justicia (1.5%) ante DGR Misiones y estampilla previsional de Caja Forense Ley N° 3144.

V. PETITORIO:
1. Me tenga por presentado, por parte y por constituido el domicilio electrónico SIGED.
2. Se corra traslado de la demanda a la demandada y citada en garantía por el término de QUINCE (15) DÍAS HÁBILES.
3. Oportunamente se dicte sentencia haciendo lugar a la demanda con costas.

PROVEER DE CONFORMIDAD. SERÁ JUSTICIA.`,
    pasosASeguir: [
      {
        id: 'PASO-001-1',
        orden: 1,
        titulo: 'Iniciación: Demanda + Pago de Tasa DGR (1.5%) y Bono Caja Forense',
        descripcion: 'Cargar el escrito inicial en SIGED con el formulario DGR de Tasa de Justicia y los aportes de ley.',
        diasEstimados: 3,
        escritoRecomendadoId: 'REP-001',
        escritoRecomendadoNombre: 'Demanda por Daños y Perjuicios',
        obligatorio: true,
      },
      {
        id: 'PASO-001-2',
        orden: 2,
        titulo: 'Cédula Digital SIGED de Traslado a Demandada y Citada en Garantía',
        descripcion: 'Diligenciar cédula electrónica de notificación. Plazo de contestación: 15 días hábiles.',
        diasEstimados: 15,
        escritoRecomendadoNombre: 'Cédula Digital SIGED',
        obligatorio: true,
      },
      {
        id: 'PASO-001-3',
        orden: 3,
        titulo: 'Contestación de Demanda y Excepciones de la Aseguradora',
        descripcion: 'Revisar la contestación en SIGED y responder excepciones o traslado de documentación por 5 días.',
        diasEstimados: 5,
        obligatorio: true,
      },
      {
        id: 'PASO-001-4',
        orden: 4,
        titulo: 'Audiencia de Apertura a Prueba (Art. 360 CPCCyM Misiones)',
        descripcion: 'Fijar puntos de pericia mecánica y médica, designar perito único de oficio.',
        diasEstimados: 10,
        obligatorio: true,
      },
      {
        id: 'PASO-001-5',
        orden: 5,
        titulo: 'Producción de Pruebas (Periciales, Testimoniales e Informes)',
        descripcion: 'Diligenciar oficios informativos y acompañar puntos de pericia al médico legista.',
        diasEstimados: 30,
        obligatorio: true,
      },
      {
        id: 'PASO-001-6',
        orden: 6,
        titulo: 'Clausura de Prueba y Presentación de Alegatos',
        descripcion: 'Presentar alegato sobre la prueba producida en el plazo de 6 días hábiles.',
        diasEstimados: 6,
        obligatorio: true,
      },
      {
        id: 'PASO-001-7',
        orden: 7,
        titulo: 'Solicitud de Autos para Sentencia Definitiva',
        descripcion: 'Pedir el pase a fallo del expediente para el dictado de la sentencia resolutiva.',
        diasEstimados: 5,
        obligatorio: true,
      },
    ]
  },
  {
    id: 'REP-002',
    titulo: 'Demanda Laboral por Despido e Indemnización Ley 20.744',
    fuero: 'Laboral',
    tematica: 'Despido e Indemnización',
    tipoExpediente: 'Juicio Laboral Ordinario',
    etapaProcesal: 'Iniciación / Demanda',
    descripcion: 'Modelo procesal de demanda laboral con invocación de beneficio de gratuidad (Ley Orgánica de Trabajo Misiones).',
    autor: 'Dra. María Elena Gómez',
    fechaCreacion: '2026-07-20',
    etiquetas: ['Laboral', 'Despido', 'LCT', 'Indemnización', 'Gratuidad'],
    contenidoPlantilla: `SEÑOR JUEZ DE PRIMERA INSTANCIA EN LO LABORAL DE POSADAS:

{LETRADO_PATROCINANTE}, M.P. CADAM, por la representación de {CLIENTE}, en los autos caratulados "{CARATULA}", Expte. N° {NUMERO_EXPTE}, tramitados ante el {JUZGADO}, a V.I. digo:

I. OBJETO:
Que vengo a interponer demanda laboral por despido incausado e indemnizaciones de la Ley 20.744 contra {DEMANDADO}, reclamando rubros indemnizatorios, preaviso, integración de mes de despido y diferencias salariales.

II. BENEFICIO DE GRATUIDAD:
Conforme al CPL de Misiones y Ley de Contrato de Trabajo, mi mandante goza del beneficio procesal de gratuidad en el acceso a la justicia.

III. HECHOS Y LIQUIDACIÓN:
1. Antigüedad y Fecha de Ingreso.
2. Categoria Profesional e Indemnización Art. 245 LCT.
3. Multas Ley 24.013 y Ley 25.323.

IV. PETITORIO:
1. Se me tenga por presentado en el carácter invocado.
2. Se confiera traslado de la demanda por DIEZ (10) DÍAS HÁBILES.
3. Se haga lugar a la demanda con costas a la empleadora.

PROVEER DE CONFORMIDAD. SERÁ JUSTICIA.`,
    pasosASeguir: [
      {
        id: 'PASO-002-1',
        orden: 1,
        titulo: 'Interposición de Demanda y Verificación de Acreditación TCL/Telegramas',
        descripcion: 'Ingreso del escrito inicial por SIGED Misiones y digitalización de cartas documento.',
        diasEstimados: 2,
        escritoRecomendadoId: 'REP-002',
        escritoRecomendadoNombre: 'Demanda Laboral por Despido',
        obligatorio: true,
      },
      {
        id: 'PASO-002-2',
        orden: 2,
        titulo: 'Traslado de Demanda por Cédula Digital SIGED (10 Días Hábiles)',
        descripcion: 'Notificación oficial al empleador en el domicilio fiscal registrado.',
        diasEstimados: 10,
        obligatorio: true,
      },
      {
        id: 'PASO-002-3',
        orden: 3,
        titulo: 'Audiencia Conciliatoria (CPL Misiones)',
        descripcion: 'Comparendo personal de las partes e intento de acuerdo homologado.',
        diasEstimados: 15,
        obligatorio: false,
      },
      {
        id: 'PASO-002-4',
        orden: 4,
        titulo: 'Apertura a Prueba y Pericial Contable en Libros del Empleador',
        descripcion: 'Sorteo de perito contador y libramiento de oficio a AFIP y Ministerio de Trabajo.',
        diasEstimados: 20,
        obligatorio: true,
      },
      {
        id: 'PASO-002-5',
        orden: 5,
        titulo: 'Alegatos y Sentencia Definitiva Laboral',
        descripcion: 'Presentación de alegato e ingreso a despacho para resolución judicial.',
        diasEstimados: 10,
        obligatorio: true,
      },
    ]
  },
  {
    id: 'REP-003',
    titulo: 'Solicitud de Divorcio Unilateral y Convenio Regulador',
    fuero: 'Familia',
    tematica: 'Divorcio y Alimentos',
    tipoExpediente: 'Proceso Especial de Familia',
    etapaProcesal: 'Iniciación / Demanda',
    descripcion: 'Petición unilateral de divorcio (Art. 437 CCCN) con propuesta sobre atribución de vivienda, alimentos y comunicación.',
    autor: 'Dr. Carlos Alberto Ruiz',
    fechaCreacion: '2026-07-28',
    etiquetas: ['Familia', 'Divorcio', 'CCCN', 'Alimentos', 'Convenio'],
    contenidoPlantilla: `SEÑOR/A JUEZ/A DEL JUZGADO DE FAMILIA DE POSADAS:

{LETRADO_PATROCINANTE}, letrado patrocinante de {CLIENTE}, en los autos "{CARATULA}", Expte. N° {NUMERO_EXPTE}, ante el {JUZGADO}, digo:

I. OBJETO:
Vengo a solicitar formalmente el Divorcio Vincular Unilateral del matrimonio contraído con {DEMANDADO}, adjuntando la Propuesta Reguladora exigida por el Art. 438 CCCN.

II. PROPUESTA REGULADORA:
1. Ejercicio de la Responsabilidad Parental y Cuidado Personal de los hijos menores.
2. Cuota Alimentaria y Gastos de Educación / Cobertura Médica.
3. Atribución de la Vivienda Familiar y Bienes Gananciales.

III. PETITORIO:
1. Me tenga por presentado y por peticionado el divorcio vincular.
2. Se corra traslado de la propuesta reguladora por dieciocho (18) días.
3. Oportunamente se dicte sentencia decretando el divorcio vincular e inscribiendo en el Registro de las Personas Misiones.

SERÁ JUSTICIA.`,
    pasosASeguir: [
      {
        id: 'PASO-003-1',
        orden: 1,
        titulo: 'Presentación de Petición Unilateral y Acta de Matrimonio',
        descripcion: 'Acompañar libreta de matrimonio y partidas de nacimiento legalizadas de los hijos.',
        diasEstimados: 3,
        escritoRecomendadoId: 'REP-003',
        escritoRecomendadoNombre: 'Solicitud de Divorcio Unilateral',
        obligatorio: true,
      },
      {
        id: 'PASO-003-2',
        orden: 2,
        titulo: 'Traslado por Cédula Digital de la Propuesta Reguladora (18 Días)',
        descripcion: 'Notificar al cónyuge para responder o presentar contrapropuesta.',
        diasEstimados: 18,
        obligatorio: true,
      },
      {
        id: 'PASO-003-3',
        orden: 3,
        titulo: 'Audiencia de Conciliación de Convenio con Asesoría de Menores',
        descripcion: 'Reunión ante la secretaría del juzgado de familia para consensuar cuota y comunicación.',
        diasEstimados: 10,
        obligatorio: true,
      },
      {
        id: 'PASO-003-4',
        orden: 4,
        titulo: 'Sentencia de Divorcio y Oficio al Registro de las Personas de Posadas',
        descripcion: 'Inscripción marginal del divorcio en el Acta de Matrimonio.',
        diasEstimados: 5,
        obligatorio: true,
      },
    ]
  },
  {
    id: 'REP-004',
    titulo: 'Ejecución de Honorarios Profesionales y Solicitud de Embargo',
    fuero: 'Caducidades y Concursos',
    tematica: 'Ejecución de Honorarios',
    tipoExpediente: 'Juicio Ejecutivo',
    etapaProcesal: 'Ejecución de Sentencia',
    descripcion: 'Petición firme de cobro ejecutivo de honorarios regulados con pedido de traba de embargo bancario.',
    autor: 'Dr. Juan Manuel Posadas',
    fechaCreacion: '2026-08-01',
    etiquetas: ['Ejecutivo', 'Honorarios', 'Embargo', 'Banco Macro', 'CADAM'],
    contenidoPlantilla: `SEÑOR JUEZ DE PRIMERA INSTANCIA:

{LETRADO_PATROCINANTE}, abogando en causa propia, en los autos caratulados "{CARATULA}", Expte. N° {NUMERO_EXPTE}, ante el {JUZGADO}, digo:

I. OBJETO:
Vengo a iniciar la Ejecución de Honorarios Profesionales firmes contra {DEMANDADO}, por la suma regulada con más sus intereses pactados y gastos de ley.

II. TRABA DE EMBARGO PREVENTIVO:
Solicito se trabe embargo preventivo sobre los fondos depositados en cuentas bancarias del ejecutado en el Banco Macro S.A. o cualquier otra entidad del sistema financiero hasta cubrir el importe reclamado.

III. PETITORIO:
1. Se ordene la intimación de pago por el término de TRES (3) DÍAS HÁBILES.
2. Se libre oficio electrónico al Banco Macro para efectivizar la medida cautelar.

SERÁ JUSTICIA.`,
    pasosASeguir: [
      {
        id: 'PASO-004-1',
        orden: 1,
        titulo: 'Interposición de Ejecución y Acreditación de Regulación Firme',
        descripcion: 'Adjuntar cédula de notificación del auto regulatorio firme y no apelado.',
        diasEstimados: 2,
        escritoRecomendadoId: 'REP-004',
        escritoRecomendadoNombre: 'Ejecución de Honorarios',
        obligatorio: true,
      },
      {
        id: 'PASO-004-2',
        orden: 2,
        titulo: 'Intimación de Pago por Cédula SIGED (3 Días Hábiles)',
        descripcion: 'Notificación oficial para cancelar capital reclamado bajo apercibimiento de ejecución.',
        diasEstimados: 3,
        obligatorio: true,
      },
      {
        id: 'PASO-004-3',
        orden: 3,
        titulo: 'Oficio Digital a Banco Macro S.A. para Traba de Embargo',
        descripcion: 'Retención de fondos y transferencia a cuenta judicial en el Banco de la Provincia de Misiones.',
        diasEstimados: 5,
        obligatorio: true,
      },
      {
        id: 'PASO-004-4',
        orden: 4,
        titulo: 'Aprobación de Liquidación Final y Transferencia a CBU del Abogado',
        descripcion: 'Orden de giro bancario y cancelación del expediente ejecutivo.',
        diasEstimados: 4,
        obligatorio: true,
      },
    ]
  },
  {
    id: 'REP-005',
    titulo: 'Sucesión Ab Intestato - Apertura y Declaratoria de Herederos',
    fuero: 'Civil y Comercial',
    tematica: 'Sucesión Ab Intestato',
    tipoExpediente: 'Proceso Sucesorio',
    etapaProcesal: 'Iniciación / Demanda',
    descripcion: 'Petición judicial de inicio de juicio sucesorio, acreditación de acervo hereditario y solicitud de publicacion de edictos.',
    autor: 'Dra. María Elena Gómez',
    fechaCreacion: '2026-08-02',
    etiquetas: ['Sucesión', 'Herederos', 'Edictos', 'Boletín Oficial', 'Propiedad'],
    contenidoPlantilla: `SEÑOR JUEZ CIVIL Y COMERCIAL DE POSADAS:

{LETRADO_PATROCINANTE}, patrocinando a {CLIENTE}, en las actuaciones sucesorias de quien en vida fuera el causante, Expte. N° {NUMERO_EXPTE} "{CARATULA}", ante V.I. digo:

I. OBJETO:
Vengo a solicitar la apertura del Juicio Sucesorio Ab Intestato del causante, acompañando acta de defunción legalizada e inscrita en la provincia de Misiones.

II. ACREDITACIÓN DE VÍNCULO Y BIENES:
Se acompañan partidas de nacimiento/matrimonio que acreditan el carácter de herederos universales y título de propiedad del bien inmueble.

III. PUBLICATION DE EDICTOS:
Solicito se disponga la publicación de edictos por tres (3) días en el Boletín Oficial de la Provincia de Misiones e informe al Registro de Juicios Universales.

SERÁ JUSTICIA.`,
    pasosASeguir: [
      {
        id: 'PASO-005-1',
        orden: 1,
        titulo: 'Presentación del Escrito de Inicio y Partidas de Defunción / Nacimiento',
        descripcion: 'Cargar el inicio del expediente en SIGED con partidas legalizadas.',
        diasEstimados: 3,
        escritoRecomendadoId: 'REP-005',
        escritoRecomendadoNombre: 'Apertura de Sucesión Ab Intestato',
        obligatorio: true,
      },
      {
        id: 'PASO-005-2',
        orden: 2,
        titulo: 'Publicación de Edictos por 3 Días en el Boletín Oficial de Misiones',
        descripcion: 'Generar comprobante de pago e ingresar edicto oficial digital.',
        diasEstimados: 10,
        obligatorio: true,
      },
      {
        id: 'PASO-005-3',
        orden: 3,
        titulo: 'Informe al Registro de Juicios Universales de Misiones',
        descripcion: 'Verificar si no existen otros sucesorios promovidos respecto del mismo causante.',
        diasEstimados: 5,
        obligatorio: true,
      },
      {
        id: 'PASO-005-4',
        orden: 4,
        titulo: 'Dictamen de Fiscalía y Dictado de la Declaratoria de Herederos',
        descripcion: 'Auto interlocutorio que declara herederos legítimos al cónyuge y descendientes.',
        diasEstimados: 15,
        obligatorio: true,
      },
      {
        id: 'PASO-005-5',
        orden: 5,
        titulo: 'Inscripción en el Registro de la Propiedad Inmueble y Adjudicación',
        descripcion: 'Inscribir el inmueble a nombre de los herederos y regular honorarios del letrado.',
        diasEstimados: 10,
        obligatorio: true,
      },
    ]
  },
  {
    id: 'REP-006',
    titulo: 'Reclamo Administrativo de Reajuste de Haberes Jubilatorios (ANSES e-TRAMITE)',
    fuero: 'ANSES / Previsional',
    tematica: 'Reajuste Previsional',
    tipoExpediente: 'Reclamo Administrativo ANSES',
    etapaProcesal: 'Iniciación / Demanda',
    descripcion: 'Presentación formal de reclamo de movilidad previsional y recalculación de haber inicial ante la Administración Nacional de la Seguridad Social.',
    autor: 'Dra. María Elena Gómez',
    fechaCreacion: '2026-08-05',
    etiquetas: ['ANSES', 'Previsional', 'Badaro', 'Elliff', 'e-Trámite', 'Jubilación'],
    contenidoPlantilla: `SEÑOR DIRECTOR GENERAL DE LA ADMINISTRACIÓN NACIONAL DE LA SEGURIDAD SOCIAL (ANSES - UDAI POSADAS):

{LETRADO_PATROCINANTE}, abogada apoderada/patrocinante de {CLIENTE}, CUIL N° {CUIL_TITULAR}, en el e-Trámite Administrativo N° {NUMERO_EXPTE}, constituyendo domicilio legal y digital en el Portal ANSES, ante Ud. me presento y digo:

I. OBJETO:
Vengo en tiempo y forma a interponer formal RECLAMO ADMINISTRATIVO PREVISIONAL Y REAJUSTE DE HABERES Y MOBILIDAD JUBILATORIA respecto del beneficio N° {NUMERO_EXPTE}, solicitando la readecuación del haber inicial conforme doctrina jurisprudencial de la Corte Suprema de Justicia de la Nación ("Badaro", "Elliff" y "Blanco").

II. LIQUIDACIÓN DE DIFERENCIAS PREVISIONALES:
Se adjunta estudio de recalculación de la Tasa de Sustitución de la Remuneración en Actividad y recomposición de topes máximos de los arts. 9 y 25 de la Ley 24.241.

III. PETITORIO:
1. Se tenga por presentado el Reclamo Administrativo con el alcance del art. 15 de la Ley 24.463.
2. Se dicte resolución expresa denegatoria o se proceda al reajuste directo del haber mensual.

PROVEER DE CONFORMIDAD,
SERÁ JUSTICIA ADMINISTRATIVA.`,
    pasosASeguir: [
      {
        id: 'PASO-006-1',
        orden: 1,
        titulo: 'Acreditación de Apoderamiento y Generación de e-Trámite ANSES',
        descripcion: 'Carga de Carta Poder y Clave de Seguridad Social Nivel 3 en Atención Virtual ANSES.',
        diasEstimados: 3,
        escritoRecomendadoId: 'REP-006',
        escritoRecomendadoNombre: 'Reclamo Administrativo ANSES',
        obligatorio: true,
      },
      {
        id: 'PASO-006-2',
        orden: 2,
        titulo: 'Presentación de Vista del Expediente y Liquidación de Movilidad Badaro/Elliff',
        descripcion: 'Anexo de cómputo ilustrativo de haberes devengados e índices aplicables.',
        diasEstimados: 5,
        obligatorio: true,
      },
      {
        id: 'PASO-006-3',
        orden: 3,
        titulo: 'Vencimiento de Plazo de Resolución Administrativa ANSES (60 Días)',
        descripcion: 'Vencimiento del término legal fijado por el art. 15 de la Ley 24.463 para expedirse.',
        diasEstimados: 60,
        obligatorio: true,
      },
      {
        id: 'PASO-006-4',
        orden: 4,
        titulo: 'Notificación de DENEGATORIA o Silencio Administrativo de ANSES',
        descripcion: 'Agotamiento de la vía administrativa para habilitar la instancia judicial federal.',
        diasEstimados: 5,
        obligatorio: true,
      },
      {
        id: 'PASO-006-5',
        orden: 5,
        titulo: 'Habilitación de Instancia Judicial Federal ante el Juzgado Federal de Posadas',
        descripcion: 'Interposición de la demanda en el Portal de Gestión Judicial Federal (PJN).',
        diasEstimados: 10,
        obligatorio: true,
      },
    ]
  },
  {
    id: 'REP-007',
    titulo: 'Solicitud de Reconocimiento de Servicios y Moratoria Jubilatoria Ley 27.705',
    fuero: 'ANSES / Previsional',
    tematica: 'Moratoria Previsional',
    tipoExpediente: 'Jubilación con Moratoria',
    etapaProcesal: 'Iniciación / Demanda',
    descripcion: 'Tramitación de cómputo de años de aportes, liquidación SICAM e inscripción en Plan de Pago de Deuda Previsional.',
    autor: 'Dr. Juan Manuel Posadas',
    fechaCreacion: '2026-08-06',
    etiquetas: ['ANSES', 'Moratoria', 'SICAM', 'AFIP', 'Jubilación'],
    contenidoPlantilla: `SEÑOR JEFE DE UDAI ANSES POSADAS:

{LETRADO_PATROCINANTE}, apoderado letrado de {CLIENTE}, CUIL {CUIL_TITULAR}, en el expediente administrativo N° {NUMERO_EXPTE}, digo:

I. SOLICITUD DE BENEFICIO JUBILATORIO:
Vengo a solicitar la liquidación e ingreso al Plan de Pago de Deuda Previsional Ley 27.705 a fin de completar la totalidad de los 30 años de aportes requeridos por el art. 19 de la Ley 24.241.

II. CERTIFICACIONES Y SICAM:
Acompaño certificación de servicios expedida por empleadores de la Provincia de Misiones y liquidación aceptada por la AFIP.

PROVEER DE CONFORMIDAD.`,
    pasosASeguir: [
      {
        id: 'PASO-007-1',
        orden: 1,
        titulo: 'Verificación de Aportes en Mi ANSES y Sistema Histórico de Trabajo',
        descripcion: 'Revisión del historial laboral del afiliado y constancia de CUIL.',
        diasEstimados: 2,
        obligatorio: true,
      },
      {
        id: 'PASO-007-2',
        orden: 2,
        titulo: 'Generación y Envío de Liquidación SICAM en Portal AFIP',
        descripcion: 'Cálculo de moratoria previsional e imputación de períodos faltantes.',
        diasEstimados: 4,
        obligatorio: true,
      },
      {
        id: 'PASO-007-3',
        orden: 3,
        titulo: 'Turno e-Trámite Presencial o Virtual en UDAI Posadas / Oberá',
        descripcion: 'Ingreso del beneficio y firma de aceptación del Plan de Pago de Deuda Previsional.',
        diasEstimados: 10,
        obligatorio: true,
      },
      {
        id: 'PASO-007-4',
        orden: 4,
        titulo: 'Acuerdo Concesorio del Beneficio y Liquidación de Primer Haber Jubilatorio',
        descripcion: 'Cobro de la primera prestación jubilatoria en la entidad bancaria pagadora.',
        diasEstimados: 30,
        obligatorio: true,
      },
    ]
  },
  {
    id: 'REP-008',
    titulo: 'Demanda de Amparo por Mora Previsional contra ANSES (Justicia Federal - Portal PJN)',
    fuero: 'Justicia Federal',
    tematica: 'Amparo Previsional',
    tipoExpediente: 'Amparo por Mora Ley 19.549',
    etapaProcesal: 'Iniciación / Demanda',
    descripcion: 'Acción de amparo judicial en el fuero Federal por mora injustificada de ANSES en resolver el expediente administrativo previsional.',
    autor: 'Dr. Juan Manuel Posadas',
    fechaCreacion: '2026-08-04',
    etiquetas: ['PJN', 'Justicia Federal', 'Amparo por Mora', 'DEOX', 'ANSES', 'Cámara Federal'],
    contenidoPlantilla: `SEÑOR JUEZ FEDERAL DE PRIMERA INSTANCIA DE POSADAS:

{LETRADO_PATROCINANTE}, abogado matriculado en el Fuero Federal bajo el T° {MATRICULA}, por la representación acreditada de {CLIENTE}, en las actuaciones de Amparo por Mora, Expte. Federal N° {NUMERO_EXPTE} caratulado "{CARATULA}", ante V.S. me presento y digo:

I. OBJETO:
Vengo a promover formal DEMANDA DE AMPARO POR MORA (Art. 28 de la Ley 19.549 de Procedimientos Administrativos) contra la ADMINISTRACIÓN NACIONAL DE LA SEGURIDAD SOCIAL (ANSES), a fin de que V.S. ordene a la demandada despachar las actuaciones administrativas de reajuste de haberes N° {NUMERO_EXPTE_ANSES} dentro del plazo perentorio de DIEZ (10) DÍAS HÁBILES.

II. PROCEDENCIA DEL AMPARO POR MORA:
Se han agotado los plazos previstos en el art. 10 de la Ley 19.549 sin que la autoridad administrativa se haya pronunciado sobre la petición de la actora, vulnerando la garantía constitucional del Debido Proceso y de la Seguridad Social (art. 14 bis y 18 C.N.).

III. OFICIO ELECTRÓNICO DEOX:
Solicito que se ordene la emisión de cédula digital por el sistema DEOX (Diligenciamiento Electrónico Oficial) a la Dirección de Asuntos Jurídicos de ANSES para que produzca el informe sobre las causas de la demora.

SERÁ JUSTICIA.`,
    pasosASeguir: [
      {
        id: 'PASO-008-1',
        orden: 1,
        titulo: 'Sorteo e Inserción de Demanda en el Portal de Gestión Judicial Federal (PJN)',
        descripcion: 'Carga de demanda y documentación con firma digital Ley 26.685.',
        diasEstimados: 2,
        escritoRecomendadoId: 'REP-008',
        escritoRecomendadoNombre: 'Demanda Amparo por Mora Federal',
        obligatorio: true,
      },
      {
        id: 'PASO-008-2',
        orden: 2,
        titulo: 'Asignación a Juzgado Federal N° 1 o N° 2 de Posadas',
        descripcion: 'Notificación del auto de radicación en Secretaría Federal.',
        diasEstimados: 2,
        obligatorio: true,
      },
      {
        id: 'PASO-008-3',
        orden: 3,
        titulo: 'Diligenciamiento de Cédula Digital DEOX a la Dirección Legal de ANSES',
        descripcion: 'Requerimiento del informe previsto en el art. 10 de la Ley 16.986 por 5 días.',
        diasEstimados: 5,
        obligatorio: true,
      },
      {
        id: 'PASO-008-4',
        orden: 4,
        titulo: 'Dictamen de la Fiscalía Federal e Intervención del Defensor Oficial',
        descripcion: 'Dictamen fiscal de competencia federal e idoneidad de la vía elegida.',
        diasEstimados: 5,
        obligatorio: true,
      },
      {
        id: 'PASO-008-5',
        orden: 5,
        titulo: 'Sentencia Definitiva y Orden Judicial de Pronto Despacho bajo Apercibimiento',
        descripcion: 'Condena a ANSES para expedirse con imposición de costas y astreintes.',
        diasEstimados: 10,
        obligatorio: true,
      },
    ]
  },
  {
    id: 'REP-009',
    titulo: 'Acción de Amparo de Salud Federal contra PAMI / Incluir Salud',
    fuero: 'Justicia Federal',
    tematica: 'Amparo de Salud Federal',
    tipoExpediente: 'Amparo de Salud con Cautelar',
    etapaProcesal: 'Iniciación / Demanda',
    descripcion: 'Petición urgente ante el fuero Federal para provisión inmediata de prótesis, medicamentos de alta complejidad o coberturas vitales de PAMI / Ministerio de Salud.',
    autor: 'Dra. María Elena Gómez',
    fechaCreacion: '2026-08-07',
    etiquetas: ['PJN', 'Amparo', 'Salud', 'PAMI', 'Incluir Salud', 'Justicia Federal', 'Cautelar'],
    contenidoPlantilla: `SEÑOR JUEZ FEDERAL DE POSADAS:

{LETRADO_PATROCINANTE}, abogada defensora de {CLIENTE}, en los autos caratulados "{CARATULA}", Expte. N° {NUMERO_EXPTE}, ante V.S. respetuosamente digo:

I. OBJETO - SOLICITA MEDIDA CAUTELAR INNOVATIVA URGENTE:
Vengo a interponer ACCIÓN DE AMPARO DE SALUD CON MEDIDA CAUTELAR NO INNOVAR / INNOVATIVA contra PAMI / INCLUIR SALUD, a fin de que se ordene la provisión inmediata del tratamiento médico prescrito bajo apercibimiento de astreintes acumulativos diarios y denuncia penal por desobediencia.

II. PELIGRO EN LA DEMORA Y VEROSIMILITUD DEL DERECHO:
Se acompaña prescripción médica suscrita por profesional especialista y negativa expresa u omisión de la obra social nacional, comprometiendo de forma irreparable el derecho a la vida y a la salud (art. 75 inc. 22 C.N.).

III. PETITORIO:
1. Se disponga la habilitación de días y horas inhábiles en caso de receso.
2. Se libre cédula electrónica DEOX con carácter de urgente.

SERÁ JUSTICIA.`,
    pasosASeguir: [
      {
        id: 'PASO-009-1',
        orden: 1,
        titulo: 'Carga Urgente en Portal PJN con Solicitud de Cautelar e Habilitación de Horas',
        descripcion: 'Ingreso prioritario con indicación de riesgo severo de salud.',
        diasEstimados: 1,
        escritoRecomendadoId: 'REP-009',
        escritoRecomendadoNombre: 'Amparo de Salud Federal',
        obligatorio: true,
      },
      {
        id: 'PASO-009-2',
        orden: 2,
        titulo: 'Resolución de Cautelar Innovativa y Cédula DEOX Urgente a PAMI / Estado Nacional',
        descripcion: 'Notificación oficial electrónica con plazo de 24-48 horas para cumplimiento.',
        diasEstimados: 2,
        obligatorio: true,
      },
      {
        id: 'PASO-009-3',
        orden: 3,
        titulo: 'Constatación de Cumplimiento Médico / Intimación con Astreintes Diarios',
        descripcion: 'Sanción pecuniaria por día de retardo en la entrega de medicamentos o prótesis.',
        diasEstimados: 3,
        obligatorio: true,
      },
      {
        id: 'PASO-009-4',
        orden: 4,
        titulo: 'Sentencia Definitiva del Amparo de Salud y Confirmación en Cámara Federal',
        descripcion: 'Sentencia de mérito ordenando la cobertura integral del 100%.',
        diasEstimados: 10,
        obligatorio: true,
      },
    ]
  }
];

export const INITIAL_PROGRESO_PASOS: ProgresoPasosExpediente[] = [
  {
    expediente_id: 'EXP-1420',
    modelo_id: 'REP-001',
    pasosCompletadosIds: ['PASO-001-1', 'PASO-001-2'],
    fechaUltimaActualizacion: '2026-08-03 16:00',
  },
  {
    expediente_id: 'EXP-3105',
    modelo_id: 'REP-004',
    pasosCompletadosIds: ['PASO-004-1'],
    fechaUltimaActualizacion: '2026-08-02 11:30',
  }
];
