import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BotDocument } from '../types';
import {
  FileText,
  Download,
  ExternalLink,
  Calendar,
  Layers,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

interface BotDetailsPageProps {
  onOpenEnquiry?: (track?: string) => void;
}

export const BotDetailsPage: React.FC<BotDetailsPageProps> = ({ onOpenEnquiry }) => {
  const { botDocuments, isAdmin } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Public visitors see only published documents; Admins see all non-archived or published
  const visibleDocs = botDocuments.filter((doc) => {
    if (isAdmin) return doc.status !== 'archived';
    return doc.status === 'published' || doc.published === true;
  });

  // Extract unique bot or competition tags
  const tags = [
    'All',
    ...Array.from(
      new Set(
        visibleDocs
          .map((d) => d.botOrCompetition?.trim())
          .filter((t): t is string => Boolean(t && t.length > 0))
      )
    ),
  ];

  const filteredDocs = visibleDocs.filter((doc) => {
    const matchesTag = selectedTag === 'All' || doc.botOrCompetition === selectedTag;
    const matchesSearch =
      !searchTerm.trim() ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.botOrCompetition && doc.botOrCompetition.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return 'PDF Document';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB PDF`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB PDF`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#141824] via-[#0E1118] to-[#0A0D14] border border-zinc-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="text-red-500 font-bold uppercase tracking-wider">
              Technical Documentation &amp; Blueprints
            </span>
            <span className="text-zinc-600">&middot;</span>
            <span className="text-zinc-400">Engineering Archives</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Robot Blueprints &amp; Technical Dossiers
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Official mechanical blueprints, electrical schematics, firmware architectures, and tournament compliance documentation uploaded by ALTRON&apos;Z engineering teams.
          </p>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      {visibleDocs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, robot name, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0D1017] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {tags.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-[#12151F] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Documents Grid or Clean Polite Empty State */}
      {filteredDocs.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-[#0A0D14] border border-zinc-800/80 rounded-2xl p-8 max-w-xl mx-auto shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <FileText className="w-7 h-7 text-red-500/80" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">
              {searchTerm ? 'No Matching Documents Found' : 'No Robot Documents Published Yet'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
              {searchTerm
                ? `No technical documents matched "${searchTerm}". Try resetting search or checking filters.`
                : 'Robot CAD blueprints, circuit schematics, and competition compliance dossiers will be published here once uploaded by authorized engineers.'}
            </p>
          </div>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('All');
              }}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Clear Search Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-lg group space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/40 border border-red-800/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF Document</span>
                  </span>

                  {doc.botOrCompetition && (
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded truncate max-w-[140px]">
                      {doc.botOrCompetition}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed mt-2 line-clamp-3">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{doc.uploadedAt || 'Uploaded recently'}</span>
                  </span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                <a
                  href={doc.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  <span>View PDF</span>
                </a>

                <a
                  href={doc.pdfUrl}
                  download={doc.fileName || `${doc.title.toLowerCase().replace(/\s+/g, '_')}.pdf`}
                  className="py-2 px-3 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg text-center transition-colors shadow-sm shadow-red-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download PDF to device"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
