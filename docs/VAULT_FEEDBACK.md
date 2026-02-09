# Divorce Companion - Document Vault Feature Context & Feedback

## Current Implementation

### Tech Stack
- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Storage)
- **File Storage**: Supabase Storage (encrypted at rest)

### Implemented Features
- Secure file upload with "Only you can see them" security messaging
- Category system with divorce-specific options:
  - No category
  - Legal
  - Financial
  - Personal
  - Correspondence
  - Court
  - Other
- Notes/description field (optional) for adding context to documents
- File metadata display: filename, upload date, file size, category, notes
- Download and Delete actions per document
- Filter/view documents by "All categories" dropdown
- Clean upload modal workflow

### UI/UX
- Dark-themed interface matching app design
- Upload button triggers modal with category dropdown and notes textarea
- Document cards displaying all metadata in organized layout
- List view of all uploaded documents

## Feature Enhancements Roadmap

### HIGH PRIORITY - Quick Wins

#### 1. Metadata Editing Feature
**Problem**: Users upload documents in a rush (often late at night, emotionally stressed) and need to fix categorization/notes later. Currently they must delete and re-upload.

**Solution**: Add ability to edit document metadata WITHOUT touching the actual file

**What SHOULD be editable:**
- ✅ Category (change from "Legal" to "Financial", etc.)
- ✅ Notes/description text
- ✅ File name (let users rename "IMG_1234.pdf" to something meaningful)

**What should NOT be editable:**
- ❌ The actual document content (that's PDF editing - different scope)
- ❌ Upload date (maintain accurate audit trail)
- ❌ File size (it is what it is)

**Why this matters:**
- Reduces user friction during already stressful time
- Prevents loss of original files
- Avoids wasting storage/bandwidth on re-uploads
- Maintains file references for future features (linking docs to journal entries)
- Low implementation effort, high user value

**Implementation Options:**

**Option A - Edit Modal:**
```javascript
// Click "Edit" button on document card
// Show modal with:
- File name input field (editable)
- Category dropdown (current selection shown)
- Notes textarea (current notes shown)
- Save/Cancel buttons

// Backend: Update only database fields in Supabase
// Don't touch the actual stored file
```

**Option B - Inline Editing (simpler):**
- Click on category badge → dropdown appears inline
- Click on notes text → textarea appears inline
- Click on filename → input field appears
- Auto-save on blur or Enter key
- No separate modal needed

**Recommended**: Start with Option A (modal) - more explicit, harder to accidentally edit

**Database Update:**
```javascript
// Update documents table
await supabase
  .from('documents')
  .update({ 
    file_name: newFileName,
    category: newCategory,
    notes: newNotes,
    last_edited_date: new Date()
  })
  .eq('id', documentId)
  .eq('user_id', userId); // Security check
```

#### 2. UX Polish Improvements

**Drag-and-Drop Upload:**
- Add drop zone in addition to "Choose file" button
- Visual feedback on drag hover (highlight border, change background)
- Standard HTML5 drag-and-drop API
- Show "Drop files here" message when dragging over page

**Multiple File Upload:**
- Allow selecting/dropping multiple files at once
- Batch upload with individual progress bars
- Show overall progress (e.g., "Uploading 3 of 5 files...")
- Queue system if user uploads many files

**Upload Progress Indicator:**
- Progress bar during upload (especially for large files)
- Show upload speed and time remaining
- Success notification when complete
- Error handling with retry option

**Clear Upload Constraints:**
- Display file size limit prominently (e.g., "Max 50MB per file")
- Show supported file types (e.g., "PDF, JPG, PNG, DOCX")
- Inline validation before upload starts
- Error message if user tries to upload unsupported type
- Show remaining storage quota if implementing limits

**In-App PDF Preview:**
- View PDFs without downloading
- Modal or split-pane view
- Use PDF.js library for rendering
- Navigation controls (page up/down, zoom)
- Quick preview before deciding to download

**Implementation:**
```javascript
// Drag-and-drop
<div 
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  className="border-2 border-dashed p-8 text-center"
>
  Drop files here or click to upload
</div>

// Multiple files
<input 
  type="file" 
  multiple 
  accept=".pdf,.jpg,.png,.docx"
  onChange={handleFileChange}
/>

// File validation
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

if (file.size > MAX_SIZE) {
  showError('File too large. Max 50MB.');
}
if (!ALLOWED_TYPES.includes(file.type)) {
  showError('Unsupported file type.');
}
```

### MEDIUM PRIORITY - AI/Smart Features

#### 3. Document Auto-Categorization with AI
**Use Groq API** (already set up for journal summaries) to auto-categorize uploaded documents

**How it works:**
```javascript
// On file upload, send filename + file type to Groq
const prompt = `
Categorize this divorce-related document into one of these categories:
- Legal (court documents, lawyer correspondence, legal agreements)
- Financial (bank statements, tax returns, asset documents)
- Personal (personal records, medical documents)
- Correspondence (emails, text screenshots, letters)
- Court (court orders, hearing notices, filings)
- Other (anything else)

Document filename: ${fileName}
File type: ${fileType}

Respond with ONLY the category name, nothing else.
`;

// Present suggestion to user: "Suggested category: Legal"
// User can accept or change
```

**UX Flow:**
1. User uploads file
2. Show loading spinner: "Analyzing document..."
3. Display suggestion: "Suggested category: Legal ✨"
4. User can accept (one click) or change manually
5. Saves time, reduces cognitive load

**Cost**: Minimal - very short prompts, uses free Groq tier

#### 4. Key Information Extraction
**Extract structured data from documents** to make vault smarter

**What to extract:**
- Important dates (court dates, filing deadlines, agreement dates)
- Names mentioned (parties involved)
- Dollar amounts (assets, debts, payments)
- Key legal terms (custody, alimony, division of assets)

**Storage:**
```javascript
// Add to documents table
extracted_data JSONB {
  dates: ['2024-03-15', '2024-06-20'],
  amounts: ['$50,000', '$1,200/month'],
  names: ['John Smith', 'Jane Smith'],
  keywords: ['custody', 'child support', 'visitation']
}
```

**Use cases:**
- Auto-populate notes field with extracted summary
- Create timeline of important dates across all documents
- Flag upcoming deadlines with notifications
- Search documents by extracted content

**Implementation:**
```javascript
// For text-based PDFs, extract text first
const pdfText = await extractTextFromPDF(file);

// Send to Groq for analysis
const prompt = `
Extract key information from this divorce document:
${pdfText}

Return JSON with:
- dates (array of ISO date strings)
- amounts (array of monetary values)
- people (array of names)
- keywords (array of legal terms)
`;
```

#### 5. OCR for Scanned Documents
**Problem**: Many legal documents are scans/photos (not searchable text)

**Solution**: Run OCR to extract text for search and analysis

**Options:**
- **Tesseract.js** (client-side, free, decent accuracy)
- **Google Cloud Vision API** (high accuracy, costs money)
- **Groq with vision model** (if they add vision support)

**Workflow:**
1. User uploads image or scanned PDF
2. Auto-detect if file needs OCR (check if text extractable)
3. If needed, run OCR in background
4. Store extracted text in `extracted_text` column
5. Enable full-text search across all documents

**Storage:**
```javascript
// Add to documents table
extracted_text TEXT, // Full OCR text for searching
ocr_status TEXT, // 'pending', 'completed', 'failed', 'not_needed'
```

### MEDIUM-HIGH PRIORITY - Organization & Search

#### 6. Timeline View
**Show documents chronologically** to visualize case progression

**Two date options:**
- **Upload date**: When user added to vault
- **Document date**: Extracted/entered date of document itself

**UI:**
- Vertical timeline with documents as cards
- Group by month/year
- Filter by date range
- Combined view with journal entries (future)

**Implementation:**
```javascript
// Query documents ordered by date
const { data: documents } = await supabase
  .from('documents')
  .select('*')
  .eq('user_id', userId)
  .order('upload_date', { ascending: false });

// Group by month for display
const groupedByMonth = groupBy(documents, doc => 
  format(doc.upload_date, 'MMM yyyy')
);
```

#### 7. Advanced Tag System
**Beyond categories** - add flexible tagging

**Useful tags:**
- `urgent` - Needs immediate attention
- `needs-review` - Should review before lawyer meeting
- `reviewed` - Already reviewed by lawyer
- `for-court` - Will submit to court
- `evidence` - Supporting evidence for case
- `draft` - Not final version

**Features:**
- Color-coded tags for visual organization
- Multiple tags per document
- Filter by tags
- Quick-add common tags

**UI:**
- Tag input with autocomplete (suggest existing tags)
- Tag chips/badges on document cards
- Click tag to filter all docs with that tag

**Database:**
```javascript
// Add to documents table
tags TEXT[], // Array of tag strings

// Or separate tags table for more features
tags table:
  id, user_id, name, color, created_at

document_tags table:
  document_id, tag_id
```

#### 8. Smart Search & Filtering
**Make it easy to find specific documents**

**Search capabilities:**
- Search by filename
- Search by notes/description
- Search by category
- Search by tags
- Search by date range
- Full-text search in document content (requires OCR)

**Implementation:**
```javascript
// Basic search
const { data } = await supabase
  .from('documents')
  .select('*')
  .eq('user_id', userId)
  .or(`file_name.ilike.%${query}%,notes.ilike.%${query}%`)
  .order('upload_date', { ascending: false });

// Full-text search (if extracted_text column populated)
.textSearch('extracted_text', query)
```

**UI:**
- Search bar at top of vault
- Filters sidebar (category, tags, date range)
- Sort options (name, date, size, relevance)
- Show result count
- Highlight matching terms

### LOW PRIORITY - Advanced Features

#### 9. Document Sharing with Lawyers
**Securely share documents with legal professionals**

**Features:**
- Select multiple documents to share
- Generate secure shareable link (time-limited, password-optional)
- Track what's been shared and when
- Revoke access anytime
- Email notification when accessed

**Implementation:**
```javascript
// Generate secure share link
const shareId = generateRandomToken();
const expirationDate = addDays(new Date(), 7); // Expires in 7 days

await supabase
  .from('shared_documents')
  .insert({
    user_id: userId,
    share_link_id: shareId,
    document_ids: selectedDocIds,
    expiration_date: expirationDate,
    password_hash: hashedPassword // optional
  });

// Share URL: divorcecompanion.com/shared/{shareId}
```

**Lawyer Portal View:**
- Clean, professional interface
- No login required (just secure link + optional password)
- List of shared documents with preview
- Download all as ZIP option
- Watermark: "Shared by [User] on [Date]"

#### 10. Link Documents to Journal Entries
**Cross-feature integration** between Vault and Journal

**Use case:** User writes journal entry about court hearing, attaches court order document as evidence

**Features:**
- "Attach from Vault" button in journal editor
- Browse vault and select documents
- Display attached docs as chips in entry
- Click to preview attached document
- Timeline view showing journal + documents together

**Database:**
```javascript
// New junction table
journal_document_links:
  id, journal_entry_id, document_id, created_at
```

**Value:** Creates comprehensive case documentation - emotional context + hard evidence

#### 11. Document Versioning
**Track document evolution** as negotiations progress

**Use case:** Custody agreement goes through multiple revisions

**Features:**
- Upload new version of existing document
- Keep version history (v1, v2, v3...)
- Compare versions side-by-side
- Restore previous version if needed
- Show timeline of changes

**Database:**
```javascript
// Add to documents table
version_number INT DEFAULT 1,
parent_document_id UUID, // References original document
version_notes TEXT // What changed in this version
```

#### 12. Export & Backup
**Let users download or backup their vault**

**Features:**
- "Download All" button → ZIP file of entire vault
- Select multiple documents → download as package
- Organized folder structure in ZIP (by category)
- One-click backup to Google Drive (OAuth integration)
- Scheduled auto-backups
- Generate PDF package for lawyer meetings (all docs + cover page)

## Database Schema

### Current Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  category TEXT, -- 'Legal', 'Financial', etc.
  notes TEXT,
  upload_date TIMESTAMP DEFAULT NOW(),
  file_size INTEGER, -- in bytes
  file_type TEXT -- MIME type
);

-- Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id);
```

### Future Schema Additions
```sql
-- For metadata editing tracking
ALTER TABLE documents ADD COLUMN last_edited_date TIMESTAMP;

-- For AI features
ALTER TABLE documents ADD COLUMN extracted_dates JSONB;
ALTER TABLE documents ADD COLUMN extracted_text TEXT; -- OCR text
ALTER TABLE documents ADD COLUMN tags TEXT[]; -- Array of tags

-- For versioning
ALTER TABLE documents ADD COLUMN version_number INTEGER DEFAULT 1;
ALTER TABLE documents ADD COLUMN parent_document_id UUID REFERENCES documents(id);

-- For OCR tracking
ALTER TABLE documents ADD COLUMN ocr_status TEXT; -- 'pending', 'completed', 'failed'
```

## Supabase Storage Setup

### Storage Bucket Configuration
```javascript
// Bucket name: 'divorce-documents'
// Settings:
- Public: false (private files only)
- File size limit: 50MB per file
- Allowed MIME types: PDF, images, DOCX

// Storage policies (Row Level Security)
CREATE POLICY "Users can upload to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'divorce-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'divorce-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'divorce-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### File Organization
```
divorce-documents/
  {user_id}/
    {document_id}/
      original_filename.pdf
```

## Security Considerations

### File Upload Security
- Authenticate users before upload (done)
- Validate file types on client AND server (done)
- Limit file size (prevent DoS) (done)
- Add virus scanning (consider ClamAV or cloud service) (need to do)
- Sanitize filenames (remove special characters) (need to do)
- Rate limiting on upload endpoint (need to do)

### Data Privacy
- Supabase Storage encrypts files at rest ✅
- Files transferred over HTTPS ✅
- Row Level Security prevents cross-user access ✅
- Consider: Client-side encryption before upload (E2E encryption)
- GDPR compliance: User right to delete all files

### Access Control
```javascript
// Always verify user owns document before operations
const { data: document } = await supabase
  .from('documents')
  .select('*')
  .eq('id', documentId)
  .eq('user_id', userId)
  .single();

if (!document) {
  throw new Error('Document not found or access denied');
}
```

## Implementation Priority Order

### Sprint 1 (Week 1)
1. Basic vault functionality (already done)
2. Add metadata editing (modal-based)
3. Add drag-and-drop upload
4. Add file validation and error messages

### Sprint 2 (Week 2)
1. Multiple file upload
2. Upload progress indicators
3. In-app PDF preview
4. Mobile responsiveness

### Sprint 3 (Week 3)
1. Document auto-categorization with Groq API
2. Basic search functionality
3. Tag system (add/remove tags)

### Sprint 4 (Week 4+)
1. Key information extraction
2. OCR for scanned documents
3. Timeline view
4. Advanced search/filtering

## Testing Checklist

**Functional Testing:**
- [ ] Upload single file successfully
- [ ] Upload multiple files simultaneously
- [ ] Edit document metadata
- [ ] Delete document (removes from DB and Storage)
- [ ] Download document (generates signed URL)
- [ ] Filter by category
- [ ] Search by filename/notes
- [ ] File size validation (reject >50MB)
- [ ] File type validation (reject unsupported types)

**Security Testing:**
- [ ] User A cannot access User B's documents
- [ ] Unauthenticated user cannot upload
- [ ] Direct URL access to files blocked
- [ ] SQL injection attempts fail (RLS protects)
- [ ] XSS attempts in filename/notes sanitized

**Performance Testing:**
- [ ] Large file upload (50MB) completes successfully
- [ ] Multiple concurrent uploads handled
- [ ] Loading large vault (100+ documents) performant
- [ ] Search responds quickly (< 1 second)

**Mobile Testing:**
- [ ] Upload works on mobile browsers
- [ ] Touch interactions work smoothly
- [ ] Layout responsive on small screens
- [ ] Camera/photo upload works

## Notes for Implementation

**AI Integration (Groq):**
- Use same API key as journal summaries
- Keep prompts concise to minimize token usage
- Implement client-side caching (don't re-categorize same doc)
- Show loading states during AI processing
- Handle API errors gracefully (fallback to manual categorization)

**File Handling Best Practices:**
```javascript
// Generate unique document ID before upload
const documentId = uuidv4();

// Construct storage path
const filePath = `${userId}/${documentId}/${file.name}`;

// Upload to Supabase Storage
const { data: storageData, error: storageError } = await supabase.storage
  .from('divorce-documents')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false // Prevent accidental overwrites
  });

// Save metadata to database
const { data: docData, error: docError } = await supabase
  .from('documents')
  .insert({
    id: documentId,
    user_id: userId,
    file_name: file.name,
    file_path: filePath,
    file_size: file.size,
    file_type: file.type,
    category: selectedCategory,
    notes: enteredNotes
  });
```

**Error Handling:**
```javascript
// Comprehensive error handling
try {
  // Upload file
  const result = await uploadDocument(file);
  
  toast.success('Document uploaded successfully');
} catch (error) {
  if (error.message.includes('size')) {
    toast.error('File too large. Maximum size is 50MB.');
  } else if (error.message.includes('type')) {
    toast.error('Unsupported file type. Please upload PDF, JPG, PNG, or DOCX.');
  } else if (error.message.includes('storage')) {
    toast.error('Storage error. Please try again.');
  } else {
    toast.error('Upload failed. Please try again.');
    console.error('Upload error:', error);
  }
}
```

**UX Polish Details:**
- Show file count in vault header: "12 documents"
- Empty state message: "No documents yet. Upload your first document to get started."
- Skeleton loaders while fetching documents
- Optimistic UI updates (show file immediately, confirm upload in background)
- Confirmation modal before delete: "Are you sure? This cannot be undone."
- Success/error toasts for all actions

---

**Last Updated**: February 9, 2026  
**Status**: Current features implemented, enhancements prioritized and documented