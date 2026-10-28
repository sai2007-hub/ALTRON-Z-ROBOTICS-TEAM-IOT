import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  MessageSquare,
  Info,
} from 'lucide-react';
import { ContactItem } from '../types';

export const ContactPage: React.FC = () => {
  const { addWorkshopEnquiry, contactPageConfig } = useApp();

  const [institutionName, setInstitutionName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institutionType, setInstitutionType] = useState<string>(
    contactPageConfig.institutionCategories?.[0] || 'College'
  );
  const [preferredTrack, setPreferredTrack] = useState<string>(
    contactPageConfig.technicalTracks?.[0] || 'Robotics & Microcontrollers'
  );
  const [estimatedStudents, setEstimatedStudents] = useState<number>(35);
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!institutionName.trim() || !contactPerson.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);

    const mappedType: 'School' | 'College' | 'University' | 'Organization' =
      institutionType.toLowerCase().includes('school')
        ? 'School'
        : institutionType.toLowerCase().includes('university')
        ? 'University'
        : institutionType.toLowerCase().includes('organization')
        ? 'Organization'
        : 'College';

    const res = addWorkshopEnquiry({
      institutionName: institutionName.trim(),
      institutionType: mappedType,
      contactPerson: contactPerson.trim(),
      designation: 'Faculty / Student Representative',
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      preferredTrack,
      estimatedStudents,
      preferredDate: preferredDate || 'Flexible Window',
      message: message.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessInfo(contactPageConfig.successMessage || res.message);
      setInstitutionName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setMessage('');
      setPreferredDate('');
    }
  };

  const renderContactIcon = (type: ContactItem['type']) => {
    switch (type) {
      case 'address':
        return <MapPin className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'hours':
        return <Clock className="w-4 h-4" />;
      case 'custom':
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const labels = contactPageConfig.fieldLabels || {
    institutionName: 'School / College / Organization Name',
    contactPerson: 'Contact Person Name',
    institutionCategory: 'Institution Category',
    officialEmail: 'Official Email',
    contactPhone: 'Contact Phone Number',
    preferredTrack: 'Preferred Technical Track',
    targetTimeline: 'Target Timeline / Preferred Date',
    additionalDetails: 'Special Requirements & Workshop Scope',
  };

  const activeContactItems = (contactPageConfig.contactItems || []).filter(
    (item) => item.enabled !== false
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">
          {contactPageConfig.badge}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {contactPageConfig.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          {contactPageConfig.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info & Lab Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white">Laboratory Coordinates</h3>

            <div className="space-y-4 text-xs text-zinc-300">
              {activeContactItems.map((item) => {
                const autoLink =
                  item.link ||
                  (item.type === 'email' ? `mailto:${item.value}` : undefined) ||
                  (item.type === 'phone' ? `tel:${item.value.replace(/[^0-9+]/g, '')}` : undefined);

                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                      {renderContactIcon(item.type)}
                    </div>
                    <div>
                      <span className="font-bold text-white block">{item.label}</span>
                      {autoLink ? (
                        <a
                          href={autoLink}
                          className="text-zinc-300 hover:text-red-400 transition-colors block mt-0.5 leading-relaxed"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span className="text-zinc-400 leading-relaxed block mt-0.5">
                          {item.value}
                        </span>
                      )}
                      {item.subValue && (
                        <span className="text-zinc-400 block text-[11px] mt-0.5">
                          {item.subValue}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {contactPageConfig.showVisitingNotice && (
              <div className="p-4 bg-[#121520] border border-zinc-800 rounded-lg text-xs text-zinc-400 space-y-1">
                <span className="font-mono text-zinc-300 font-semibold block">
                  {contactPageConfig.visitingNoticeTitle || 'Notice for Visiting Delegations:'}
                </span>
                <p className="text-[11px] leading-relaxed">
                  {contactPageConfig.visitingNoticeText}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Workshop Booking / Enquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">
                {contactPageConfig.enquirySectionTitle}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {contactPageConfig.enquirySectionDescription}
              </p>
            </div>

            {successInfo ? (
              <div className="p-6 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">
                  {contactPageConfig.successTitle || 'Enquiry Dispatched'}
                </h4>
                <p className="text-xs text-zinc-300">{successInfo}</p>
                <button
                  type="button"
                  onClick={() => setSuccessInfo(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg mt-2 cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {labels.institutionName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Institute of Engineering"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {labels.contactPerson} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Arthur Hayes"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {labels.institutionCategory}
                    </label>
                    <select
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      {(contactPageConfig.institutionCategories || [
                        'Engineering College',
                        'High School',
                        'University',
                        'Organization / Corporate',
                      ]).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {labels.officialEmail} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contact@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {labels.contactPhone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {labels.preferredTrack}
                    </label>
                    <select
                      value={preferredTrack}
                      onChange={(e) => setPreferredTrack(e.target.value)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      {(contactPageConfig.technicalTracks || [
                        'Robotics & Microcontrollers',
                        'IoT & Wireless Telemetry',
                        'Bare-Metal ARM Firmware',
                        'Custom Integrated Bootcamps',
                      ]).map((trk) => (
                        <option key={trk} value={trk}>
                          {trk}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Estimated Student Cohort
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={estimatedStudents}
                      onChange={(e) => setEstimatedStudents(parseInt(e.target.value) || 30)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {labels.targetTimeline}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. November 2026 or Spring Semester"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      {labels.additionalDetails}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe target student year, existing lab infrastructure, or customized requirements..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSubmitting
                        ? 'Transmitting Enquiry...'
                        : contactPageConfig.submitButtonText || 'Transmit Official Enquiry'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
