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
      {/* Official ALTRON'Z logo */}
<div className={`relative shrink-0 ${iconDimensions} overflow-hidden rounded-xl border border-white/10 bg-[#0C0F17] shadow-[0_0_18px_rgba(220,38,38,0.22)]`}>
  <img
    src="/altronz-app-icon.png"
    alt="ALTRON'Z Robotics Team logo"
    className="h-full w-full object-contain"
    loading="eager"
  />
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
