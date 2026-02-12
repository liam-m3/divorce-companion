# Document Vault -- Enhancement Ideas

Ideas for future improvements to the vault feature, grouped by priority.

## Current State

The vault has: file upload with validation (50MB max, type restrictions), category tagging (6 categories), notes per document, search by filename/notes, category filter, inline metadata editing, download via signed URLs, delete with confirmation, file type badges, and a mobile overflow menu.

## High Priority

### Upload UX
- Drag-and-drop upload zone (HTML5 drag-and-drop API)
- Multiple file upload with individual progress bars
- Upload progress indicator with speed and time remaining
- Show file constraints clearly before upload (size limit, supported types)

### In-App Preview
- View PDFs without downloading, using PDF.js
- Image preview in modal
- Avoids unnecessary downloads for quick checks

## Medium Priority

### AI Auto-Categorisation
Use Groq API (same setup as journal summaries) to suggest a category based on filename and file type. User sees "Suggested category: Legal" and can accept or change with one click. Minimal token usage since the prompts are short.

### Key Information Extraction
For text-based documents, extract important data: dates, names, monetary amounts, legal terms. Store as JSONB. Enables searching documents by extracted content and auto-populating the notes field.

### OCR for Scanned Documents
Many legal documents are scans or photos. Run OCR (Tesseract.js client-side or a cloud service) to extract text. Store in an `extracted_text` column for full-text search across all documents.

### Tag System
Flexible tags beyond the existing categories: `urgent`, `needs-review`, `reviewed`, `for-court`, `evidence`, `draft`. Multiple tags per document. Colour-coded, filterable. Users can create custom tags.

## Lower Priority

### Sharing with Lawyers
Generate secure, time-limited links to share selected documents. Optional password protection. Track when documents are accessed. Download all shared docs as ZIP.

### Document Linking
Link documents to journal entries for context. Junction table approach (`entry_documents`). Combined timeline view showing journal entries alongside related documents.

### Versioning
Track document revisions (e.g. custody agreement v1, v2, v3). Version history with notes on what changed. Option to restore previous versions.

### Bulk Export
"Download All" as organised ZIP (folders by category). Generate a PDF package with cover page for lawyer meetings. Scheduled auto-backup option.

## Security Notes

- Validate file types on both client and server
- Consider virus scanning (ClamAV or a cloud service)
- Sanitise filenames on upload to strip special characters
- Rate limiting on the upload endpoint
- GDPR compliance: users need the ability to export and permanently delete all their files

## Design Notes

- Users often upload in a rush and while stressed -- make it easy to fix metadata afterwards
- Private storage with signed URLs is critical -- no permanent public links
- File path isolation by user_id prevents cross-user access at the storage level
- Keep the interface simple: upload, organise, find, download
