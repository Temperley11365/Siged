import { BackupSnapshot } from '../types';

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

export const GOOGLE_CLOUD_PROJECT_ID = 'gen-lang-client-0255089972';
export const GOOGLE_CLOUD_PROJECT_NAME = 'SIGED Misiones - Kairós Legal Cloud';

export const OAUTH_CLIENT_ID = '336926638781-fgkq987508t8rddrl6e0qms3s56993fk.apps.googleusercontent.com';

export interface GoogleDriveFileMeta {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  description?: string;
  webViewLink?: string;
}

export interface GoogleDriveAuthResult {
  accessToken: string;
  expiresIn?: number;
  email?: string;
}

/**
 * Verifica si existe un token de acceso válido de Google Drive en la sesión
 */
export function estaAutenticadoConGoogleDrive(): boolean {
  const tokenGuardado = sessionStorage.getItem('gdrive_access_token');
  const tokenExpira = sessionStorage.getItem('gdrive_token_exp');
  if (tokenGuardado && tokenExpira) {
    return Date.now() < parseInt(tokenExpira, 10);
  }
  return false;
}

/**
 * Retorna el email del usuario conectado a Google Drive si existe
 */
export function obtenerEmailGoogleDriveConectado(): string | null {
  return sessionStorage.getItem('gdrive_user_email');
}

/**
 * Retorna el token actual si está activo
 */
export function obtenerTokenGoogleDriveActivo(): string | null {
  if (estaAutenticadoConGoogleDrive()) {
    return sessionStorage.getItem('gdrive_access_token');
  }
  return null;
}

/**
 * Solicita autorización de OAuth2 Client de Google para Drive
 * vinculando directamente la cuenta del usuario registrado.
 */
export async function conectarGoogleDriveOAuth(userEmail?: string): Promise<GoogleDriveAuthResult> {
  return new Promise((resolve, reject) => {
    // Si ya tenemos token en sessionStorage válido
    const tokenGuardado = sessionStorage.getItem('gdrive_access_token');
    const tokenExpira = sessionStorage.getItem('gdrive_token_exp');
    if (tokenGuardado && tokenExpira && Date.now() < parseInt(tokenExpira, 10)) {
      if (userEmail) {
        sessionStorage.setItem('gdrive_user_email', userEmail);
      }
      resolve({ 
        accessToken: tokenGuardado,
        email: userEmail || sessionStorage.getItem('gdrive_user_email') || undefined
      });
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      // Cargar script dinámicamente si no existe
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        iniciarOAuthPrompt(resolve, reject, userEmail);
      };
      script.onerror = () => {
        reject(new Error('No se pudo cargar el cliente de autenticación de Google Identity Services.'));
      };
      document.body.appendChild(script);
    } else {
      iniciarOAuthPrompt(resolve, reject, userEmail);
    }
  });
}

function iniciarOAuthPrompt(
  resolve: (val: GoogleDriveAuthResult) => void, 
  reject: (err: any) => void,
  userEmail?: string
) {
  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: OAUTH_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file',
      hint: userEmail,
      login_hint: userEmail,
      callback: (response: any) => {
        if (response.error !== undefined) {
          reject(response);
          return;
        }
        const accessToken = response.access_token;
        const expiresInMs = (response.expires_in ? parseInt(response.expires_in, 10) : 3600) * 1000;
        sessionStorage.setItem('gdrive_access_token', accessToken);
        sessionStorage.setItem('gdrive_token_exp', String(Date.now() + expiresInMs));
        if (userEmail) {
          sessionStorage.setItem('gdrive_user_email', userEmail);
        }
        resolve({ accessToken, expiresIn: expiresInMs, email: userEmail });
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent', hint: userEmail });
  } catch (e) {
    reject(e);
  }
}

/**
 * Desconectar cuenta de Google Drive
 */
export function desconectarGoogleDrive() {
  sessionStorage.removeItem('gdrive_access_token');
  sessionStorage.removeItem('gdrive_token_exp');
  sessionStorage.removeItem('gdrive_user_email');
}

/**
 * Busca o crea la carpeta de respaldos del proyecto en Google Drive del usuario
 */
export async function obtenerOCrearCarpetaDrive(accessToken: string, folderName?: string): Promise<string> {
  const nombreCarpeta = folderName || 'Kairós Legal - SIGED Misiones';
  try {
    // 1. Buscar si ya existe la carpeta
    const query = encodeURIComponent(`name = '${nombreCarpeta}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // 2. Crear carpeta si no existe
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: nombreCarpeta,
        mimeType: 'application/vnd.google-apps.folder',
        description: `Carpeta segura de respaldos - Proyecto SIGED Misiones (Google Cloud ID: ${GOOGLE_CLOUD_PROJECT_ID})`,
      }),
    });

    if (createRes.ok) {
      const folderData = await createRes.json();
      return folderData.id;
    }
  } catch (e) {
    console.error('Error buscando/creando carpeta en Google Drive:', e);
  }
  return 'root';
}

/**
 * Sube un snapshot de respaldo del proyecto al Google Drive del usuario
 */
export async function subirSnapshotAGoogleDrive(
  snapshot: BackupSnapshot, 
  accessToken: string,
  userEmail?: string
): Promise<{ exito: boolean; fileId?: string; webViewLink?: string; error?: string }> {
  try {
    const folderId = await obtenerOCrearCarpetaDrive(accessToken, 'Kairós Legal - SIGED Misiones');
    const sanitizedName = snapshot.autorNombre.replace(/\s+/g, '_').toLowerCase();
    const dateStr = snapshot.fechaIso.split('T')[0];
    const timeStr = snapshot.fechaIso.split('T')[1].replace(/:/g, '-').slice(0, 5);
    const fileName = `respaldo_siged_${sanitizedName}_${dateStr}_${timeStr}.json`;

    const metadata = {
      name: fileName,
      description: `Copia de Seguridad del Proyecto SIGED Misiones - Titular: ${snapshot.autorNombre} (${userEmail || snapshot.autorMatricula})`,
      mimeType: 'application/json',
      parents: [folderId],
      properties: {
        kairosSnapshotId: snapshot.id,
        fechaIso: snapshot.fechaIso,
        autor: snapshot.autorNombre,
        titularEmail: userEmail || '',
        googleCloudProject: GOOGLE_CLOUD_PROJECT_ID,
        sistemaDestino: 'SIGED Misiones - Kairós Legal',
        totalExpedientes: String(snapshot.estadisticas.totalExpedientes),
        totalActuaciones: String(snapshot.estadisticas.totalActuaciones),
      },
    };

    const fileContent = JSON.stringify(snapshot, null, 2);
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { exito: true, fileId: data.id, webViewLink: data.webViewLink };
    } else {
      const errData = await response.text();
      return { exito: false, error: `Error de Google Drive API: ${errData}` };
    }
  } catch (error: any) {
    return { exito: false, error: error?.message || 'Fallo de red al sincronizar con Google Drive.' };
  }
}

/**
 * Lista los respaldos disponibles en la carpeta de Google Drive del usuario
 */
export async function listarRespaldosGoogleDrive(accessToken: string): Promise<GoogleDriveFileMeta[]> {
  try {
    const query = encodeURIComponent(`(name contains 'respaldo_siged_' or name contains 'respaldo_kairos_') and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,mimeType,createdTime,modifiedTime,size,description,webViewLink)&pageSize=30`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      return data.files || [];
    }
  } catch (e) {
    console.error('Error listando archivos de Google Drive:', e);
  }
  return [];
}

/**
 * Descarga y parsea un snapshot guardado en Google Drive para restaurar
 */
export async function descargarSnapshotDeDrive(fileId: string, accessToken: string): Promise<BackupSnapshot> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('No se pudo descargar el archivo de respaldo desde Google Drive.');
  }

  const json = await res.json();
  return json as BackupSnapshot;
}
