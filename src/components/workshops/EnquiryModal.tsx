import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Building2, Calendar, Users, Mail, Phone, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTrack?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  preselectedTrack,
}) => {
  const { addWorkshopEnquiry } = useApp();

  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState<'School' | 'College' | 'University' | 'Organization'>('College');
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredTrack, setPreferredTrack] = useState(preselectedTrack || 'Robotics & Microcontrollers');
  const [estimatedStudents, setEstimatedStudents] = useState<number>(40);
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (preselectedTrack) {
      setPreferredTrack(preselectedTrack);
    }
  }, [preselectedTrack]);

  // Accessibility: Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!institutionName.trim()) {
      setErrorMsg('Please provide the institution or school name.');
      return;
    }
    if (!contactPerson.trim()) {
      setErrorMsg('Please provide contact person name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please provide a valid institutional or personal email.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter a phone number.');
      return;
    }

    setIsSubmitting(true);
    const result = addWorkshopEnquiry({
      institutionName: institutionName.trim(),
      institutionType,
      contactPerson: contactPerson.trim(),
      designation: designation.trim() || 'Faculty / Club Lead',
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      preferredTrack,
      estimatedStudents,
      preferredDate: preferredDate || 'Flexible / To Be Finalized',
      message: message.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message);
    }
  };

  const handleReset = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-[#0F1219] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-4 sm:my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#141824] border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="enquiry-modal-title" className="text-sm sm:text-base font-bold text-white tracking-tight">
                Host an ALTRON&apos;Z Workshop
              </h2>
              <p className="text-[11px] text-zinc-400">ALTRON&apos;Z ROBOTICS TEAM &amp; IOT &middot; Schools &amp; Colleges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {successMsg ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Enquiry Submitted Successfully</h3>
                <p className="text-xs text-zinc-300 mt-2 max-w-md mx-auto">{successMsg}</p>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 max-w-md mx-auto">
                Our outreach coordinator will send a detailed syllabus, hardware kit breakdown, and logistics checklist.
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    School / College / Institution Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. St. Xavier’s Engineering College"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Institution Category
                  </label>
                  <select
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value as any)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="College">Engineering College</option>
                    <option value="School">High School / Senior Secondary</option>
                    <option value="University">University</option>
                    <option value="Organization">Robotics Club / Maker Space</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Requested Technical Track
                  </label>
                  <select
                    value={preferredTrack}
                    onChange={(e) => setPreferredTrack(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Robotics & Microcontrollers">Robotics & Differential Drive (ESP32/Arduino)</option>
                    <option value="Industrial IoT">Industrial IoT & Sensor Telemetry</option>
                    <option value="Embedded Systems & ARM">Embedded Systems & ARM Cortex Firmware</option>
                    <option value="Computer Vision & ROS2">Computer Vision & ROS2 Autonomous Bots</option>
                    <option value="Custom Multi-Track Curriculum">Custom Multi-Track Curriculum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Contact Coordinator Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Prof. or Student Head"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Designation / Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Head of ECE / Club President"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="coordinator@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Estimated Student Count
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={300}
                    value={estimatedStudents}
                    onChange={(e) => setEstimatedStudents(parseInt(e.target.value) || 30)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Target Month / Date Window
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. November 2026 or Spring Term"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Specific Hardware or Requirements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Lab facility details, existing hardware, or specific learning goals..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Sending...' : 'Submit Host Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
