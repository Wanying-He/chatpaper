import React, { useState, useEffect, useMemo } from 'react';
import { usePaperStore } from '../../store/paperStore';
import { commentApi, aiApi } from '../../utils/api';

const CommentsPanel: React.FC = () => {
  const { selectedPaper, annotations, comments, setComments, addComment } = usePaperStore();
  const [newComment, setNewComment] = useState('');
  const [askingAI, setAskingAI] = useState<{ [key: string]: boolean }>({});
  const [searchAnnotations, setSearchAnnotations] = useState('');

  const paperAnnotations = useMemo(() =>
    selectedPaper
      ? annotations.filter(annotation => annotation.paperId === selectedPaper.id)
      : [],
    [selectedPaper, annotations]
  );

  const filteredAnnotations = useMemo(() => {
    if (!searchAnnotations.trim()) return paperAnnotations;

    const query = searchAnnotations.toLowerCase();
    return paperAnnotations.filter(annotation =>
      annotation.highlightedText.toLowerCase().includes(query)
    );
  }, [paperAnnotations, searchAnnotations]);

  const handleAddComment = async (annotationId: string) => {
    if (!newComment.trim()) return;

    try {
      const result = await commentApi.createComment(annotationId, newComment);
      addComment(result.comment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleAskAI = async (annotationId: string, highlightedText: string) => {
    if (!selectedPaper) return;

    const question = prompt('What would you like to ask about this selection?');
    if (!question) return;

    setAskingAI(prev => ({ ...prev, [annotationId]: true }));

    try {
      await aiApi.askQuestion(question, selectedPaper.id, annotationId);
      // The AI response is automatically added as a comment by the backend
      // Reload comments for this annotation
      await loadCommentsForAnnotation(annotationId);
    } catch (error) {
      console.error('Failed to ask AI:', error);
      alert('Failed to get AI response. Please try again.');
    } finally {
      setAskingAI(prev => ({ ...prev, [annotationId]: false }));
    }
  };

  const loadCommentsForAnnotation = async (annotationId: string) => {
    try {
      const result = await commentApi.getCommentsForAnnotation(annotationId);
      // Update the comments store with the new comments
      // This is a simplified approach - in a more complex app you'd merge comments
      const currentComments = comments.filter(c => c.annotationId !== annotationId);
      setComments([...currentComments, ...result.comments]);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  // Load comments when annotations change
  useEffect(() => {
    const loadAllComments = async () => {
      if (paperAnnotations.length === 0) {
        setComments([]);
        return;
      }

      try {
        const allComments = [];
        for (const annotation of paperAnnotations) {
          const result = await commentApi.getCommentsForAnnotation(annotation.id);
          allComments.push(...result.comments);
        }
        setComments(allComments);
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    };

    loadAllComments();
  }, [paperAnnotations, setComments]);

  if (!selectedPaper) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-sm">Select a paper to view comments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Comments & Notes</h2>
        <p className="text-sm text-gray-600 mt-1">
          {paperAnnotations.length} annotation(s)
        </p>

        {paperAnnotations.length > 0 && (
          <div className="mt-3">
            <input
              type="text"
              value={searchAnnotations}
              onChange={(e) => setSearchAnnotations(e.target.value)}
              placeholder="Search annotations..."
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {paperAnnotations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-sm">No annotations yet</p>
            <p className="text-xs mt-1">
              Highlight text in the PDF to create annotations
            </p>
          </div>
        ) : filteredAnnotations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm">No annotations match your search</p>
            <button
              onClick={() => setSearchAnnotations('')}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {filteredAnnotations.map((annotation) => {
              const annotationComments = comments.filter(
                comment => comment.annotationId === annotation.id
              );

              return (
                <div key={annotation.id} className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">
                      Page {annotation.pageNumber}
                    </div>
                    <div className="text-sm bg-yellow-100 p-2 rounded border-l-4 border-yellow-400">
                      "{annotation.highlightedText}"
                    </div>
                  </div>

                  {annotationComments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`text-sm p-2 rounded mb-2 ${
                        comment.isAiResponse
                          ? 'bg-blue-50 border-l-4 border-blue-400'
                          : 'bg-gray-50 border-l-4 border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          {comment.isAiResponse ? 'AI Assistant' : 'You'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-800">{comment.content}</p>
                    </div>
                  ))}

                  <div className="mt-3">
                    <div className="flex">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment or ask AI..."
                        className="flex-1 text-sm border border-gray-300 rounded-l-md px-3 py-2"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(annotation.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(annotation.id)}
                        disabled={!newComment.trim()}
                        className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        💬
                      </button>
                    </div>
                    <button
                      onClick={() => handleAskAI(annotation.id, annotation.highlightedText)}
                      disabled={askingAI[annotation.id]}
                      className="w-full mt-2 text-xs bg-green-100 text-green-700 py-1 px-2 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {askingAI[annotation.id] ? '🤔 Thinking...' : '🤖 Ask AI about this selection'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors text-sm">
          Export All Notes
        </button>
      </div>
    </div>
  );
};

export default CommentsPanel;