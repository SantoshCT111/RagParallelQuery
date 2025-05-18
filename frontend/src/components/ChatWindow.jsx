import React, { useState, useEffect, useRef } from 'react';
import { askRag, saveChatHistory, loadChatHistory } from '../api/ragService';

export default function ChatWindow({ currentDocument, collectionName }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documentCollection, setDocumentCollection] = useState(collectionName);
  const messagesEndRef = useRef(null);

  // Load chat history when the document changes
  useEffect(() => {
    if (currentDocument) {
      const chatData = loadChatHistory(currentDocument);
      setMessages(chatData.messages);
      // If we have a collection name from props, use it, otherwise use from storage
      setDocumentCollection(collectionName || chatData.collection_name);
    }
  }, [currentDocument, collectionName]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (currentDocument && messages.length > 0) {
      saveChatHistory(currentDocument, messages, documentCollection);
    }
  }, [messages, currentDocument, documentCollection]);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || !documentCollection) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input field
    setQuery('');
    setLoading(true);

    // Show thinking indicator
    const tempId = Date.now();
    setMessages(prev => [...prev, { 
      id: tempId, 
      role: 'assistant', 
      content: 'Thinking...', 
      loading: true 
    }]);
    
    try {
      const data = await askRag(userMessage.content, documentCollection);
      
      // Replace thinking indicator with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { role: 'assistant', content: data.answer } 
          : msg
      ));
    } catch (error) {
      // Replace thinking indicator with error message
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { role: 'assistant', content: `Error: ${error.message}` } 
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      saveChatHistory(currentDocument, [], documentCollection);
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      {!documentCollection && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-3">
          This document was uploaded with an older version. Please re-upload it to enable chat functionality.
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Ask a question about your document
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] px-4 py-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  } ${message.loading ? 'opacity-70' : ''}`}
              >
                {message.loading ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{message.content}</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input form */}
      <div className="border-t pt-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading || !documentCollection}
            placeholder={documentCollection ? "Ask a question about your document..." : "Please re-upload document to chat"}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading || !query.trim() || !documentCollection}
            className={`px-4 py-2 rounded-md text-white font-medium focus:outline-none ${
              loading || !query.trim() || !documentCollection
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            Send
          </button>
          
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              title="Clear chat history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
