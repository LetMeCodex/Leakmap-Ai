'use client';

import React from 'react';
import { useScanStore } from '../../store/useScanStore';
import { providerProfiles } from '../../lib/providerProfiles';

export default function SubprocessorGraph() {
  const { providerId, setActiveNodeId, setActiveEdgeId, activeNodeId, activeEdgeId } = useScanStore();
  const profile = providerProfiles[providerId] || providerProfiles.gemini;

  // Horizontal flow coordinates mapping for nodes
  // Layout spacing: 50 -> 250 -> 450 -> 650 -> 850
  const getNodeCoordinates = (index: number, total: number, nodeId: string) => {
    const xSpacing = 220;
    const startX = 60;
    const x = startX + index * xSpacing;
    
    // Stagger y values to make the graph look dynamic
    let y = 180;
    if (total > 2) {
      if (nodeId.includes('storage') || nodeId.includes('db') || nodeId.includes('training')) {
        y = 260; // push persistent storage downwards
      } else if (nodeId.includes('review') || nodeId.includes('human')) {
        y = 90; // push human reviewers upwards
      } else if (index % 2 === 1) {
        y = 130;
      } else if (index % 2 === 0 && index > 0) {
        y = 230;
      }
    }

    // Special layout for local sovereign (centered, simpler)
    if (providerId === 'local') {
      y = 180;
    }

    return { x, y };
  };

  // Build nodes with coordinates
  const graphNodes = profile.nodes.map((node, idx) => {
    const coords = getNodeCoordinates(idx, profile.nodes.length, node.id);
    return {
      ...node,
      ...coords,
    };
  });

  // Helper to find node coordinates
  const findNodeCoords = (id: string) => {
    const node = graphNodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 100, y: 100 };
  };

  // Node styles configuration
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'verified':
        return {
          border: 'border-2 border-brutalist-text bg-white text-brutalist-text',
          dot: 'bg-brutalist-blue pulse-glow-cyan',
          title: 'text-brutalist-text',
        };
      case 'disclosed':
        return {
          border: 'border-2 border-brutalist-text bg-white text-brutalist-text',
          dot: 'bg-brutalist-text',
          title: 'text-brutalist-text',
        };
      case 'inferred':
        return {
          border: 'border-2 border-brutalist-text bg-white text-brutalist-text',
          dot: 'bg-brutalist-amber',
          title: 'text-brutalist-text',
        };
      case 'sovereign':
        return {
          border: 'border-2 border-brutalist-text bg-white text-brutalist-text',
          dot: 'bg-brutalist-green pulse-glow-green',
          title: 'text-brutalist-text',
        };
      case 'unknown':
      default:
        return {
          border: 'border-2 border-brutalist-muted bg-brutalist-bg text-brutalist-muted',
          dot: 'bg-brutalist-muted',
          title: 'text-brutalist-muted',
        };
    }
  };

  return (
    <div className="relative w-full h-[380px] bg-white border-2 border-brutalist-text rounded-none overflow-hidden p-6 shadow-[4px_4px_0px_#050505]">
      {/* Grid background inside graph panel */}
      <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />

      {/* SVG Canvas for links */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <linearGradient id="cyan-purple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B00FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="purple-red" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#050505" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF2B2B" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="cyan-green" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B00FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00A86B" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {profile.edges.map((edge, index) => {
          const from = findNodeCoords(edge.from);
          const to = findNodeCoords(edge.to);
          
          // Bezier control parameters
          // Horizontal flow control points
          const cp1x = from.x + 80;
          const cp1y = from.y;
          const cp2x = to.x - 80;
          const cp2y = to.y;

          const pathD = `M ${from.x + 80} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x - 80} ${to.y}`;
          
          const isSelected = activeEdgeId?.from === edge.from && activeEdgeId?.to === edge.to;
          
          // Edge color mappings
          let strokeColor = '#8A8A84'; // grey
          if (edge.type === 'verified') strokeColor = '#3B00FF';
          else if (edge.type === 'disclosed') strokeColor = '#050505';
          else if (edge.type === 'inferred') strokeColor = '#DFA100';

          return (
            <g key={index} className="pointer-events-auto cursor-pointer" onClick={() => setActiveEdgeId({ from: edge.from, to: edge.to })}>
              {/* Thick transparent background for easier clicking */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth="20"
                className="hover:stroke-[#050505]/5 transition-colors"
              />
              {/* Highlight background path if selected */}
              {isSelected && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="6"
                  opacity="0.3"
                  className="blur-sm"
                />
              )}
              {/* Core connection path */}
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isSelected ? '2' : '1.5'}
                strokeDasharray={edge.type !== 'verified' ? '5,5' : 'none'}
                opacity={isSelected ? '1' : '0.4'}
                className="transition-all"
              />
              {/* Flowing particle dash animation */}
              <path
                d={pathD}
                fill="none"
                stroke={edge.type === 'verified' ? '#3B00FF' : '#050505'}
                strokeWidth="2"
                strokeDasharray="10, 150"
                className="animate-[dash_4s_linear_infinite]"
                style={{
                  strokeDashoffset: `${index * 50}`,
                  animationDuration: edge.type === 'verified' ? '3s' : '5s'
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {graphNodes.map((node) => {
          const styles = getTypeStyles(node.type);
          const isSelected = activeNodeId === node.id;
          
          return (
            <div
              key={node.id}
              className={`absolute pointer-events-auto w-[160px] h-[70px] border-2 p-3 cursor-pointer flex flex-col justify-between transition-all select-none rounded-none shadow-[2px_2px_0px_#050505] ${styles.border} ${
                isSelected ? 'border-brutalist-blue border-3 ring-2 ring-brutalist-blue shadow-[4px_4px_0px_#050505]' : 'hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#050505]'
              }`}
              style={{
                left: `${node.x - 80}px`,
                top: `${node.y - 35}px`,
              }}
              onClick={() => setActiveNodeId(node.id)}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className={`text-[10px] font-mono font-bold truncate leading-tight uppercase ${styles.title}`}>
                  {node.label}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
              </div>
              <div className="flex items-center justify-between mt-1 text-[8px] font-mono text-brutalist-muted">
                <span className="uppercase tracking-wider truncate max-w-[90px]">{node.country}</span>
                <span className="capitalize text-[7px] border border-brutalist-text px-1 rounded bg-[#F4F2EC] text-brutalist-text font-bold">{node.type}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graph Legend Panel */}
      <div className="absolute bottom-4 left-6 flex items-center gap-4 text-[8px] font-mono tracking-wider uppercase text-brutalist-muted bg-white px-3 py-1.5 border border-brutalist-text rounded-none shadow-[2px_2px_0px_#050505]">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brutalist-blue" />
          <span>Verified Network</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brutalist-text" />
          <span>Disclosed Path</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brutalist-amber" />
          <span>Inferred Risk</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brutalist-green" />
          <span>Sovereign Compute</span>
        </div>
      </div>

      {/* Embedded Instructions */}
      <div className="absolute top-4 right-6 text-[8px] font-mono text-gray-600">
        CLICK NODES & PATHS TO AUDIT EVIDENCE
      </div>

      {/* CSS style inline definition for custom SVG animations */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -160;
          }
        }
      `}</style>
    </div>
  );
}
