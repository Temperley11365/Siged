import React, { useState, useRef } from 'react';
import { DocumentoEstudio, PlantillaDocx, Expediente } from '../types';
import { Folder, FileText, Download, Eye, FileCheck, Plus, Sparkles, Copy, FileCode, Edit3, ShieldCheck, UploadCloud, Paperclip, CheckCircle2 } from 'lucide-react';
import { copiarTextoConFormatoSiged, descargarDocxFormatoSiged } from '../utils/exportUtils';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editor State
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<PlantillaDocx | null>(plantillas[0] || null);
  const [expedienteAsociado, setExpedienteAsociado] = useState<Expediente | null>(expedientes[0] || null);
  const [tituloEditor, setTituloEditor] = useState(plantillas[0]?.nombre || 'Nuevo Escrito Judicial');
  const [contenidoEditor, setContenidoEditor] = useState(plantillas[0]?.contenidoPlantilla || plantillas[0]?.contenidoDefault || '');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [copiadoExito, setCopiadoExito] = useState(false);
  const [guardadoExito, setGuardadoExito] = useState(false);
  const [notificacionAdjunto, setNotificacionAdjunto] = useState<string | null>(null);

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

  const handleNuevoDocumentoBlanco = () => {
    setPlantillaSeleccionada(null);
    setTituloEditor('Nuevo Escrito Judicial');
    if (expedienteAsociado) {
      setContenidoEditor(
        `SEÑOR/A JUEZ/A:\n\nEXPTE. N° ${expedienteAsociado.numero} - "${expedienteAsociado.caratula}"\nJuzgado: ${expedienteAsociado.juzgado}\n\nDr./Dra. en representación de la parte ${expedienteAsociado.cliente}, constituyendo domicilio procesal en autos, a V.S. respetuosamente me presento y digo:\n\nI.- OBJETO:\nQue por el presente escrito vengo a...\n\nII.- DERECHO:\n\nIII.- PETITORIO:\nPor todo lo expuesto a V.S. solicito:\n1) Se tenga por presentado el presente escrito en legal tiempo y forma.\n2) Oportunamente se haga lugar a lo peticionado.\n\nPROVEER DE CONFORMIDAD,\nSERÁ JUSTICIA.`
      );
    } else {
      setContenidoEditor(
        `SEÑOR/A JUEZ/A:\n\nEn autos caratulados:\n\nI.- OBJETO:\nQue por el presente escrito vengo a...\n\nII.- PETITORIO:\nPROVEER DE CONFORMIDAD,\nSERÁ JUSTICIA.`
      );
    }
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

  // Upload Word / PDF / TXT File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let tipoArchivo: 'pdf' | 'docx' | 'doc' | 'txt' = 'docx';
      if (extension === 'pdf') tipoArchivo = 'pdf';
      else if (extension === 'doc') tipoArchivo = 'doc';
      else if (extension === 'txt') tipoArchivo = 'txt';
      else if (extension === 'docx') tipoArchivo = 'docx';

      const tamanioStr = (file.size / 1024).toFixed(1) + ' KB';
      const targetExpteId = expedienteAsociado?.id || (carpetaSeleccionada !== 'todas' && carpetaSeleccionada !== 'MODELOS_GLOBALES' ? carpetaSeleccionada : undefined);

      const reader = new FileReader();

      if (tipoArchivo === 'txt') {
        reader.onload = (event) => {
          const texto = event.target?.result as string;
          const nuevoDoc: DocumentoEstudio = {
            id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            nombre: file.name,
            expediente_id: targetExpteId,
            carpeta: targetExpteId || (carpetaSeleccionada !== 'todas' ? carpetaSeleccionada : 'MODELOS_GLOBALES'),
            tipoArchivo: tipoArchivo,
            tamanio: tamanioStr,
            fecha_modificacion: new Date().toISOString().split('T')[0],
            autor: 'Estudio Jurídico',
            contenidoTexto: texto,
            contenidoSimulado: texto,
          };
          onGuardarDocumento(nuevoDoc);
          setNotificacionAdjunto(`Documento "${file.name}" adjuntado con éxito.`);
          setTimeout(() => setNotificacionAdjunto(null), 3500);
        };
        reader.readAsText(file);
      } else {
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const nuevoDoc: DocumentoEstudio = {
            id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            nombre: file.name,
            expediente_id: targetExpteId,
            carpeta: targetExpteId || (carpetaSeleccionada !== 'todas' ? carpetaSeleccionada : 'MODELOS_GLOBALES'),
            tipoArchivo: tipoArchivo,
            tamanio: tamanioStr,
            fecha_modificacion: new Date().toISOString().split('T')[0],
            autor: 'Estudio Jurídico',
            fileDataUrl: dataUrl,
            contenidoSimulado: `Archivo adjunto "${file.name}" en formato ${tipoArchivo.toUpperCase()} (${tamanioStr}). Almacenado en la base de documentos del expediente.`,
          };
          onGuardarDocumento(nuevoDoc);
          setNotificacionAdjunto(`Documento "${file.name}" (${tipoArchivo.toUpperCase()}) adjuntado con éxito.`);
          setTimeout(() => setNotificacionAdjunto(null), 3500);
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGuardarEditorEnEstudio = () => {
    if (!tituloEditor.trim()) return;

    const targetExpteId = expedienteAsociado?.id || (carpetaSeleccionada !== 'todas' && carpetaSeleccionada !== 'MODELOS_GLOBALES' ? carpetaSeleccionada : undefined);

    const nuevoDoc: DocumentoEstudio = {
      id: `DOC-${Date.now()}`,
      nombre: tituloEditor.endsWith('.docx') ? tituloEditor : `${tituloEditor}.docx`,
      expediente_id: targetExpteId,
      carpeta: targetExpteId || (carpetaSeleccionada !== 'todas' ? carpetaSeleccionada : 'MODELOS_GLOBALES'),
      tipoArchivo: 'docx',
      tamanio: `${(contenidoEditor.length / 1024).toFixed(1)} KB`,
      fecha_modificacion: new Date().toISOString().split('T')[0],
      autor: 'Estudio Jurídico',
      contenidoTexto: contenidoEditor,
      contenidoSimulado: contenidoEditor,
    };

    onGuardarDocumento(nuevoDoc);
    setGuardadoExito(true);
    setTimeout(() => setGuardadoExito(false), 3000);
  };

  const handleCopiarFormatoSiged = async () => {
    const ok = await copiarTextoConFormatoSiged(contenidoEditor);
    if (ok) {
      setCopiadoExito(true);
      setTimeout(() => setCopiadoExito(false), 2500);
    }
  };

  // NATIVE DOCX GENERATION USING `docx` LIBRARY WITH SIGED JUDICIAL MARGINS
  const handleDescargarDocxNativo = async () => {
    setIsExportingDocx(true);
    try {
      await descargarDocxFormatoSiged(contenidoEditor, tituloEditor);
    } catch (err) {
      console.error('Error generando archivo .docx:', err);
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
      {/* Hidden File Input for Word / PDF */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        multiple
        className="hidden"
      />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight uppercase text-slate-100 flex items-center space-x-2">
              <Folder className="w-5 h-5 text-blue-500" />
              <span>Gestor de Documentos & Editor Colaborativo .docx</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Adjunte escritos en Word (.docx, .doc) o PDF, organice carpetas por causa y redacte nuevos escritos con el editor procesal integrado.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-2 shadow-md shadow-blue-950/50 transition-all cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
              <span>Adjuntar Escrito (Word / PDF)</span>
            </button>

            <button
              onClick={handleNuevoDocumentoBlanco}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Redactar Documento</span>
            </button>
          </div>
        </div>

        {notificacionAdjunto && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificacionAdjunto}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Folders & Document Library (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Carpetas del Estudio
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-mono font-bold flex items-center space-x-1"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Subir Archivos</span>
              </button>
            </div>

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
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Documentos ({documentosFiltrados.length})
              </h3>
              <span className="text-[10px] font-mono text-slate-500">PDF, Word, TXT</span>
            </div>

            {documentosFiltrados.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
                No hay documentos en esta carpeta.
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 block mx-auto text-blue-400 hover:underline font-bold"
                >
                  + Adjuntar archivo Word o PDF
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {documentosFiltrados.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <FileText className={`w-4 h-4 shrink-0 ${doc.tipoArchivo === 'pdf' ? 'text-red-400' : 'text-blue-400'}`} />
                      <div className="truncate">
                        <strong className="text-slate-200 block truncate">{doc.nombre}</strong>
                        <span className="text-[10px] font-mono text-slate-500">
                          {doc.tipoArchivo.toUpperCase()} • {doc.tamanio} • {doc.fecha_modificacion}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {doc.contenidoTexto && (
                        <button
                          onClick={() => {
                            setTituloEditor(doc.nombre);
                            setContenidoEditor(doc.contenidoTexto || '');
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-[10px] font-mono"
                          title="Cargar en editor"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setDocPreview(doc)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                        title="Vista previa"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor .docx & Templates (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-blue-500" />
                <span>Editor de Escritos Procesales (.docx)</span>
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleGuardarEditorEnEstudio}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/40 text-white rounded text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors shadow-md shadow-emerald-950/40"
                  title="Guarda este escrito en la carpeta de documentos del estudio"
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>{guardadoExito ? '✓ ¡Guardado en Documentos!' : 'Guardar en Estudio'}</span>
                </button>

                <button
                  onClick={handleCopiarFormatoSiged}
                  className="px-3 py-1.5 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/40 text-blue-300 rounded text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors"
                  title="Copia el escrito al portapapeles conservando márgenes de 5cm, Times New Roman 12pt e interlineado 1.5 para pegar en SIGED"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>{copiadoExito ? '¡Copiado!' : 'Copiar Formato SIGED'}</span>
                </button>

                <button
                  onClick={handleDescargarDocxNativo}
                  disabled={isExportingDocx}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono font-bold flex items-center space-x-1 shadow-md"
                  title="Descarga documento .docx con formato judicial"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingDocx ? 'Generando...' : 'Descargar .docx'}</span>
                </button>
              </div>
            </div>

            {/* Template Selector & Expediente Binding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Cargar Modelo de Escrito:</label>
                <select
                  onChange={(e) => {
                    const p = plantillas.find((pl) => pl.id === e.target.value);
                    if (p) handleAplicarPlantilla(p);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                >
                  <option value="">Seleccionar plantilla procesal...</option>
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
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-bold focus:ring-1 focus:ring-blue-500 font-mono"
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

            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between flex-wrap gap-2">
              <span>Variables automáticas: {'{NUMERO_EXPTE}'}, {'{CARATULA}'}, {'{JUZGADO}'}, {'{CLIENTE}'}</span>
              <span>Formato OpenXML Compliant (.docx) • Márgenes Judiciales 5cm</span>
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
              {docPreview.contenidoSimulado || docPreview.contenidoTexto || 'Documento adjunto guardado en el repositorio del estudio.'}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">
                Tipo: {docPreview.tipoArchivo.toUpperCase()} • Tamaño: {docPreview.tamanio}
              </div>
              <div className="flex items-center space-x-2">
                {docPreview.fileDataUrl && (
                  <a
                    href={docPreview.fileDataUrl}
                    download={docPreview.nombre}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase text-[10px] font-mono flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Archivo</span>
                  </a>
                )}
                <button
                  onClick={() => setDocPreview(null)}
                  className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded font-bold uppercase text-[10px]"
                >
                  Cerrar Visor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
