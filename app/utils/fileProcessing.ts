import { upload } from '@vercel/blob/client';

export async function calculateSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function checkFileExists(hash: string) {
  const checkResponse = await fetch('/api/check-hash', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hash }),
  });

  if (!checkResponse.ok) {
    throw new Error('Failed to check file hash');
  }

  return checkResponse.json();
}

export async function uploadFile(hash: string, file: File, onProgress?: (progress: number) => void) {
  const blob = await upload(`${hash}-${file.name}`, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    onUploadProgress: onProgress ? (progressEvent: { loaded: number; total: number }) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 100;
      onProgress(Math.round(progress));
    } : undefined,
  });

  if (!blob?.url) {
    throw new Error('Failed to upload file');
  }

  return blob;
}

export async function processAudioFile(audioUrl: string, hash: string) {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      audioUrl,
      hash,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Processing failed: ${errorData}`);
  }

  return response.json();
}
