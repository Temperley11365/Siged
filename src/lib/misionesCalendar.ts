import { DiaInhabil } from '../types';

/**
 * Calculador de Días Hábiles Judiciales - Poder Judicial de Misiones (CPCCyM)
 */

// Feriados y ferias representativas de Misiones (extendible)
export const HOLIDAYS_MISIONES_2026 = [
  '2026-01-01', // Año Nuevo
  '2026-02-16', // Carnaval
  '2026-02-17', // Carnaval
  '2026-03-24', // Memoria por la Verdad y la Justicia
  '2026-04-02', // Malvinas
  '2026-04-03', // Viernes Santo
  '2026-05-01', // Día del Trabajo
  '2026-05-25', // Revolución de Mayo
  '2026-06-17', // Güemes
  '2026-06-20', // Belgrano / Bandera
  '2026-07-09', // Independencia
  '2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', // Feria Judicial de Invierno
  '2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', // Feria Judicial de Invierno
  '2026-08-17', // San Martín
  '2026-10-12', // Respeto a la Diversidad Cultural
  '2026-11-16', // Día del Empleado Judicial (Feriado Judicial Ley Misiones)
  '2026-11-20', // Soberanía Nacional
  '2026-11-30', // Andrés Guacurarí y Artigas (Prócer Misionero - Feriado Provincial Misiones)
  '2026-12-08', // Inmaculada Concepción
  '2026-12-25', // Navidad
];

export function isHabilJudicial(date: Date, customInhabiles: DiaInhabil[] = []): boolean {
  const dayOfWeek = date.getDay(); // 0: Sunday, 6: Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  if (HOLIDAYS_MISIONES_2026.includes(dateStr)) return false;

  // Check custom non-working days configured by the study
  if (customInhabiles.some((inh) => inh.fecha === dateStr)) return false;

  return true;
}

export function formatFechaEsp(date: Date): string {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
}

export function formatShortDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function calcularVencimientoMisiones(
  fechaNotificacionStr: string,
  diasPlazo: number,
  tipoPlazo: 'hábiles' | 'corridos' = 'hábiles',
  customInhabiles: DiaInhabil[] = []
): {
  vencimientoFecha: Date;
  vencimientoFechaStr: string;
  vencimientoGraciaStr: string;
  diasHabilesDesglosados: string[];
} {
  const fechaNotif = new Date(fechaNotificacionStr + 'T12:00:00');
  let curr = new Date(fechaNotif);
  
  const desglosados: string[] = [];

  if (tipoPlazo === 'corridos') {
    curr.setDate(curr.getDate() + diasPlazo);
    // Si cae en inhábil, se prorroga al primer día hábil siguiente
    while (!isHabilJudicial(curr, customInhabiles)) {
      curr.setDate(curr.getDate() + 1);
    }
  } else {
    // Días hábiles judiciales: comienzan a contarse desde el DÍA SIGUIENTE a la notificación
    let diasContados = 0;
    while (diasContados < diasPlazo) {
      curr.setDate(curr.getDate() + 1);
      if (isHabilJudicial(curr, customInhabiles)) {
        diasContados++;
        desglosados.push(`${diasContados}° día hábil: ${formatFechaEsp(curr)}`);
      }
    }
  }

  // Calcular las 2 primeras horas del día hábil posterior (Plazo de gracia Art. 124 CPCCM)
  const diaGracia = new Date(curr);
  diaGracia.setDate(diaGracia.getDate() + 1);
  while (!isHabilJudicial(diaGracia, customInhabiles)) {
    diaGracia.setDate(diaGracia.getDate() + 1);
  }

  const vencimientoFechaStr = `${formatFechaEsp(curr)} (hasta 24:00 hs)`;
  const vencimientoGraciaStr = `${formatFechaEsp(diaGracia)} de 07:00 a 09:00 hs (Plazo de Gracia - Art. 124 CPCCyM Misiones)`;

  return {
    vencimientoFecha: curr,
    vencimientoFechaStr,
    vencimientoGraciaStr,
    diasHabilesDesglosados: desglosados,
  };
}
