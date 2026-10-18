import React, { useState, useRef } from 'react';
import {
  Plus,
  Trophy,
  Award,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AchievementItem } from '../../types';
import { uploadImageToStorage, createLocalImagePreview } from '../../services/cmsService';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const AchievementsManager: React.FC = () => {
  const { achievements, addAchievement, updateAchievement, deleteAchievement } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [eventName, setEventName] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [category, setCategory] = useState<'National' | 'International' | 'Regional' | 'University' | 'Hackathon'>('National');
  const [position, setPosition] = useState('First Place (Champion)');
  const [description, setDescription] = useState('');
  const [prizeDetails, setPrizeDetails] = useState('');
  const [teamMembersStr, setTeamMembersStr] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [published, setPublished] = useState(true);

  // Image Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [existingStoragePath, setExistingStoragePath] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete State
  const [deletingAch, setDeletingAch] = useState<AchievementItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'National', 'International', 'Regional', 'University', 'Hackathon'];

  const filteredAchievements = achievements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setEventName('');
    setYear(new Date().getFullYear());
    setCategory('National');
    setPosition('First Place (Champion)');
    setDescription('');
    setPrizeDetails('');
    setTeamMembersStr('');
    setCertificateId(`CERT-${Date.now().toString().slice(-4)}`);
    setPublished(true);
    setSelectedFile(null);
    setImagePreview(null);
    setExistingImageUrl('');
    setExistingStoragePath('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: AchievementItem) => {
    setEditingId(a.id);
    setTitle(a.title);
    setEventName(a.eventName);
    setYear(a.year);
    setCategory((a.category as any) || 'National');
    setPosition(a.position || a.rankOrAward);
    setDescription(a.description);
    setPrizeDetails(a.prizeDetails || '');
    setTeamMembersStr(Array.isArray(a.teamMembers) ? a.teamMembers.join(', ') : '');
    setCertificateId(a.certificateId || '');
    setPublished(a.published !== false);
    setSelectedFile(null);
    setImagePreview(null);
    setExistingImageUrl(a.imageUrl || '');
    setExistingStoragePath(a.storagePath || '');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    try {
      const preview = await createLocalImagePreview(file);
      setImagePreview(preview);
    } catch (err: any) {
      setErrorMsg('Could not read image preview: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg('Achievement title is required.');
      return;
    }
    if (!eventName.trim()) {
      setErrorMsg('Event or competition name is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Description of the win is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = existingImageUrl;
      let finalStoragePath = existingStoragePath;

      if (selectedFile) {
        setUploadProgress(10);
        const uploadRes = await uploadImageToStorage(
          selectedFile,
          'achievements',
          (pct: number) => setUploadProgress(pct)
        );
        finalImageUrl = uploadRes.downloadUrl;
        finalStoragePath = uploadRes.storagePath;
      }

      const teamMembersArray = teamMembersStr
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        title: title.trim(),
        eventName: eventName.trim(),
        year: Number(year) || new Date().getFullYear(),
        rankOrAward: position.trim(),
        position: position.trim(),
        category,
        description: description.trim(),
        prizeDetails: prizeDetails.trim(),
        teamMembers: teamMembersArray,
        certificateId: certificateId.trim(),
        imageUrl: finalImageUrl,
        storagePath: finalStoragePath,
        published,
      };

      if (editingId) {
        await updateAchievement(editingId, payload);
        setSuccessMsg(`Achievement "${title}" updated in Firestore!`);
      } else {
        await addAchievement(payload);
        setSuccessMsg(`Achievement "${title}" saved to Firestore!`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Achievement Save Error:', err);
      setErrorMsg(err.message || 'Failed to save achievement to Firebase.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleTogglePublish = async (a: AchievementItem) => {
    try {
      const next = !a.published;
      await updateAchievement(a.id, { published: next });
      setSuccessMsg(`Award is now ${next ? 'Published' : 'Unpublished'}.`);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setErrorMsg('Failed to update status: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAch) return;
    setIsDeleting(true);
    try {
      await deleteAchievement(deletingAch.id, deletingAch.storagePath);
      setSuccessMsg(`Award "${deletingAch.title}" deleted from Firebase.`);
      setDeletingAch(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to delete award: ' + err.message);
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
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Achievements & Awards Management</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Document competition wins, upload trophy photos to Firebase Storage, and publish accolades.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Award / Honor</span>
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

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search honors by title, event, or description..."
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

      {/* Achievements List */}
      {filteredAchievements.length === 0 ? (
        <div className="p-16 text-center bg-[#0C0F17] border border-zinc-800 rounded-xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Honors Recorded</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Add tournament wins, hackathon placements, and university citations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAchievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                {ach.imageUrl ? (
                  <img
                    src={ach.imageUrl}
                    alt={ach.title}
                    className="w-16 h-16 rounded-xl object-cover border border-amber-500/30 shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Trophy className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">{ach.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-700 text-amber-300">
                      {ach.position || ach.rankOrAward}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">· {ach.year}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${
                        ach.published !== false
                          ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {ach.published !== false ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">{ach.eventName} · {ach.category}</p>
                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">{ach.description}</p>
                  {ach.teamMembers && ach.teamMembers.length > 0 && (
                    <p className="text-[11px] text-zinc-500 font-mono">
                      Squad: {ach.teamMembers.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800">
                <button
                  onClick={() => handleTogglePublish(ach)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5"
                  title={ach.published !== false ? 'Unpublish' : 'Publish'}
                >
                  {ach.published !== false ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Draft</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOpenEdit(ach)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Edit Award"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeletingAch(ach)}
                  className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Delete Award"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-[#0F1219] border border-zinc-800 rounded-xl p-6 space-y-4 shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Achievement Record' : 'Add New Achievement / Award'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Trophy or Ceremony Photograph (Firebase Storage)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#080A0E] border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : existingImageUrl ? (
                      <img src={existingImageUrl} alt="Existing" className="w-full h-full object-cover" />
                    ) : (
                      <Trophy className="w-7 h-7 text-amber-500/60" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors border border-zinc-700"
                    >
                      {existingImageUrl || imagePreview ? 'Replace Trophy Photo' : 'Upload Trophy Photo'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-[11px] text-zinc-500">
                      Upload medal, trophy, or team ceremony photo (Max 10 MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Title & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Award Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. National Robo Sumo Champions"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Position / Rank <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1st Place / Gold Medal"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Event Name & Category & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Competition Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. All-India RoboFest 2026"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Tier / Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="National">National</option>
                    <option value="International">International</option>
                    <option value="Regional">Regional</option>
                    <option value="University">University</option>
                    <option value="Hackathon">Hackathon</option>
                  </select>
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

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Description / Match Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Undefeated 8-round streak in the heavy-wedge combat division..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Prize Details & Certificate ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Prize Details (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $5,000 Cash Grant & Trophy"
                    value={prizeDetails}
                    onChange={(e) => setPrizeDetails(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Certificate ID / Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CERT-AIRF-2026-904"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Team Members */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Team Members Involved (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan, Sarah Chen, Aryan Patel"
                  value={teamMembersStr}
                  onChange={(e) => setTeamMembersStr(e.target.value)}
                  className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Publish Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ach-publish"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
                <label htmlFor="ach-publish" className="text-xs text-zinc-300 cursor-pointer">
                  Display immediately on public Achievements & Awards page
                </label>
              </div>

              {/* Progress */}
              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Uploading Trophy Photo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-600 h-full" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
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
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'Update Award in Firestore' : 'Save Award to Firestore'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      <DeleteConfirmModal
        isOpen={!!deletingAch}
        onClose={() => setDeletingAch(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Award Record"
        itemName={deletingAch?.title || ''}
        isDeleting={isDeleting}
        warningNote="This will permanently delete this competition honor from Cloud Firestore and remove any uploaded trophy photo."
      />
    </div>
  );
};
