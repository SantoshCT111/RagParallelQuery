import React, { useState } from 'react';
import { askRag } from '../api/ragService';

export default function ChatWindow() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const data = await askRag(query);
      setAnswer(data.answer);
    } catch (e) {
      setAnswer('Error: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', marginBottom: '1rem' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask a question..."
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
          Send
        </button>
      </form>
      {loading ? <p>Loading...</p> : <p>{answer}</p>}
    </div>
  );
}
