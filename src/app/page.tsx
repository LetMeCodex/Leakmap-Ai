'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JurisdictionGlobe from '../components/globe/JurisdictionGlobe';
import { QRCodeSVG } from 'qrcode.react';
import { getSiteUrl } from '../lib/siteUrl';

export default function LandingPage() {
  const [sourcesCount, setSourcesCount] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView && sourcesCount < 8) {
      const timer = setTimeout(() => {
        setSourcesCount(prev => prev + 1);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [inView, sourcesCount]);

  const sourcesUrl = `${getSiteUrl()}/sources`;
  const isLocalhost = sourcesUrl.includes("localhost") || sourcesUrl.includes("127.0.0.1");

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

  const beaconVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        staggerChildren: 0.15
      }
    }
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

        {/* Right Column: 3D Globe inside a refined brutalist frame (6/12 grid) */}
        <div className="lg:col-span-6 relative w-full aspect-square border-[1.5px] border-black bg-[#F4F2EC] shadow-[8px_8px_0px_#050505] flex items-center justify-center overflow-hidden">
          
          {/* Inner hairline border */}
          <div className="absolute inset-2 border border-black/10 pointer-events-none z-20" />

          {/* Corner calibration marks */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-black/40 pointer-events-none z-20" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-black/40 pointer-events-none z-20" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-black/40 pointer-events-none z-20" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-black/40 pointer-events-none z-20" />

          {/* Grid overlay for editorial look */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-5">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="border border-black" />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <JurisdictionGlobe variant="hero" />
          </div>

          {/* Corner text overlays (tiny mono labels) */}
          <div className="absolute top-3.5 left-3.5 font-mono text-[8px] text-black/60 pointer-events-none z-20 leading-none">
            LMX_GLOBE_RENDER / EXPOSURE MODEL
          </div>
          <div className="absolute top-3.5 right-3.5 font-mono text-[8px] text-black/60 pointer-events-none z-20 leading-none text-right">
            TRACE TYPE: EXPOSURE MODEL
          </div>
          <div className="absolute bottom-3.5 left-3.5 font-mono text-[8px] text-black/60 pointer-events-none z-20 leading-none">
            NOT A PHYSICAL PACKET TRACE
          </div>
          <div className="absolute bottom-3.5 right-3.5 font-mono text-[8px] text-black/60 pointer-events-none z-20 leading-none text-right">
            EVIDENCE-LINKED ROUTES
          </div>
        </div>
      </div>

      {/* SOURCE BEACON Hero-Adjacent Credibility Section */}
      <motion.section 
        onViewportEnter={() => setInView(true)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={beaconVariants}
        className="w-full border-t-2 border-black bg-[#F4F2EC] relative z-10 select-none"
      >
        <div className="max-w-[1600px] mx-auto w-full px-6 md:px-[72px] py-16 md:py-20 flex flex-col lg:flex-row gap-12 lg:gap-[56px]">
          {/* Left Column: Evidence Message (65%) */}
          <div className="w-full lg:w-[65%] flex flex-col gap-6">
            
            {/* Metadata Label */}
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#77776F] font-bold">
              [00] EVIDENCE-BACKED METHODOLOGY / SOURCE VAULT
            </span>

            {/* Main Heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-[58px] font-black font-display tracking-tight text-[#050505] uppercase leading-[0.9] text-left">
              <motion.span 
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="block"
              >
                WE DO NOT CLAIM HIDDEN PATHS.
              </motion.span>
              <motion.span 
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="text-[#3B00FF] block"
              >
                WE SHOW EVIDENCE-BACKED EXPOSURE.
              </motion.span>
            </h2>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-[#050505] leading-relaxed font-mono uppercase font-semibold border-l-2 border-black pl-4">
              “LeakMap is not a packet sniffer for proprietary AI providers. We do not claim to observe exact internal data centers, GPUs, model workers, or hidden routing paths. Every route, warning, and score is backed by official provider sources, runtime endpoint evidence, confidence labels, and clearly marked unknowns.”
            </p>

            {/* Hero Section Microcopy quote box */}
            <div className="border border-black bg-white p-4 text-[11px] text-[#77776F] uppercase font-mono leading-relaxed font-bold shadow-[2px_2px_0px_#050505]">
              “LeakMap does not ask you to trust a glowing line on a globe. Every route is classified as verified, disclosed, inferred, or unknown. Every claim has a source, a confidence score, and a limitation statement.”
              <span className="block mt-2.5 text-black font-black">
                “Scan the Source Beacon to inspect the official documents behind the model.”
              </span>
            </div>

            {/* Highlighted note */}
            <div className="bg-[#EBE9E2] border border-black p-3.5 text-[10px] leading-relaxed uppercase font-mono font-semibold text-black">
              “Solid routes = verified endpoint telemetry. Dashed routes = disclosed provider evidence. Dotted routes = inferred or unknown jurisdictional risk.”
            </div>

            {/* Brutalist stamp */}
            <div className="mt-2 flex">
              <motion.div
                variants={{
                  hidden: { scale: 2, opacity: 0, rotate: 10 },
                  visible: { scale: 1, opacity: 1, rotate: -2 }
                }}
                transition={{ type: "spring", damping: 10, stiffness: 100 }}
                className="border-2 border-black bg-white px-5 py-3 text-xs font-mono font-black uppercase text-black tracking-wider shadow-[3.5px_3.5px_0px_#050505] select-none"
              >
                EVIDENCE-BACKED<br />
                <span className="text-[#3B00FF]">NOT PHYSICAL ROUTE PROOF</span>
              </motion.div>
            </div>

          </div>

          {/* Right Column: QR Source Vault Card (35%) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[35%] flex flex-col gap-4"
          >
            
            {/* Card Content Wrapper */}
            <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#050505] flex flex-col gap-4">
              
              <div>
                <h3 className="text-lg font-black text-black uppercase tracking-tight">SOURCE VAULT</h3>
                <p className="text-[10px] text-[#77776F] uppercase leading-relaxed mt-1 font-semibold">
                  “Scan to view all official statements, provider docs, subprocessors, retention policies, and methodology limits used by LeakMap.”
                </p>
              </div>

              {/* QR Visual */}
              <div className="relative bg-[#F4F2EC] p-6 border-2 border-black flex flex-col items-center justify-center overflow-hidden">
                
                {/* Inner border frame */}
                <div className="border border-black p-3 bg-white relative shadow-[2px_2px_0px_rgba(0,0,0,0.05)]">
                  
                  {/* Subtle pulsing electric blue corner dot */}
                  <div className="absolute top-1.5 right-1.5 z-20 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B00FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B00FF]"></span>
                  </div>

                  {/* Loop-based vertical scanline */}
                  <motion.div 
                    className="absolute left-0 right-0 h-[1.5px] bg-[#3B00FF] z-10 pointer-events-none"
                    initial={{ top: "0%", opacity: 0 }}
                    animate={{ 
                      top: ["0%", "100%"], 
                      opacity: [0, 1, 1, 0] 
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />

                  <QRCodeSVG 
                    value={sourcesUrl} 
                    size={140} 
                    bgColor="#FFFFFF"
                    fgColor="#050505"
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <span className="text-[9px] font-mono font-black text-black mt-3.5 uppercase tracking-widest text-center block">
                  SCAN OFFICIAL SOURCE VAULT
                </span>
              </div>

              {/* Localhost Warning Badge */}
              {isLocalhost && (
                <div className="border border-amber-600 bg-amber-50 p-2 text-left text-[8px] text-amber-900 leading-normal font-semibold uppercase flex gap-1 items-start">
                  <span className="text-amber-700 shrink-0 font-extrabold">⚠️ LOCAL QR WARNING:</span>
                  <p>
                    Phone scanners cannot open laptop localhost. Deploy to Vercel or use ngrok/Cloudflare Tunnel.
                  </p>
                </div>
              )}

              {/* Card Metadata info */}
              <div className="border border-black bg-[#F8F7F2] p-3 flex flex-col gap-1.5 text-[9px] font-mono text-[#77776F] font-semibold uppercase leading-tight">
                <div>
                  <span className="text-black font-extrabold">SOURCES LINKED:</span>{' '}
                  <span className="text-[#3B00FF] font-black">0{sourcesCount}</span>
                </div>
                <div className="border-t border-black/10 pt-1">
                  <span className="text-black font-extrabold">CLAIMS COVERED:</span>{' '}
                  <span className="text-black">ROUTING / RETENTION / SUBPROCESSORS / DATA RESIDENCY</span>
                </div>
                <div className="border-t border-black/10 pt-1">
                  <span className="text-black font-extrabold">TRACE MODEL:</span>{' '}
                  <span className="text-[#3B00FF] font-black">VERIFIED / DISCLOSED / INFERRED</span>
                </div>
              </div>

              {/* Brutalist Link button */}
              <Link 
                href="/sources"
                className="w-full py-3 bg-[#3B00FF] hover:bg-[#F4F2EC] text-white hover:text-black text-center text-xs font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_#050505] hover:shadow-[2px_2px_0px_#050505] hover:translate-x-0.5 hover:translate-y-0.5 transition-all block duration-200"
              >
                OPEN SOURCE VAULT ↗
              </Link>

            </div>

          </motion.div>
        </div>
      </motion.section>

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

