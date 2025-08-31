import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UploadPage from "./pages/UploadPage";
import DownloadPage from "./pages/DownloadPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/upload/:shareId" element={<UploadPage />} />
        <Route path="/download/:shareId" element={<DownloadPage />} />
      </Routes>
    </Router>
  );
};

export default App;
