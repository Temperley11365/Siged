import { Abogado, Expediente, ActuacionSIGED } from '../types';

export const INITIAL_ABOGADOS: Abogado[] = [
  {
    id: 'ABG-001',
    nombre: 'Dr. Juan Manuel Posadas',
    matricula: 'MP 4102 - CADAM',
    rol: 'Socio',
    email: 'jposadas@estudioposadas.com.ar',
    telefono: '+5493764123456',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'ABG-002',
    nombre: 'Dra. María Elena Gómez',
    matricula: 'MP 5890 - CADAM',
    rol: 'Asociado',
    email: 'mgomez@estudioposadas.com.ar',
    telefono: '+5493764987654',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'ABG-003',
    nombre: 'Dr. Carlos Alberto Ruiz',
    matricula: 'MP 6214 - CADAM',
    rol: 'Asociado',
    email: 'cruiz@estudioposadas.com.ar',
    telefono: '+5493764554433',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_EXPEDIENTES: Expediente[] = [
  {
    id: 'EXP-1420',
    numero: '1420/2025',
    caratula: 'GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L. S/ DAÑOS Y PERJUICIOS',
    juzgado: 'Juzgado Civil y Comercial N° 1 - Posadas (1ra Circunscripción)',
    fuero: 'Civil y Comercial',
    circunscripcion: 'Primera (Posadas)',
    abogados_autorizados: ['ABG-001', 'ABG-002'],
    letrado_patrocinante: 'ABG-002',
    apoderado: 'ABG-001',
    fecha_inicio: '2025-03-10',
    estado: 'Con plazo pendiente',
    cliente: 'Alberto Gómez',
  },
  {
    id: 'EXP-882',
    numero: '882/2024',
    caratula: 'SILVA ROXANA C/ TRANSPORTES URQUIZA S.A. S/ ACCIDENTE DE TRABAJO',
    juzgado: 'Juzgado de Primera Instancia en lo Laboral N° 2 - Posadas',
    fuero: 'Laboral',
    circunscripcion: 'Primera (Posadas)',
    abogados_autorizados: ['ABG-001', 'ABG-002'],
    letrado_patrocinante: 'ABG-002',
    fecha_inicio: '2024-08-15',
    estado: 'En trámite',
    cliente: 'Roxana Silva',
  },
  {
    id: 'EXP-3105',
    numero: '3105/2025',
    caratula: 'BANCO MACRO S.A. C/ KOWALSKI MARTIN S/ EJECUCION PRENDARIA',
    juzgado: 'Juzgado Civil, Comercial y de Familia N° 1 - Oberá',
    fuero: 'Civil y Comercial',
    circunscripcion: 'Segunda (Oberá)',
    abogados_autorizados: ['ABG-001', 'ABG-003'],
    letrado_patrocinante: 'ABG-003',
    apoderado: 'ABG-001',
    fecha_inicio: '2025-05-20',
    estado: 'Con plazo pendiente',
    cliente: 'Banco Macro S.A.',
  },
  {
    id: 'EXP-9941',
    numero: '9941/2025',
    caratula: 'FERREYRA PATRICIA C/ RUIZ MARCELO S/ DIVORCIO VINCULAR Y ALIMENTOS',
    juzgado: 'Juzgado de Familia N° 2 - Eldorado',
    fuero: 'Familia',
    circunscripcion: 'Tercera (Eldorado)',
    abogados_autorizados: ['ABG-001', 'ABG-003'],
    letrado_patrocinante: 'ABG-003',
    fecha_inicio: '2025-02-14',
    estado: 'Dictamen pendiente',
    cliente: 'Patricia Ferreyra',
  },
  {
    id: 'EXP-504',
    numero: '504/2026',
    caratula: 'COOPERATIVA AGRICOLA ELDORADO LTDA. S/ CONCURSO PREVENTIVO',
    juzgado: 'Juzgado Civil y Comercial N° 3 - Posadas',
    fuero: 'Caducidades y Concursos',
    circunscripcion: 'Primera (Posadas)',
    abogados_autorizados: ['ABG-001', 'ABG-002'],
    letrado_patrocinante: 'ABG-001',
    apoderado: 'ABG-002',
    fecha_inicio: '2026-01-22',
    estado: 'En trámite',
    cliente: 'Cooperativa Agrícola Eldorado',
  },
];

export const INITIAL_ACTUACIONES: ActuacionSIGED[] = [
  {
    id: 'ACT-001',
    expediente_id: 'EXP-1420',
    fecha: '2026-08-01',
    tipo_actuacion: 'Cédula Digital de Traslado de Demanda',
    firmante: 'Secretaría N° 2 - Dra. Carmen Benítez',
    texto_completo: `CEDULA DE NOTIFICACIÓN DIGITAL - PODER JUDICIAL DE MISIONES (SIGED)
Juzgado de Primera Instancia Civil y Comercial N° 1 - Secretaría N° 2
Expediente N° 1420/2025 - Carátula: GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L. S/ DAÑOS Y PERJUICIOS.

Se notifica al letrado apoderado Dr. Juan Manuel Posadas (M.P. 4102) y letrada patrocinante Dra. María Elena Gómez (M.P. 5890) del traslado de la contestación de demanda presentada por la demandada con fecha 28/07/2026.
Se otorga un plazo de CINCO (5) DÍAS HÁBILES judicial a las partes para manifestarse sobre la documental acompañada y solicitar las medidas probatorias suplementarias conforme el Art. 358 del CPCCyM de la Provincia de Misiones, bajo apercibimiento de ley. Quedan Uds. debidamente notificados.`,
    procesado: true,
  },
  {
    id: 'ACT-002',
    expediente_id: 'EXP-3105',
    fecha: '2026-08-02',
    tipo_actuacion: 'Resolución Interlocutoria - Intimación de Pago',
    firmante: 'Juez Dr. Ricardo Alvarenga',
    texto_completo: `PODER JUDICIAL DE MISIONES - SIGED NOTIFICACIONES
Juzgado Civil, Comercial y de Familia N° 1 - Oberá
Expediente N° 3105/2025 - BANCO MACRO S.A. C/ KOWALSKI MARTIN S/ EJECUCION PRENDARIA.

Oberá, Misiones, 02 de Agosto de 2026.
AUTOS Y VISTOS: Por presentados, por parte y por constituido el domicilio legal y electrónico.
RESUELVO: 1) Intimar al ejecutado Martin Kowalski para que en el plazo de TRES (3) DÍAS HÁBILES judiciales proceda a dar cumplimiento a la traba del embargo y depositar la suma reclamada de $4.500.000 con más la suma de $1.350.000 presupuestada provisoriamente para acrecidas. 2) Traslado por el término de TRES (3) DÍAS a la parte actora para que opte por el martillero de la lista. Notifíquese por Cédula Digital SIGED.`,
    procesado: true,
  },
  {
    id: 'ACT-003',
    expediente_id: 'EXP-9941',
    fecha: '2026-07-29',
    tipo_actuacion: 'Vista al Ministerio Público Fiscal',
    firmante: 'Dra. Silvina Masi - Fiscal de Familia N° 2',
    texto_completo: `PODER JUDICIAL DE MISIONES - VISTA FISCAL DIGITAL SIGED
Juzgado de Familia N° 2 - Eldorado
Expediente N° 9941/2025 - FERREYRA PATRICIA C/ RUIZ MARCELO S/ DIVORCIO VINCULAR Y ALIMENTOS.

Eldorado, 29 de Julio de 2026.
Cúmpleme correr VISTA a la letrada patrocinante de la parte actora Dra. María Elena Gómez de la propuesta regulatoria de cuota alimentaria formulada por la Asesoría de Menores. Confiérase traslado por el término de DIEZ (10) DÍAS HÁBILES procesales para formular alegaciones o conformidad. Notifíquese por cédula electrónica.`,
    procesado: true,
  },
];
