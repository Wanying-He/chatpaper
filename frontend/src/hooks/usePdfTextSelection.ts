import { useState, useCallback, useRef } from 'react';

export interface TextSelection {
  text: string;
  pageNumber: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
    pageX: number;
    pageY: number;
  };
  boundingRect: DOMRect;
}

export const usePdfTextSelection = () => {
  const [selectedText, setSelectedText] = useState<TextSelection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionRef = useRef<Selection | null>(null);

  const handleTextSelection = useCallback((pageNumber: number) => {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setSelectedText(null);
      setIsSelecting(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const text = selection.toString().trim();

    if (text.length === 0) {
      setSelectedText(null);
      setIsSelecting(false);
      return;
    }

    // Get the bounding rectangle of the selection
    const boundingRect = range.getBoundingClientRect();

    // Find the PDF page container to get relative coordinates
    const pageElement = range.commonAncestorContainer.parentElement?.closest('[data-page-number]');
    const pageRect = pageElement?.getBoundingClientRect();

    if (!pageRect) {
      setSelectedText(null);
      setIsSelecting(false);
      return;
    }

    // Calculate relative coordinates within the PDF page
    const relativeX = boundingRect.left - pageRect.left;
    const relativeY = boundingRect.top - pageRect.top;

    const textSelection: TextSelection = {
      text,
      pageNumber,
      coordinates: {
        x: relativeX,
        y: relativeY,
        width: boundingRect.width,
        height: boundingRect.height,
        pageX: pageRect.width,
        pageY: pageRect.height
      },
      boundingRect
    };

    setSelectedText(textSelection);
    setIsSelecting(true);
    selectionRef.current = selection;
  }, []);

  const clearSelection = useCallback(() => {
    if (selectionRef.current) {
      selectionRef.current.removeAllRanges();
    }
    setSelectedText(null);
    setIsSelecting(false);
  }, []);

  const handleMouseUp = useCallback((pageNumber: number) => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      handleTextSelection(pageNumber);
    }, 10);
  }, [handleTextSelection]);

  return {
    selectedText,
    isSelecting,
    handleMouseUp,
    clearSelection,
    handleTextSelection
  };
};