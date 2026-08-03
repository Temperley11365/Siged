import React, { useState } from 'react';
import { HOLIDAYS_MISIONES_2026, calcularVencimientoMisiones, isHabilJudicial, formatFechaEsp } from '../lib/misionesCalendar';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Info, Sparkles } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const [fechaNotif, setFechaNotif] = useState(new Date().toISOString().split('T')[0]);
  const [plazoDias, setPlazoDias] = useState<number>(5);
  const [tipoPlazo, setTipoPlazo] = useState<'hábiles' | 'corridos'>('hábiles');

  const resultadoCalc = calcularVencimientoMisiones(fechaNotif, plazoDias, tipoPlazo);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight uppercase text-slate-100 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Calculador de Días Hábiles Judiciales <span className="text-blue-500 italic">(Poder Judicial Misiones)</span></span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Conforme el Código Procesal Civil y Comercial de Misiones (CPCCyM), Ley Orgánica Judicial y Art. 124 (Plazo de Gracia).
            </p>
          </div>
          <span className="text-[10px] font-mono bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded border border-blue-500/30 uppercase font-bold tracking-widest shrink-0">
            CPCCyM • Misiones
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 pb-2 border-b border-slate-800 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Simulador de Vencimientos</span>
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Fecha de Notificación (Cédula/SIGED)</label>
            <input
              type="date"
              value={fechaNotif}
              onChange={(e) => setFechaNotif(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              * El cómputo del plazo inicia el primer día hábil posterior a la notificación.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Cantidad de Días</label>
              <input
                type="number"
                min={1}
                max={90}
                value={plazoDias}
                onChange={(e) => setPlazoDias(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tipo de Plazo</label>
              <select
                value={tipoPlazo}
                onChange={(e) => setTipoPlazo(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 font-mono"
              >
                <option value="hábiles">Días Hábiles Judiciales</option>
                <option value="corridos">Días Corridos</option>
              </select>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase font-bold tracking-widest">Plazos Frecuentes CPCCyM:</label>
            <div className="flex flex-wrap gap-1.5">
              {[3, 5, 10, 15].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setPlazoDias(d)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded transition-colors ${
                    plazoDias === d
                      ? 'bg-blue-600 text-white border border-blue-500'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {d} Días
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Breakdown Result (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 pb-2 border-b border-slate-800">
            Desglose del Cómputo de Plazo
          </h3>

          <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">FECHA DE NOTIFICACIÓN:</span>
              <span className="text-xs font-bold text-blue-400 font-mono">{fechaNotif}</span>
            </div>

            <div className="p-4 bg-slate-800 rounded-lg border-l-4 border-amber-500 space-y-3">
              <div className="text-xs text-amber-300">
                <strong className="text-amber-400 font-bold uppercase text-[10px] tracking-widest block mb-1">📅 Vencimiento Principal:</strong>
                <span className="text-sm font-bold text-white font-mono">{resultadoCalc.vencimientoFechaStr}</span>
              </div>

              <div className="text-xs text-emerald-300 border-t border-slate-700/80 pt-2">
                <strong className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest block mb-1">
                  ⏰ Plazo de Gracia (Art. 124 CPCCyM Misiones):
                </strong>
                <span className="text-xs text-slate-200 font-mono">{resultadoCalc.vencimientoGraciaStr}</span>
              </div>
            </div>

            {/* Daily breakdown */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Días Hábiles Contados:</span>
              <div className="space-y-1">
                {resultadoCalc.diasHabilesDesglosados.map((dh, i) => (
                  <div key={i} className="text-xs bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-slate-300 font-mono flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{dh}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 leading-relaxed flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Nota sobre Plazo de Gracia Misiones:</strong>
              En los tribunales de la Provincia de Misiones, el escrito no presentado dentro del horario judicial del día en que venciera un plazo, podrá ser entregado válidamente el día hábil inmediato posterior dentro de las <strong className="text-slate-200">dos primeras horas del despacho</strong> (Art. 124 CPCCyM).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
