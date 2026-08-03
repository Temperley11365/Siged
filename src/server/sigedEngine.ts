import { GoogleGenAI, Type } from '@google/genai';
import { PeticionProcesamientoSiged, RespuestaProcesalSiged } from '../types';
import { INITIAL_ABOGADOS, INITIAL_EXPEDIENTES } from '../data/mockStore';
import { calcularVencimientoMisiones, formatShortDate } from '../lib/misionesCalendar';

// Helper to get or fallback Gemini AI client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('GEMINI_API_KEY not configured or using default mock.');
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Motor principal de inteligencia procesal y verificación de acceso multiusuario
 */
export async function procesarNotificacionSiged(
  peticion: PeticionProcesamientoSiged
): Promise<RespuestaProcesalSiged> {
  const { abogado_autenticado, expediente: expPeticion, texto_actuacion, fecha_notificacion } = peticion;
  const fechaHoy = fecha_notificacion || formatShortDate(new Date());

  // 1. Verificación de Autenticación y Seguridad Multiusuario
  const abogadoDB = INITIAL_ABOGADOS.find((a) => a.id === abogado_autenticado.abogado_id);
  const esSocio = abogado_autenticado.rol === 'Socio' || (abogadoDB && abogadoDB.rol === 'Socio');

  // Buscar el expediente en base de datos si viene ID o número
  let expedienteEncontrado = INITIAL_EXPEDIENTES.find(
    (e) => (expPeticion?.id && e.id === expPeticion.id) || (expPeticion?.numero && e.numero === expPeticion.numero)
  );

  // Si no se proveyó ID o número, intentamos deducirlo del texto de la actuación mediante expresión regular
  if (!expedienteEncontrado && texto_actuacion) {
    const matchNumero = texto_actuacion.match(/(?:Expediente|Expte\.?|N°)\s*(\d+[\/\-]\d+)/i);
    if (matchNumero && matchNumero[1]) {
      const numExtraido = matchNumero[1];
      expedienteEncontrado = INITIAL_EXPEDIENTES.find((e) => e.numero === numExtraido);
    }
  }

  // Si el expediente existe en la base de datos del estudio, validar permisos:
  if (expedienteEncontrado && !esSocio) {
    const tienePermiso = expedienteEncontrado.abogados_autorizados.includes(abogado_autenticado.abogado_id);
    if (!tienePermiso) {
      return {
        autenticacion_valida: false,
        abogado_destino_id: abogado_autenticado.abogado_id,
        expediente: {
          numero: expedienteEncontrado.numero,
          caratula: 'ACCESO RESTRINGIDO - CAUSA NO AUTORIZADA',
          juzgado: expedienteEncontrado.juzgado,
        },
        analisis_procesal: {
          requiere_accion: false,
          tipo_actuacion: 'Acceso Denegado',
          resumen_ejecutivo: `El abogado ${abogado_autenticado.nombre} (ID: ${abogado_autenticado.abogado_id}, Rol: ${abogado_autenticado.rol}) no posee autorización legal expresamente delegada para acceder a la causa N° ${expedienteEncontrado.numero}.`,
          plazo_dias: null,
          tipo_plazo: null,
          sugerencia_agenda: null,
        },
        notificaciones: {
          push_short: `⛔ DENEGADO: Sin permisos en Expte. ${expedienteEncontrado.numero}`,
          whatsapp_text: `*ALERTA DE SEGURIDAD ESTUDIO*\n\nEstimado/a ${abogado_autenticado.nombre}, se registró una solicitud de acceso al Expte. N° ${expedienteEncontrado.numero}. Al poseer el rol de Asociado y no figurar como autorizado expreso en dicha causa, el sistema restringió el contenido por normas de confidencialidad.`,
          email_subject: `[SEGURIDAD ESTUDIO] Acceso denegado a expediente ${expedienteEncontrado.numero}`,
          email_body: `<div style="font-family:sans-serif; padding:20px; border:1px solid #e2e8f0; border-radius:8px;">
            <h3 style="color:#c53030;">Aviso de Seguridad y Control Acceso SIGED</h3>
            <p>El abogado <strong>${abogado_autenticado.nombre}</strong> (Matrícula: ${abogado_autenticado.matricula}) intentó procesar una actuación de una causa a la cual no se encuentra autorizado en el catálogo del estudio.</p>
            <p>Si requiere acceso, solicite al socio administrador incluir su ID en la lista de abogados autorizados del expediente.</p>
          </div>`,
        },
        mensaje_seguridad: 'Abogado asociado no autorizado para ver o procesar este expediente.',
      };
    }
  }

  // 2. Procesamiento con Gemini AI
  const ai = getGeminiClient();
  const apiKey = process.env.GEMINI_API_KEY;

  let promptSystem = `Eres el motor de inteligencia procesal y gestión de expedientes del Poder Judicial de Misiones (SIGED) de un estudio jurídico.
Tu tarea es analizar el texto procesal de una actuación, cédula o resolución provista y extraer los datos para el abogado autenticado:
- Abogado Destino: ${abogado_autenticado.nombre} (ID: ${abogado_autenticado.abogado_id}, Rol: ${abogado_autenticado.rol})
- Expediente Metadata: Numero "${expedienteEncontrado?.numero || expPeticion?.numero || 'A determinar'}", Caratula "${expedienteEncontrado?.caratula || expPeticion?.caratula || 'A determinar'}", Juzgado "${expedienteEncontrado?.juzgado || expPeticion?.juzgado || 'Juzgado Misiones'}".

Normas de cálculo procesal en Misiones (CPCCyM):
1. Plazos judiciales estándar son en "hábiles" (días hábiles judiciales de Lunes a Viernes excluyendo feriados).
2. Determina si requiere acción inmediata (vencimiento, vista, contestación de traslado, intimación, expresión de agravios, apelación).
3. Si requiere acción, calcula plazo_dias (ej: 3, 5, 10, 15).
4. Genera sugerencia_agenda detallada incluyendo día del vencimiento y recordatorio para las primeras 2 horas del día siguiente (Plazo de Gracia Art. 124).
5. Genera notificaciones profesionales y ejecutivas en los 4 formatos requeridos.`;

  try {
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Analiza la siguiente actuación procesal del SIGED Misiones y genera la respuesta procesal requerida:\n\nTEXTO ACTUACIÓN SIGED:\n"""${texto_actuacion}"""`,
        config: {
          systemInstruction: promptSystem,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              autenticacion_valida: { type: Type.BOOLEAN },
              abogado_destino_id: { type: Type.STRING },
              expediente: {
                type: Type.OBJECT,
                properties: {
                  numero: { type: Type.STRING },
                  caratula: { type: Type.STRING },
                  juzgado: { type: Type.STRING },
                },
                required: ['numero', 'caratula', 'juzgado'],
              },
              analisis_procesal: {
                type: Type.OBJECT,
                properties: {
                  requiere_accion: { type: Type.BOOLEAN },
                  tipo_actuacion: { type: Type.STRING },
                  resumen_ejecutivo: { type: Type.STRING },
                  plazo_dias: { type: Type.NUMBER, nullable: true },
                  tipo_plazo: { type: Type.STRING, nullable: true }, // "hábiles" | "corridos" | null
                  sugerencia_agenda: { type: Type.STRING, nullable: true },
                },
                required: ['requiere_accion', 'tipo_actuacion', 'resumen_ejecutivo'],
              },
              notificaciones: {
                type: Type.OBJECT,
                properties: {
                  push_short: { type: Type.STRING },
                  whatsapp_text: { type: Type.STRING },
                  email_subject: { type: Type.STRING },
                  email_body: { type: Type.STRING },
                },
                required: ['push_short', 'whatsapp_text', 'email_subject', 'email_body'],
              },
            },
            required: ['autenticacion_valida', 'abogado_destino_id', 'expediente', 'analisis_procesal', 'notificaciones'],
          },
        },
      });

      const parsed: RespuestaProcesalSiged = JSON.parse(response.text || '{}');
      
      // Asegurar que abogada_destino_id sea el correcto
      parsed.autenticacion_valida = true;
      parsed.abogado_destino_id = abogado_autenticado.abogado_id;
      if (!parsed.expediente.numero || parsed.expediente.numero === 'A determinar') {
        parsed.expediente.numero = expedienteEncontrado?.numero || expPeticion?.numero || '1420/2025';
      }
      if (!parsed.expediente.caratula || parsed.expediente.caratula === 'A determinar') {
        parsed.expediente.caratula = expedienteEncontrado?.caratula || expPeticion?.caratula || 'ACTUACION PROCESAL SIGED';
      }
      if (!parsed.expediente.juzgado || parsed.expediente.juzgado === 'Juzgado Misiones') {
        parsed.expediente.juzgado = expedienteEncontrado?.juzgado || expPeticion?.juzgado || 'Juzgado Civil y Comercial N° 1 - Posadas';
      }

      // Adjuntar metadatos de días hábiles calculados con nuestro motor de calendario Misiones
      if (parsed.analisis_procesal.plazo_dias && parsed.analisis_procesal.plazo_dias > 0) {
        const meta = calcularVencimientoMisiones(
          fechaHoy,
          parsed.analisis_procesal.plazo_dias,
          (parsed.analisis_procesal.tipo_plazo as any) || 'hábiles'
        );
        parsed.meta_calculo = {
          fecha_notificacion: fechaHoy,
          vencimiento_fecha: meta.vencimientoFechaStr,
          vencimiento_con_gracia: meta.vencimientoGraciaStr,
          dias_habiles_desglosados: meta.diasHabilesDesglosados,
        };
      }

      return parsed;
    }
  } catch (err) {
    console.error('Error invoking Gemini AI, fallback to deterministic parser:', err);
  }

  // 3. Parser Heurístico de Fallback Determinístico (si Gemini no está o hay error de red)
  return generarRespuestaHeuristica(peticion, expedienteEncontrado, fechaHoy);
}

function generarRespuestaHeuristica(
  peticion: PeticionProcesamientoSiged,
  expedienteDB: any,
  fechaHoy: string
): RespuestaProcesalSiged {
  const { abogado_autenticado, texto_actuacion, expediente: expPeticion } = peticion;

  const numExp = expedienteDB?.numero || expPeticion?.numero || '1420/2025';
  const caratulaExp = expedienteDB?.caratula || expPeticion?.caratula || 'GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L. S/ DAÑOS Y PERJUICIOS';
  const juzgadoExp = expedienteDB?.juzgado || expPeticion?.juzgado || 'Juzgado Civil y Comercial N° 1 - Posadas';

  // Detección de plazos y traslados
  let plazoDias = 5;
  let tipoPlazo: 'hábiles' | 'corridos' = 'hábiles';
  let requiereAccion = true;
  let tipoActuacion = 'Cédula de Notificación SIGED';

  const txtUpper = texto_actuacion.toUpperCase();

  if (txtUpper.includes('TRES (3)') || txtUpper.includes('3 DÍAS') || txtUpper.includes('3 DIAS')) {
    plazoDias = 3;
  } else if (txtUpper.includes('DIEZ (10)') || txtUpper.includes('10 DÍAS') || txtUpper.includes('10 DIAS')) {
    plazoDias = 10;
  } else if (txtUpper.includes('QUINCE (15)') || txtUpper.includes('15 DÍAS') || txtUpper.includes('15 DIAS')) {
    plazoDias = 15;
  } else if (txtUpper.includes('CINCO (5)') || txtUpper.includes('5 DÍAS') || txtUpper.includes('5 DIAS')) {
    plazoDias = 5;
  }

  if (txtUpper.includes('CEDULA') || txtUpper.includes('CÉDULA')) {
    tipoActuacion = 'Cédula de Notificación Digital';
  } else if (txtUpper.includes('RESOLUCION') || txtUpper.includes('RESOLUCIÓN') || txtUpper.includes('AUTOS Y VISTOS')) {
    tipoActuacion = 'Resolución Interlocutoria';
  } else if (txtUpper.includes('VISTA')) {
    tipoActuacion = 'Vista Procesal';
  } else if (txtUpper.includes('TRASLADO')) {
    tipoActuacion = 'Traslado de Documental / Demanda';
  }

  if (txtUpper.includes('ARCHÍVESE') || txtUpper.includes('AGRÉGUESE Y TÉNGASE PRESENTE')) {
    requiereAccion = false;
    plazoDias = 0;
  }

  const calc = requiereAccion ? calcularVencimientoMisiones(fechaHoy, plazoDias, tipoPlazo) : null;

  const resumenEjecutivo = requiereAccion
    ? `Despacho procesal proveniente de SIGED Misiones (${tipoActuacion}) en el que se otorga un traslado/vista por el término de ${plazoDias} días hábiles judiciales. Se requiere confeccionar el escrito procesal correspondiente y presentarlo en el expediente digital antes del vencimiento.`
    : `Provincia de Misiones - Providencia simple o agregación a los autos que no requiere plazo ni contestación perentoria por las partes.`;

  const sugerenciaAgenda = requiereAccion && calc
    ? `Vencimiento principal: ${calc.vencimientoFechaStr}. Recordatorio Plazo de Gracia (Art. 124 CPCCM): ${calc.vencimientoGraciaStr}.`
    : null;

  return {
    autenticacion_valida: true,
    abogado_destino_id: abogado_autenticado.abogado_id,
    expediente: {
      numero: numExp,
      caratula: caratulaExp,
      juzgado: juzgadoExp,
    },
    analisis_procesal: {
      requiere_accion: requiereAccion,
      tipo_actuacion: tipoActuacion,
      resumen_ejecutivo: resumenEjecutivo,
      plazo_dias: requiereAccion ? plazoDias : null,
      tipo_plazo: requiereAccion ? tipoPlazo : null,
      sugerencia_agenda: sugerenciaAgenda,
    },
    notificaciones: {
      push_short: `⚡ SIGED [Exp. ${numExp}]: ${tipoActuacion} (${plazoDias}d hábiles). ${calc ? 'Vence: ' + calc.vencimientoFechaStr.substring(0, 15) : 'Sin plazo.'}`,
      whatsapp_text: `*⚖️ NOTIFICACIÓN SIGED - ESTUDIO JURÍDICO*\n\n📌 *Expediente N°:* ${numExp}\n🏛️ *Juzgado:* ${juzgadoExp}\n⚖️ *Carátula:* ${caratulaExp}\n\n📝 *Actuación:* ${tipoActuacion}\n🔍 *Resumen:* ${resumenEjecutivo}\n\n⏳ *Plazo:* ${plazoDias} días hábiles judiciales.\n📅 *Vencimiento:* ${calc ? calc.vencimientoFechaStr : 'N/A'}\n⚠️ *Plazo de Gracia:* ${calc ? calc.vencimientoGraciaStr : 'N/A'}\n\n👤 *Asignado a:* ${abogado_autenticado.nombre}`,
      email_subject: `[SIGED MISIONES] Notificación Procesal Expte. ${numExp} - ${tipoActuacion}`,
      email_body: `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc;">
  <h2 style="color: #1e3a8a; margin-top: 0;">Motor Procesal SIGED - Poder Judicial Misiones</h2>
  <div style="background:#ffffff; padding:15px; border-radius:6px; margin-bottom:15px; border-left:4px solid #2563eb;">
    <p style="margin:4px 0;"><strong>Expediente:</strong> ${numExp}</p>
    <p style="margin:4px 0;"><strong>Carátula:</strong> ${caratulaExp}</p>
    <p style="margin:4px 0;"><strong>Juzgado:</strong> ${juzgadoExp}</p>
  </div>
  <h4 style="color: #334155;">Análisis Procesal</h4>
  <p>${resumenEjecutivo}</p>
  ${
    calc
      ? `<div style="background:#fef2f2; padding:12px; border-radius:6px; border:1px solid #fecaca;">
      <p style="margin:0; color:#991b1b; font-weight:bold;">🚨 Vencimiento Procesal: ${calc.vencimientoFechaStr}</p>
      <p style="margin:4px 0 0 0; color:#7f1d1d; font-size:13px;">⏰ ${calc.vencimientoGraciaStr}</p>
    </div>`
      : '<p style="color:#059669;">No requiere acción perentoria con vencimiento.</p>'
  }
  <p style="margin-top:20px; font-size:12px; color:#64748b;">Notificación procesal generada para ${abogado_autenticado.nombre} (Matrícula ${abogado_autenticado.matricula}). Estricto cumplimiento del CPCCyM Misiones.</p>
</div>`,
    },
    meta_calculo: calc
      ? {
          fecha_notificacion: fechaHoy,
          vencimiento_fecha: calc.vencimientoFechaStr,
          vencimiento_con_gracia: calc.vencimientoGraciaStr,
          dias_habiles_desglosados: calc.diasHabilesDesglosados,
        }
      : undefined,
  };
}
