'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JurisdictionGlobe from '../components/globe/JurisdictionGlobe';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 60, damping: 18 },
    },
  };

  const badgeLabels = [
    { label: 'Verified endpoint', color: 'bg-brutalist-blue text-white', top: '12%', left: '10%' },
    { label: 'Disclosed processor', color: 'bg-brutalist-lime text-black', top: '24%', right: '12%' },
    { label: 'Inferred exposure', color: 'bg-brutalist-red text-white', bottom: '26%', left: '12%' },
    { label: 'Data residency unknown', color: 'bg-brutalist-amber text-black', top: '56%', right: '14%' },
    { label: 'Redaction active', color: 'bg-black text-white', bottom: '12%', right: '16%' },
  ];

  return (
    <div className="flex-grow flex flex-col justify-between items-center relative overflow-hidden select-none min-h-[calc(100vh-140px)] bg-[#F4F2EC]">
      
      {/* Main Split Layout: Left Text CTAs, Right 3D Visuals */}
      <div className="max-w-7xl mx-auto w-full px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative">
        
        {/* Left Column: Cinematic Typography & CTAs (6/12 grid) */}
        <motion.div 
          className="lg:col-span-6 flex flex-col gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Geopolitical Track indicator badge */}
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-brutalist-blue inline-block" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-brutalist-text font-bold bg-[#EBE9E2] border border-black px-3 py-1">
              Governance & Geopolitics Layer
            </span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-7xl lg:text-[85px] font-black font-display tracking-tight text-brutalist-text uppercase leading-[0.85] text-left"
          >
            YOUR PROMPT<br />
            HAS A PASSPORT<br />
            <span className="text-brutalist-blue">PROBLEM.</span>
          </motion.h1>

          {/* Hero Subheadline */}
          <motion.p 
            variants={itemVariants}
            className="text-xs md:text-sm text-brutalist-text leading-relaxed max-w-xl font-mono uppercase font-semibold border-l-2 border-black pl-4"
          >
            Before you prompt, know where your data may go. LeakMap AI audits compliance vectors, national sovereignty, and subprocessor networks in real time.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mt-2">
            <Link 
              href="/scanner" 
              className="brutalist-button text-xs py-3 px-6 shadow-[4px_4px_0px_#3B00FF] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              Scan a Prompt
            </Link>
            <Link 
              href="/evidence" 
              className="brutalist-button-outline text-xs py-3 px-6 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              View Audits
            </Link>
          </motion.div>

          {/* Small Credibility lines */}
          <motion.div 
            variants={itemVariants} 
            className="flex items-start gap-2.5 mt-4 border-t border-black pt-6 text-[10px] font-mono text-brutalist-muted max-w-lg leading-normal uppercase font-bold"
          >
            <span>[AUDIT_INFO]</span>
            <p>
              We separate verified network evidence, disclosed processor chains, and inferred jurisdictional risk. LeakMap advocates for local digital sovereignty compliance models.
            </p>
          </motion.div>
        </motion.div>

        {/* Right Column: 3D Globe inside a brutalist bordered grid (6/12 grid) */}
        <div className="lg:col-span-6 relative w-full aspect-square border-2 border-black bg-white shadow-[6px_6px_0px_#050505] flex items-center justify-center overflow-hidden">
          
          {/* Grid overlay for editorial look */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-5">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="border border-black" />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <JurisdictionGlobe variant="hero" />
          </div>

          {/* Floating UI Badges overlays */}
          {badgeLabels.map((badge, idx) => (
            <motion.div
              key={idx}
              className={`absolute hidden md:flex items-center gap-1.5 px-2.5 py-0.5 border border-black text-[9px] font-mono uppercase tracking-wider z-20 pointer-events-none font-bold shadow-[2px_2px_0px_#050505] ${badge.color}`}
              style={{
                top: badge.top,
                bottom: badge.bottom,
                left: badge.left,
                right: badge.right,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.1, duration: 0.3 }}
            >
              <span className="w-1.5 h-1.5 bg-black inline-block shrink-0" />
              {badge.label}
            </motion.div>
          ))}

          {/* Decorative corners / labels */}
          <div className="absolute top-2 left-2 font-mono text-[9px] text-brutalist-text font-bold">
            LAT: 47.3769 / LON: 8.5417
          </div>
          <div className="absolute bottom-2 right-2 font-mono text-[9px] text-brutalist-text font-bold">
            SWISS_SOVEREIGN_NODE_A
          </div>
        </div>
      </div>

      {/* Sovereign Highlights Panel Grid (Three columns of metadata index values) */}
      <section className="max-w-7xl mx-auto w-full px-6 py-12 border-t border-black grid grid-cols-1 md:grid-cols-3 gap-8 z-10 relative bg-white">
        <div className="flex flex-col gap-4 border-b border-black md:border-b-0 md:border-r border-black pb-6 md:pb-0 md:pr-8">
          <span className="text-6xl font-black font-display text-brutalist-text leading-none">
            (01)
          </span>
          <div>
            <h4 className="text-xs font-bold text-brutalist-text uppercase tracking-widest font-mono border-b border-black pb-1.5 mb-2">
              Network Telemetry
            </h4>
            <p className="text-[11px] text-brutalist-muted font-mono leading-relaxed font-semibold uppercase">
              We audit outgoing API sockets to identify gateway servers and DNS resolutions in real time. We record routing pathways before prompt dispatch.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-b border-black md:border-b-0 md:border-r border-black pb-6 md:pb-0 md:pr-8">
          <span className="text-6xl font-black font-display text-brutalist-text leading-none">
            (02)
          </span>
          <div>
            <h4 className="text-xs font-bold text-brutalist-text uppercase tracking-widest font-mono border-b border-black pb-1.5 mb-2">
              Contractual Boundaries
            </h4>
            <p className="text-[11px] text-brutalist-muted font-mono leading-relaxed font-semibold uppercase">
              We parse subprocessor trust sheets, GDPR schedules, and data storage terms of service. Transparency indices are dynamically generated from corporate disclosures.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-6xl font-black font-display text-brutalist-text leading-none">
            (03)
          </span>
          <div>
            <h4 className="text-xs font-bold text-brutalist-text uppercase tracking-widest font-mono border-b border-black pb-1.5 mb-2">
              Sovereign Compute
            </h4>
            <p className="text-[11px] text-brutalist-muted font-mono leading-relaxed font-semibold uppercase">
              We catalog local routing strategies using Docker and Ollama, eliminating international threat exposures. Keep sensitive payloads fully on-premise.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

