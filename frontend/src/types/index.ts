export interface Paper {
  id: string;
  title: string;
  filename: string;
  filepath: string;
  uploadDate: string;
  fileSize: number;
}

export interface Annotation {
  id: string;
  paperId: string;
  pageNumber: number;
  coordinates: string;
  highlightedText: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  annotationId: string;
  content: string;
  isAiResponse: boolean;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  paperId: string;
  annotationId?: string;
  userQuestion: string;
  aiResponse: string;
  createdAt: string;
}