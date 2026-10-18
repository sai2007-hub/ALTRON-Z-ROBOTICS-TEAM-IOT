import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Cpu,
  Home,
  Copy,
  Check,
  Loader2,
  Calendar,
  Users,
  Building2,
  GraduationCap,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventItem, WorkshopItem } from '../../types';
import { RegistrationInput } from '../../services/registrationService';

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem?: EventItem | WorkshopItem | null;
  targetType?: 'event' | 'workshop';
  onNavigateHome?: () => void;
}

interface ConfirmedRegistrationRecord {
  regId: string;
  studentName: string;
  targetTitle: string;
  targetType: 'event' | 'workshop';
  schoolOrCollege: string;
  departmentOrClass: string;
  email: string;
  phone: string;
  teamName?: string;
  teamSize?: number;
  status: string;
  timestamp: string;
}

export const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  targetType = 'event',
  onNavigateHome,
}) => {
  const { events, workshops, addRegistration } = useApp();

  const [selectedType, setSelectedType] = useState<'event' | 'workshop'>(targetType);
  const [selectedId, setSelectedId] = useState<string>(targetItem?.id || '');
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [schoolOrCollege, setSchoolOrCollege] = useState('');
  const [departmentOrClass, setDepartmentOrClass] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState<string>('2');
  const [teammateDetails, setTeammateDetails] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successRecord, setSuccessRecord] = useState<ConfirmedRegistrationRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const prevOpenRef = useRef(false);

  // Sync target when modal opens fresh
  useEffect(() => {
    if (!prevOpenRef.current && isOpen) {
      if (targetItem) {
        setSelectedId(targetItem.id);
        setSelectedType(targetType);
      } else {
        if (targetType === 'event' && events.length > 0) {
          setSelectedId(events[0].id);
          setSelectedType('event');
        } else if (targetType === 'workshop' && workshops.length > 0) {
          setSelectedId(workshops[0].id);
          setSelectedType('workshop');
        }
      }
      setErrorMsg(null);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, targetItem, targetType]);

  // Accessibility: Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting]);

  if (!isOpen) return null;

  const currentEvent = events.find((e) => e.id === selectedId);
  const currentWorkshop = workshops.find((w) => w.id === selectedId);
  const currentTitle =
    selectedType === 'event'
      ? currentEvent?.title || 'Selected Competition'
      : currentWorkshop?.title || 'Selected Workshop';

  const isTeamRequired = selectedType === 'event' && currentEvent && currentEvent.category !== 'Aerial';

  const resetFormFields = () => {
    setStudentName('');
    setEmail('');
    setPhone('');
    setSchoolOrCollege('');
    setDepartmentOrClass('');
    setTeamName('');
    setTeammateDetails('');
    setTeamSize('2');
    setExperienceLevel('Intermediate');
  };

  const handleClose = () => {
    if (successRecord) {
      resetFormFields();
      setSuccessRecord(null);
    }
    setErrorMsg(null);
    onClose();
  };

  const handleReturnHome = () => {
    resetFormFields();
    setSuccessRecord(null);
    setErrorMsg(null);
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.hash = 'home';
      onClose();
    }
  };

  const handleCopyId = () => {
    if (!successRecord?.regId) return;
    try {
      navigator.clipboard.writeText(successRecord.regId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent repeated submissions while request is pending
    if (isSubmitting) return;

    setErrorMsg(null);

    // Client-side validations
    const trimmedName = studentName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 5) {
      setErrorMsg('Please provide a valid contact phone number.');
      return;
    }

    const trimmedSchool = schoolOrCollege.trim();
    if (!trimmedSchool || trimmedSchool.length < 2) {
      setErrorMsg('Please specify your school, college, or university.');
      return;
    }

    const trimmedDept = departmentOrClass.trim();
    if (!trimmedDept) {
      setErrorMsg('Please enter your class, year, or engineering department.');
      return;
    }

    let finalTeamSize = 1;
    if (isTeamRequired) {
      if (!teamName.trim()) {
        setErrorMsg('Team name is required for team-based competitions.');
        return;
      }

      const trimmedTeamSize = teamSize.trim();
      if (!trimmedTeamSize) {
        setErrorMsg('Please specify a team size between 2 and 4 members.');
        return;
      }

      const parsed = Number(trimmedTeamSize);
      if (!Number.isInteger(parsed) || isNaN(parsed) || parsed < 2 || parsed > 4) {
        setErrorMsg('Team size must be a whole number from 2 through 4.');
        return;
      }

      finalTeamSize = parsed;
    }

    // Capture registration payload
    const regPayload: RegistrationInput = {
      studentName: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      schoolOrCollege: trimmedSchool,
      departmentOrClass: trimmedDept,
      targetType: selectedType,
      targetId: selectedId,
      targetTitle: currentTitle,
      teamName: isTeamRequired ? teamName.trim() : 'Solo',
      teamSize: isTeamRequired ? finalTeamSize : 1,
      teammateDetails: teammateDetails.trim() || undefined,
      experienceLevel,
    };

    setIsSubmitting(true);

    try {
      const result = await addRegistration(regPayload);

      setIsSubmitting(false);

      if (result.success && result.regId) {
        // Successful write to Firestore: capture verified document ID & record
        setSuccessRecord({
          regId: result.regId,
          studentName: regPayload.studentName,
          targetTitle: regPayload.targetTitle,
          targetType: regPayload.targetType,
          schoolOrCollege: regPayload.schoolOrCollege,
          departmentOrClass: regPayload.departmentOrClass,
          email: regPayload.email,
          phone: regPayload.phone,
          teamName: regPayload.teamName !== 'Solo' ? regPayload.teamName : undefined,
          teamSize: regPayload.teamSize,
          status: result.status || 'confirmed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        // Only reset form inputs AFTER database operation confirms success
        resetFormFields();
        setErrorMsg(null);
      } else {
        // If Firestore rejects or fails: keep form data, do not show success screen
        setErrorMsg(
          result.message ||
            'Registration could not be recorded. Please verify your details and try again.'
        );
      }
    } catch (err: any) {
      // If network fails or exception thrown: keep entered form data, display clear error
      setIsSubmitting(false);
      let message = 'Failed to connect to Firebase Firestore. Please check your connection and retry.';
      if (err?.message) {
        try {
          const parsed = JSON.parse(err.message);
          message = parsed.error || err.message;
        } catch {
          message = err.message;
        }
      }
      setErrorMsg(message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-[#0F1219] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header Strip */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#141824] border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="registration-modal-title"
                className="text-sm sm:text-base font-bold text-white tracking-tight"
              >
                {successRecord ? 'Registration Confirmation' : 'Official Registration Portal'}
              </h2>
              <p className="text-[11px] text-zinc-400">ALTRON&apos;Z ROBOTICS TEAM &amp; IOT</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer"
            title="Close"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {successRecord ? (
            /* Requirement 1: SUCCESS CONFIRMATION SCREEN */
            <div className="py-2 sm:py-4 space-y-6">
              {/* Header with Title and Check Icon */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/40">
                  <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-semibold tracking-wider uppercase mb-1.5">
                    <span>Firestore Document Confirmed</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Registration Successful!
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-md mx-auto">
                    Your registration has been securely committed to the ALTRON&apos;Z database. Keep your
                    Registration ID for reference and check-in.
                  </p>
                </div>
              </div>

              {/* Requirement 1 & 2: Registration Card with actual Firestore document ID */}
              <div className="bg-[#141824] border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/5 rounded-bl-full pointer-events-none" />

                {/* Primary ID & Status Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Registration ID
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-bold text-sm sm:text-base text-red-400 break-all select-all">
                        {successRecord.regId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors shrink-0"
                        title="Copy Registration ID"
                      >
                        {copiedId ? (
                          <span className="flex items-center text-emerald-400 text-[11px] gap-1 font-mono">
                            <Check className="w-3.5 h-3.5" /> Copied
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between items-center">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 sm:mb-1">
                      Registration Status
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 capitalize">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {successRecord.status}
                    </span>
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
                  <div>
                    <span className="text-zinc-400 block text-[11px] uppercase tracking-wider font-mono">
                      Student Name
                    </span>
                    <span className="font-semibold text-white mt-0.5 block text-sm">
                      {successRecord.studentName}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[11px] uppercase tracking-wider font-mono">
                      Event / Workshop
                    </span>
                    <span className="font-semibold text-white mt-0.5 block truncate text-sm" title={successRecord.targetTitle}>
                      {successRecord.targetTitle}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[11px] uppercase tracking-wider font-mono">
                      Institution
                    </span>
                    <span className="text-zinc-200 mt-0.5 block truncate" title={successRecord.schoolOrCollege}>
                      {successRecord.schoolOrCollege}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[11px] uppercase tracking-wider font-mono">
                      Class / Department
                    </span>
                    <span className="text-zinc-200 mt-0.5 block truncate" title={successRecord.departmentOrClass}>
                      {successRecord.departmentOrClass}
                    </span>
                  </div>

                  {successRecord.teamName && (
                    <div className="sm:col-span-2">
                      <span className="text-zinc-400 block text-[11px] uppercase tracking-wider font-mono">
                        Team Information
                      </span>
                      <span className="text-zinc-200 mt-0.5 block font-mono font-medium">
                        {successRecord.teamName} {successRecord.teamSize ? `(${successRecord.teamSize} members)` : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 text-[11px] text-zinc-400 border-t border-zinc-800/80 flex items-center justify-between">
                  <span>Synced in Firestore: registrations/{successRecord.regId}</span>
                  <span className="font-mono">{successRecord.timestamp}</span>
                </div>
              </div>

              {/* Requirement 1: Button to return to the home page */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReturnHome}
                  className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Home Page</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium rounded-lg transition-colors border border-zinc-700/60 cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Requirement 4: Clear error message when failed */}
              {errorMsg && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3.5 bg-red-950/50 border border-red-800 rounded-lg text-xs text-red-200 animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold block text-red-300">Registration Incomplete</span>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* Target Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Category Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-[#0A0C11] p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setSelectedType('event');
                        if (events[0]) setSelectedId(events[0].id);
                      }}
                      className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        selectedType === 'event'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Competition Event
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setSelectedType('workshop');
                        if (workshops[0]) setSelectedId(workshops[0].id);
                      }}
                      className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        selectedType === 'workshop'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Technical Workshop
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Select Specific Program
                  </label>
                  <select
                    value={selectedId}
                    disabled={isSubmitting}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 disabled:opacity-60"
                  >
                    {selectedType === 'event'
                      ? events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title} ({ev.date})
                          </option>
                        ))
                      : workshops.map((ws) => (
                          <option key={ws.id} value={ws.id}>
                            {ws.title} [{ws.track}]
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. Alex Morgan"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={isSubmitting}
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    disabled={isSubmitting}
                    onChange={(e) => setExperienceLevel(e.target.value as any)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 disabled:opacity-60"
                  >
                    <option value="Beginner">Beginner (First-time builder)</option>
                    <option value="Intermediate">Intermediate (Previous kits / Arduino)</option>
                    <option value="Advanced">Advanced (Custom PCB / Competition)</option>
                  </select>
                </div>
              </div>

              {/* Educational Affiliation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    School / College / University <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. National Institute of Tech"
                    value={schoolOrCollege}
                    onChange={(e) => setSchoolOrCollege(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Class, Year or Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. 3rd Year Mechatronics / Grade 11"
                    value={departmentOrClass}
                    onChange={(e) => setDepartmentOrClass(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Team Information if Event */}
              {isTeamRequired && (
                <div className="p-3.5 bg-[#0B0D14] border border-zinc-800/80 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">Competition Team Specs</span>
                    <span className="text-[11px] text-zinc-400">
                      Cap: {currentEvent?.teamSize || '2-4 members'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Team Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="e.g. CyberVanguard"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full bg-[#0F1219] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label htmlFor="team-size-input" className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Team Size (2 - 4) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="team-size-input"
                        type="number"
                        min={2}
                        max={4}
                        step={1}
                        disabled={isSubmitting}
                        placeholder="2"
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="w-full bg-[#0F1219] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Teammate Names (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. John Doe, Sarah Chen"
                      value={teammateDetails}
                      onChange={(e) => setTeammateDetails(e.target.value)}
                      className="w-full bg-[#0F1219] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 disabled:opacity-60"
                    />
                  </div>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="flex items-start gap-2 text-[11px] text-zinc-400 pt-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-zinc-400 mt-0.5" />
                <span>
                  ALTRON&apos;Z strictly maintains student privacy. Registration entries are securely logged into Firebase Firestore and visible only to authorized team directors.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                {/* Requirement 3: Loading state with "Submitting Registration..." and button disabled */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <span>Confirm Registration</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
