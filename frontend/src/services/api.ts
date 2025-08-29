const API_BASE_URL = 'https://fileflow-ry6a.onrender.com';

// File size limit (49MB) - matches backend
const MAX_FILE_SIZE = 49 * 1024 * 1024;

export interface UploadResponse {
  ok: boolean;
  path: string;
  filename: string;
  original_name: string;
  size: number;
  content_type: string;
  public_url: string;
  share_url: string;
  share_id: string;
  upload_success: boolean;
}

export interface BatchUploadResponse {
  successful_uploads: UploadResponse[];
  failed_uploads: { filename: string; error: string }[];
  total_files: number;
  successful_count: number;
  failed_count: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  shareLink: string;
  uploadDate: Date;
  path?: string;
  shareId?: string;
}

export interface SharedFile {
  share_url: string;
  original_url: string;
  filename: string;
  created_at: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(files: File[]): Promise<BatchUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${this.baseUrl}/upload-multiple`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Batch upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Batch upload error:', error);
      throw error;
    }
  }

  async uploadMultipleFilesLegacy(files: File[]): Promise<UploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  // Generate a random ID for frontend use
  generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Check if files should use batch upload (more than 1 file)
  shouldUseBatchUpload(files: File[]): boolean {
    return files.length > 1;
  }

  // Validate file size
  validateFileSize(file: File): { isValid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return {
        isValid: false,
        error: `File "${file.name}" is ${sizeMB}MB. File size cannot be more than ${maxSizeMB}MB.`
      };
    }
    return { isValid: true };
  }

  // Validate multiple files and calculate total size
  validateFiles(files: File[]): { isValid: boolean; errors: string[]; totalSize: number } {
    const errors: string[] = [];
    let totalSize = 0;

    for (const file of files) {
      totalSize += file.size;
      const validation = this.validateFileSize(file);
      if (!validation.isValid && validation.error) {
        errors.push(validation.error);
      }
    }

    // Also check total size for folder uploads
    if (totalSize > MAX_FILE_SIZE) {
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
      const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      errors.push(`Total folder size is ${totalSizeMB}MB. Folder size cannot be more than ${maxSizeMB}MB.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalSize
    };
  }

  // Create file data structure for frontend
  createFileData(file: File, uploadResult?: UploadResponse): UploadedFile {
    return {
      id: this.generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      shareLink: uploadResult?.public_url || '',
      uploadDate: new Date(),
      path: uploadResult?.path,
      shareId: uploadResult?.share_id,
    };
  }

  // Create file data from batch upload results
  createFileDataFromBatch(files: File[], batchResult: BatchUploadResponse): UploadedFile[] {
    const uploadedFiles: UploadedFile[] = [];
    
    // Process successful uploads
    batchResult.successful_uploads.forEach(uploadResult => {
      const originalFile = files.find(f => f.name === uploadResult.original_name);
      if (originalFile) {
        uploadedFiles.push(this.createFileData(originalFile, uploadResult));
      }
    });
    
    // Process failed uploads (still create file data for UI consistency)
    batchResult.failed_uploads.forEach(failedUpload => {
      const originalFile = files.find(f => f.name === failedUpload.filename);
      if (originalFile) {
        uploadedFiles.push(this.createFileData(originalFile));
      }
    });
    
    return uploadedFiles;
  }

  async deleteFile(shareId: string): Promise<{ ok: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/delete/${shareId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  async getSharedFile(shareId: string): Promise<SharedFile> {
    try {
      const response = await fetch(`${this.baseUrl}/share/${shareId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('File not found or link has expired');
        }
        throw new Error(`Failed to load file information: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get shared file error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
