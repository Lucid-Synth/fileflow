import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { apiService } from "../services/api";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  shareLink: string;
  uploadDate: Date;
  shareId?: string;
}

interface FileCardProps {
  files: UploadedFile[];
  onClose: () => void;
}

const FileCard = ({ files, onClose }: FileCardProps) => {
  const [fileList, setFileList] = useState<UploadedFile[]>(files);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const handleDelete = async (fileId: string) => {
    const file = fileList.find(f => f.id === fileId);
    if (!file || !file.shareId) {
      setFileList((prev: UploadedFile[]) => prev.filter((file: UploadedFile) => file.id !== fileId));
      return;
    }

    setDeletingFiles(prev => new Set(prev).add(fileId));
    
    try {
      await apiService.deleteFile(file.shareId);
      setFileList((prev: UploadedFile[]) => prev.filter((file: UploadedFile) => file.id !== fileId));
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleCopyLink = (shareLink: string) => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(shareLink);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden mx-2 sm:mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-700 tracking-wide">
              {fileList.length} files
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row">
            {/* File List Section*/}
            <div className="flex-1 overflow-y-auto max-h-[40vh] sm:max-h-[50vh] lg:max-h-[60vh]">
              {fileList.length > 0 ? (
                fileList.map((file: UploadedFile) => (
                  <div key={file.id} className="border-b border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-gray-600"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-800 truncate">{file.name}</h3>
                          <p className="text-xs text-gray-500 font-light">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center ml-2 flex-shrink-0">
                        <button
                          onClick={() => handleDelete(file.id)}
                          disabled={deletingFiles.has(file.id)}
                          className={`transition-colors p-1 ${
                            deletingFiles.has(file.id)
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-500 hover:text-red-600 cursor-pointer'
                          }`}
                          title={deletingFiles.has(file.id) ? 'Deleting...' : 'Delete file'}
                        >
                          {deletingFiles.has(file.id) ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="animate-spin"
                            >
                              <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">No files remaining</p>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code and Share Link Section */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-100 p-4 sm:p-6 lg:p-8 bg-white flex flex-col items-center">
              {fileList.length > 0 ? (
                <>
                  <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 w-full max-w-xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fileList[0]?.shareLink || '')}`}
                      alt="QR Code"
                      className="w-full h-auto aspect-square rounded-xl object-contain"
                    />
                  </div>
                  <div className="mt-4 text-center w-full">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Share via link</h3>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
                      <input
                        type="text"
                        readOnly
                        value={fileList[0]?.shareLink || ''}
                        className="w-full sm:flex-1 px-3 py-2 text-sm border-0 bg-gray-50 rounded-lg text-center text-gray-700 truncate min-w-0"
                      />
                      <button
                        onClick={() => handleCopyLink(fileList[0]?.shareLink || '')}
                        className={`p-2 transition-colors cursor-pointer flex-shrink-0 ${
                          copiedLink === (fileList[0]?.shareLink || '')
                            ? 'text-green-600'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                        title="Copy link"
                        disabled={!fileList[0]?.shareLink}
                      >
                        {copiedLink === (fileList[0]?.shareLink || '') ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                            <path d="M4 16c-1.1 0-2-.9-2 2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">No files uploaded</h3>
                  <p className="text-xs text-gray-500">Upload files to generate share links</p>
                </div>
              )}
            </div>
          </div>
          
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileCard;
