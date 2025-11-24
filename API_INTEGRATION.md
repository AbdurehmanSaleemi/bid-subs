# API Integration Guide

## Backend API Setup

The frontend is now fully integrated with the backend API endpoints. Follow these steps to configure and use the integration:

### 1. Environment Configuration

Create a `.env` file in the `estimator-frontend` directory with:

```bash
VITE_API_URL=http://localhost:8000
```

For production, update this to your actual backend URL:

```bash
VITE_API_URL=https://your-backend-api.com
```

### 2. Available API Endpoints

The following endpoints are integrated:

- **POST `/api/v1/upload`** - Upload a PDF file
- **POST `/api/v1/process-page`** - Process a specific page
- **GET `/api/v1/file-info/{file_id}`** - Get file information
- **DELETE `/api/v1/file/{file_id}`** - Delete a file
- **GET `/api/v1/models`** - List available models
- **GET `/api/v1/health`** - Health check

### 3. Upload Modal Flow

The upload modal now has 3 steps:

#### Step 1: Upload & Details
- Select trade from dropdown (maps to model names):
  - Electrical, Data, IT, AV, Security → `elec-data-security-detector`
  - Mechanical → `mechanical-symbol-detector`
  - Fire Alarm → `fire-alarm-detector-v1`
  - Fire Protection, Sprinkler → `fire-protection-sprinkler-model`
- Upload PDF file
- Click "Next Step" → Uploads file to backend

#### Step 2: Select Page
- View all PDF pages as thumbnails
- Click any thumbnail to preview it full-screen
- Select a page
- Click "Process Page" → Sends page to backend for processing

#### Step 3: Results
- Displays processing results beautifully:
  - Processing stats (detections, categories, time)
  - Original page vs Annotated page side-by-side
  - Detailed detection information grouped by class
  - Confidence scores and bounding box positions

### 4. Features

✅ Full API integration
✅ File upload with progress
✅ Page selection with preview modal
✅ Beautiful results display
✅ Loading states for all operations
✅ Error handling and display
✅ Navigation between steps
✅ Dark mode support

### 5. API Service

The API service is located at `src/services/api.service.ts` and provides:

```typescript
import { apiService } from '@/services/api.service';

// Upload PDF
const response = await apiService.uploadPDF(file);

// Process page
const results = await apiService.processPage({
  file_id: 'file-123',
  page_number: 1,
  model_name: 'elec-data-security-detector'
});

// Get models
const models = await apiService.getModels();

// Health check
const health = await apiService.healthCheck();
```

### 6. Components

- **ProcessingResults** (`src/components/processing/ProcessingResults.tsx`)
  - Displays detection results
  - Shows original and annotated images
  - Lists all detections with confidence scores
  
- **PDFPageHover** (`src/components/pdf/PDFPageHover.tsx`)
  - Renders PDF page thumbnails
  - Click to preview full-size
  - Shows selection state

### 7. Testing

1. Start the backend server:
```bash
cd estimator-backend
python -m uvicorn app.main:app --reload
```

2. Start the frontend:
```bash
cd estimator-frontend
bun run dev
```

3. Navigate to the dashboard and click "Upload Project"
4. Follow the 3-step process

### 8. Error Handling

All API errors are caught and displayed to the user with clear messages:
- Upload failures
- Processing errors
- Network issues

### 9. Type Safety

All API responses are fully typed with TypeScript interfaces for:
- UploadResponse
- ProcessPageResponse
- Detection
- FileInfo
- ModelInfo

