import React, { useState, useEffect } from 'react';
import DocumentUploader from './components/DocumentUploader';
import ChatWindow from './components/ChatWindow';
import { getDocumentList } from './api/ragService';
import './App.css';

export default function App() {
  const [indexed, setIndexed] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentList, setDocumentList] = useState([]);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);

  // Load documents list from localStorage on mount
  useEffect(() => {
    const documents = getDocumentList();
    setDocumentList(documents);
    if (documents.length > 0) {
      setIndexed(true);
    }
  }, []);

  // Handle document selection
  const handleSelectDocument = (document) => {
    setCurrentDocument(document);
    setIndexed(true);
  };

  // Handle new document indexed
  const handleDocumentIndexed = (filename) => {
    setCurrentDocument(filename);
    setIndexed(true);
    setDocumentList(prev => [...prev, filename]);
  };

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed z-20 top-4 left-4 p-2 rounded-md bg-white shadow-md"
        onClick={toggleSidebar}
      >
        {showSidebar ? '×' : '☰'}
      </button>

      {/* Sidebar */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-10 w-64 h-full bg-white shadow-md overflow-y-auto`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">RAG Chat</h2>
          <p className="text-sm text-gray-600">Chat with your documents</p>
        </div>
        
        {/* Document list */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Documents</h3>
          <ul className="mt-2 space-y-1">
            {documentList.map(doc => (
              <li key={doc} className="group">
                <button
                  className={`w-full flex items-center px-2 py-2 text-sm rounded-md ${currentDocument === doc ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => handleSelectDocument(doc)}
                >
                  <span className="truncate">{doc}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Upload new document */}
        <div className="p-4 border-t">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Upload New</h3>
          <div className="mt-2">
            <DocumentUploader onIndexed={handleDocumentIndexed} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {indexed && currentDocument ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-800">Chatting with: {currentDocument}</h2>
                </div>
                <div className="p-4">
                  <ChatWindow currentDocument={currentDocument} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to RAG Chat</h2>
                <p className="text-gray-600 mb-6">Upload a PDF document to get started, or select an existing document from the sidebar.</p>
                
                {documentList.length === 0 && (
                  <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <DocumentUploader onIndexed={handleDocumentIndexed} />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
