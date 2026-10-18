import React, { useState, useRef } from 'react';
import {
  Plus,
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GalleryItem } from '../../types';
import { uploadImageToStorage, createLocalImagePreview } from '../../services/cmsService';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const GalleryManager: React.FC = () => {
  const { gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Upload / Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [eventOrWorkshop, setEventOrWorkshop] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [category, setCategory] = useState<'Competition' | 'Workshop' | 'Lab & R&D' | 'Other'>('Competition');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Upload Progress & Feedback
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'Competition', 'Workshop', 'Lab & R&D', 'Other'];

  const filteredGallery = gallery.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.eventOrWorkshop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    try {
      const previews = await Promise.all(files.map((file) => createLocalImagePreview(file)));
      setFilePreviews(previews);
      if (!title && files[0]) {
        // Auto-fill suggested title from file name
        const cleanName = files[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch (err: any) {
      setErrorMsg('Could not preview selected images: ' + err.message);
    }
  };

  const handleUploadAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (selectedFiles.length === 0) {
      setErrorMsg('Please select at least one photograph to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please provide a title for the photograph.');
      return;
    }
    if (!eventOrWorkshop.trim()) {
      setErrorMsg('Please enter the event or workshop context.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let uploadedCount = 0;
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const itemTitle =
          selectedFiles.length > 1 ? `${title.trim()} (${i + 1}/${selectedFiles.length})` : title.trim();

        // 1. Upload to Cloudinary (via alias)
        const { downloadUrl, storagePath } = await uploadImageToStorage(
          file,
          'gallery',
          (pct: number) => setUploadProgress(pct)
        );

        // 2. Save metadata to Cloud Firestore
        await addGalleryItem({
          title: itemTitle,
          eventOrWorkshop: eventOrWorkshop.trim(),
          year: Number(year) || new Date().getFullYear(),
          category,
          caption: description.trim(),
          description: description.trim(),
          imageUrl: downloadUrl,
          storagePath,
          published: isPublished,
        });

        uploadedCount++;
      }

      setSuccessMsg(`Successfully uploaded and saved ${uploadedCount} image(s) to Firebase!`);
      resetAddModal();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setErrorMsg(err.message || 'Failed to upload photo to Firebase Storage and Firestore.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const resetAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedFiles([]);
    setFilePreviews([]);
    setTitle('');
    setEventOrWorkshop('');
    setDescription('');
    setYear(new Date().getFullYear());
    setCategory('Competition');
    setIsPublished(true);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSubmitting(true);
    try {
      await updateGalleryItem(editingItem.id, {
        title: editingItem.title,
        eventOrWorkshop: editingItem.eventOrWorkshop,
        year: Number(editingItem.year),
        category: editingItem.category,
        caption: editingItem.caption,
        description: editingItem.description || editingItem.caption,
        published: editingItem.published,
      });
      setSuccessMsg('Gallery metadata updated successfully in Firestore!');
      setEditingItem(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to update gallery item: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (item: GalleryItem) => {
    try {
      const nextState = !item.published;
      await updateGalleryItem(item.id, { published: nextState });
      setSuccessMsg(`Photograph is now ${nextState ? 'Published' : 'Unpublished'}.`);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setErrorMsg('Failed to toggle publication status: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteGalleryItem(deletingItem.id, deletingItem.storagePath);
      setSuccessMsg('Photograph removed from Firebase Storage and Firestore.');
      setDeletingItem(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to delete photograph: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-500" />
            <span>Photo Gallery Management</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Upload images to Firebase Storage, manage competition archives, and configure public display.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Photographs</span>
        </button>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title, event, or caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0C0F17] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0C0F17] border border-zinc-800 rounded-lg overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Items Grid */}
      {filteredGallery.length === 0 ? (
        <div className="p-16 text-center bg-[#0C0F17] border border-zinc-800 rounded-xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Photographs in Gallery</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Upload high-resolution event photos or field build captures to showcase ALTRON&apos;Z ROBOTICS TEAM &amp; IOT achievements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              className="bg-[#0C0F17] border border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all group"
            >
              {/* Image Preview */}
              <div className="h-40 bg-[#12151F] relative overflow-hidden flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center text-zinc-600">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-mono">Vector Graphic</span>
                  </div>
                )}

                {/* Published Status Badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                      item.published !== false
                        ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                        : 'bg-zinc-900/90 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {item.published !== false ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Category & Year Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-zinc-300">
                  {item.year} · {item.category}
                </div>
              </div>

              {/* Info & Metadata */}
              <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1" title={item.title}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{item.eventOrWorkshop}</p>
                  {item.caption && (
                    <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">{item.caption}</p>
                  )}
                </div>

                {/* Controls */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
                    title={item.published !== false ? 'Unpublish from Public Site' : 'Publish to Public Site'}
                  >
                    {item.published !== false ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingItem({ ...item })}
                      className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                      title="Edit Photograph Metadata"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-800 transition-colors"
                      title="Delete from Storage & Firestore"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD PHOTOGRAPHS MODAL */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-[#0F1219] border border-zinc-800 rounded-xl p-6 space-y-4 shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upload Gallery Image</h3>
                  <p className="text-[11px] text-zinc-400">Stores image in Firebase Storage and metadata in Firestore</p>
                </div>
              </div>
              <button
                onClick={resetAddModal}
                disabled={isSubmitting}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadAndSave} className="space-y-4">
              {/* File Drop / Selection Area */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Select Photograph File(s) <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-red-500/80 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#080A0E] group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-red-600/20 flex items-center justify-center text-zinc-400 group-hover:text-red-400 transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white">
                        Click to select image or drag & drop
                      </span>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Supports JPG, PNG, WEBP, GIF (Max 10 MB per file)
                      </p>
                    </div>
                  </div>
                </div>

                {/* File Previews */}
                {filePreviews.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto p-2 bg-[#0C0F17] rounded-lg border border-zinc-800">
                    {filePreviews.map((prev, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden shrink-0 border border-zinc-700">
                        <img src={prev} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center font-mono truncate px-1">
                          {selectedFiles[idx]?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Photograph Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Sumo Ring Combat"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Competition">Competition</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Lab & R&D">Lab & R&D</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Event Context & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Event / Workshop Occasion <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. National Robotics Championship 2026"
                    value={eventOrWorkshop}
                    onChange={(e) => setEventOrWorkshop(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    min={2020}
                    max={2035}
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Caption / Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Caption / Field Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Autonomous search phase during finals against defending champion..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="gallery-publish"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
                <label htmlFor="gallery-publish" className="text-xs text-zinc-300 cursor-pointer">
                  Publish immediately to public Photo Gallery page
                </label>
              </div>

              {/* Upload Progress Bar */}
              {uploadProgress !== null && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Uploading to Firebase Storage...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-red-600 h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={resetAddModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Firebase...</span>
                    </>
                  ) : (
                    <span>Upload & Save to Gallery</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PHOTOGRAPH MODAL */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-lg bg-[#0F1219] border border-zinc-800 rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Edit Photograph Metadata</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Competition">Competition</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Lab & R&D">Lab & R&D</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Year</label>
                  <input
                    type="number"
                    value={editingItem.year}
                    onChange={(e) => setEditingItem({ ...editingItem, year: parseInt(e.target.value) || 2026 })}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Event Occasion</label>
                <input
                  type="text"
                  required
                  value={editingItem.eventOrWorkshop}
                  onChange={(e) => setEditingItem({ ...editingItem, eventOrWorkshop: e.target.value })}
                  className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  value={editingItem.caption || editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value, description: e.target.value })}
                  className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-publish"
                  checked={editingItem.published !== false}
                  onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
                <label htmlFor="edit-publish" className="text-xs text-zinc-300 cursor-pointer">
                  Published to public Photo Gallery
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Metadata to Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Gallery Photograph"
        itemName={deletingItem?.title || ''}
        isDeleting={isDeleting}
        warningNote="This will permanently delete the photograph metadata from Cloud Firestore and purge the file from Firebase Storage."
      />
    </div>
  );
};
