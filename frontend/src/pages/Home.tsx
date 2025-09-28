import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePaperStore } from '../store/paperStore';
import { paperApi } from '../utils/api';

const Home: React.FC = () => {
  const { papers, annotations, comments, setPapers, selectPaper } = usePaperStore();

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const response = await paperApi.getPapers();
        setPapers(response.papers);
      } catch (error) {
        console.error('Failed to load papers:', error);
      }
    };

    loadPapers();
  }, [setPapers]);

  const totalAnnotations = annotations.length;
  const totalComments = comments.length;

  const recentActivity = [
    ...annotations.map(a => ({ ...a, type: 'annotation' })),
    ...comments.map(c => ({ ...c, type: 'comment' }))
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to ChatPaper</h1>
        <p className="text-xl text-gray-600 mb-6">Your AI-powered research companion for PDF annotation and analysis</p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/papers"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            📝 Start Annotating
          </Link>
          {papers.length === 0 && (
            <Link
              to="/papers"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              📁 Upload Your First Paper
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Papers</h3>
              <p className="text-3xl font-bold text-blue-700">{papers.length}</p>
              <p className="text-sm text-blue-600 mt-1">PDF documents</p>
            </div>
            <div className="text-4xl opacity-70">📄</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-lg p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Annotations</h3>
              <p className="text-3xl font-bold text-yellow-700">{totalAnnotations}</p>
              <p className="text-sm text-yellow-600 mt-1">Highlights made</p>
            </div>
            <div className="text-4xl opacity-70">🖍️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Interactions</h3>
              <p className="text-3xl font-bold text-green-700">{totalComments}</p>
              <p className="text-sm text-green-600 mt-1">Comments & questions</p>
            </div>
            <div className="text-4xl opacity-70">🤖</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Papers</h2>
          </div>
          <div className="p-6">
            {papers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No papers uploaded yet</p>
            ) : (
              <div className="space-y-3">
                {papers.slice(0, 5).map((paper) => (
                  <div key={paper.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{paper.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(paper.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to="/papers"
                      onClick={() => selectPaper(paper)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1 rounded transition-colors"
                    >
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="text-lg">
                      {activity.type === 'annotation' ? '🖍️' : '💬'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {activity.type === 'annotation'
                          ? `New annotation: "${(activity as any).highlightedText?.substring(0, 50)}..."`
                          : `New comment: "${(activity as any).content?.substring(0, 50)}..."`
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;