import React, { useState } from 'react';
import { uploadPdf } from '../api/ragService';

export default function DocumentUploader({ onIndexed }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setStatus('Uploading...');
    try {
      await uploadPdf(file);
      setStatus('Indexed successfully!');
      onIndexed();
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={!file} style={{ marginLeft: 8 }}>
        Upload & Index
      </button>
      <p>{status}</p>
    </div>
  );
}
