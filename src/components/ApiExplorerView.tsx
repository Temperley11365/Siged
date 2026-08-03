import React, { useState } from 'react';
import { Abogado } from '../types';
import { Code2, Copy, Check, Terminal, FileJson, Send, Play } from 'lucide-react';

interface ApiExplorerViewProps {
  abogadoActual: Abogado;
}

export const ApiExplorerView: React.FC<ApiExplorerViewProps> = ({ abogadoActual }) => {
  const [copiadoCurl, setCopiadoCurl] = useState(false);
  const [copiadoSchema, setCopiadoSchema] = useState(false);

  const samplePayload = {
    abogado_autenticado: {
      abogado_id: abogadoActual.id,
      nombre: abogadoActual.nombre,
      matricula: abogadoActual.matricula,
      rol: abogadoActual.rol,
    },
    expediente: {
      numero: '1420/2025',
      caratula: 'GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L. S/ DAÑOS Y PERJUICIOS',
      juzgado: 'Juzgado Civil y Comercial N° 1 - Posadas',
    },
    texto_actuacion: `CEDULA DE NOTIFICACIÓN DIGITAL - PODER JUDICIAL DE MISIONES (SIGED)...`,
    fecha_notificacion: '2026-08-03',
  };

  const curlCommand = `curl -X POST "${window.location.origin}/api/procesar-siged" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`;

  const responseSchemaDoc = `{
  "autenticacion_valida": boolean,
  "abogado_destino_id": "string",
  "expediente": {
    "numero": "string",
    "caratula": "string",
    "juzgado": "string"
  },
  "analisis_procesal": {
    "requiere_accion": boolean,
    "tipo_actuacion": "string",
    "resumen_ejecutivo": "string",
    "plazo_dias": number | null,
    "tipo_plazo": "hábiles" | "corridos" | null,
    "sugerencia_agenda": "string | null"
  },
  "notificaciones": {
    "push_short": "string",
    "whatsapp_text": "string",
    "email_subject": "string",
    "email_body": "string"
  }
}`;

  const handleCopiarCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiadoCurl(true);
    setTimeout(() => setCopiadoCurl(false), 2000);
  };

  const handleCopiarSchema = () => {
    navigator.clipboard.writeText(responseSchemaDoc);
    setCopiadoSchema(true);
    setTimeout(() => setCopiadoSchema(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-bold tracking-tight uppercase text-slate-100 flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-blue-500" />
          <span>Documentación API y Salida JSON Estricto</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Especificación del endpoint <code className="text-blue-400 font-mono text-xs bg-slate-950 px-2 py-0.5 rounded border border-blue-500/30">POST /api/procesar-siged</code> para integración con bots, webhooks o sistemas externos del estudio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Payload */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-mono uppercase text-blue-400 font-bold tracking-widest flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-blue-500" />
              <span>Ejemplo de Comando cURL (HTTP POST)</span>
            </h3>
            <button
              onClick={handleCopiarCurl}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-mono uppercase font-bold text-[10px]"
            >
              {copiadoCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiadoCurl ? 'Copiado' : 'Copiar cURL'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono overflow-x-auto leading-relaxed">
            {curlCommand}
          </pre>
        </div>

        {/* Response JSON Schema */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-widest flex items-center space-x-2">
              <FileJson className="w-4 h-4 text-emerald-500" />
              <span>Formato de Salida Requerido (JSON Estricto)</span>
            </h3>
            <button
              onClick={handleCopiarSchema}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-mono uppercase font-bold text-[10px]"
            >
              {copiadoSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiadoSchema ? 'Copiado' : 'Copiar Schema'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 border border-slate-800 rounded-lg text-xs text-emerald-400 font-mono overflow-x-auto leading-relaxed">
            {responseSchemaDoc}
          </pre>
        </div>
      </div>
    </div>
  );
};
