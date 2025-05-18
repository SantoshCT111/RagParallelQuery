export async function uploadPdf(file) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function askRag(question) {
  const res = await fetch('/api/rag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Query failed');
  return res.json();
}

// Chat history storage functions
export function saveChatHistory(filename, chatHistory) {
  localStorage.setItem(`chat_${filename}`, JSON.stringify(chatHistory));
}

export function loadChatHistory(filename) {
  const saved = localStorage.getItem(`chat_${filename}`);
  return saved ? JSON.parse(saved) : [];
}

export function getAllChatHistories() {
  const histories = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('chat_')) {
      const filename = key.replace('chat_', '');
      histories[filename] = JSON.parse(localStorage.getItem(key));
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
