import React, { useEffect } from 'react';
import { Zap, ExternalLink, X, FileText, AlertCircle, ArrowRight, CheckCircle, Scale } from 'lucide-react';
import { NotificacionPushSiged } from '../types';

interface NotificacionToastPopupProps {
  popups: NotificacionPushSiged[];
  onDismiss: (id: string) => void;
  onMarcarLeida: (id: string) => void;
  onVerExpediente: (expedienteId: string) => void;
  onProcesarEnMotor: (actuacionId?: string) => void;
}

export const NotificacionToastPopup: React.FC<NotificacionToastPopupProps> = ({
  popups,
  onDismiss,
  onMarcarLeida,
  onVerExpediente,
  onProcesarEnMotor,
}) => {
  if (popups.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {popups.map((popup) => (
        <ToastItem
          key={popup.id}
          popup={popup}
          onDismiss={() => {
            onMarcarLeida(popup.id);
            onDismiss(popup.id);
          }}
          onVerExpediente={() => {
            onMarcarLeida(popup.id);
            onDismiss(popup.id);
            onVerExpediente(popup.expediente_id);
          }}
          onProcesarEnMotor={() => {
            onMarcarLeida(popup.id);
            onDismiss(popup.id);
            onProcesarEnMotor(popup.actuacion_id);
          }}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  popup: NotificacionPushSiged;
  onDismiss: () => void;
  onVerExpediente: () => void;
  onProcesarEnMotor: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  popup,
  onDismiss,
  onVerExpediente,
  onProcesarEnMotor,
}) => {
  // Auto dismiss after 10 seconds unless hovered
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 12000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getTipoStyle = () => {
    switch (popup.tipo) {
      case 'CEDULA':
        return {
          badgeBg: 'bg-blue-600/30 text-blue-300 border-blue-500/50',
          borderColor: 'border-blue-500',
          icon: <Zap className="w-4 h-4 text-blue-400" />,
        };
      case 'INTIMACION':
        return {
          badgeBg: 'bg-amber-600/30 text-amber-300 border-amber-500/50',
          borderColor: 'border-amber-500',
          icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
        };
      case 'RESOLUCION':
        return {
          badgeBg: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50',
          borderColor: 'border-emerald-500',
          icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
        };
      default:
        return {
          badgeBg: 'bg-purple-600/30 text-purple-300 border-purple-500/50',
          borderColor: 'border-purple-500',
          icon: <Scale className="w-4 h-4 text-purple-400" />,
        };
    }
  };

  const style = getTipoStyle();

  return (
    <div className="pointer-events-auto bg-slate-900 border-2 border-slate-700/90 rounded-2xl shadow-2xl p-4 text-slate-100 font-mono text-xs transition-all transform animate-in slide-in-from-bottom-5 duration-300 relative overflow-hidden backdrop-blur-md">
      {/* Top accent border line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.borderColor.replace('border-', 'from-')}-500 to-blue-600`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
            {style.icon}
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${style.badgeBg}`}>
              {popup.tipo} SIGED
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{popup.fecha.substring(11, 16)} hs</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          title="Cerrar notificación emergente"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Expediente details */}
      <div className="space-y-1 my-2">
        <h4 className="font-bold text-slate-100 text-xs leading-snug">{popup.titulo}</h4>
        <div className="text-[11px] text-blue-400 font-bold truncate">
          Expte: {popup.expediente_numero}
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
          {popup.mensaje}
        </p>
      </div>

      {/* Action Buttons inside Popup */}
      <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80 mt-3">
        <button
          onClick={onVerExpediente}
          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 border border-slate-700 transition-colors"
        >
          <FileText className="w-3 h-3 text-blue-400" />
          <span>Ver Expediente</span>
        </button>

        <button
          onClick={onProcesarEnMotor}
          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 shadow transition-colors"
        >
          <span>Analizar IA</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
