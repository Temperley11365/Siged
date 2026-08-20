import React from 'react';
import { AuthScreen } from './AuthScreen';
import { Abogado } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (abogado: Abogado) => void;
  abogadosExistentes: Abogado[];
  abogadoActual?: Abogado | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  abogadosExistentes,
  abogadoActual,
}) => {
  if (!isOpen) return null;

  return (
    <AuthScreen
      onLoginSuccess={onLoginSuccess}
      abogadosExistentes={abogadosExistentes}
      abogadoActual={abogadoActual}
      isModal={true}
      onClose={onClose}
    />
  );
};
