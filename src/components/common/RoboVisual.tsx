import React from 'react';

interface RoboVisualProps {
  type: 'sumo' | 'soccer' | 'iot' | 'rover' | 'drone' | 'workshop' | 'lab';
  className?: string;
  badge?: string;
  title?: string;
}

export const RoboVisual: React.FC<RoboVisualProps> = ({
  type,
  className = 'w-full h-48',
  badge,
  title,
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#12151D] via-[#0E1017] to-[#0A0B0F] border border-white/5 rounded-xl flex items-center justify-center p-6 ${className}`}
    >
      {/* Background technical grid and circuit tracks */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${type}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zinc-600" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${type})`} />
        {/* Technical crosshairs and coordinate marks */}
        <line x1="20" y1="20" x2="35" y2="20" stroke="#DC2626" strokeWidth="1" opacity="0.6" />
        <line x1="20" y1="20" x2="20" y2="35" stroke="#DC2626" strokeWidth="1" opacity="0.6" />
        <circle cx="20" cy="20" r="1.5" fill="#DC2626" />
        <text x="40" y="24" fill="#71717A" fontSize="9" fontFamily="var(--font-mono)">
          ALTRON&apos;Z-SYS // {type.toUpperCase()}
        </text>
      </svg>

      {/* Main vector subject by type */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {type === 'sumo' && (
          <svg className="w-24 h-24 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Dohyo Ring base */}
            <ellipse cx="50" cy="80" rx="42" ry="12" stroke="#3F3F46" strokeWidth="2" fill="#18181B" />
            <ellipse cx="50" cy="80" rx="36" ry="10" stroke="#DC2626" strokeWidth="1" strokeDasharray="3 3" />
            {/* Robo Sumo Heavy Chassis */}
            <path d="M25 65 L35 38 L65 38 L75 65 Z" fill="#27272A" stroke="#52525B" strokeWidth="2" />
            {/* Hardened Titanium Wedge Blade */}
            <path d="M20 68 L28 45 L72 45 L80 68 L50 72 Z" fill="#3F3F46" stroke="#EF4444" strokeWidth="1.5" />
            {/* Red sensor arrays & optical line detector */}
            <rect x="42" y="40" width="16" height="5" rx="1" fill="#DC2626" />
            <circle cx="34" cy="52" r="2" fill="#F87171" />
            <circle cx="66" cy="52" r="2" fill="#F87171" />
            {/* Traction Magnet / Heavy Wheels */}
            <rect x="18" y="55" width="8" height="15" rx="2" fill="#18181B" stroke="#71717A" strokeWidth="1" />
            <rect x="74" y="55" width="8" height="15" rx="2" fill="#18181B" stroke="#71717A" strokeWidth="1" />
          </svg>
        )}

        {type === 'soccer' && (
          <svg className="w-24 h-24 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Field circle pitch */}
            <circle cx="50" cy="50" r="42" stroke="#27272A" strokeWidth="1.5" fill="#111318" />
            <line x1="8" y1="50" x2="92" y2="50" stroke="#3F3F46" strokeWidth="1" strokeDasharray="2 2" />
            {/* Omni-directional circular robot body */}
            <circle cx="50" cy="50" r="26" fill="#1F242F" stroke="#DC2626" strokeWidth="2" />
            <circle cx="50" cy="50" r="18" fill="#141820" stroke="#3F3F46" strokeWidth="1" />
            {/* 3 Omni Wheels at 120 degrees */}
            <rect x="44" y="16" width="12" height="6" rx="2" fill="#52525B" />
            <rect x="22" y="60" width="12" height="6" rx="2" transform="rotate(60 28 63)" fill="#52525B" />
            <rect x="66" y="60" width="12" height="6" rx="2" transform="rotate(-60 72 63)" fill="#52525B" />
            {/* Solenoid Kicker & IR Ball Sensor */}
            <path d="M44 38 L56 38 L52 26 L48 26 Z" fill="#DC2626" />
            {/* Glowing Orange Soccer Ball */}
            <circle cx="50" cy="20" r="4" fill="#F97316" stroke="#FFFFFF" strokeWidth="1" />
          </svg>
        )}

        {type === 'iot' && (
          <svg className="w-24 h-24 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Microcontroller PCB body */}
            <rect x="26" y="24" width="48" height="52" rx="4" fill="#161A22" stroke="#DC2626" strokeWidth="1.5" />
            {/* Chip Core */}
            <rect x="36" y="34" width="28" height="28" rx="2" fill="#27272A" stroke="#52525B" strokeWidth="1" />
            <circle cx="50" cy="48" r="5" fill="#DC2626" opacity="0.8" />
            {/* Pin headers left and right */}
            {[28, 36, 44, 52, 60, 68].map((y) => (
              <React.Fragment key={y}>
                <line x1="20" y1={y} x2="26" y2={y} stroke="#E4E4E7" strokeWidth="1.5" />
                <line x1="74" y1={y} x2="80" y2={y} stroke="#E4E4E7" strokeWidth="1.5" />
              </React.Fragment>
            ))}
            {/* RF Antenna track & WiFi waves */}
            <path d="M38 20 L62 20 M42 16 L58 16 M46 12 L54 12" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
            {/* Circuit traces */}
            <path d="M40 66 L40 70 L48 70" stroke="#71717A" strokeWidth="1" />
            <path d="M60 66 L60 70 L52 70" stroke="#71717A" strokeWidth="1" />
          </svg>
        )}

        {type === 'rover' && (
          <svg className="w-24 h-24 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ground line */}
            <line x1="15" y1="78" x2="85" y2="78" stroke="#3F3F46" strokeWidth="1.5" />
            {/* 4 Off-road Rover Wheels */}
            <circle cx="28" cy="72" r="9" fill="#18181B" stroke="#52525B" strokeWidth="2" />
            <circle cx="72" cy="72" r="9" fill="#18181B" stroke="#52525B" strokeWidth="2" />
            {/* Rocker-Bogie Suspension Linkage */}
            <path d="M28 72 L45 58 L50 64 L72 72" stroke="#DC2626" strokeWidth="2" fill="none" />
            {/* Chassis */}
            <rect x="36" y="44" width="32" height="16" rx="3" fill="#27272A" stroke="#71717A" strokeWidth="1.5" />
            {/* LIDAR / Sensor Turret */}
            <rect x="46" y="32" width="10" height="12" fill="#18181B" stroke="#DC2626" strokeWidth="1" />
            <circle cx="51" cy="34" r="3" fill="#EF4444" />
            <path d="M51 31 L58 24 M51 31 L44 24" stroke="#DC2626" strokeWidth="1" strokeLinecap="round" />
          </svg>
        )}

        {type === 'drone' && (
          <svg className="w-24 h-24 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Quadcopter Arms */}
            <line x1="25" y1="30" x2="75" y2="70" stroke="#71717A" strokeWidth="3" />
            <line x1="75" y1="30" x2="25" y2="70" stroke="#71717A" strokeWidth="3" />
            {/* Center Avionics Hub */}
            <circle cx="50" cy="50" r="14" fill="#1E232E" stroke="#DC2626" strokeWidth="2" />
            <circle cx="50" cy="50" r="5" fill="#EF4444" />
            {/* 4 Motor Nacelles & Propeller Blurs */}
            {[[25, 30], [75, 30], [25, 70], [75, 70]].map(([x, y], idx) => (
              <React.Fragment key={idx}>
                <circle cx={x} cy={y} r="6" fill="#27272A" stroke="#DC2626" strokeWidth="1" />
                <ellipse cx={x} cy={y} rx="12" ry="4" stroke="#52525B" strokeWidth="1" strokeDasharray="3 2" />
              </React.Fragment>
            ))}
          </svg>
        )}

        {type === 'workshop' && (
          <svg className="w-24 h-24 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Workbench outline */}
            <rect x="20" y="58" width="60" height="22" rx="2" fill="#18181B" stroke="#3F3F46" strokeWidth="1.5" />
            {/* Breadboard with wire jumpers */}
            <rect x="28" y="44" width="30" height="16" rx="2" fill="#E4E4E7" stroke="#27272A" strokeWidth="1" />
            {/* Colorful jumper wires */}
            <path d="M32 46 C 36 32, 42 32, 46 46" stroke="#DC2626" strokeWidth="1.5" fill="none" />
            <path d="M40 46 C 45 36, 52 36, 54 46" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
            {/* Soldering Iron */}
            <line x1="62" y1="36" x2="78" y2="20" stroke="#71717A" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="38" x2="65" y2="33" stroke="#DC2626" strokeWidth="2" />
            {/* Tech student monitor */}
            <rect x="62" y="46" width="16" height="12" rx="1" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
            <line x1="70" y1="58" x2="70" y2="62" stroke="#64748B" strokeWidth="1.5" />
          </svg>
        )}

        {type === 'lab' && (
          <svg className="w-24 h-24 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Oscilloscope screen */}
            <rect x="22" y="26" width="56" height="42" rx="3" fill="#111827" stroke="#DC2626" strokeWidth="1.5" />
            <rect x="26" y="30" width="36" height="28" rx="2" fill="#030712" stroke="#374151" strokeWidth="1" />
            {/* Oscilloscope waveform */}
            <path d="M28 44 Q 34 32, 38 44 T 48 44 T 58 44" stroke="#22C55E" strokeWidth="1.5" fill="none" />
            {/* Knobs */}
            <circle cx="68" cy="36" r="3.5" fill="#374151" stroke="#DC2626" strokeWidth="1" />
            <circle cx="68" cy="48" r="3.5" fill="#374151" stroke="#DC2626" strokeWidth="1" />
            {/* Stand */}
            <path d="M30 68 L26 78 M70 68 L74 78" stroke="#4B5563" strokeWidth="2" />
          </svg>
        )}

        {title && (
          <p className="mt-3 text-xs font-semibold text-zinc-300 tracking-wider uppercase">
            {title}
          </p>
        )}
      </div>

      {badge && (
        <div className="absolute top-3 right-3 text-[11px] font-mono text-red-400 bg-red-950/60 border border-red-800/50 px-2 py-0.5 rounded">
          {badge}
        </div>
      )}
    </div>
  );
};
