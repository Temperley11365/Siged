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
  ProgresoPasosExpediente,
  ConfiguracionChatbot,
  RegistroConsultaChatbot
} from '../types';

export const DEFAULT_OIDC_SESSION: OidcSessionState = {
  autenticado: false,
  metodoAutenticacion: 'LOCAL',
};

export const INITIAL_ACTUACIONES: ActuacionSIGED[] = [];

export const INITIAL_ABOGADOS: Abogado[] = [
  {
    id: 'ADMIN-001',
    nombre: 'JyE Sender Servicios (Administrador)',
    matricula: 'ADMIN-001 • JyE Servicios',
    rol: 'Administrador',
    email: 'jye.sender2023@gmail.com',
    password: 'AdminSender2023!',
    telefono: '+54 9 376 400-0000',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    esAdmin: true,
    activo: true,
    fechaRegistro: '2026-01-10 08:00',
    preguntaSecreta: '¿Cuál es el servicio de administración del sistema?',
    respuestaSecreta: 'JyE Sender Servicios',
    credencialesSiged: {
      usuarioSiged: 'admin.jyesender',
      claveSiged: '••••••••••••',
      pinCertificadoDigital: '990182',
      estadoConexion: 'Conectado',
      ultimaSincronizacion: '2026-08-20 09:30',
      sincronizacionAutomatica: true,
      frecuenciaMinutos: 15,
      notificacionesPushWeb: true,
    },
  },
  {
    id: 'ABG-001',
    nombre: 'Dr. Alejandro Posadas',
    matricula: 'T° 14 F° 230 C.P.A.M.',
    rol: 'Socio',
    email: 'aposadas@estudioposadas.com.ar',
    password: 'posadas_legal_2026',
    telefono: '+54 9 376 455-8899',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    activo: true,
    fechaRegistro: '2026-02-15 10:30',
    preguntaSecreta: '¿Cuál es la ciudad donde se ubica la sede central del estudio?',
    respuestaSecreta: 'Posadas',
    credencialesSiged: {
      usuarioSiged: 'aposadas.siged',
      claveSiged: '••••••••••••',
      pinCertificadoDigital: '884192',
      estadoConexion: 'Conectado',
      ultimaSincronizacion: '2026-08-20 08:45',
      sincronizacionAutomatica: true,
      frecuenciaMinutos: 15,
      notificacionesPushWeb: true,
    },
  },
];

export const INITIAL_NOTIFICACIONES_PUSH: NotificacionPushSiged[] = [];

export const INITIAL_REGISTROS_SINCRONIZACION: RegistroSincronizacionSiged[] = [];

export const INITIAL_EXPEDIENTES: Expediente[] = [
  {
    id: 'EXP-001',
    numero: '10423/2025',
    caratula: 'GÓMEZ, MARIO ROBERTO C/ TRANSPORTES MISIONES S.R.L. S/ DAÑOS Y PERJUICIOS',
    juzgado: 'Juzgado Civil y Comercial N° 2 - Posadas',
    fuero: 'Civil y Comercial',
    circunscripcion: 'Primera (Posadas)',
    etapa_procesal: 'Apertura a Prueba',
    abogados_autorizados: ['ADMIN-001', 'ABG-001'],
    letrado_patrocinante: 'Dr. Alejandro Posadas',
    fecha_inicio: '2025-04-12',
    estado: 'En trámite',
    cliente: 'Gómez, Mario Roberto',
    partes: [
      {
        id: 'PARTE-001',
        nombre: 'Gómez, Mario Roberto',
        rol: 'Actor/a',
        dni_cuit: '30123456',
        domicilio_constituido: 'Av. Corrientes 1540, Posadas',
        letrado_patrocinante: 'Dr. Alejandro Posadas',
      },
      {
        id: 'PARTE-002',
        nombre: 'Transportes Misiones S.R.L.',
        rol: 'Demandado/a',
        dni_cuit: '30-71445566-9',
      },
      {
        id: 'PARTE-003',
        nombre: 'La Segunda Compañía de Seguros',
        rol: 'Citado/a en Garantía',
      }
    ],
    movimientos: [
      {
        id: 'MOV-001',
        fecha: '2026-08-10',
        tipo: 'Resolución Judicial',
        descripcion: 'Apertura a prueba por 40 días hábiles. Se designa perito médico traumatólogo y se fija fecha de audiencia preliminar.',
        firmante: 'Dr. Ricardo Benítez - Juez',
      },
      {
        id: 'MOV-002',
        fecha: '2026-07-28',
        tipo: 'Contestación de Demanda',
        descripcion: 'La aseguradora contesta demanda reconociendo el seguro y ofreciendo pruebas documentales.',
        firmante: 'Dra. Patricia Silva - Letrada Apoderada',
      },
      {
        id: 'MOV-003',
        fecha: '2025-04-12',
        tipo: 'Escrito Inicial',
        descripcion: 'Interposición de formal demanda con beneficio de litigar sin gastos.',
        firmante: 'Dr. Alejandro Posadas',
      }
    ],
    financiero: {
      honorariosPactados: 1200000,
      honorariosRegulados: 0,
      honorariosCobrados: 400000,
      tasaDeJusticiaMisiones: 18000,
      tasaJusticiaPagada: true,
      aportesCajaForense: 8500,
      aportesCajaAbogados: 8500,
      gastosDiligenciamiento: 25000,
      saldoPendiente: 800000,
    },
    sistemaOrigen: 'SIGED Misiones',
  },
  {
    id: 'EXP-002',
    numero: '4589/2026',
    caratula: 'FERREIRA, SILVANA ANDREA C/ SUPERMERCADOS DEL CENTRO S.A. S/ DESPIDO INCAUSADO',
    juzgado: 'Juzgado Laboral N° 1 - Posadas',
    fuero: 'Laboral',
    circunscripcion: 'Primera (Posadas)',
    etapa_procesal: 'Traba de la Litis / Contestación',
    abogados_autorizados: ['ADMIN-001', 'ABG-001'],
    letrado_patrocinante: 'Dr. Alejandro Posadas',
    fecha_inicio: '2026-02-18',
    estado: 'En trámite',
    cliente: 'Ferreira, Silvana Andrea',
    partes: [
      {
        id: 'PARTE-004',
        nombre: 'Ferreira, Silvana Andrea',
        rol: 'Actor/a',
        dni_cuit: '28456789',
        domicilio_constituido: 'Calle Félix de Azara 1820, Posadas',
        letrado_patrocinante: 'Dr. Alejandro Posadas',
      },
      {
        id: 'PARTE-005',
        nombre: 'Supermercados del Centro S.A.',
        rol: 'Demandado/a',
        dni_cuit: '30-68991122-3',
      }
    ],
    movimientos: [
      {
        id: 'MOV-004',
        fecha: '2026-08-15',
        tipo: 'Cédula Notificación SIGED',
        descripcion: 'Cédula digital remitida al domicilio electrónico de la demandada para contestar traslado en 10 días.',
        firmante: 'Secretaría Laboral N° 1',
      },
      {
        id: 'MOV-005',
        fecha: '2026-02-18',
        tipo: 'Demanda Laboral',
        descripcion: 'Presentación de demanda laboral por despido indirecto y diferencias de liquidación.',
        firmante: 'Dr. Alejandro Posadas',
      }
    ],
    financiero: {
      honorariosPactados: 850000,
      honorariosRegulados: 0,
      honorariosCobrados: 250000,
      tasaDeJusticiaMisiones: 0,
      tasaJusticiaPagada: true,
      aportesCajaForense: 5000,
      aportesCajaAbogados: 5000,
      gastosDiligenciamiento: 12000,
      saldoPendiente: 600000,
    },
    sistemaOrigen: 'SIGED Misiones',
  },
  {
    id: 'EXP-003',
    numero: '8832/2025',
    caratula: 'MARTÍNEZ, CLAUDIO GABRIEL C/ ANSES S/ REAJUSTES VARIOS',
    juzgado: 'Juzgado Federal de Posadas - Secretaría Previsional',
    fuero: 'ANSES / Previsional',
    circunscripcion: 'Primera (Posadas)',
    etapa_procesal: 'Autos para Sentencia',
    abogados_autorizados: ['ADMIN-001', 'ABG-001'],
    letrado_patrocinante: 'Dr. Alejandro Posadas',
    fecha_inicio: '2025-06-20',
    estado: 'Dictamen pendiente',
    cliente: 'Martínez, Claudio Gabriel',
    partes: [
      {
        id: 'PARTE-006',
        nombre: 'Martínez, Claudio Gabriel',
        rol: 'Actor/a',
        dni_cuit: '14223344',
        domicilio_constituido: 'Calle San Lorenzo 2100, Posadas',
      },
      {
        id: 'PARTE-007',
        nombre: 'Administración Nacional de la Seguridad Social (ANSES)',
        rol: 'Demandado/a',
      }
    ],
    movimientos: [
      {
        id: 'MOV-006',
        fecha: '2026-08-05',
        tipo: 'Pase a Despacho',
        descripcion: 'Autos a resolver para dictado de sentencia definitiva de reajuste jubilatorio.',
        firmante: 'Juez Federal de Primera Instancia',
      }
    ],
    financiero: {
      honorariosPactados: 600000,
      honorariosRegulados: 0,
      honorariosCobrados: 200000,
      tasaDeJusticiaMisiones: 0,
      tasaJusticiaPagada: true,
      aportesCajaForense: 0,
      aportesCajaAbogados: 0,
      gastosDiligenciamiento: 5000,
      saldoPendiente: 400000,
    },
    sistemaOrigen: 'PJN - Justicia Federal',
  }
];

export const INITIAL_PRUEBAS: PruebaExpediente[] = [];

export const INITIAL_AUDIENCIAS: AudienciaExpediente[] = [
  {
    id: 'AUD-001',
    expediente_id: 'EXP-001',
    caratula_expte: 'GÓMEZ, MARIO ROBERTO C/ TRANSPORTES MISIONES S.R.L. S/ DAÑOS Y PERJUICIOS',
    tipo: 'Art. 360 / Preliminar CPCCyM',
    fecha_hora: '2026-09-15 09:30',
    juzgado_sala: 'Juzgado Civil y Comercial N° 2 - Sala 2 (Posadas)',
    modalidad: 'Presencial',
    estado: 'Programada',
    pruebas_vinculadas_ids: [],
    personas_citadas: [
      {
        id: 'CIT-001',
        nombre: 'Gómez, Mario Roberto',
        dni: '30123456',
        rolCitado: 'Absolvente / Parte',
        estadoNotificacion: 'Diligenciada / Notificado',
      },
      {
        id: 'CIT-002',
        nombre: 'Dr. Fernando Romero (Perito Médico)',
        rolCitado: 'Perito',
        estadoNotificacion: 'Cédula Confeccionada',
      }
    ],
    notas_audiencia: 'El cliente debe presentarse con DNI original y comprobantes de gastos médicos actualizados.',
  }
];

export const INITIAL_TAREAS: TareaEstudio[] = [];

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

export const INITIAL_DOCUMENTOS: DocumentoEstudio[] = [];

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

export const INITIAL_PROGRESO_PASOS: ProgresoPasosExpediente[] = [];

export const INITIAL_TRAMITES_PORTALES: any[] = [];

export const INITIAL_ALERTAS_PROGRAMABLES: any[] = [];

export const DEFAULT_CONFIGURACION_CHATBOT: ConfiguracionChatbot = {
  nombreBot: 'Asistente Legal SIGED',
  mensajeBienvenida: '¡Hola! Soy el Asistente Virtual del Estudio Jurídico. Ingresa tu número de DNI o CUIT para consultar el estado actual de tu causa, próximas audiencias o novedades de tu expediente.',
  tonoRespuesta: 'cordial',
  permitirVerAudiencias: true,
  permitirVerFinanciero: true,
  permitirSolicitarLlamada: true,
  telefonoWhatsAppEstudio: '+54 9 376 455-8899',
  emailContactoEstudio: 'consultas@estudioposadas.com.ar',
  nombreEstudio: 'Estudio Jurídico Posadas & Asociados',
  horarioAtencion: 'Lunes a Viernes de 07:30 a 13:00 y 16:30 a 20:00 hs',
  whatsappWebhookUrl: 'https://api.estudioposadas.com.ar/api/chatbot-cliente/whatsapp-webhook',
  whatsappVerifyToken: 'siged_whatsapp_token_seguro_2026',
};

export const INITIAL_REGISTROS_CHATBOT: RegistroConsultaChatbot[] = [
  {
    id: 'REG-BOT-001',
    fecha: '2026-08-20 10:15',
    clienteDni: '30123456',
    clienteNombre: 'Gómez, Mario Roberto',
    expedienteNumero: '10423/2025',
    pregunta: '¿Cuándo es mi próxima audiencia y tengo que ir yo?',
    respuesta: 'Hola Mario, tu audiencia preliminar está fijada para el 15/09/2026 a las 09:30 hs en la Sala N° 2 del Juzgado Civil N° 2 de Posadas. Debes presentarte personalmente con tu DNI original.',
    canal: 'web_widget',
    solicitoHumano: false,
    atendidoPorAbogado: true,
  },
  {
    id: 'REG-BOT-002',
    fecha: '2026-08-19 16:40',
    clienteDni: '28456789',
    clienteNombre: 'Ferreira, Silvana Andrea',
    expedienteNumero: '4589/2026',
    pregunta: '¿La empresa ya contestó el juicio laboral?',
    respuesta: 'Hola Silvana, el juzgado envió la cédula oficial de notificación a la empresa el 15/08/2026. Tienen un plazo de 10 días hábiles judiciales para contestar.',
    canal: 'portal_clientes',
    solicitoHumano: true,
    atendidoPorAbogado: false,
  }
];


