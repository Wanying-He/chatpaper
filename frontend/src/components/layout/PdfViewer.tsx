import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePaperStore } from '../../store/paperStore';
import { paperApi, annotationApi } from '../../utils/api';
import { usePdfTextSelection } from '../../hooks/usePdfTextSelection';
import HighlightOverlay from '../common/HighlightOverlay';
import SelectionPopup from '../common/SelectionPopup';

// Set up PDF.js worker - use local file for reliability
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PdfViewer: React.FC = () => {
  const { selectedPaper, annotations, setAnnotations, addAnnotation } = usePaperStore();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(800);
  const [pageHeight, setPageHeight] = useState<number>(1000);
  const [loading, setLoading] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);

  const {
    selectedText,
    isSelecting,
    handleMouseUp,
    clearSelection
  } = usePdfTextSelection();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(page => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(numPages, page + 1));
  };

  const loadAnnotations = useCallback(async () => {
    if (!selectedPaper) return;

    try {
      const response = await annotationApi.getAnnotationsForPaper(selectedPaper.id);
      setAnnotations(response.annotations);
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  }, [selectedPaper, setAnnotations]);

  // Load annotations when paper changes
  useEffect(() => {
    if (selectedPaper) {
      setLoading(true);
      setError(null);
      loadAnnotations();
    }
  }, [selectedPaper, loadAnnotations]);

  // Responsive PDF width calculation
  useEffect(() => {
    const updatePdfWidth = () => {
      const container = document.querySelector('.pdf-container');
      if (container) {
        const containerWidth = container.clientWidth;
        const maxWidth = Math.min(containerWidth - 40, 800);
        setPageWidth(maxWidth);
      }
    };

    updatePdfWidth();
    window.addEventListener('resize', updatePdfWidth);
    return () => window.removeEventListener('resize', updatePdfWidth);
  }, []);

  const zoomIn = () => setScale(s => Math.min(s + 0.2, 2.0));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  const handleCreateHighlight = async (text: string, coordinates: any) => {
    if (!selectedPaper) return;

    try {
      const response = await annotationApi.createAnnotation(
        selectedPaper.id,
        pageNumber,
        coordinates,
        text
      );
      addAnnotation(response.annotation);
    } catch (error) {
      console.error('Failed to create annotation:', error);
      throw error;
    }
  };

  const handleHighlightClick = (annotation: any) => {
    // TODO: Scroll to the annotation in the comments panel
    console.log('Clicked annotation:', annotation);
  };

  const onPageRenderSuccess = () => {
    // Update page dimensions after render
    const pageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
    if (pageElement) {
      const rect = pageElement.getBoundingClientRect();
      setPageWidth(rect.width);
      setPageHeight(rect.height);
    }
  };

  if (!selectedPaper) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium mb-2">No paper selected</h3>
          <p>Select a paper from the list to view it here</p>
        </div>
      </div>
    );
  }

  const pdfUrl = paperApi.getPdfUrl(selectedPaper.id);

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-4">
            {selectedPaper.title}
          </h2>
          {loading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Loading...
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* Navigation controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600 px-2">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              Next →
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors text-sm"
            >
              −
            </button>
            <span className="text-sm text-gray-600 px-2 min-w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors text-sm"
            >
              +
            </button>
            <button
              onClick={resetZoom}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-xs"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 pdf-container">
        <div className="flex justify-center">
          {error ? (
            <div className="text-center text-red-500 p-8">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium mb-2">Failed to load PDF</h3>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  loadAnnotations();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-in-out'
              }}
              onMouseUp={() => handleMouseUp(pageNumber)}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="text-center text-gray-500 p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Loading PDF...</p>
                    <p className="text-sm text-gray-400 mt-2">Please wait while we load your document</p>
                  </div>
                }
                className="shadow-lg rounded-lg overflow-hidden"
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  className="border border-gray-300 rounded"
                  data-page-number={pageNumber}
                  onRenderSuccess={onPageRenderSuccess}
                  loading={
                    <div className="flex items-center justify-center h-96 bg-gray-50">
                      <div className="animate-pulse text-gray-400">Rendering page...</div>
                    </div>
                  }
                />
              </Document>

              <HighlightOverlay
                annotations={annotations}
                pageNumber={pageNumber}
                pageWidth={pageWidth * scale}
                pageHeight={pageHeight * scale}
                onHighlightClick={handleHighlightClick}
              />

              {selectedText && isSelecting && (
                <SelectionPopup
                  selection={selectedText}
                  onHighlight={handleCreateHighlight}
                  onCancel={clearSelection}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;