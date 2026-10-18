import React, { useState, useRef } from 'react';
import {
  Plus,
  Users,
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
  Linkedin,
  Github,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TeamMember } from '../../types';
import { uploadImageToStorage, createLocalImagePreview } from '../../services/cmsService';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const TeamManager: React.FC = () => {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [subsystemFilter, setSubsystemFilter] = useState('All');

  // Form Modal (for Add & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [subsystem, setSubsystem] = useState('Leadership');
  const [bio, setBio] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [isLead, setIsLead] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [published, setPublished] = useState(true);

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [existingStoragePath, setExistingStoragePath] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete State
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const subsystems = [
    'All',
    'Leadership',
    'Embedded & Firmware',
    'Mechanical & CAD',
    'Computer Vision & AI',
    'Operations & Outreach',
  ];

  const filteredTeam = teamMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSub = subsystemFilter === 'All' || m.subsystem === subsystemFilter;
    return matchesSearch && matchesSub;
  });

  const handleOpenAdd = () => {
    setEditingMemberId(null);
    setName('');
    setRole('');
    setDepartment('Mechatronics & Robotics');
    setSubsystem('Leadership');
    setBio('');
    setSkillsStr('');
    setEmail('');
    setLinkedin('');
    setGithub('');
    setIsLead(false);
    setDisplayOrder(teamMembers.length + 1);
    setPublished(true);
    setSelectedFile(null);
    setImagePreview(null);
    setExistingImageUrl('');
    setExistingStoragePath('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: TeamMember) => {
    setEditingMemberId(m.id);
    setName(m.name);
    setRole(m.role);
    setDepartment(m.department || m.yearAndDept || '');
    setSubsystem(m.subsystem);
    setBio(m.bio);
    setSkillsStr(Array.isArray(m.skills) ? m.skills.join(', ') : '');
    setEmail(m.email || '');
    setLinkedin(m.linkedin || '');
    setGithub(m.github || '');
    setIsLead(!!m.isLead);
    setDisplayOrder(m.displayOrder || 1);
    setPublished(m.published !== false);
    setSelectedFile(null);
    setImagePreview(null);
    setExistingImageUrl(m.imageUrl || '');
    setExistingStoragePath(m.storagePath || '');
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

    if (!name.trim()) {
      setErrorMsg('Team member full name is required.');
      return;
    }
    if (!role.trim()) {
      setErrorMsg('Role or designation is required.');
      return;
    }
    if (!bio.trim()) {
      setErrorMsg('Please enter a short biography.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = existingImageUrl;
      let finalStoragePath = existingStoragePath;

      // 1. If new image selected, upload to Firebase Storage
      if (selectedFile) {
        setUploadProgress(10);
        const uploadRes = await uploadImageToStorage(
          selectedFile,
          'team',
          (pct: number) => setUploadProgress(pct)
        );
        finalImageUrl = uploadRes.downloadUrl;
        finalStoragePath = uploadRes.storagePath;
      }

      // Parse skills array
      const skillsArray = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        name: name.trim(),
        role: role.trim(),
        department: department.trim(),
        subsystem,
        bio: bio.trim(),
        yearAndDept: department.trim(),
        skills: skillsArray,
        email: email.trim(),
        linkedin: linkedin.trim(),
        github: github.trim(),
        imageUrl: finalImageUrl,
        storagePath: finalStoragePath,
        isLead,
        displayOrder: Number(displayOrder) || 1,
        published,
      };

      if (editingMemberId) {
        // Edit existing record in Firestore
        await updateTeamMember(editingMemberId, payload);
        setSuccessMsg(`Team member "${name}" successfully updated in Firestore!`);
      } else {
        // Add new record in Firestore
        await addTeamMember(payload);
        setSuccessMsg(`Team member "${name}" successfully added to Firestore!`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Team Member Save Error:', err);
      setErrorMsg(err.message || 'Failed to save team member to Firebase.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleTogglePublish = async (m: TeamMember) => {
    try {
      const next = !m.published;
      await updateTeamMember(m.id, { published: next });
      setSuccessMsg(`Profile is now ${next ? 'Published' : 'Unpublished'}.`);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setErrorMsg('Failed to update status: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
    setIsDeleting(true);
    try {
      await deleteTeamMember(deletingMember.id, deletingMember.storagePath);
      setSuccessMsg(`Member "${deletingMember.name}" deleted from Firebase.`);
      setDeletingMember(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to delete team member: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            <span>Team & Leadership Management</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Add team member profiles, upload profile images to Firebase Storage, and set hierarchy.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
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
            placeholder="Search team by name, role, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0C0F17] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0C0F17] border border-zinc-800 rounded-lg overflow-x-auto">
          {subsystems.map((sub) => (
            <button
              key={sub}
              onClick={() => setSubsystemFilter(sub)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                subsystemFilter === sub
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Team Roster List */}
      {filteredTeam.length === 0 ? (
        <div className="p-16 text-center bg-[#0C0F17] border border-zinc-800 rounded-xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
            <UserIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Team Members Found</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Add team leads, firmware engineers, and CAD architects to display your student team.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeam.map((m) => (
            <div
              key={m.id}
              className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {m.imageUrl ? (
                      <img
                        src={m.imageUrl}
                        alt={m.name}
                        className="w-12 h-12 rounded-xl object-cover border border-red-500/30 shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-zinc-800 border border-red-500/30 flex items-center justify-center text-red-400 font-bold font-mono text-base shrink-0">
                        {m.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white line-clamp-1">{m.name}</h4>
                        {m.isLead && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-red-950 border border-red-800 text-red-400">
                            LEAD
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-red-400 font-medium">{m.role}</p>
                      <p className="text-[11px] text-zinc-500">{m.subsystem}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                      m.published !== false
                        ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {m.published !== false ? 'Live' : 'Draft'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2">{m.bio}</p>

                {m.skills && m.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {m.skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-zinc-300 bg-[#121520] border border-zinc-800 px-1.5 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {m.skills.length > 4 && (
                      <span className="text-[10px] text-zinc-500 px-1 py-0.5">
                        +{m.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleTogglePublish(m)}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
                  title={m.published !== false ? 'Unpublish from Public Team Page' : 'Publish to Public Team Page'}
                >
                  {m.published !== false ? (
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
                    onClick={() => handleOpenEdit(m)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                    title="Edit Member Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingMember(m)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-800 transition-colors"
                    title="Delete Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MEMBER MODAL */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-[#0F1219] border border-zinc-800 rounded-xl p-6 space-y-4 shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingMemberId ? 'Edit Team Member Profile' : 'Add New Team Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Image Upload */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Profile Photograph (Firebase Storage)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#080A0E] border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : existingImageUrl ? (
                      <img src={existingImageUrl} alt="Existing" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-7 h-7 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors border border-zinc-700"
                    >
                      {existingImageUrl || imagePreview ? 'Replace Photo' : 'Choose Photo'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-[11px] text-zinc-500">
                      JPG, PNG, or WEBP up to 10MB. Stored securely in Firebase Storage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aryan Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Role / Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Principal Hardware Architect"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Department & Subsystem */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Department / Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4th Year Mechatronics"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Subsystem Wing
                  </label>
                  <select
                    value={subsystem}
                    onChange={(e) => setSubsystem(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Leadership">Leadership</option>
                    <option value="Embedded & Firmware">Embedded & Firmware</option>
                    <option value="Mechanical & CAD">Mechanical & CAD</option>
                    <option value="Computer Vision & AI">Computer Vision & AI</option>
                    <option value="Operations & Outreach">Operations & Outreach</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Biography <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Engineers low-latency motor control drivers and teaches embedded C..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. FreeRTOS, STM32, SolidWorks, CAN Bus"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="engineer@altronz.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full bg-[#080A0E] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Flags: Lead, Display Order, Published */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 items-center bg-[#080A0E] p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="team-islead"
                    checked={isLead}
                    onChange={(e) => setIsLead(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                  <label htmlFor="team-islead" className="text-xs text-zinc-300 cursor-pointer">
                    Team Lead
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-0.5">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#0F1219] border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="team-publish"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                  <label htmlFor="team-publish" className="text-xs text-zinc-300 cursor-pointer">
                    Published Live
                  </label>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Uploading Profile Image...</span>
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
                    <span>{editingMemberId ? 'Update Member Profile' : 'Save Member to Firestore'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Team Member"
        itemName={deletingMember?.name || ''}
        isDeleting={isDeleting}
        warningNote="This will permanently delete this member profile from Cloud Firestore and remove any uploaded profile image."
      />
    </div>
  );
};
