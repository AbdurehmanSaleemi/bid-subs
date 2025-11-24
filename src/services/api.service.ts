// API Base URL - Update this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface UploadResponse {
  file_id: string;
  filename: string;
  file_size_bytes: number;
  total_pages: number;
  upload_timestamp: string;
  storage_path: string;
}

export interface ProcessPageRequest {
  file_id: string;
  page_number: number;
  model_type: "electrical" | "fire_sprinkler" | "fire_alarm" | "mechanical" | "plumbing";
  include_raw_detections?: boolean;
}

export interface YOLODetection {
  class_name: string;
  confidence: number;
  bbox: number[];
  tile_index?: number;
}

export interface YOLOResults {
  total_detections: number;
  detections_by_class: Record<string, number>;
  confidence_stats: {
    mean: number;
    min: number;
    max: number;
  };
  all_detections?: YOLODetection[];
}

export interface GeminiAnalysis {
  formatted_output: string;
}

export interface ProcessPageResponse {
  file_id: string;
  page_number: number;
  total_tiles_processed: number;
  processing_time_seconds: number;
  yolo_results: YOLOResults;
  gemini_analysis: GeminiAnalysis;
  status: string;
}

export interface FileInfo {
  file_id: string;
  filename: string;
  num_pages: number;
  upload_time: string;
}

export interface ModelInfo {
  name: string;
  description: string;
  classes: string[];
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Upload a PDF file
   */
  async uploadPDF(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/v1/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Failed to upload PDF');
    }

    return response.json();
  }

  /**
   * Process a specific page
   */
  async processPage(data: ProcessPageRequest): Promise<ProcessPageResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/process-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Processing failed' }));
      throw new Error(error.detail || 'Failed to process page');
    }

    return response.json();
  }

  /**
   * Process a specific page with real-time progress updates (SSE)
   */
  async processPageWithProgress(
    data: ProcessPageRequest,
    onProgress: (progress: { percent: number; total: number; status: string; message: string }) => void,
    onError?: (error: string) => void
  ): Promise<ProcessPageResponse> {
    return new Promise((resolve, reject) => {
      // Use fetch with ReadableStream for SSE with POST support
      fetch(`${this.baseUrl}/api/v1/process-page-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Failed to start processing');
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error('No response body');
          }

          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim()) continue;

              const eventMatch = line.match(/^event: (\w+)\n/);
              const dataMatch = line.match(/data: (.+)$/m);

              if (eventMatch && dataMatch) {
                const eventType = eventMatch[1];
                const data = JSON.parse(dataMatch[1]);

                if (eventType === 'progress') {
                  onProgress(data);
                } else if (eventType === 'result') {
                  resolve(data as ProcessPageResponse);
                } else if (eventType === 'error') {
                  if (onError) onError(data.error);
                  reject(new Error(data.error));
                } else if (eventType === 'done') {
                  // Processing complete
                }
              }
            }
          }
        })
        .catch((error) => {
          if (onError) onError(error.message);
          reject(error);
        });
    });
  }

  /**
   * Get file information
   */
  async getFileInfo(fileId: string): Promise<FileInfo> {
    const response = await fetch(`${this.baseUrl}/api/v1/file-info/${fileId}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to get file info' }));
      throw new Error(error.detail || 'Failed to get file information');
    }

    return response.json();
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/file/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete file' }));
      throw new Error(error.detail || 'Failed to delete file');
    }

    return response.json();
  }

  /**
   * List available models
   */
  async getModels(): Promise<{ models: ModelInfo[] }> {
    const response = await fetch(`${this.baseUrl}/api/v1/models`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to get models' }));
      throw new Error(error.detail || 'Failed to get models');
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/health`);

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }
}

export const apiService = new ApiService();

