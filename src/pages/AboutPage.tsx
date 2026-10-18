import React from 'react';
import { RoboVisual } from '../components/common/RoboVisual';
import { Target, Compass, Cpu, Wrench, Shield, CheckCircle2, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#170E12] via-[#10141F] to-[#0A0D14] border border-red-900/30 p-8 sm:p-12 overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">
            Engineering Identity & Pedagogy
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Forging Autonomous Excellence Through Hardware First
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Founded by engineering undergraduates, ALTRON&apos;Z ROBOTICS TEAM &amp; IOT bridges the gap between textbook physics and high-stress competition robotics. We operate a dual mandate: competing at elite national tournaments and demystifying embedded hardware for thousands of school and college students through hands-on bootcamps.
          </p>
        </div>
      </div>

      {/* Mission & Vision Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-8 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Our Mission</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            To build competitive, resilient autonomous machines that push mechatronics boundaries, while making cutting-edge embedded systems, robotics, and IoT accessible to every curious young mind regardless of background or prior experience.
          </p>
          <ul className="space-y-2 text-xs text-zinc-300 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
              <span>Zero-compromise hardware immersion with real microcontrollers.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
              <span>Free introductory STEM clinics for underprivileged high schools.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
              <span>Open-source hardware repositories for competition teams.</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-8 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Our Vision</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            To establish an internationally recognized center of student engineering innovation where real-world problems in agriculture, disaster robotics, and industrial IoT are solved by undergraduate and school students working on tactile hardware.
          </p>
          <ul className="space-y-2 text-xs text-zinc-300 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
              <span>Top-tier podium finishes in international Robocup leagues.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
              <span>Incubating patentable hardware startups from team student projects.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
              <span>Training 10,000+ certified young embedded engineers by 2028.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Core Activities Breakdown */}
      <div className="bg-[#0A0C11] border border-zinc-800 rounded-2xl p-8 sm:p-10 space-y-8">
        <div>
          <span className="text-xs font-mono text-red-500 uppercase tracking-widest block mb-1">
            Operational Pillars
          </span>
          <h2 className="text-2xl font-bold text-white">Three Core Technical Disciplines</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#121520] border border-zinc-800 p-6 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <Cpu className="w-6 h-6 text-red-500" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase">DISCIPLINE 01</span>
            </div>
            <h3 className="text-base font-bold text-white">Competition Robotics</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Design of combat sumo bots, holonomic omni-wheel soccer strikers, micro-mouse maze solvers, and aerial drones for timed circuit challenges.
            </p>
          </div>

          <div className="bg-[#121520] border border-zinc-800 p-6 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <Wrench className="w-6 h-6 text-red-500" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase">DISCIPLINE 02</span>
            </div>
            <h3 className="text-base font-bold text-white">Industrial IoT & Telemetry</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Low-power sensor telemetry using LoRaWAN, ESP-NOW, and MQTT with cloud dashboard pipelines for environmental monitoring and automated rovers.
            </p>
          </div>

          <div className="bg-[#121520] border border-zinc-800 p-6 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <Award className="w-6 h-6 text-red-500" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase">DISCIPLINE 03</span>
            </div>
            <h3 className="text-base font-bold text-white">Bare-Metal Embedded Firmware</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Low-level C programming on ARM Cortex-M microcontrollers, direct register access, interrupt service routines, DMA memory transfers, and FreeRTOS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
