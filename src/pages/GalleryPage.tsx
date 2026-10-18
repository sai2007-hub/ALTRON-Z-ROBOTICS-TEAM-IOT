import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RoboVisual } from '../components/common/RoboVisual';
import { GalleryItem } from '../types';
import { Maximize2, Calendar, Tag, Layers, ImageIcon, X } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const { gallery, isAdmin } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Accessibility: Close lightbox on Escape key
  useEffect(() => {
    if (!previewItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewItem]);

  const categories = ['All', 'Competition', 'Workshop', 'Lab & R&D', 'Other'];

  // Dynamically compute unique years from gallery items + defaults
  const availableYears = Array.from(
    new Set(['2026', '2025', '2024', ...gallery.map((g) => String(g.year))])
  ).sort((a, b) => Number(b) - Number(a));
  const years = ['All', ...availableYears];

  // Public visitors see published items; Admins see all items
  const visibleGallery = isAdmin
    ? gallery
    : gallery.filter((item) => item.published !== false);

  const filteredGallery = visibleGallery.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesYear = selectedYear === 'All' || String(item.year) === selectedYear;
    return matchesCat && matchesYear;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="text-xs font-mono text-red-500 uppercase tracking-widest mb-1">
            Media & Field Archives
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Robotics & Workshop Gallery
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
            A visual chronicle of combat rounds, student lab sessions, circuit prototyping, and university bootcamps.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#12151F] border border-zinc-800 rounded-lg overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#12151F] border border-zinc-800 rounded-lg overflow-x-auto">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedYear === y
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredGallery.length === 0 ? (
        <div className="p-16 text-center bg-[#0C0F17] border border-zinc-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Gallery Photographs Found</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            No images match the selected category &ldquo;{selectedCategory}&rdquo; and year &ldquo;{selectedYear}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setPreviewItem(item)}
              className="bg-[#0C0F17] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="p-3 bg-[#111420] relative overflow-hidden flex items-center justify-center min-h-[13rem]">
                {item.imageUrl && !failedImages[item.id] ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                    className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <RoboVisual type={item.svgType || 'sumo'} className="h-48" />
                )}
                <div className="absolute top-5 right-5 p-2 bg-black/70 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span className="text-red-400">{item.category}</span>
                  <span>{item.year}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {item.caption || item.description}
                </p>
                <div className="pt-2 text-[11px] text-zinc-500 font-mono">
                  Context: {item.eventOrWorkshop}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo Preview"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-[#0F1219] border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-4 max-h-[92vh] flex flex-col overflow-y-auto my-auto shadow-2xl">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-mono text-red-500 uppercase tracking-widest block">
                  {previewItem.category} &middot; {previewItem.year}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">{previewItem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer"
                aria-label="Close image preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 bg-[#080A0E] rounded-lg border border-zinc-800 overflow-hidden flex items-center justify-center">
              {previewItem.imageUrl && !failedImages[previewItem.id] ? (
                <img
                  src={previewItem.imageUrl}
                  alt={previewItem.title}
                  onError={() => setFailedImages((prev) => ({ ...prev, [previewItem.id]: true }))}
                  className="w-full max-h-[55vh] object-contain rounded-lg"
                />
              ) : (
                <RoboVisual type={previewItem.svgType || 'sumo'} className="h-64 sm:h-72" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-300 leading-relaxed">
                {previewItem.caption || previewItem.description}
              </p>
              <p className="text-[11px] text-zinc-500 font-mono">
                Occasion: {previewItem.eventOrWorkshop}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[42px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
