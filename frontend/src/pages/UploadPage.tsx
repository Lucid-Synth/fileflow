import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FileCard from '../components/FileCard';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  shareLink: string;
  uploadDate: Date;
}

const UploadPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    // Check if we have files in the location state
    if (location.state?.files) {
      setUploadedFiles(location.state.files);
    } else {
      // If no files provided, redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleClose = () => {
    setUploadedFiles([]);
    navigate('/');
  };

  if (uploadedFiles.length === 0) {
    return (
      <div className="min-h-screen w-full bg-[#181818] flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg mb-4">Folder is too large</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#181818] flex items-center justify-center">
      <FileCard files={uploadedFiles} onClose={handleClose} />
    </div>
  );
};

export default UploadPage;
