import React, { useState, useEffect, useRef } from 'react';
import { askRag, saveChatHistory, loadChatHistory } from '../api/ragService';

export default function ChatWindow({ currentDocument, collectionName }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documentCollection, setDocumentCollection] = useState(collectionName);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  // Focus input field when component mounts or messages update
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading, messages]);

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
    <div className="flex flex-col h-full">
      {/* Warning banner for missing collection */}
      {!documentCollection && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This document was uploaded with an older version. Please re-upload it to enable chat functionality.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat message area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-white">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md py-12">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-300 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Start a conversation</h3>
              <p className="text-gray-500">Ask a question about {currentDocument} to begin</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} message-animation`}
              >
                <div 
                  className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
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
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (query.trim() && !loading && documentCollection) {
                      handleSubmit(e);
                    }
                  }
                }}
                disabled={loading || !documentCollection}
                placeholder={documentCollection ? "Ask a question..." : "Please re-upload document to chat"}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                style={{resize: 'none'}}
              />
              {!loading && query.trim() && (
                <button
                  type="submit"
                  className="absolute right-3 bottom-3 text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Clear chat history"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send your message. Use Shift+Enter for a new line.
          </p>
        </div>
      </div>
    </div>
  );
}
