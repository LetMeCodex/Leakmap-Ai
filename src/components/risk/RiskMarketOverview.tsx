'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  name: string;
  risk: number;
  layerName: string;
  confidence: number;
  evidenceType: string;
}

interface TimeframeData {
  score: number;
  delta: string;
  points: DataPoint[];
}

const datasets: Record<string, TimeframeData> = {
  '1H': {
    score: 87,
    delta: '+24 risk increase after sensitive data detected',
    points: [
      { name: '00:00', risk: 10, layerName: 'Client entry', confidence: 100, evidenceType: 'Local socket connection' },
      { name: 'API route', risk: 25, layerName: 'Proxy endpoint', confidence: 95, evidenceType: 'DNS resolution log' },
      { name: 'provider', risk: 48, layerName: 'AI host boundary', confidence: 90, evidenceType: 'Network handshake' },
      { name: 'processor', risk: 68, layerName: 'Disclosed processor', confidence: 85, evidenceType: 'Subprocessor register' },
      { name: 'subprocessor', risk: 81, layerName: 'Third-party cloud', confidence: 75, evidenceType: 'Policy audit data' },
      { name: 'unknown', risk: 87, layerName: 'Untraced transit', confidence: 62, evidenceType: 'Static inference routing' },
    ]
  },
  '1D': {
    score: 87,
    delta: '+24 risk increase after sensitive data detected',
    points: [
      { name: '00:00', risk: 12, layerName: 'Client entry', confidence: 100, evidenceType: 'Local socket connection' },
      { name: 'API route', risk: 30, layerName: 'Proxy endpoint', confidence: 95, evidenceType: 'DNS resolution log' },
      { name: 'provider', risk: 52, layerName: 'AI host boundary', confidence: 90, evidenceType: 'Network handshake' },
      { name: 'processor', risk: 64, layerName: 'Disclosed processor', confidence: 88, evidenceType: 'Subprocessor register' },
      { name: 'subprocessor', risk: 79, layerName: 'Third-party cloud', confidence: 78, evidenceType: 'Policy audit data' },
      { name: 'unknown', risk: 87, layerName: 'Untraced transit', confidence: 62, evidenceType: 'Static inference routing' },
    ]
  },
  '1W': {
    score: 82,
    delta: '+19 risk increase over last 7 days',
    points: [
      { name: '00:00', risk: 15, layerName: 'Client entry', confidence: 100, evidenceType: 'Local socket connection' },
      { name: 'API route', risk: 28, layerName: 'Proxy endpoint', confidence: 95, evidenceType: 'DNS resolution log' },
      { name: 'provider', risk: 45, layerName: 'AI host boundary', confidence: 92, evidenceType: 'Network handshake' },
      { name: 'processor', risk: 70, layerName: 'Disclosed processor', confidence: 85, evidenceType: 'Subprocessor register' },
      { name: 'subprocessor', risk: 80, layerName: 'Third-party cloud', confidence: 70, evidenceType: 'Policy audit data' },
      { name: 'unknown', risk: 82, layerName: 'Untraced transit', confidence: 65, evidenceType: 'Static inference routing' },
    ]
  },
  '1M': {
    score: 78,
    delta: '+15 risk increase over last 30 days',
    points: [
      { name: '00:00', risk: 8, layerName: 'Client entry', confidence: 100, evidenceType: 'Local socket connection' },
      { name: 'API route', risk: 22, layerName: 'Proxy endpoint', confidence: 95, evidenceType: 'DNS resolution log' },
      { name: 'provider', risk: 40, layerName: 'AI host boundary', confidence: 94, evidenceType: 'Network handshake' },
      { name: 'processor', risk: 58, layerName: 'Disclosed processor', confidence: 88, evidenceType: 'Subprocessor register' },
      { name: 'subprocessor', risk: 75, layerName: 'Third-party cloud', confidence: 72, evidenceType: 'Policy audit data' },
      { name: 'unknown', risk: 78, layerName: 'Untraced transit', confidence: 68, evidenceType: 'Static inference routing' },
    ]
  },
  '1Y': {
    score: 72,
    delta: '+9 risk increase over last 365 days',
    points: [
      { name: '00:00', risk: 5, layerName: 'Client entry', confidence: 100, evidenceType: 'Local socket connection' },
      { name: 'API route', risk: 18, layerName: 'Proxy endpoint', confidence: 96, evidenceType: 'DNS resolution log' },
      { name: 'provider', risk: 35, layerName: 'AI host boundary', confidence: 95, evidenceType: 'Network handshake' },
      { name: 'processor', risk: 55, layerName: 'Disclosed processor', confidence: 90, evidenceType: 'Subprocessor register' },
      { name: 'subprocessor', risk: 72, layerName: 'Third-party cloud', confidence: 75, evidenceType: 'Policy audit data' },
      { name: 'unknown', risk: 72, layerName: 'Untraced transit', confidence: 70, evidenceType: 'Static inference routing' },
    ]
  },
  'ALL': {
    score: 87,
    delta: '+24 risk increase over entire tracking timeline',
    points: [
      { name: '00:00', risk: 20, layerName: 'Client entry', confidence: 100, evidenceType: 'Local socket connection' },
      { name: 'API route', risk: 35, layerName: 'Proxy endpoint', confidence: 95, evidenceType: 'DNS resolution log' },
      { name: 'provider', risk: 50, layerName: 'AI host boundary', confidence: 92, evidenceType: 'Network handshake' },
      { name: 'processor', risk: 65, layerName: 'Disclosed processor', confidence: 88, evidenceType: 'Subprocessor register' },
      { name: 'subprocessor', risk: 78, layerName: 'Third-party cloud', confidence: 76, evidenceType: 'Policy audit data' },
      { name: 'unknown', risk: 87, layerName: 'Untraced transit', confidence: 62, evidenceType: 'Static inference routing' },
    ]
  }
};

const providersData = [
  { name: 'GEMINI', risk: 72, change: '+3.12%', isPositive: false, sparkline: [40, 45, 52, 60, 58, 65, 72], color: '#7C3AED', gradId: 'gemGrad' },
  { name: 'OPENAI', risk: 64, change: '+2.45%', isPositive: false, sparkline: [50, 48, 55, 62, 59, 64, 64], color: '#3B00FF', gradId: 'opGrad' },
  { name: 'CLAUDE', risk: 58, change: '+1.89%', isPositive: false, sparkline: [45, 47, 50, 52, 55, 56, 58], color: '#7C3AED', gradId: 'clGrad' },
  { name: 'LOCAL', risk: 18, change: '-42.5%', isPositive: true, sparkline: [40, 35, 28, 22, 20, 19, 18], color: '#10B981', gradId: 'locGrad' },
  { name: 'UNKNOWN', risk: 91, change: '+8.22%', isPositive: false, sparkline: [75, 78, 82, 85, 88, 90, 91], color: '#EF4444', gradId: 'unkGrad' }
];

function Sparkline({ data, strokeColor, gradientId }: { data: number[], strokeColor: string, gradientId: string }) {
  const width = 120;
  const height = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - 4 - ((val - min) / range) * (height - 8);
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#${gradientId})`} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DataPoint;
    return (
      <div className="bg-white border border-[#E8E5DC] rounded-xl p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col gap-1.5 min-w-[200px] select-none text-left font-sans text-xs">
        <div className="flex items-center justify-between border-b border-[#F4F2EC] pb-1.5 mb-1">
          <span className="font-bold text-[#111111]">Risk Metric</span>
          <span className="font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded text-[10px]">
            {data.risk} / 100
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8A8A84] font-medium">Layer:</span>
          <span className="text-[#111111] font-semibold">{data.layerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8A8A84] font-medium">Confidence:</span>
          <span className="text-[#111111] font-semibold">{data.confidence}%</span>
        </div>
        <div className="flex flex-col gap-0.5 mt-1 border-t border-[#F4F2EC] pt-1.5">
          <span className="text-[9px] text-[#8A8A84] font-mono uppercase tracking-wider font-bold">Evidence Type</span>
          <span className="text-[10px] text-[#111111] font-mono font-bold truncate">
            {data.evidenceType}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RiskMarketOverview() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1D');
  const [displayScore, setDisplayScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smooth count-up animation when selectedTimeframe changes
  useEffect(() => {
    const target = datasets[selectedTimeframe].score;
    let start = displayScore;
    if (start === target) {
      setDisplayScore(target);
      return;
    }

    const duration = 500; // ms
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = (target - start) / steps;
    let current = start;
    let step = 0;

    const timer = setInterval(() => {
      current += increment;
      step++;
      
      if (step >= steps) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [selectedTimeframe]);

  const currentDataset = datasets[selectedTimeframe];

  // Container variants for staggering mini cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 } 
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      
      {/* Main Graph Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-[#E8E5DC] rounded-3xl p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)] flex flex-col gap-6 relative"
      >
        <style jsx global>{`
          @keyframes pulse-dot-anim {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.4); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
          }
          .custom-active-dot {
            animation: pulse-dot-anim 2s infinite ease-in-out;
            transform-origin: center;
          }
        `}</style>

        {/* Card Header: Title, Metric & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F4F2EC] pb-6">
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#8A8A84] uppercase">
              Jurisdictional Exposure Trend
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-sans tracking-tight text-[#111111]">
                {displayScore} / 100
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#10B981]">
              <span>+24 risk increase after sensitive data detected</span>
            </div>
          </div>

          {/* Timeframe Selector with rounded pill background animation */}
          <div className="flex bg-[#F4F2EC] p-1 rounded-full border border-[#E8E5DC] select-none shrink-0 self-end sm:self-center">
            {['1H', '1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className="relative px-3.5 py-1 text-[10px] font-mono font-bold tracking-tight uppercase cursor-pointer rounded-full transition-colors duration-200 z-10"
                style={{ color: selectedTimeframe === tf ? '#111111' : '#8A8A84' }}
              >
                {selectedTimeframe === tf && (
                  <motion.span
                    layoutId="activeTimeframePill"
                    className="absolute inset-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-full -z-10"
                    transition={{ type: 'spring' as const, stiffness: 380, damping: 30 }}
                  />
                )}
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart Wrapper */}
        <div className="h-[280px] w-full mt-2 relative">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={currentDataset.points}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal dotted grid lines only */}
                <CartesianGrid
                  vertical={false}
                  stroke="#E8E5DC"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8A8A84', fontSize: 10, fontFamily: 'IBM Plex Mono', fontWeight: 500 }}
                  dy={10}
                />

                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8A8A84', fontSize: 10, fontFamily: 'IBM Plex Mono', fontWeight: 500 }}
                  dx={-5}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#E8E5DC', strokeWidth: 1, strokeDasharray: '3 3' }}
                  wrapperStyle={{ outline: 'none' }}
                />

                {/* Fading area gradient */}
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="none"
                  fill="url(#purpleGradient)"
                  isAnimationActive={true}
                  animationDuration={1000}
                />

                {/* Interactive main purple line */}
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  fill="none"
                  isAnimationActive={true}
                  animationDuration={1200}
                  activeDot={{
                    r: 5.5,
                    fill: '#7C3AED',
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                    className: 'custom-active-dot'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F8F7F2]/50">
              <div className="w-8 h-8 border-4 border-black border-t-[#7C3AED] animate-spin rounded-none" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Risk Market Overview Title (Bottom cards grid header) */}
      <div className="flex items-center justify-between border-b border-black pb-2 mt-2 text-left">
        <h4 className="text-xs font-bold text-[#050505] font-mono uppercase tracking-widest">
          Risk Market Overview
        </h4>
        <span className="text-[10px] font-mono text-brutalist-muted">AI_PROVIDER_EXPOSURE_INDEX</span>
      </div>

      {/* Bottom AI Providers mini cards grid with staggered entry */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {providersData.map((prov) => {
          const isPositiveChange = prov.isPositive; // Risk decrease is positive
          const changeColor = isPositiveChange ? 'text-[#10B981]' : 'text-[#EF4444]';

          return (
            <motion.div
              key={prov.name}
              variants={cardVariants}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className="bg-white border border-[#E8E5DC] rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.015)] transition-all"
            >
              <div className="flex justify-between items-start text-left">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#8A8A84]">
                    {prov.name}
                  </span>
                  <span className="text-2xl font-bold font-sans tracking-tight text-[#111111] mt-0.5">
                    {prov.risk}
                  </span>
                </div>
                <span className={`text-[10px] font-mono font-bold mt-1 px-1.5 py-0.5 bg-[#F4F2EC] border border-[#E8E5DC] rounded ${changeColor}`}>
                  {prov.change}
                </span>
              </div>

              {/* Sparkline Visualizer */}
              <div className="w-full mt-1.5">
                <Sparkline 
                  data={prov.sparkline} 
                  strokeColor={prov.color} 
                  gradientId={prov.gradId} 
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
