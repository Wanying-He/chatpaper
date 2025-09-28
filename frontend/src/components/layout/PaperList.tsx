import React, { useState, useRef, useCallback, useMemo } from 'react';
import { usePaperStore } from '../../store/paperStore';
import { paperApi } from '../../utils/api';

const PaperList: React.FC = () => {
  const { papers, selectedPaper, setPapers, addPaper, selectPaper } = usePaperStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPapers = useCallback(async () => {
    try {
      const response = await paperApi.getPapers();
      setPapers(response.papers);
    } catch (error) {
      console.error('Failed to load papers:', error);
    }
  }, [setPapers]);

  React.useEffect(() => {
    loadPapers();
  }, [loadPapers]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadTitle(file.name.replace('.pdf', ''));
      setShowUploadForm(true);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !uploadTitle.trim()) return;

    setIsUploading(true);
    try {
      const response = await paperApi.uploadPaper(file, uploadTitle.trim());
      addPaper(response.paper);
      setShowUploadForm(false);
      setUploadTitle('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload paper:', error);
      alert('Failed to upload paper. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredAndSortedPapers = useMemo(() => {
    let filtered = papers;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = papers.filter(paper =>
        paper.title.toLowerCase().includes(query) ||
        paper.filename.toLowerCase().includes(query)
      );
    }

    // Sort papers
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
        case 'date':
        default:
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [papers, searchQuery, sortBy, sortOrder]);

  const toggleSort = (newSortBy: 'date' | 'name' | 'size') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Papers</h2>
          <span className="text-xs text-gray-500">({filteredAndSortedPapers.length})</span>
        </div>

        {/* Search bar */}
        <div className="mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers..."
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort options */}
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => toggleSort('date')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              sortBy === 'date' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('name')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              sortBy === 'name' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('size')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              sortBy === 'size' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Upload PDF
        </button>

        {showUploadForm && (
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-md">
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Enter paper title"
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={isUploading || !uploadTitle.trim()}
                className="flex-1 bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => setShowUploadForm(false)}
                className="flex-1 bg-gray-500 text-white py-1 px-3 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {papers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No papers uploaded yet
          </div>
        ) : filteredAndSortedPapers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No papers match your search
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {filteredAndSortedPapers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => selectPaper(paper)}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  selectedPaper?.id === paper.id
                    ? 'bg-blue-100 border-blue-300 border'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                  {paper.title}
                </h3>
                <p className="text-xs text-gray-500 mb-1 truncate">
                  {paper.filename}
                </p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatDate(paper.uploadDate)}</span>
                  <span>{formatFileSize(paper.fileSize)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperList;