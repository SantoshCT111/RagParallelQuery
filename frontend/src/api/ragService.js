export async function uploadPdf(file) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function askRag(question, collectionName) {
  const res = await fetch('/api/rag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      question,
      collection_name: collectionName 
    }),
  });
  if (!res.ok) throw new Error('Query failed');
  return res.json();
}

export async function fetchCollections() {
  const res = await fetch('/api/collections');
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
}

export async function deleteCollection(collectionName) {
  const res = await fetch(`/api/collection/${collectionName}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete collection');
  return res.json();
}

// Chat history storage functions
export function saveChatHistory(filename, chatHistory, collectionName) {
  localStorage.setItem(`chat_${filename}`, JSON.stringify({
    messages: chatHistory,
    collection_name: collectionName
  }));
}

export function loadChatHistory(filename) {
  const saved = localStorage.getItem(`chat_${filename}`);
  if (!saved) return { messages: [], collection_name: null };
  
  const parsed = JSON.parse(saved);
  // Handle legacy format (just an array of messages)
  if (Array.isArray(parsed)) {
    return { messages: parsed, collection_name: null };
  }
  return parsed;
}

export function getAllChatHistories() {
  const histories = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('chat_')) {
      const filename = key.replace('chat_', '');
      histories[filename] = loadChatHistory(filename);
    }
  }
  return histories;
}

export function getDocumentList() {
  const documents = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('chat_')) {
      documents.push(key.replace('chat_', ''));
    }
  }
  return documents;
}

export function removeChatHistory(filename) {
  localStorage.removeItem(`chat_${filename}`);
}
