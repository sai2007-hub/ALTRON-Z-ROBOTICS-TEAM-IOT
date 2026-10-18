import React from 'react';

interface AltronzLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export const AltronzLogo: React.FC<AltronzLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  iconOnly = false,
}) => {
  // Dimension definitions based on size
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    hero: 'w-14 h-14',
  }[size];

  const titleStyles = {
    sm: 'text-base sm:text-lg font-black tracking-wider leading-none',
    md: 'text-lg sm:text-xl font-black tracking-wider leading-none',
    lg: 'text-2xl sm:text-3xl font-black tracking-tight leading-none',
    hero: 'text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none',
  }[size];

  const subtitleStyles = {
    sm: 'text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase',
    md: 'text-[10px] font-mono tracking-widest text-zinc-400 font-bold uppercase',
    lg: 'text-xs font-mono tracking-widest text-zinc-400 font-bold uppercase',
    hero: 'text-xs sm:text-sm font-mono tracking-widest text-zinc-400 font-bold uppercase',
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      aria-label="ALTRON'Z ROBOTICS TEAM & IOT"
    >
      {/* Precision Vector Robotics & IoT Emblem */}
      <div className={`relative shrink-0 ${iconDimensions} flex items-center justify-center`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(220,38,38,0.35)]"
          aria-hidden="true"
        >
          {/* Base Hexagonal Shield */}
          <rect width="64" height="64" rx="14" fill="#0C0F17" />
          <rect x="2" y="2" width="60" height="60" rx="12" stroke="#232838" strokeWidth="1.5" />

          {/* Circuit Traces */}
          <path
            d="M8 32H18M46 32H56M32 8V18M32 46V56"
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle cx="8" cy="32" r="1.5" fill="#EF4444" />
          <circle cx="56" cy="32" r="1.5" fill="#EF4444" />
          <circle cx="32" cy="8" r="1.5" fill="#EF4444" />
          <circle cx="32" cy="56" r="1.5" fill="#EF4444" />

          {/* Faceted Titanium Mechatronic Hexagon */}
          <polygon
            points="32,15 49,24.5 49,41.5 32,51 15,41.5 15,24.5"
            fill="#121622"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Dynamic 'A' and 'Z' Geometric Vectors */}
          <path
            d="M21 40L32 20L43 40"
            stroke="#F4F4F5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Red Z-core chevron */}
          <path
            d="M25 31H39L23 44H41"
            stroke="#EF4444"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central IoT Core Node */}
          <circle cx="32" cy="32" r="2.5" fill="#DC2626" />
          <circle cx="32" cy="32" r="1" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Typography */}
      {!iconOnly && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className={`${titleStyles} text-white truncate`}>
              ALTRON&apos;Z
            </span>
            {showSubtitle && size === 'sm' && (
              <span className={`hidden sm:inline ${subtitleStyles}`}>
                ROBOTICS TEAM &amp; IOT
              </span>
            )}
          </div>
          {showSubtitle && size !== 'sm' && (
            <span className={`${subtitleStyles} mt-0.5 truncate`}>
              ROBOTICS TEAM &amp; IOT
            </span>
          )}
        </div>
      )}
    </div>
  );
};
