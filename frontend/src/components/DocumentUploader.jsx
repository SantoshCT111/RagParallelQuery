import React, { useState } from 'react';
import { uploadPdf } from '../api/ragService';

export default function DocumentUploader({ onIndexed }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatus('Uploading and indexing...');
    try {
      await uploadPdf(file);
      setStatus('Indexed successfully!');
      onIndexed(file.name);
    } catch (e) {
      setStatus('Error: ' + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="flex items-center justify-center w-full h-12 px-4 transition-colors duration-150 border-2 border-dashed rounded-md cursor-pointer hover:border-gray-400 focus-within:border-indigo-500">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span className="text-sm text-gray-500">
            {file ? file.name : 'Choose PDF file'}
          </span>
        </div>
        <input 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          onChange={e => setFile(e.target.files[0])} 
        />
      </label>
      
      <button 
        onClick={handleUpload} 
        disabled={!file || isUploading} 
        className={`w-full py-2 px-4 rounded-md text-sm font-medium focus:outline-none transition duration-150 ${
          !file || isUploading 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        }`}
      >
        {isUploading ? 'Processing...' : 'Upload & Index'}
      </button>
      
      {status && (
        <div className={`p-2 text-sm rounded-md ${status.includes('Error') ? 'bg-red-50 text-red-600' : status.includes('success') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
          {status}
        </div>
      )}
    </div>
  );
}
