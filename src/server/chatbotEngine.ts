import { GoogleGenAI } from '@google/genai';
import { 
  Expediente, 
  AudienciaExpediente, 
  PeticionConsultaChatbot, 
  RespuestaConsultaChatbot, 
  ResumenExpedienteChatbot,
  ConfiguracionChatbot 
} from '../types';
import { 
  INITIAL_EXPEDIENTES, 
  INITIAL_AUDIENCIAS, 
  DEFAULT_CONFIGURACION_CHATBOT 
} from '../data/mockStore';

// Helper to get or fallback Gemini AI client
function getGeminiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-siged-chatbot',
      },
    },
  });
}

/**
 * Normaliza un número de DNI o CUIT quitando puntos, guiones y espacios
 */
export function normalizarIdentificador(id: string): string {
  return (id || '').replace(/[\.\-\s]/g, '').trim().toLowerCase();
}

/**
 * Busca expedientes asociados a un DNI, CUIT, nombre de cliente o número de causa
 */
export function buscarExpedientesCliente(
  identificador: string, 
  expedientes: Expediente[] = INITIAL_EXPEDIENTES
): Expediente[] {
  if (!identificador || identificador.trim().length === 0) return [];

  const normalizado = normalizarIdentificador(identificador);
  const busquedaTexto = identificador.trim().toLowerCase();

  return expedientes.filter((exp) => {
    // 1. Coincidencia directa por número de expediente
    if (exp.numero.toLowerCase().includes(busquedaTexto)) return true;

    // 2. Coincidencia por nombre de cliente titular
    if (exp.cliente && exp.cliente.toLowerCase().includes(busquedaTexto)) return true;

    // 3. Coincidencia en las partes intervinientes (DNI, CUIT o nombre)
    if (exp.partes && Array.isArray(exp.partes)) {
      return exp.partes.some((parte) => {
        if (parte.dni_cuit && normalizarIdentificador(parte.dni_cuit) === normalizado) return true;
        if (parte.dni_cuit && normalizarIdentificador(parte.dni_cuit).includes(normalizado)) return true;
        if (parte.nombre && parte.nombre.toLowerCase().includes(busquedaTexto)) return true;
        return false;
      });
    }

    return false;
  });
}

/**
 * Construye el resumen público y comprensible de un expediente para el cliente
 */
export function construirResumenExpediente(
  expediente: Expediente,
  audiencias: AudienciaExpediente[] = INITIAL_AUDIENCIAS,
  config: ConfiguracionChatbot = DEFAULT_CONFIGURACION_CHATBOT
): ResumenExpedienteChatbot {
  // Último movimiento procesal
  const ultimoMov = expediente.movimientos && expediente.movimientos.length > 0
    ? expediente.movimientos[0]
    : undefined;

  // Próxima audiencia programada
  const proximaAud = audiencias.find(
    (a) => a.expediente_id === expediente.id && a.estado === 'Programada'
  );

  return {
    numero: expediente.numero,
    caratula: expediente.caratula,
    juzgado: expediente.juzgado,
    fuero: expediente.fuero,
    estado: expediente.estado,
    etapa_procesal: expediente.etapa_procesal,
    abogado_responsable: expediente.letrado_patrocinante || 'Dr. Alejandro Posadas',
    ultimo_movimiento: ultimoMov ? {
      fecha: ultimoMov.fecha,
      tipo: ultimoMov.tipo,
      descripcion: ultimoMov.descripcion,
    } : undefined,
    proxima_audiencia: (config.permitirVerAudiencias && proximaAud) ? {
      fecha: proximaAud.fecha_hora,
      tipo: proximaAud.tipo,
      juzgado: proximaAud.juzgado_sala,
      modalidad: proximaAud.modalidad,
    } : undefined,
    saldo_financiero: (config.permitirVerFinanciero && expediente.financiero) ? {
      honorariosPactados: expediente.financiero.honorariosPactados,
      honorariosCobrados: expediente.financiero.honorariosCobrados,
      saldoPendiente: expediente.financiero.saldoPendiente,
    } : undefined,
  };
}

/**
 * Genera sugerencias interactivas basadas en el estado del expediente
 */
export function generarSugerenciasContextuales(
  resumen?: ResumenExpedienteChatbot,
  config: ConfiguracionChatbot = DEFAULT_CONFIGURACION_CHATBOT
): string[] {
  if (!resumen) {
    return [
      '🔍 Consultar con mi DNI',
      '⏰ ¿Cuáles son los horarios de atención?',
      '📞 Hablar con mi abogado por WhatsApp',
    ];
  }

  const sugerencias: string[] = [
    '📌 ¿En qué etapa está mi juicio actualmente?',
    '📜 ¿Qué novedades hubo en el último despacho?',
  ];

  if (resumen.proxima_audiencia) {
    sugerencias.push('📅 ¿Cuándo y dónde es mi próxima audiencia?');
    sugerencias.push('👤 ¿Tengo que asistir personalmente a la audiencia?');
  }

  if (config.permitirVerFinanciero && resumen.saldo_financiero) {
    sugerencias.push('💰 ¿Cuál es el estado de mis honorarios y pagos?');
  }

  sugerencias.push('🤝 ¿Puedo solicitar que mi abogado me llame?');

  return sugerencias;
}

/**
 * Motor principal para procesar preguntas del cliente
 */
export async function procesarConsultaChatbot(
  peticion: PeticionConsultaChatbot,
  expedientesStore: Expediente[] = INITIAL_EXPEDIENTES,
  audienciasStore: AudienciaExpediente[] = INITIAL_AUDIENCIAS,
  config: ConfiguracionChatbot = DEFAULT_CONFIGURACION_CHATBOT
): Promise<RespuestaConsultaChatbot> {
  const { dni_cuit, consulta, expediente_id } = peticion;

  // 1. Validación de identificador / DNI
  if (!dni_cuit || dni_cuit.trim().length < 4) {
    return {
      exito: false,
      mensaje: `Por favor ingresa tu número de **DNI** o **CUIT** (sin puntos ni espacios) o el número de tu causa para poder identificarte y brindarte la información de tu caso.`,
      sugerencias: ['🔍 Ingresar mi DNI', '⏰ Horarios de atención del estudio', '📞 Contactar por WhatsApp'],
      tipo: 'seguridad',
    };
  }

  // 2. Búsqueda de causas asociadas
  const causasEncontradas = buscarExpedientesCliente(dni_cuit, expedientesStore);

  if (causasEncontradas.length === 0) {
    return {
      exito: false,
      mensaje: `No encontramos ningún expediente registrado bajo el documento o identificador **"${dni_cuit}"** en nuestro sistema.\n\nPor favor verifica haber ingresado correctamente tu DNI o comunícate directamente con la secretaría de nuestro estudio al **${config.telefonoWhatsAppEstudio}** para verificar tu ficha de cliente.`,
      sugerencias: [
        '🔄 Intentar con otro DNI',
        '📞 Hablar con la secretaría por WhatsApp',
        '📧 Enviar un correo electrónico',
      ],
      tipo: 'seguridad',
      requiereContactoHumano: true,
    };
  }

  // 3. Selección de expediente activo (si hay múltiples o uno específico)
  let expedienteActivo = causasEncontradas[0];
  if (expediente_id) {
    const coincidencia = causasEncontradas.find((c) => c.id === expediente_id || c.numero === expediente_id);
    if (coincidencia) {
      expedienteActivo = coincidencia;
    }
  }

  const resumenExp = construirResumenExpediente(expedienteActivo, audienciasStore, config);
  const sugerencias = generarSugerenciasContextuales(resumenExp, config);

  // Detección de intención si el usuario pide hablar con un abogado o solicitar llamada
  const consultaLower = (consulta || '').toLowerCase();
  const pideHumano = /abogad|human|llam|turn|comunicar|hablar con|urgente|contacto/i.test(consultaLower);

  if (pideHumano && /quiero hablar|que me llam|necesito hablar|comunicarme con/i.test(consultaLower)) {
    return {
      exito: true,
      mensaje: `¡Entendido! Hemos registrado tu solicitud de contacto para el **${resumenExp.abogado_responsable}** respecto a tu causa **N° ${resumenExp.numero}**.\n\nEl profesional se comunicará contigo al teléfono registrado a la brevedad dentro del horario de atención (${config.horarioAtencion}).\n\nSi es urgente, puedes escribirnos directamente a nuestro WhatsApp oficial: **${config.telefonoWhatsAppEstudio}**.`,
      expediente: resumenExp,
      sugerencias: ['📌 ¿En qué etapa está mi juicio actualmente?', '📜 ¿Cuál fue el último movimiento?'],
      tipo: 'escalamiento',
      requiereContactoHumano: true,
    };
  }

  // 4. Procesamiento Inteligente con Gemini AI
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== 'dummy_key') {
    try {
      const ai = getGeminiClient();
      const promptSistema = `Eres el Asistente Virtual Inteligente del "${config.nombreEstudio}".
Tu objetivo es responder de forma cordial, comprensible y humana a los clientes del estudio sobre el estado de sus trámites legales.

INFORMACIÓN DE LA CAUSA DEL CLIENTE:
- Número de Expediente: ${resumenExp.numero}
- Carátula: ${resumenExp.caratula}
- Juzgado: ${resumenExp.juzgado} (${resumenExp.fuero})
- Estado general: ${resumenExp.estado}
- Etapa procesal actual: ${resumenExp.etapa_procesal}
- Abogado a cargo: ${resumenExp.abogado_responsable}
- Último movimiento judicial: ${resumenExp.ultimo_movimiento ? `${resumenExp.ultimo_movimiento.fecha} - ${resumenExp.ultimo_movimiento.tipo}: ${resumenExp.ultimo_movimiento.descripcion}` : 'Sin movimientos recientes cargados'}
- Próxima Audiencia: ${resumenExp.proxima_audiencia ? `Fecha: ${resumenExp.proxima_audiencia.fecha}, Tipo: ${resumenExp.proxima_audiencia.tipo}, Juzgado: ${resumenExp.proxima_audiencia.juzgado}, Modalidad: ${resumenExp.proxima_audiencia.modalidad}` : 'No hay audiencias pendientes fijadas por el momento'}
- Saldo Financiero (Honorarios): ${resumenExp.saldo_financiero ? `Pactados: $${resumenExp.saldo_financiero.honorariosPactados}, Abonados: $${resumenExp.saldo_financiero.honorariosCobrados}, Saldo pendiente: $${resumenExp.saldo_financiero.saldoPendiente}` : 'No disponible'}
- Teléfono de contacto / WhatsApp: ${config.telefonoWhatsAppEstudio}
- Horario de atención: ${config.horarioAtencion}

NORMAS ESTRICTAS DE RESPUESTA:
1. Habla en un tono ${config.tonoRespuesta === 'formal' ? 'formal y respetuoso' : config.tonoRespuesta === 'simplificado' ? 'muy simple, didáctico y directo' : 'cálido, cordial y profesional'}.
2. NUNCA uses jerga técnica judicial sin explicarla (por ejemplo: traduce "traba de litis" como "notificación a la otra parte", "art. 360" como "audiencia preliminar para definir pruebas", "autos para sentencia" como "el juez ya tiene el expediente listo para dictar el fallo final").
3. Brinda tranquilidad y claridad. Si el cliente pregunta qué tiene que hacer, dale pasos claros.
4. Recuerda que eres un asistente informativo; no garantices resultados ni des asesoramiento legal vinculante.
5. Si pregunta por audiencias, explícale la fecha y si debe concurrir o no.
6. Si la pregunta no se relaciona con su causa, respóndele educadamente invitándolo a consultar sobre su expediente o comunicarse con el estudio.`;

      const userMessage = `Consulta del cliente: "${consulta || '¿Cómo está mi expediente actualmente y cuáles son las novedades?'}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${promptSistema}\n\n${userMessage}` }] }
        ],
      });

      const textoGenerado = response.text || '';
      if (textoGenerado && textoGenerado.trim().length > 0) {
        return {
          exito: true,
          mensaje: textoGenerado,
          expediente: resumenExp,
          expedientesDisponibles: causasEncontradas.map((c) => ({ id: c.id, numero: c.numero, caratula: c.caratula })),
          sugerencias,
          tipo: 'info',
        };
      }
    } catch (aiErr) {
      console.warn('Fallo llamada a Gemini AI en chatbot cliente, recurriendo a motor local:', aiErr);
    }
  }

  // 5. Fallback Algorítmico Inteligente (Sin dependencia externa)
  return generarRespuestaAlgoritmica(consulta, resumenExp, causasEncontradas, sugerencias, config);
}

/**
 * Generador algorítmico de respuestas en lenguaje claro
 */
function generarRespuestaAlgoritmica(
  consulta: string,
  resumen: ResumenExpedienteChatbot,
  causas: Expediente[],
  sugerencias: string[],
  config: ConfiguracionChatbot
): RespuestaConsultaChatbot {
  const query = (consulta || '').toLowerCase();

  // 1. Pregunta sobre Audiencias
  if (/audiencia|citaci|declar|testigo|cuándo voy|juzgado fecha/i.test(query)) {
    if (resumen.proxima_audiencia) {
      return {
        exito: true,
        mensaje: `📅 **Tu próxima audiencia está programada:**\n\n- **Fecha y Hora:** ${resumen.proxima_audiencia.fecha} hs.\n- **Tipo de Audiencia:** ${resumen.proxima_audiencia.tipo}.\n- **Sede:** ${resumen.proxima_audiencia.juzgado}.\n- **Modalidad:** ${resumen.proxima_audiencia.modalidad}.\n\n💡 **Recomendación:** Te sugerimos presentarte 15 minutos antes con tu DNI original. Tu abogado **${resumen.abogado_responsable}** estará presente para acompañarte.`,
        expediente: resumen,
        sugerencias,
        tipo: 'audiencia',
      };
    } else {
      return {
        exito: true,
        mensaje: `Por el momento **no tienes ninguna audiencia fijada** en el expediente N° ${resumen.numero}.\n\nActualmente el juicio se encuentra en la etapa de **"${resumen.etapa_procesal}"**. Tan pronto como el juzgado fije una fecha, te estaremos avisando automáticamente.`,
        expediente: resumen,
        sugerencias,
        tipo: 'audiencia',
      };
    }
  }

  // 2. Pregunta sobre Último Movimiento / Despacho / Novedades
  if (/último|despacho|movimiento|novedad|pasó|que dijo el juez|resolv/i.test(query)) {
    if (resumen.ultimo_movimiento) {
      return {
        exito: true,
        mensaje: `📜 **Última novedad en tu expediente (Fecha: ${resumen.ultimo_movimiento.fecha}):**\n\n- **Actuación:** ${resumen.ultimo_movimiento.tipo}\n- **Detalle:** ${resumen.ultimo_movimiento.descripcion}\n\nTu causa está radicada en el **${resumen.juzgado}** y el equipo del estudio está realizando el seguimiento continuo de los plazos procesales.`,
        expediente: resumen,
        sugerencias,
        tipo: 'movimiento',
      };
    }
  }

  // 3. Pregunta sobre Honorarios / Saldo / Financiero
  if (/honorario|pago|saldo|costo|cuota|precio|debo/i.test(query)) {
    if (config.permitirVerFinanciero && resumen.saldo_financiero) {
      const { honorariosPactados, honorariosCobrados, saldoPendiente } = resumen.saldo_financiero;
      return {
        exito: true,
        mensaje: `💰 **Estado de cuenta y honorarios:**\n\n- **Honorarios acordados:** $${honorariosPactados.toLocaleString('es-AR')}\n- **Monto abonado hasta la fecha:** $${honorariosCobrados.toLocaleString('es-AR')}\n- **Saldo pendiente:** $${saldoPendiente.toLocaleString('es-AR')}\n\nSi necesitas solicitar recibo o coordinar un plan de pagos, puedes escribirnos por WhatsApp al **${config.telefonoWhatsAppEstudio}**.`,
        expediente: resumen,
        sugerencias,
        tipo: 'financiero',
      };
    } else {
      return {
        exito: true,
        mensaje: `Para consultas sobre pagos y estado de cuenta, por favor comunícate directamente con la administración del estudio al **${config.telefonoWhatsAppEstudio}**.`,
        expediente: resumen,
        sugerencias,
        tipo: 'financiero',
      };
    }
  }

  // 4. Respuesta General de Estado de la Causa
  return {
    exito: true,
    mensaje: `👋 ¡Hola! Te informamos sobre tu causa **"${resumen.caratula}"** (Expte. N° **${resumen.numero}**):\n\n🏛️ **Juzgado:** ${resumen.juzgado}\n⚖️ **Etapa Procesal:** ${resumen.etapa_procesal}\n🟢 **Estado:** ${resumen.estado}\n👨‍⚖️ **Letrado a cargo:** ${resumen.abogado_responsable}\n\n${resumen.ultimo_movimiento ? `📅 **Última actuación (${resumen.ultimo_movimiento.fecha}):** ${resumen.ultimo_movimiento.descripcion}\n\n` : ''}${resumen.proxima_audiencia ? `🗓️ **Próxima audiencia:** ${resumen.proxima_audiencia.fecha} hs (${resumen.proxima_audiencia.tipo}).\n\n` : ''}¿En qué más te puedo ayudar hoy?`,
    expediente: resumen,
    expedientesDisponibles: causas.length > 1 ? causas.map((c) => ({ id: c.id, numero: c.numero, caratula: c.caratula })) : undefined,
    sugerencias,
    tipo: 'info',
  };
}
