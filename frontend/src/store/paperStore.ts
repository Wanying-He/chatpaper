import { create } from 'zustand';
import { Paper, Annotation, Comment } from '../types';

interface PaperStore {
  papers: Paper[];
  selectedPaper: Paper | null;
  annotations: Annotation[];
  comments: Comment[];
  selectedAnnotation: Annotation | null;

  setPapers: (papers: Paper[]) => void;
  addPaper: (paper: Paper) => void;
  selectPaper: (paper: Paper | null) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (annotationId: string) => void;
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  selectAnnotation: (annotation: Annotation | null) => void;
}

export const usePaperStore = create<PaperStore>((set) => ({
  papers: [],
  selectedPaper: null,
  annotations: [],
  comments: [],
  selectedAnnotation: null,

  setPapers: (papers) => set({ papers }),
  addPaper: (paper) => set((state) => ({ papers: [paper, ...state.papers] })),
  selectPaper: (paper) => set({ selectedPaper: paper, annotations: [], comments: [], selectedAnnotation: null }),
  setAnnotations: (annotations) => set({ annotations }),
  addAnnotation: (annotation) => set((state) => ({ annotations: [...state.annotations, annotation] })),
  removeAnnotation: (annotationId) => set((state) => ({
    annotations: state.annotations.filter(a => a.id !== annotationId)
  })),
  setComments: (comments) => set({ comments }),
  addComment: (comment) => set((state) => ({ comments: [...state.comments, comment] })),
  selectAnnotation: (annotation) => set({ selectedAnnotation: annotation })
}));