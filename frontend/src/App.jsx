import React, { useState } from 'react';
import DocumentUploader from './components/DocumentUploader';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const [indexed, setIndexed] = useState(false);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>RAG Chat</h1>
      {!indexed ? (
        <DocumentUploader onIndexed={() => setIndexed(true)} />
      ) : (
        <ChatWindow />
      )}
    </div>
  );
}
