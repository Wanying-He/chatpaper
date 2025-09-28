import React, { useState } from 'react';
import { TextSelection } from '../../hooks/usePdfTextSelection';

interface SelectionPopupProps {
  selection: TextSelection;
  onHighlight: (text: string, coordinates: any) => void;
  onCancel: () => void;
}

const SelectionPopup: React.FC<SelectionPopupProps> = ({
  selection,
  onHighlight,
  onCancel
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleHighlight = async () => {
    setIsCreating(true);
    try {
      await onHighlight(selection.text, selection.coordinates);
      onCancel(); // Close the popup after successful highlight
    } catch (error) {
      console.error('Failed to create highlight:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Position the popup near the selection
  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${selection.boundingRect.left}px`,
    top: `${selection.boundingRect.bottom + 10}px`,
    zIndex: 1000,
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    minWidth: '200px',
    maxWidth: '300px'
  };

  return (
    <div style={popupStyle}>
      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#374151' }}>
        <strong>Selected text:</strong>
      </div>
      <div
        style={{
          fontSize: '13px',
          color: '#6b7280',
          marginBottom: '12px',
          maxHeight: '80px',
          overflowY: 'auto',
          padding: '8px',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          border: '1px solid #e5e7eb'
        }}
      >
        "{selection.text}"
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          disabled={isCreating}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleHighlight}
          disabled={isCreating}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            backgroundColor: '#fbbf24',
            color: '#92400e',
            border: '1px solid #f59e0b',
            borderRadius: '4px',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            opacity: isCreating ? 0.6 : 1
          }}
        >
          {isCreating ? 'Creating...' : '🖍️ Highlight'}
        </button>
      </div>
    </div>
  );
};

export default SelectionPopup;