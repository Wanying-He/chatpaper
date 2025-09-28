import React, { useState } from 'react';
import PaperList from '../components/layout/PaperList';
import PdfViewer from '../components/layout/PdfViewer';
import CommentsPanel from '../components/layout/CommentsPanel';

const PaperView: React.FC = () => {
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  return (
    <div className="h-screen flex relative bg-gray-50">
      {/* Mobile overlay */}
      <div className="lg:hidden">
        {/* Left panel toggle */}
        <button
          onClick={() => setLeftPanelVisible(!leftPanelVisible)}
          className="fixed top-20 left-4 z-50 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Right panel toggle */}
        <button
          onClick={() => setRightPanelVisible(!rightPanelVisible)}
          className="fixed top-20 right-4 z-50 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Left Panel - Paper List */}
      <div className={`
        ${leftPanelVisible ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-80 flex-shrink-0 bg-white shadow-sm border-r border-gray-200
        fixed lg:relative z-40 h-full lg:z-auto
      `}>
        <PaperList />
      </div>

      {/* Center Panel - PDF Viewer */}
      <div className="flex-1 bg-white relative">
        <PdfViewer />
      </div>

      {/* Right Panel - Comments */}
      <div className={`
        ${rightPanelVisible ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-80 flex-shrink-0 bg-gray-50 border-l border-gray-200
        fixed lg:relative z-40 h-full lg:z-auto right-0
      `}>
        <CommentsPanel />
      </div>

      {/* Mobile overlay backdrop */}
      {(leftPanelVisible || rightPanelVisible) && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => {
            setLeftPanelVisible(false);
            setRightPanelVisible(false);
          }}
        />
      )}
    </div>
  );
};

export default PaperView;