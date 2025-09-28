const API_BASE_URL = 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const paperApi = {
  async uploadPaper(file: File, title: string) {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);

    const response = await fetch(`${API_BASE_URL}/papers/upload`, {
      method: 'POST',
      body: formData
    });

    return handleResponse<{ success: boolean; paper: any }>(response);
  },

  async getPapers() {
    const response = await fetch(`${API_BASE_URL}/papers`);
    return handleResponse<{ papers: any[] }>(response);
  },

  async deletePaper(id: string) {
    const response = await fetch(`${API_BASE_URL}/papers/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  getPdfUrl(paperId: string) {
    return `${API_BASE_URL}/papers/${paperId}/pdf`;
  }
};

export const annotationApi = {
  async createAnnotation(paperId: string, pageNumber: number, coordinates: any, highlightedText: string) {
    const response = await fetch(`${API_BASE_URL}/annotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paperId,
        pageNumber,
        coordinates,
        highlightedText
      })
    });

    return handleResponse<{ success: boolean; annotation: any }>(response);
  },

  async getAnnotationsForPaper(paperId: string) {
    const response = await fetch(`${API_BASE_URL}/annotations/paper/${paperId}`);
    return handleResponse<{ annotations: any[] }>(response);
  },

  async deleteAnnotation(id: string) {
    const response = await fetch(`${API_BASE_URL}/annotations/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  }
};

export const commentApi = {
  async getCommentsForAnnotation(annotationId: string) {
    const response = await fetch(`${API_BASE_URL}/comments/annotation/${annotationId}`);
    return handleResponse<{ comments: any[] }>(response);
  },

  async createComment(annotationId: string, content: string, isAiResponse = false) {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        annotationId,
        content,
        isAiResponse
      })
    });

    return handleResponse<{ comment: any }>(response);
  },

  async deleteComment(id: string) {
    const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  }
};

export const aiApi = {
  async askQuestion(question: string, paperId: string, annotationId?: string) {
    const response = await fetch(`${API_BASE_URL}/ai/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question,
        paperId,
        annotationId
      })
    });

    return handleResponse<{ response: string; conversationId: string }>(response);
  },

  async getConversations(paperId: string) {
    const response = await fetch(`${API_BASE_URL}/ai/conversations/${paperId}`);
    return handleResponse<{ conversations: any[] }>(response);
  }
};