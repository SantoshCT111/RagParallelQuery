import React, { useState, useEffect } from 'react';
import DocumentUploader from './components/DocumentUploader';
import ChatWindow from './components/ChatWindow';
import { getDocumentList, loadChatHistory, fetchCollections, deleteCollection, removeChatHistory } from './api/ragService';
import './App.css';

export default function App() {
  const [indexed, setIndexed] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [documentList, setDocumentList] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);

  // Load documents list from the backend API
  useEffect(() => {
    const loadCollections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchCollections();
        setCollections(result.collections);
        if (result.collections.length > 0) {
          setIndexed(true);
        }
      } catch (err) {
        console.error("Failed to load collections:", err);
        setError("Failed to load collections. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCollections();
  }, []);

  // Handle document selection
  const handleSelectDocument = (collection) => {
    setCurrentDocument(collection.display_name);
    setCurrentCollection(collection.name);
    setIndexed(true);
  };

  // Handle new document indexed
  const handleDocumentIndexed = (filename, collectionName) => {
    setCurrentDocument(filename);
    setCurrentCollection(collectionName);
    setIndexed(true);
    
    // Refresh collections
    fetchCollections().then(result => {
      setCollections(result.collections);
    }).catch(err => {
      console.error("Failed to refresh collections:", err);
    });
  };

  // Handle document deletion
  const handleDeleteDocument = async (collection) => {
    if (window.confirm(`Are you sure you want to delete "${collection.display_name}"? This cannot be undone.`)) {
      try {
        await deleteCollection(collection.name);
        // Remove from local storage if exists
        removeChatHistory(collection.display_name);
        
        // Refresh collections list
        const result = await fetchCollections();
        setCollections(result.collections);
        
        // If the deleted collection was the current one, reset the view
        if (collection.name === currentCollection) {
          setCurrentDocument(null);
          setCurrentCollection(null);
          if (result.collections.length === 0) {
            setIndexed(false);
          }
        }
      } catch (err) {
        console.error("Failed to delete collection:", err);
        alert("Failed to delete document. Please try again.");
      }
    }
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
          
          {isLoading ? (
            <div className="mt-2 text-center py-4">
              <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
          ) : error ? (
            <div className="mt-2 text-center py-4">
              <div className="text-red-500">{error}</div>
              <button 
                onClick={() => fetchCollections().then(r => setCollections(r.collections)).catch(e => setError(e.message))}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Try Again
              </button>
            </div>
          ) : collections.length === 0 ? (
            <div className="mt-2 text-center py-4 text-gray-500">
              No documents yet. Upload one to get started.
            </div>
          ) : (
            <ul className="mt-2 space-y-1">
              {collections.map(collection => (
                <li key={collection.name} className="group">
                  <div className="flex items-center">
                    <button
                      className={`flex-grow flex items-center px-2 py-2 text-sm rounded-md ${currentCollection === collection.name ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => handleSelectDocument(collection)}
                    >
                      <span className="truncate">{collection.display_name}</span>
                      {collection.vectors_count > 0 && (
                        <span className="ml-2 text-xs text-gray-500">({collection.vectors_count})</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(collection)}
                      className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete document"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
                  <ChatWindow 
                    currentDocument={currentDocument}
                    collectionName={currentCollection}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to RAG Chat</h2>
                <p className="text-gray-600 mb-6">Upload a PDF document to get started, or select an existing document from the sidebar.</p>
                
                {collections.length === 0 && !isLoading && !error && (
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
