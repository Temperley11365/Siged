import React, { useState } from 'react';
import { 
  FileText, Users, DollarSign, Clock, Paperclip, ChevronRight, X, ShieldAlert, CheckCircle2, AlertCircle, Building, Landmark, Scale
} from 'lucide-react';
import { Expediente, DocumentoEstudio, PruebaExpediente, AudienciaExpediente } from '../types';

interface FichaExpedienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  expediente: Expediente | null;
  documentos: DocumentoEstudio[];
  pruebas: PruebaExpediente[];
  audiencias: AudienciaExpediente[];
}

export const FichaExpedienteModal: React.FC<FichaExpedienteModalProps> = ({
  isOpen,
  onClose,
  expediente,
  documentos,
  pruebas,
  audiencias,
}) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'partes' | 'movimientos' | 'financiero' | 'documentos'>('resumen');

  if (!isOpen || !expediente) return null;

  const docsCausa = documentos.filter((d) => d.expediente_id === expediente.id || d.carpeta === expediente.id);
  const pruebasCausa = pruebas.filter((p) => p.expediente_id === expediente.id);
  const audienciasCausa = audiencias.filter((a) => a.expediente_id === expediente.id);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-600/20 border border-blue-500/30 px-2.5 py-0.5 rounded">
                EXPTE N° {expediente.numero}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {expediente.circunscripcion}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-900/40 text-blue-300 border border-blue-700/50">
                {expediente.fuero}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-1 line-clamp-1">
              {expediente.caratula}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Header Navigation */}
        <div className="bg-slate-950/80 px-6 border-b border-slate-800 flex space-x-6 text-xs font-mono shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'resumen'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Resumen y Etapa</span>
          </button>
          <button
            onClick={() => setActiveTab('partes')}
            className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'partes'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Partes Intervinientes ({expediente.partes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('movimientos')}
            className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'movimientos'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Historial SIGED ({expediente.movimientos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('financiero')}
            className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'financiero'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Estado Financiero</span>
          </button>
          <button
            onClick={() => setActiveTab('documentos')}
            className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'documentos'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Documentos ({docsCausa.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              {/* Top Banner Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Etapa Procesal Actual</span>
                  <div className="text-sm font-bold text-blue-400 flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-blue-500" />
                    <span>{expediente.etapa_procesal}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Cliente Principal</span>
                  <div className="text-sm font-bold text-slate-200">
                    {expediente.cliente}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Estado Actual</span>
                  <div className="text-sm font-bold text-amber-400">
                    {expediente.estado}
                  </div>
                </div>
              </div>

              {/* General Info Grid */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">
                  Ficha Técnica de Radicación Judicial
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Juzgado de Radicación:</span>
                    <strong className="text-slate-200">{expediente.juzgado}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Circunscripción Judicial:</span>
                    <strong className="text-slate-200">{expediente.circunscripcion}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Fecha de Inicio de Causa:</span>
                    <strong className="text-slate-200">{expediente.fecha_inicio}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Letrado Patrocinante:</span>
                    <strong className="text-blue-400">{expediente.letrado_patrocinante}</strong>
                  </div>
                  {expediente.apoderado && (
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Apoderado Legal:</span>
                      <strong className="text-amber-400">{expediente.apoderado}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Pruebas & Audiencias Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Pruebas Ofrecidas ({pruebasCausa.length})
                  </span>
                  {pruebasCausa.length === 0 ? (
                    <p className="text-xs text-slate-500">Sin pruebas registradas.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {pruebasCausa.map((p) => (
                        <div key={p.id} className="text-xs bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300 truncate max-w-[200px]">{p.tipo}: {p.descripcion}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            p.semaforo === 'rojo' ? 'bg-red-950 text-red-400 border border-red-800' :
                            p.semaforo === 'amarillo' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {p.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Audiencias Programadas ({audienciasCausa.length})
                  </span>
                  {audienciasCausa.length === 0 ? (
                    <p className="text-xs text-slate-500">Sin audiencias vigentes.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {audienciasCausa.map((a) => (
                        <div key={a.id} className="text-xs bg-slate-900 p-2 rounded border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between font-mono text-blue-400">
                            <span>{a.tipo}</span>
                            <span className="text-slate-400">{a.fecha_hora}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 italic">{a.juzgado_sala}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'partes' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">
                Nómina de Partes Intervinientes en la Causa
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {expediente.partes.map((p) => (
                  <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{p.nombre}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold uppercase">
                        {p.rol}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 font-mono">
                      {p.dni_cuit && <div><span className="text-slate-500">DNI/CUIT:</span> {p.dni_cuit}</div>}
                      {p.domicilio_constituido && <div><span className="text-slate-500">Dom. Constituido:</span> {p.domicilio_constituido}</div>}
                      {p.letrado_patrocinante && <div><span className="text-slate-500">Patrocinante:</span> <span className="text-slate-200">{p.letrado_patrocinante}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'movimientos' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">
                Historial de Actuaciones y Notificaciones SIGED Misiones
              </h3>

              <div className="space-y-3">
                {expediente.movimientos.map((m) => (
                  <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-blue-400">{m.tipo}</span>
                      <span className="text-slate-500">{m.fecha}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{m.descripcion}</p>
                    <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-900 flex items-center justify-between">
                      <span>Firmante: {m.firmante}</span>
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Firma Digital SIGED OK</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'financiero' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">
                Estado Financiero, Tasas de Justicia y Caja Forense Misiones
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Honorarios Pactados / Regulados</span>
                  <div className="text-lg font-bold text-slate-100 font-mono">
                    $ {expediente.financiero.honorariosPactados.toLocaleString('es-AR')}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    Cobrado: $ {expediente.financiero.honorariosCobrados.toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Tasa de Justicia Misiones (1.5%)</span>
                  <div className="text-lg font-bold text-blue-400 font-mono">
                    $ {expediente.financiero.tasaDeJusticiaMisiones.toLocaleString('es-AR')}
                  </div>
                  <span className={`text-[10px] font-bold font-mono ${expediente.financiero.tasaJusticiaPagada ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {expediente.financiero.tasaJusticiaPagada ? '✓ TASA PAGADA EN DGR MISIONES' : '⚠️ PENDIENTE DE PAGO EN DGR'}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Saldo Pendiente Cliente</span>
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    $ {expediente.financiero.saldoPendiente.toLocaleString('es-AR')}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">Honorarios + Gastos</span>
                </div>
              </div>

              {/* Aportes breakdown */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
                  Desglose Previsional y Contributivo Misiones (Ley N° 3144 / Caja Forense)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Aportes Caja Forense Misiones:</span>
                    <span className="text-slate-200">$ {expediente.financiero.aportesCajaForense.toLocaleString('es-AR')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Aportes Colegio de Abogados (CADAM):</span>
                    <span className="text-slate-200">$ {expediente.financiero.aportesCajaAbogados.toLocaleString('es-AR')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Gastos de Diligenciamiento / Cédulas:</span>
                    <span className="text-slate-200">$ {expediente.financiero.gastosDiligenciamiento.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">
                Documentos y Escritos del Expediente
              </h3>

              {docsCausa.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  No hay archivos ni cédulas adjuntas para esta causa.
                </div>
              ) : (
                <div className="space-y-2">
                  {docsCausa.map((doc) => (
                    <div key={doc.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <Paperclip className="w-4 h-4 text-blue-400" />
                        <div>
                          <strong className="text-slate-200 block">{doc.nombre}</strong>
                          <span className="text-[11px] font-mono text-slate-500">
                            {doc.tamanio} • Modificado: {doc.fecha_modificacion} por {doc.autor}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                        {doc.tipoArchivo}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
          <span className="text-slate-400">Poder Judicial de Misiones • Sistema SIGED</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
