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
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed z-20 top-4 left-4 p-2 rounded-md bg-white shadow-md"
        onClick={toggleSidebar}
      >
        {showSidebar ? '×' : '☰'}
      </button>

      {/* Sidebar */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-10 w-72 h-full bg-white border-r border-gray-200 shadow-sm overflow-y-auto`}>
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            RAG Chat
          </h2>
          <p className="text-sm text-gray-600 mt-1">Interact with your documents using AI</p>
        </div>
        
        {/* Document list */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Documents</h3>
            {!isLoading && collections.length > 0 && (
              <span className="text-xs text-gray-500">{collections.length} document{collections.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          
          {isLoading ? (
            <div className="mt-4 text-center py-6 bg-gray-50 rounded-lg">
              <div className="flex justify-center items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Loading documents...</span>
              </div>
            </div>
          ) : error ? (
            <div className="mt-4 p-6 bg-red-50 rounded-lg border border-red-100">
              <div className="text-red-600 mb-2">{error}</div>
              <button 
                onClick={() => fetchCollections().then(r => setCollections(r.collections)).catch(e => setError(e.message))}
                className="text-sm px-3 py-1 bg-white border border-red-200 rounded-md text-red-600 hover:bg-red-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : collections.length === 0 ? (
            <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-100 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400 mx-auto mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-gray-600">No documents yet. Upload one to get started.</p>
            </div>
          ) : (
            <ul className="mt-2 space-y-1">
              {collections.map(collection => (
                <li key={collection.name} className="group">
                  <div className="flex items-center">
                    <button
                      className={`flex-grow flex items-center p-3 text-sm rounded-md ${currentCollection === collection.name ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => handleSelectDocument(collection)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <div className="flex flex-col">
                        <span className="truncate font-medium">{collection.display_name}</span>
                        {collection.vectors_count > 0 && (
                          <span className="text-xs text-gray-500">{collection.vectors_count} chunks</span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(collection)}
                      className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="p-5 mt-auto border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Upload Document</h3>
          <DocumentUploader onIndexed={handleDocumentIndexed} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {indexed && currentDocument ? (
          <>
            {/* Header with document name */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                {currentDocument}
              </h2>
            </header>
            
            {/* Chat space - takes all available space */}
            <div className="flex-1 overflow-hidden">
              <ChatWindow 
                currentDocument={currentDocument}
                collectionName={currentCollection}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-4 md:p-6">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-indigo-300 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to RAG Chat</h2>
              <p className="text-gray-600 mb-8 text-lg">Upload a PDF document to start asking questions about its content.</p>
              
              {collections.length === 0 && !isLoading && !error && (
                <div className="mt-4 p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <DocumentUploader onIndexed={handleDocumentIndexed} />
                </div>
              )}
              
              {collections.length > 0 && (
                <p className="text-gray-500 text-sm mt-4">
                  Or select a document from the sidebar to begin chatting
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
