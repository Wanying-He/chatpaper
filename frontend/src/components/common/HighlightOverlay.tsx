import React from 'react';
import { Annotation } from '../../types';

interface HighlightOverlayProps {
  annotations: Annotation[];
  pageNumber: number;
  pageWidth: number;
  pageHeight: number;
  onHighlightClick: (annotation: Annotation) => void;
}

const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
  annotations,
  pageNumber,
  pageWidth,
  pageHeight,
  onHighlightClick
}) => {
  const pageAnnotations = annotations.filter(annotation =>
    annotation.pageNumber === pageNumber
  );

  if (pageAnnotations.length === 0) {
    return null;
  }

  return (
    <div
      className="highlight-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: pageWidth,
        height: pageHeight,
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      {pageAnnotations.map((annotation) => {
        let coordinates;
        try {
          coordinates = JSON.parse(annotation.coordinates);
        } catch (error) {
          console.error('Failed to parse annotation coordinates:', error);
          return null;
        }

        // Calculate the position and size based on the current page dimensions
        const scaleX = pageWidth / coordinates.pageX;
        const scaleY = pageHeight / coordinates.pageY;

        const left = coordinates.x * scaleX;
        const top = coordinates.y * scaleY;
        const width = coordinates.width * scaleX;
        const height = coordinates.height * scaleY;

        return (
          <div
            key={annotation.id}
            className="highlight-box"
            style={{
              position: 'absolute',
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: 'rgba(255, 255, 0, 0.3)',
              border: '1px solid rgba(255, 255, 0, 0.6)',
              cursor: 'pointer',
              pointerEvents: 'auto',
              borderRadius: '2px',
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => onHighlightClick(annotation)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
            }}
            title={`"${annotation.highlightedText}"`}
          />
        );
      })}
    </div>
  );
};

export default HighlightOverlay;