'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/dashboard/Header';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DOCUMENT_CATEGORIES } from '@/types';
import type { Document, DocumentCategory } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  legal: 'Legal',
  financial: 'Financial',
  personal: 'Personal',
  correspondence: 'Correspondence',
  court: 'Court',
  other: 'Other',
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const ALLOWED_EXTENSIONS = 'PDF, JPG, PNG, WEBP, DOC, DOCX, TXT';

function getFileTypeBadge(mimeType: string | null): { label: string; className: string } | null {
  if (!mimeType) return null;
  if (mimeType === 'application/pdf')
    return { label: 'PDF', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (mimeType.startsWith('image/'))
    return { label: 'IMG', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
  if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    return { label: 'DOC', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
  if (mimeType === 'text/plain')
    return { label: 'TXT', className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300' };
  return null;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VaultPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory | ''>('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [categoryFilter, search]);

  async function fetchDocuments() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    let query = supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }
    if (search) {
      query = query.or(`file_name.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
    } else {
      setDocuments((data as Document[]) || []);
    }
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 50MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        category: uploadCategory || null,
        notes: uploadNotes.trim() || null,
      });

    if (insertError) {
      setError(`Failed to save document: ${insertError.message}`);
      setUploading(false);
      return;
    }

    setUploadCategory('');
    setUploadNotes('');
    setShowUploadForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploading(false);
    fetchDocuments();
  }

  async function handleDownload(doc: Document) {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 60);

    if (error || !data?.signedUrl) {
      setError('Failed to download file.');
      return;
    }

    window.open(data.signedUrl, '_blank');
  }

  async function handleDelete(doc: Document) {
    await supabase.storage
      .from('documents')
      .remove([doc.file_path]);

    await supabase
      .from('documents')
      .delete()
      .eq('id', doc.id);

    fetchDocuments();
  }

  async function handleUpdate(docId: string, updates: { file_name?: string; category?: string | null; notes?: string | null }) {
    await supabase
      .from('documents')
      .update(updates)
      .eq('id', docId);

    fetchDocuments();
  }

  const docCount = documents.length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Document Vault
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {loading ? 'Loading...' : `${docCount} document${docCount !== 1 ? 's' : ''}`} &middot; Only you can see them
            </p>
          </div>
          <Button className="w-full sm:w-auto shrink-0" onClick={() => setShowUploadForm(!showUploadForm)}>
            {showUploadForm ? 'Cancel' : 'Upload File'}
          </Button>
        </div>

        {/* Upload form */}
        {showUploadForm && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Category (optional)
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentCategory | '')}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                >
                  <option value="">No category</option>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g. Signed agreement from March 2025"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.txt"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-900 file:text-white dark:file:bg-white dark:file:text-zinc-900 hover:file:opacity-80 file:cursor-pointer"
                />
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Max 50MB. Supported: {ALLOWED_EXTENSIONS}
                </p>
              </div>

              {uploading && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <LoadingSpinner size="sm" />
                  Uploading...
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by filename or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="">All categories</option>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* Documents list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              {categoryFilter || search
                ? 'No documents match your search.'
                : 'No documents uploaded yet.'}
            </p>
            {!categoryFilter && !search && (
              <Button onClick={() => setShowUploadForm(true)}>
                Upload your first document
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function DocumentCard({
  doc,
  onDownload,
  onDelete,
  onUpdate,
}: {
  doc: Document;
  onDownload: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onUpdate: (docId: string, updates: { file_name?: string; category?: string | null; notes?: string | null }) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editName, setEditName] = useState(doc.file_name);
  const [editCategory, setEditCategory] = useState(doc.category || '');
  const [editNotes, setEditNotes] = useState(doc.notes || '');

  const uploadDate = new Date(doc.uploaded_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleSaveEdit = () => {
    onUpdate(doc.id, {
      file_name: editName.trim() || doc.file_name,
      category: editCategory || null,
      notes: editNotes.trim() || null,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Filename</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Category</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <option value="">No category</option>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Notes</label>
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleSaveEdit}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-zinc-900 dark:text-white break-words">
              {doc.file_name}
            </h3>
            {(() => {
              const badge = getFileTypeBadge(doc.mime_type);
              return badge ? (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.className} shrink-0`}>
                  {badge.label}
                </span>
              ) : null;
            })()}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{uploadDate}</span>
            {doc.file_size && (
              <>
                <span>&middot;</span>
                <span>{formatFileSize(doc.file_size)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {doc.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-medium">
                {CATEGORY_LABELS[doc.category] || doc.category}
              </span>
            )}
          </div>
          {doc.notes && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              {doc.notes}
            </p>
          )}
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            Edit
          </button>
          <button
            onClick={() => onDownload(doc)}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            Download
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onDelete(doc); setConfirmDelete(false); }}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm text-zinc-500 hover:text-zinc-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>

        {/* Mobile overflow menu */}
        <div className="relative sm:hidden shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20 py-1">
              <button
                onClick={() => { setEditing(true); setMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                Edit
              </button>
              <button
                onClick={() => { onDownload(doc); setMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                Download
              </button>
              {confirmDelete ? (
                <>
                  <button
                    onClick={() => { onDelete(doc); setConfirmDelete(false); setMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => { setConfirmDelete(false); setMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
