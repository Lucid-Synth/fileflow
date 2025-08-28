import { motion } from "framer-motion";

interface UploadCardProps {
  filename: string;
  progress: number;
  onCancel: () => void;
}

export default function UploadCard({ filename, progress, onCancel }: UploadCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Cancel upload"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Uploading</h3>
        <p className="text-sm text-gray-600 mb-4 truncate">{filename}</p>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <motion.div
            className="bg-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <p className="text-sm text-gray-500 text-center">{progress}%</p>
      </div>
    </motion.div>
  );
}
