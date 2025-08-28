import { motion } from "framer-motion";

interface ErrorCardProps {
  errors: string[];
  onClose: () => void;
}

export default function ErrorCard({ errors, onClose }: ErrorCardProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[#2A2A2A] rounded-lg p-6 max-w-md w-full mx-4 border border-red-500/30"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3 className="text-white font-semibold text-lg">Upload Error</h3>
        </div>

        {/* Error Messages */}
        <div className="space-y-2 mb-6">
          {errors.map((error, index) => (
            <div
              key={index}
              className="text-red-300 text-sm bg-red-500/10 rounded p-3 border border-red-500/20"
            >
              {error}
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
