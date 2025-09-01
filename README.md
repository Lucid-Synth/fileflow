# FileFlow

A modern, fast, and secure file upload and sharing service built with React and FastAPI. Upload files or entire folders with ease and get shareable links instantly.

## Features

- **Fast Uploads**: Optimized batch upload system for multiple files
- **Folder Support**: Upload entire folders with drag-and-drop functionality
- **Instant Sharing**: Generate shareable links immediately after upload
- **Responsive Design**: Cross-platform UI that works on all devices
- **Secure Storage**: Files stored securely using Supabase cloud storage
- **Real-time Progress**: Live upload progress tracking with visual feedback
- **File Validation**: Comprehensive file size and type validation
- **File Management**: Delete files with integrated share link management

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **React Router** for navigation

### Backend
- **FastAPI** with Python
- **Supabase** for file storage and database
- **Uvicorn** ASGI server
- **Python-multipart** for file uploads

## Prerequisites

- **Node.js** (v20.19.0 or higher)
- **Python** (3.8 or higher)
- **Supabase** account and project

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fileflow
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your Supabase credentials
```

**Configure your `.env` file:**

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BUCKET_NAME=your-storage-bucket-name
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Start the Backend

```bash
cd ../backend

# Run the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Usage

1. **Access the Application**: Open `http://localhost:5173` in your browser
2. **Upload Files**: Click the central upload circle or drag files onto it
3. **Upload Folders**: Use the "Upload folders" button at the bottom
4. **Get Share Links**: Files are automatically processed and shareable links generated
5. **Manage Files**: View uploaded files with options to copy links or delete

## Project Structure

```
fileflow/
├── backend/                
│   ├── models/             # Database models / Pydantic schemas
│   ├── routers/            # API route definitions
│   ├── .env.example        # Backend environment variable template
│   ├── main.py             # FastAPI entry point
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   ├── public/
│   │   └── icons/          # Static icon assets
│   └── src/
│       ├── components/     # Reusable React components
│       ├── pages/          # Page-level views
│       ├── services/       # API/service layer (Supabase, etc.)
│       ├── supabaseClient.ts   # Supabase client setup
│       ├── vite-env.d.ts       # Vite type declarations
│       ├── App.tsx             # Main React app component
│       ├── index.css           # Global styles
│       └── main.tsx            # App entry point (ReactDOM.createRoot)
│
│   ├── eslint.config.js    # ESLint configuration
│   ├── index.html          # Root HTML template
│   ├── package.json        # Frontend dependencies
│   ├── package-lock.json   # Dependency lock file
│   ├── tsconfig.app.json   # TypeScript config for app
│   ├── tsconfig.json       # Base TypeScript config
│   ├── tsconfig.node.json  # TypeScript config for Node
│   ├── vercel.json         # Deployment config (Vercel)
│   ├── vite.config.ts      # Vite build tool configuration
│   ├── README.md           # Frontend-specific docs
│   └── .gitignore          # Ignore rules
│
├── .env.example            # Root-level env template
├── .gitignore              # Root ignore rules
└── README.md               # Main project documentation

```

## Configuration

### Supabase Setup

1. Create a new Supabase project
2. Create a storage bucket for file uploads
3. Configure bucket policies for public access
4. Get your project URL and service role key
5. Update the `.env` file in the backend directory

### File Size Limits

- Maximum file size: **49MB** per file
- Maximum folder size: **49MB** total
- Maximum batch upload: **20 files** at once

## API Endpoints

### Upload Endpoints
- `POST /upload` - Upload single file
- `POST /upload-multiple` - Upload multiple files (batch)

### Share Link Management
- `GET /share/{share_id}` - Get share link information
- `GET /s/{share_id}` - Redirect to actual file
- `DELETE /delete/{share_id}` - Delete file and share link

### Health Check
- `GET /health` - Check API health and configuration

## UI Components

- **Home**: Main upload interface with animated circles
- **UploadPage**: File management and sharing interface
- **FileCard**: Display uploaded files with share options
- **UploadCard**: Real-time upload progress display
- **ErrorCard**: User-friendly error messaging

## Security Features

- File size validation on both client and server
- Secure file storage with Supabase
- CORS protection configured
- Input sanitization for filenames
- Service role key protection

## Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
# Deploy to your Python hosting service (Railway, Heroku, etc.)
# Ensure environment variables are configured
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

**Upload fails with 413 error**
- Check file size limits (49MB max)
- Verify Supabase storage quotas

**CORS errors**
- Ensure frontend URL is added to CORS origins in `main.py`
- Check if backend is running on correct port

**Supabase connection issues**
- Verify environment variables are correct
- Check Supabase project status and API keys

## Support

For support, please open an issue on the GitHub repository or contact the development team.

---

**Built using React, FastAPI, and Supabase**
