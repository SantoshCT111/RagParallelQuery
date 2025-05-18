import React, { useState } from 'react';
import { uploadPdf } from '../api/ragService';

export default function DocumentUploader({ onIndexed }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatus('Processing...');
    setUploadProgress(10);
    
    try {
      // Simulate progress updates during upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + Math.floor(Math.random() * 15);
          return next < 90 ? next : 90;
        });
      }, 500);
      
      const response = await uploadPdf(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setStatus('Document indexed successfully!');
      onIndexed(file.name, response.collection_name);
    } catch (e) {
      setStatus('Error: ' + e.message);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <label 
          className={`flex flex-col items-center justify-center w-full h-32 px-4 transition-all duration-200 border-2 ${
            file 
              ? 'border-primary-300 bg-primary-50' 
              : 'border-dashed border-gray-300 hover:bg-gray-50'
          } rounded-lg cursor-pointer focus-within:border-primary`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {file ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="mb-1 text-sm font-medium text-primary-600">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400 mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <p className="mb-1 text-sm font-medium text-gray-500">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-gray-500">
                  PDF files only (Max 50MB)
                </p>
              </>
            )}
          </div>
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            onChange={e => setFile(e.target.files[0])} 
            disabled={isUploading}
          />
        </label>
        
        {file && !isUploading && (
          <button 
            onClick={() => setFile(null)} 
            className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            title="Remove file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      <button 
        onClick={handleUpload} 
        disabled={!file || isUploading} 
        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
          !file || isUploading 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-primary hover:bg-primary-dark shadow-sm'
        }`}
      >
        {isUploading ? 'Processing...' : 'Upload & Index'}
      </button>
      
      {status && (
        <div className={`p-3 text-sm rounded-lg ${
          status.includes('Error') 
            ? 'bg-red-50 text-red-600 border border-red-100' 
            : status.includes('success') 
              ? 'bg-green-50 text-green-600 border border-green-100' 
              : 'bg-primary-50 text-primary-600 border border-primary-100'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}
