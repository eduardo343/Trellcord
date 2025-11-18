import { Attachment, User } from '../types';

export interface FileUploadResult {
  success: boolean;
  attachment?: Attachment;
  error?: string;
}

export class FileUploadManager {
  private static instance: FileUploadManager;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = [
    // Imágenes
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Archivos de texto
    'text/plain',
    'text/csv',
    'text/html',
    'application/json',
    // Archivos comprimidos
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ];

  private constructor() {}

  public static getInstance(): FileUploadManager {
    if (!FileUploadManager.instance) {
      FileUploadManager.instance = new FileUploadManager();
    }
    return FileUploadManager.instance;
  }

  /**
   * Valida el tamaño del archivo
   */
  private validateFileSize(file: File): boolean {
    return file.size <= this.MAX_FILE_SIZE;
  }

  /**
   * Valida el tipo de archivo
   */
  private validateFileType(file: File): boolean {
    return this.ALLOWED_TYPES.includes(file.type);
  }

  /**
   * Convierte un archivo a Base64 para almacenarlo en IndexedDB
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Genera un ID único para el archivo
   */
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Procesa y sube un archivo
   */
  async uploadFile(
    file: File,
    uploadedBy: User,
    cardId?: string,
    commentId?: string
  ): Promise<FileUploadResult> {
    try {
      // Validar tamaño
      if (!this.validateFileSize(file)) {
        return {
          success: false,
          error: `El archivo es demasiado grande. Tamaño máximo: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
        };
      }

      // Validar tipo
      if (!this.validateFileType(file)) {
        return {
          success: false,
          error: 'Tipo de archivo no permitido'
        };
      }

      // Convertir archivo a base64
      const base64Data = await this.fileToBase64(file);

      // Crear objeto de adjunto
      const attachment: Omit<Attachment, 'id' | 'uploadedAt'> = {
        filename: file.name,
        url: base64Data, // En producción, esto sería una URL de un servicio de almacenamiento
        size: file.size,
        mimeType: file.type,
        uploadedBy: uploadedBy,
        cardId,
        commentId
      };

      console.log(`✅ Archivo procesado: ${file.name} (${this.formatFileSize(file.size)})`);

      return {
        success: true,
        attachment: {
          ...attachment,
          id: this.generateFileId(),
          uploadedAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al subir archivo'
      };
    }
  }

  /**
   * Procesa múltiples archivos
   */
  async uploadMultipleFiles(
    files: File[],
    uploadedBy: User,
    cardId?: string,
    commentId?: string
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadFile(file, uploadedBy, cardId, commentId);
      results.push(result);
    }

    return results;
  }

  /**
   * Verifica si un archivo es una imagen
   */
  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Obtiene el ícono apropiado basado en el tipo de archivo
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '🗜️';
    if (mimeType.startsWith('text/')) return '📃';
    return '📎';
  }

  /**
   * Formatea el tamaño del archivo para mostrarlo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Descarga un archivo desde base64
   */
  downloadFile(attachment: Attachment): void {
    try {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`📥 Descargando archivo: ${attachment.filename}`);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  /**
   * Crea una vista previa de la imagen si es posible
   */
  canPreview(mimeType: string): boolean {
    return this.isImage(mimeType) || mimeType === 'application/pdf';
  }
}

export default FileUploadManager.getInstance();
