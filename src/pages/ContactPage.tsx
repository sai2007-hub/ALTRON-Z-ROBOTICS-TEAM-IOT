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
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { addWorkshopEnquiry } = useApp();

  const [institutionName, setInstitutionName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institutionType, setInstitutionType] = useState<'School' | 'College' | 'University' | 'Organization'>('College');
  const [preferredTrack, setPreferredTrack] = useState('Robotics & Microcontrollers');
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

    const res = addWorkshopEnquiry({
      institutionName: institutionName.trim(),
      institutionType,
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
      setSuccessInfo(res.message);
      setInstitutionName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setMessage('');
      setPreferredDate('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">
          Get in Touch with ALTRON&apos;Z ROBOTICS TEAM &amp; IOT
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Connect, Collaborate &amp; Host Workshops
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Whether you want to sponsor our competition squad, invite us to host a hardware workshop on your campus, or inquire about robotics rules, we are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info & Lab Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white">Laboratory Coordinates</h3>

            <div className="space-y-4 text-xs text-zinc-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Engineering Lab &amp; Test Arena</span>
                  <span className="text-zinc-400 leading-relaxed block mt-0.5">
                    ALTRON&apos;Z Robotics Center, Block 4, Tech Innovation Campus, 400 Technology Way
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Official Electronic Mail</span>
                  <a href="mailto:contact@altronz.org" className="text-red-400 hover:underline block mt-0.5">
                    contact@altronz.org
                  </a>
                  <a href="mailto:workshops@altronz.org" className="text-zinc-400 hover:underline block text-[11px]">
                    workshops@altronz.org (Outreach)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Direct Voice Line</span>
                  <span className="text-zinc-400 block mt-0.5">+1 (555) 726-2687 / +1 (555) ROBOTIC</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Lab Working Hours</span>
                  <span className="text-zinc-400 block mt-0.5">
                    Monday - Saturday: 08:30 AM - 08:00 PM
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#121520] border border-zinc-800 rounded-lg text-xs text-zinc-400 space-y-1">
              <span className="font-mono text-zinc-300 font-semibold block">Notice for Visiting Delegations:</span>
              <p className="text-[11px] leading-relaxed">
                Prior visitor authorization is required for campus entry to inspect our testing benches and competition rings.
              </p>
            </div>
          </div>
        </div>

        {/* Workshop Booking / Enquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Workshop & Partnership Enquiry</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Fill out the form below to receive a formal curriculum prospectus and fee quotation for your institution.
              </p>
            </div>

            {successInfo ? (
              <div className="p-6 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Enquiry Dispatched</h4>
                <p className="text-xs text-zinc-300">{successInfo}</p>
                <button
                  type="button"
                  onClick={() => setSuccessInfo(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg mt-2"
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
                      School / College / Organization Name <span className="text-red-500">*</span>
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
                      Contact Person Name <span className="text-red-500">*</span>
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
                      Institution Category
                    </label>
                    <select
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value as any)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="College">Engineering College</option>
                      <option value="School">High School</option>
                      <option value="University">University</option>
                      <option value="Organization">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Official Email <span className="text-red-500">*</span>
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
                      Contact Phone <span className="text-red-500">*</span>
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
                      Preferred Technical Track
                    </label>
                    <select
                      value={preferredTrack}
                      onChange={(e) => setPreferredTrack(e.target.value)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Robotics & Microcontrollers">Robotics & Differential Drive (ESP32/Arduino)</option>
                      <option value="Industrial IoT">Industrial IoT & Sensor Telemetry</option>
                      <option value="Embedded Systems & ARM">Embedded Systems & ARM Cortex Firmware</option>
                      <option value="Computer Vision & ROS2">Computer Vision & ROS2 Autonomous Bots</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Target Students & Timeline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ~45 students, November 2026"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Additional Objectives or Facility Details
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mention any existing computer lab setup, specific dates, or tailored questions..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
                  >
                    <span>{isSubmitting ? 'Transmitting...' : 'Transmit Workshop Enquiry'}</span>
                    <Send className="w-3.5 h-3.5" />
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
