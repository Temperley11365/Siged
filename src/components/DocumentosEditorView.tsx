import React, { useState } from 'react';
import { DocumentoEstudio, PlantillaDocx, Expediente } from '../types';
import { Folder, FileText, Download, Eye, FileCheck, Plus, Sparkles, Copy, FileCode, Edit3 } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

interface DocumentosEditorViewProps {
  documentos: DocumentoEstudio[];
  plantillas: PlantillaDocx[];
  expedientes: Expediente[];
  onGuardarDocumento: (doc: DocumentoEstudio) => void;
}

export const DocumentosEditorView: React.FC<DocumentosEditorViewProps> = ({
  documentos,
  plantillas,
  expedientes,
  onGuardarDocumento,
}) => {
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState<string>('todas');
  const [docPreview, setDocPreview] = useState<DocumentoEstudio | null>(null);

  // Editor State
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<PlantillaDocx | null>(plantillas[0] || null);
  const [expedienteAsociado, setExpedienteAsociado] = useState<Expediente | null>(expedientes[0] || null);
  const [tituloEditor, setTituloEditor] = useState(plantillas[0]?.nombre || 'Nuevo Escrito Judicial');
  const [contenidoEditor, setContenidoEditor] = useState(plantillas[0]?.contenidoPlantilla || plantillas[0]?.contenidoDefault || '');
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Filter docs by folder
  const documentosFiltrados = documentos.filter((d) => {
    if (carpetaSeleccionada === 'todas') return true;
    return d.carpeta === carpetaSeleccionada || d.expediente_id === carpetaSeleccionada;
  });

  // Apply template & replace variables
  const handleAplicarPlantilla = (p: PlantillaDocx) => {
    setPlantillaSeleccionada(p);
    setTituloEditor(p.nombre);
    let txt = p.contenidoPlantilla || p.contenidoDefault || '';

    if (expedienteAsociado) {
      txt = txt
        .replace(/{NUMERO_EXPTE}/g, expedienteAsociado.numero)
        .replace(/{CARATULA}/g, expedienteAsociado.caratula)
        .replace(/{JUZGADO}/g, expedienteAsociado.juzgado)
        .replace(/{CLIENTE}/g, expedienteAsociado.cliente)
        .replace(/{CIRCUNSCRIPCION}/g, expedienteAsociado.circunscripcion)
        .replace(/{LETRADO_PATRO}/g, expedienteAsociado.letrado_patrocinante);
    }
    setContenidoEditor(txt);
  };

  const handleCambiarExpediente = (expId: string) => {
    const exp = expedientes.find((e) => e.id === expId) || null;
    setExpedienteAsociado(exp);
    if (exp && plantillaSeleccionada) {
      const baseContent = plantillaSeleccionada.contenidoPlantilla || plantillaSeleccionada.contenidoDefault || '';
      let txt = baseContent
        .replace(/{NUMERO_EXPTE}/g, exp.numero)
        .replace(/{CARATULA}/g, exp.caratula)
        .replace(/{JUZGADO}/g, exp.juzgado)
        .replace(/{CLIENTE}/g, exp.cliente)
        .replace(/{CIRCUNSCRIPCION}/g, exp.circunscripcion)
        .replace(/{LETRADO_PATRO}/g, exp.letrado_patrocinante);
      setContenidoEditor(txt);
    }
  };

  // NATIVE DOCX GENERATION USING `docx` LIBRARY
  const handleDescargarDocxNativo = async () => {
    setIsExportingDocx(true);
    try {
      const lineas = contenidoEditor.split('\n');

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: lineas.map((linea) => {
              const trimmed = linea.trim();
              if (trimmed.startsWith('PROVEER DE CONFORMIDAD') || trimmed.startsWith('SERA JUSTICIA')) {
                return new Paragraph({
                  children: [new TextRun({ text: trimmed, bold: true, font: 'Times New Roman', size: 24 })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                });
              }

              if (trimmed === trimmed.toUpperCase() && trimmed.length > 5 && !trimmed.includes('.')) {
                return new Paragraph({
                  children: [new TextRun({ text: trimmed, bold: true, font: 'Times New Roman', size: 26 })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 140, after: 140 },
                });
              }

              return new Paragraph({
                children: [new TextRun({ text: linea, font: 'Times New Roman', size: 24 })],
                spacing: { line: 360, after: 120 }, // 1.5 line spacing
              });
            }),
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tituloEditor.replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando archivo .docx:', err);
      // Fallback text download
      const blob = new Blob([contenidoEditor], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tituloEditor}.doc`;
      a.click();
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDescargarTxt = () => {
    const blob = new Blob([contenidoEditor], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tituloEditor}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight uppercase text-slate-100 flex items-center space-x-2">
              <Folder className="w-5 h-5 text-blue-500" />
              <span>Gestor de Documentos & Editor Colaborativo .docx</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Organización por carpetas de causa, visor de cédulas PDF firmadas y generador de escritos procesales en formato nativo OpenXML (.docx).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Folders & Document Library (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
              Carpetas del Estudio
            </h3>

            <div className="space-y-1 text-xs font-mono">
              <button
                onClick={() => setCarpetaSeleccionada('todas')}
                className={`w-full text-left px-3 py-2 rounded flex items-center justify-between ${
                  carpetaSeleccionada === 'todas'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-950'
                }`}
              >
                <span>📂 Todos los Archivos</span>
                <span>{documentos.length}</span>
              </button>

              <button
                onClick={() => setCarpetaSeleccionada('MODELOS_GLOBALES')}
                className={`w-full text-left px-3 py-2 rounded flex items-center justify-between ${
                  carpetaSeleccionada === 'MODELOS_GLOBALES'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-950'
                }`}
              >
                <span>📁 Modelos y Jurisprudencia</span>
                <span>{documentos.filter((d) => d.carpeta === 'MODELOS_GLOBALES').length}</span>
              </button>

              {expedientes.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => setCarpetaSeleccionada(exp.id)}
                  className={`w-full text-left px-3 py-2 rounded flex items-center justify-between truncate ${
                    carpetaSeleccionada === exp.id
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold'
                      : 'text-slate-400 hover:bg-slate-950'
                  }`}
                >
                  <span className="truncate">📁 {exp.numero} - {exp.cliente}</span>
                  <span className="ml-2 shrink-0">
                    {documentos.filter((d) => d.expediente_id === exp.id || d.carpeta === exp.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Files List */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Documentos ({documentosFiltrados.length})
            </h3>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {documentosFiltrados.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="truncate">
                      <strong className="text-slate-200 block truncate">{doc.nombre}</strong>
                      <span className="text-[10px] font-mono text-slate-500">{doc.tamanio} • {doc.fecha_modificacion}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDocPreview(doc)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                    title="Vista previa"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Editor .docx & Templates (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-blue-500" />
                <span>Editor de Escritos & Generador .docx NATIVO</span>
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDescargarTxt}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono font-bold flex items-center space-x-1"
                >
                  <span>Exportar .txt</span>
                </button>

                <button
                  onClick={handleDescargarDocxNativo}
                  disabled={isExportingDocx}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold flex items-center space-x-1 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingDocx ? 'Generando...' : 'Descargar .docx'}</span>
                </button>
              </div>
            </div>

            {/* Template Selector & Expediente Binding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Cargar Plantilla Misiones:</label>
                <select
                  onChange={(e) => {
                    const p = plantillas.find((pl) => pl.id === e.target.value);
                    if (p) handleAplicarPlantilla(p);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                >
                  {plantillas.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.categoria})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Vincular Causa para Autocompletar:</label>
                <select
                  value={expedienteAsociado?.id || ''}
                  onChange={(e) => handleCambiarExpediente(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                >
                  {expedientes.map((e) => (
                    <option key={e.id} value={e.id}>{e.numero} - {e.caratula.substring(0, 30)}...</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Escrito Title Input */}
            <div>
              <input
                type="text"
                value={tituloEditor}
                onChange={(e) => setTituloEditor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-bold focus:ring-1 focus:ring-blue-500"
                placeholder="Título del escrito..."
              />
            </div>

            {/* Main Text Editor Area */}
            <div>
              <textarea
                rows={16}
                value={contenidoEditor}
                onChange={(e) => setContenidoEditor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-4 text-xs font-mono text-slate-200 leading-relaxed focus:ring-1 focus:ring-blue-500 shadow-inner"
              />
            </div>

            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Variables automáticas: {'{NUMERO_EXPTE}'}, {'{CARATULA}'}, {'{JUZGADO}'}, {'{CLIENTE}'}</span>
              <span>Formato OpenXML Compliant (.docx)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Preview Documento PDF */}
      {docPreview && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase">{docPreview.nombre}</h3>
              </div>
              <button onClick={() => setDocPreview(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
              {docPreview.contenidoSimulado || docPreview.contenidoTexto || 'Documento firmado digitalmente en el portal SIGED Misiones.'}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setDocPreview(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold uppercase text-[10px]"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
