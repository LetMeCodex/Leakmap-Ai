'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { useScanStore } from '../../store/useScanStore';
import { getRouteEvidenceId } from '../../lib/evidenceRegistry';

interface GlobeProps {
  providerId?: string;
  variant?: 'hero' | 'scanner';
  onEdgeClick?: (edge: { from: string; to: string }) => void;
  onNodeClick?: (nodeId: string) => void;
}

interface RoutePoint {
  id: string;
  name: string;
  coords: [number, number]; // [longitude, latitude]
}

interface MapRoute {
  id: string;
  from: RoutePoint;
  to: RoutePoint;
  type: 'verified' | 'disclosed' | 'inferred' | 'local' | 'unknown';
  confidence: number;
  edge: { from: string; to: string };
  source: string;
  evidenceId?: string;
}


export default function JurisdictionGlobe({
  providerId,
  variant = 'scanner',
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  // Zustand Store integrations
  const storeProviderId = useScanStore((state) => state.providerId);
  const storeActiveResult = useScanStore((state) => state.activeResult);
  const setActiveEdgeId = useScanStore((state) => state.setActiveEdgeId);

  const activeProviderId = providerId || storeProviderId;

  // Component state
  const [worldData, setWorldData] = useState<any>(null);
  const [hoveredRoute, setHoveredRoute] = useState<MapRoute | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animation values
  const pulseTime = useRef(0);
  const flowTime = useRef(0);
  const scanAnimationProgress = useRef(1.0); // starts fully drawn

  // Projection angles LERP trackers
  const rotationRef = useRef<[number, number]>([-78.9629, -20.5937]); // centered on India initially
  const targetRotationRef = useRef<[number, number]>([-78.9629, -20.5937]);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Dimension trackers
  const [dimensions, setDimensions] = useState({ width: 500, height: 460 });

  // D3 Projection and Graticule
  const projection = useRef(d3.geoOrthographic().clipAngle(90));
  const graticule = useRef(d3.geoGraticule().extent([[-180, -90], [180 - 0.1, 90 - 0.1]]));

  // Load World TopoJSON at mount
  useEffect(() => {
    fetch('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95802/world-110m.json')
      .then((res) => res.json())
      .then((data) => {
        setWorldData(data);
      })
      .catch((err) => {
        console.error('Failed to load world map data, falling back to schematic rendering', err);
      });
  }, []);

  // Recalculate dimensions on container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: width || container.clientWidth || 500,
          height: height || container.clientHeight || 460,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Reset focus rotation and trigger scan draw animation on provider or scan result changes
  useEffect(() => {
    // Center camera on India [78.96N, 20.59E] (so rotation is [-78.96, -20.59])
    targetRotationRef.current = [-78.9629, -20.5937];
    scanAnimationProgress.current = 0.0; // trigger draw animation
  }, [activeProviderId, storeActiveResult]);

  // Dynamic route configurations
  const getProviderRoutes = (pId: string): MapRoute[] => {
    const points = {
      india: { id: 'india', name: 'User Origin (India)', coords: [78.9629, 20.5937] as [number, number] },
      delhi: { id: 'delhi', name: 'Cloudflare Proxy Node (India)', coords: [77.2090, 28.6139] as [number, number] },
      singapore: { id: 'singapore', name: 'Edge Gateway (Singapore)', coords: [103.8198, 1.3521] as [number, number] },
      us_central: { id: 'us_central', name: 'Vertex AI Core (US Central)', coords: [-98.3500, 39.5000] as [number, number] },
      us_east: { id: 'us_east', name: 'AWS Core VPC (US East)', coords: [-78.0249, 37.9268] as [number, number] },
      us_west: { id: 'us_west', name: 'OpenAI Backend (US West)', coords: [-122.4194, 37.7749] as [number, number] },
      ireland: { id: 'ireland', name: 'EU Cloud Cluster (Ireland)', coords: [-8.2439, 53.4129] as [number, number] },
      localhost: { id: 'localhost', name: 'Localhost Node (Delhi)', coords: [77.2090, 28.6139] as [number, number] },
    };

    let list: Omit<MapRoute, 'evidenceId'>[] = [];

    const activeResult = useScanStore.getState().activeResult;
    const isLive = activeResult?.mode === 'live';

    switch (pId) {
      case 'gemini':
        list = [
          {
            id: 'gem-r1',
            from: points.india,
            to: points.singapore,
            type: 'verified',
            confidence: isLive ? 90 : 50,
            edge: { from: 'dns', to: 'gateway' },
            source: 'VERIFIED ENDPOINT',
          },
          {
            id: 'gem-r2',
            from: points.singapore,
            to: points.us_central,
            type: 'disclosed',
            confidence: 80,
            edge: { from: 'gateway', to: 'vertex' },
            source: 'DISCLOSED EXPOSURE',
          },
          {
            id: 'gem-r3',
            from: points.us_central,
            to: points.us_east,
            type: 'unknown',
            confidence: 20,
            edge: { from: 'vertex', to: 'storage' },
            source: 'UNKNOWN INTERNAL PATH',
          },
        ];
        break;
      case 'openai':
        list = [
          {
            id: 'oa-r1',
            from: points.india,
            to: points.delhi,
            type: 'verified',
            confidence: isLive ? 95 : 55,
            edge: { from: 'user', to: 'cloudflare' },
            source: 'VERIFIED ENDPOINT',
          },
          {
            id: 'oa-r2',
            from: points.delhi,
            to: points.singapore,
            type: 'verified',
            confidence: isLive ? 90 : 50,
            edge: { from: 'cloudflare', to: 'azure-gateway' },
            source: 'VERIFIED ENDPOINT',
          },
          {
            id: 'oa-r3',
            from: points.singapore,
            to: points.us_west,
            type: 'disclosed',
            confidence: 85,
            edge: { from: 'azure-gateway', to: 'openai-core' },
            source: 'DISCLOSED EXPOSURE',
          },
          {
            id: 'oa-r4',
            from: points.us_west,
            to: points.ireland,
            type: 'inferred',
            confidence: 45,
            edge: { from: 'openai-core', to: 'human-review' },
            source: 'INFERRED RISK',
          },
        ];
        break;
      case 'claude':
        list = [
          {
            id: 'cl-r1',
            from: points.india,
            to: points.delhi,
            type: 'verified',
            confidence: isLive ? 95 : 55,
            edge: { from: 'user', to: 'cloudflare-claude' },
            source: 'VERIFIED ENDPOINT',
          },
          {
            id: 'cl-r2',
            from: points.delhi,
            to: points.singapore,
            type: 'verified',
            confidence: isLive ? 90 : 50,
            edge: { from: 'cloudflare-claude', to: 'aws-endpoint' },
            source: 'VERIFIED ENDPOINT',
          },
          {
            id: 'cl-r3',
            from: points.singapore,
            to: points.us_east,
            type: 'disclosed',
            confidence: 85,
            edge: { from: 'aws-endpoint', to: 'anthropic-aws' },
            source: 'DISCLOSED EXPOSURE',
          },
        ];
        break;
      case 'local':
        list = [
          {
            id: 'loc-r1',
            from: points.india,
            to: points.localhost,
            type: 'local',
            confidence: 95,
            edge: { from: 'user', to: 'localhost' },
            source: 'LOCAL SOVEREIGN',
          },
        ];
        break;
      default:
        list = [];
    }

    return list.map((route) => {
      const evidenceId = getRouteEvidenceId(pId, route.edge.from, route.edge.to);
      if (!evidenceId) {
        return {
          ...route,
          type: 'unknown' as const,
          confidence: Math.min(route.confidence, 30),
          source: 'EVIDENCE MISSING',
          evidenceId: undefined,
        };
      }
      return {
        ...route,
        evidenceId,
      };
    });
  };

  const getActiveCountryIds = (pId: string): number[] => {
    const ids: number[] = [356]; // India (Origin)
    if (pId === 'gemini') {
      ids.push(840); // US
    } else if (pId === 'openai') {
      ids.push(840, 372); // US, Ireland
    } else if (pId === 'claude') {
      ids.push(840); // US
    }
    return ids;
  };

  // Check if coordinates are in the visible hemisphere
  const isVisible = (coords: [number, number], size: number): boolean => {
    const centerCoords = (projection.current as any).invert?.([size / 2, size / 2]);
    if (!centerCoords) return false;
    return d3.geoDistance(centerCoords, coords) < Math.PI / 2;
  };

  // Drag listeners
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      targetRotationRef.current[0] += deltaX * 0.25;
      targetRotationRef.current[1] -= deltaY * 0.25;

      // Clamp latitude to avoid flipping upside down
      targetRotationRef.current[1] = Math.max(-60, Math.min(60, targetRotationRef.current[1]));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hover routing detection
    const routes = getProviderRoutes(activeProviderId);
    let foundHoveredRoute: MapRoute | null = null;
    let minDistance = Infinity;

    const size = Math.min(dimensions.width, dimensions.height);

    routes.forEach((route) => {
      const start = route.from.coords;
      const end = route.to.coords;
      const interpolator = d3.geoInterpolate(start, end);

      const samples = 25;
      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const ptCoords = interpolator(t);
        if (isVisible(ptCoords, size)) {
          const ptPos = projection.current(ptCoords);
          if (ptPos) {
            const dx = ptPos[0] - x;
            const dy = ptPos[1] - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDistance) {
              minDistance = dist;
              if (dist < 10) {
                foundHoveredRoute = route;
              }
            }
          }
        }
      }
    });

    if (foundHoveredRoute) {
      setHoveredRoute(foundHoveredRoute);
      setMousePos({ x, y: y - 80 }); // offset tooltip above the path line
      canvas.style.cursor = 'pointer';
    } else {
      setHoveredRoute(null);
      canvas.style.cursor = 'grab';
    }
  };

  const handleCanvasClick = () => {
    if (hoveredRoute) {
      setActiveEdgeId(hoveredRoute.edge);
    }
  };

  // Rendering animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Increments counters
      pulseTime.current += 1.0;
      flowTime.current += 1.0;

      if (scanAnimationProgress.current < 1.0) {
        scanAnimationProgress.current += 0.015; // smooth draw speed
      } else {
        scanAnimationProgress.current = 1.0;
      }

      // Smooth camera interpolation (LERP)
      if (!isDraggingRef.current) {
        // Slow auto rotation (only longitude target)
        targetRotationRef.current[0] += 0.05;
      }
      rotationRef.current[0] += (targetRotationRef.current[0] - rotationRef.current[0]) * 0.15;
      rotationRef.current[1] += (targetRotationRef.current[1] - rotationRef.current[1]) * 0.15;

      projection.current.rotate([rotationRef.current[0], rotationRef.current[1], 0]);

      // --- Draw Cycle ---
      const size = Math.min(dimensions.width, dimensions.height);
      ctx.clearRect(0, 0, size, size);

      const r = size * 0.35; // Occupies exactly 70% of panel height
      projection.current.scale(r).translate([size / 2, size / 2]);
      const pathGenerator = d3.geoPath(projection.current, ctx);

      // 1. Globe Base Background Fill
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
      ctx.fillStyle = '#F4F2EC';
      ctx.fill();

      // 2. Render Back Hemisphere (Transparent Globe)
      if (worldData) {
        projection.current.clipAngle(180);

        // Back graticule lines
        ctx.beginPath();
        pathGenerator(graticule.current());
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Back countries
        const countries = (topojson.feature(worldData, worldData.objects.countries) as any).features;
        ctx.beginPath();
        countries.forEach((d: any) => {
          pathGenerator(d);
        });
        ctx.fillStyle = '#DADAC4';
        ctx.fill();
      }

      // 3. Render Front Hemisphere
      projection.current.clipAngle(90);

      // Front graticule lines
      ctx.beginPath();
      pathGenerator(graticule.current());
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Front countries
      if (worldData) {
        const countries = (topojson.feature(worldData, worldData.objects.countries) as any).features;
        const activeCountryIds = getActiveCountryIds(activeProviderId);

        countries.forEach((d: any) => {
          ctx.beginPath();
          pathGenerator(d);

          const isCountryActive = activeCountryIds.includes(Number(d.id));
          if (isCountryActive) {
            ctx.fillStyle = 'rgba(59, 0, 255, 0.25)'; // Glowing blue tint
          } else {
            ctx.fillStyle = '#737368'; // Brutalist base country color
          }
          ctx.fill();

          if (isCountryActive) {
            ctx.strokeStyle = 'rgba(59, 0, 255, 0.5)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          } else {
            ctx.strokeStyle = '#F4F2EC';
            ctx.lineWidth = 0.25;
            ctx.stroke();
          }
        });
      }

      // Globe Outline border
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Render Route Arcs
      const routes = getProviderRoutes(activeProviderId);
      const scanProgress = scanAnimationProgress.current;

      routes.forEach((route) => {
        const start = route.from.coords;
        const end = route.to.coords;

        const interpolator = d3.geoInterpolate(start, end);
        const points: [number, number][] = [];
        const numSamples = 40;
        const routeProg = Math.max(0, Math.min(1, scanProgress * 1.4)); // fast draw sweep

        for (let i = 0; i <= numSamples; i++) {
          const t = (i / numSamples) * routeProg;
          points.push(interpolator(t));
        }

        const geoLine = {
          type: 'LineString',
          coordinates: points,
        };

        // Draw dynamic prompt sensitivity glow halos if activeResult exists
        if (storeActiveResult) {
          ctx.beginPath();
          pathGenerator(geoLine as any);
          
          let glowColor = 'rgba(0, 174, 239, 0.15)'; // low risk cyan glow
          let glowWidth = 8;

          const sens = storeActiveResult.sensitivityLevel;
          if (sens === 'Public') {
            glowColor = 'rgba(0, 174, 239, 0.18)'; 
            glowWidth = 8;
          } else if (sens === 'Personal') {
            glowColor = 'rgba(223, 161, 0, 0.25)'; // medium risk amber glow
            glowWidth = 12;
          } else if (sens === 'Confidential' || sens === 'Sensitive') {
            glowColor = 'rgba(239, 161, 43, 0.25)'; // high risk red/amber glow
            glowWidth = 14;
          } else if (sens === 'Critical') {
            const opacity = 0.15 + Math.sin(pulseTime.current * 0.1) * 0.1;
            glowColor = `rgba(239, 43, 43, ${opacity})`; // critical pulsing red glow
            glowWidth = 18;
          }

          ctx.strokeStyle = glowColor;
          ctx.lineWidth = glowWidth;
          if (route.type === 'disclosed') {
            ctx.setLineDash([6, 4]);
          } else if (route.type === 'inferred') {
            ctx.setLineDash([2, 3]);
          } else if (route.type === 'unknown') {
            ctx.setLineDash([2, 4]);
          } else {
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        pathGenerator(geoLine as any);

        let color = '#00AEEF';
        if (route.type === 'verified') color = '#00AEEF';
        else if (route.type === 'disclosed') color = '#3B00FF';
        else if (route.type === 'inferred') color = '#DFA100';
        else if (route.type === 'local') color = '#00B873';
        else if (route.type === 'unknown') color = '#77776F';

        ctx.strokeStyle = color;
        const isRouteHovered = hoveredRoute?.id === route.id;
        ctx.lineWidth = isRouteHovered ? 3.5 : (route.type === 'local' ? 2.5 : 1.8);

        if (route.type === 'disclosed') {
          ctx.setLineDash([6, 4]); // Dashed line
        } else if (route.type === 'inferred') {
          ctx.setLineDash([2, 3]); // Dotted line
        } else if (route.type === 'unknown') {
          ctx.setLineDash([2, 4]); // Dotted line for unknown
        } else {
          ctx.setLineDash([]);
        }

        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // Draw "?" marker on unknown routes
        if (route.type === 'unknown' && scanProgress > 0.8) {
          const centerCoords = interpolator(0.5);
          if (isVisible(centerCoords, size)) {
            const pos = projection.current(centerCoords);
            if (pos) {
              const [cx, cy] = pos;
              ctx.beginPath();
              ctx.arc(cx, cy, 6.5, 0, 2 * Math.PI);
              ctx.fillStyle = '#EF2B2B';
              ctx.fill();
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 1;
              ctx.stroke();

              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 8.5px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('?', cx, cy + 0.5);
            }
          }
        }

        // 5. Draw Flowing Packet Particles
        if (scanProgress > 0.7) {
          const numPackets = route.type === 'local' ? 1 : 2;
          for (let p = 0; p < numPackets; p++) {
            const packetOffset = p * 0.4;
            const progress = (flowTime.current * 0.015 + packetOffset) % 1.0;
            const packetCoords = interpolator(progress);

            if (isVisible(packetCoords, size)) {
              const pos = projection.current(packetCoords);
              if (pos) {
                const [px, py] = pos;
                
                // Add flickering/fade for inferred or unknown
                let packetOpacity = 1.0;
                if (route.type === 'inferred' || route.type === 'unknown') {
                  packetOpacity = Math.random() > 0.35 ? 0.75 : 0.15; // flickering packets
                }
                
                ctx.beginPath();
                ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                
                ctx.save();
                ctx.globalAlpha = packetOpacity;
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
              }
            }
          }
        }
      });

      // 6. Draw India Marker (User Origin Node)
      const indiaCoords: [number, number] = [78.9629, 20.5937];
      if (isVisible(indiaCoords, size)) {
        const pos = projection.current(indiaCoords);
        if (pos) {
          const [x, y] = pos;

          // Expanding Pulse Ring
          const ringRadius = 6 + (pulseTime.current % 50) * 0.4;
          const ringOpacity = 1 - (pulseTime.current % 50) / 50;
          ctx.beginPath();
          ctx.arc(x, y, ringRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(59, 0, 255, ${ringOpacity})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Base Center Dot
          ctx.beginPath();
          ctx.arc(x, y, 5.5, 0, 2 * Math.PI);
          ctx.fillStyle = '#3B00FF'; // India marker
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // 7. Draw Destination Nodes
      routes.forEach((route) => {
        const destCoords = route.to.coords;
        if (isVisible(destCoords, size) && destCoords.toString() !== indiaCoords.toString()) {
          const pos = projection.current(destCoords);
          if (pos) {
            const [x, y] = pos;
            const isRouteHovered = hoveredRoute?.id === route.id;

            // Destination center dot (larger if hovered)
            ctx.beginPath();
            ctx.arc(x, y, isRouteHovered ? 6.5 : 4.5, 0, 2 * Math.PI);
            ctx.fillStyle = route.type === 'local' ? '#00B873' : '#050505';
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Destination arriving pulse ring
            if (scanProgress > 0.8 || isRouteHovered) {
              const speedMultiplier = isRouteHovered ? 1.5 : 1;
              const destRingRadius = (isRouteHovered ? 6.5 : 4.5) + ((pulseTime.current * speedMultiplier) % 40) * 0.35;
              const destRingOpacity = 1 - ((pulseTime.current * speedMultiplier) % 40) / 40;
              ctx.beginPath();
              ctx.arc(x, y, destRingRadius, 0, 2 * Math.PI);
              ctx.strokeStyle = route.type === 'local' 
                ? `rgba(0, 184, 115, ${destRingOpacity})`
                : (isRouteHovered ? `rgba(59, 0, 255, ${destRingOpacity})` : `rgba(5, 5, 5, ${destRingOpacity})`);
              ctx.lineWidth = isRouteHovered ? 1.5 : 1.0;
              ctx.stroke();
            }
          }
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [dimensions, worldData, activeProviderId]);

  const size = Math.min(dimensions.width, dimensions.height);

  return (
    <div ref={containerRef} className="relative w-full h-full md:min-h-[620px] min-h-[420px] flex items-center justify-center bg-[#F4F2EC] select-none">
      
      {/* 2D Canvas viewport */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px` }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        className="cursor-grab active:cursor-grabbing max-h-full max-w-full aspect-square object-contain animate-fade-in"
      />

      {/* Floating Brutalist Tooltip */}
      {hoveredRoute && (
        <div
          className="absolute z-30 pointer-events-none p-3.5 bg-[#050505] border-2 border-[#F4F2EC] text-[#F4F2EC] shadow-[4px_4px_0px_#3B00FF] text-left font-mono max-w-[260px] leading-tight select-none animate-fade-in"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        >
          {hoveredRoute.type === 'unknown' ? (
            <div className="bg-red-600 text-white font-extrabold px-2 py-1 mb-2 text-center border border-white text-[8px] tracking-wider uppercase animate-pulse">
              ⚠️ EVIDENCE MISSING
            </div>
          ) : null}
          <div className="border-b border-[#F4F2EC] pb-1.5 mb-1.5 font-[800] uppercase tracking-wider text-[10px]">
            EDGE TYPE: {hoveredRoute.type === 'local' ? 'SOVEREIGN LOCAL' : `${hoveredRoute.type.toUpperCase()} PATH`}
          </div>
          <div className="flex flex-col gap-1 text-[9px] font-bold">
            <div>CONFIDENCE: {hoveredRoute.confidence}%</div>
            <div className="uppercase">SOURCE: {hoveredRoute.source}</div>
            <div className="text-[7.5px] text-[#9A9A91] border-t border-[#3A3A36] pt-1.5 mt-1 leading-relaxed font-semibold uppercase">
              NOTE: NOT PROOF OF INTERNAL PROCESSING LOCATION
            </div>
          </div>
        </div>
      )}

      {/* Top Left Telemetry Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1 text-[9px] font-mono text-[#77776F] bg-white px-3 py-2.5 border border-[#050505] shadow-[2px_2px_0px_#050505]">
        <p className="text-[#050505] font-extrabold uppercase tracking-wider">Geopolitical Node Array</p>
        <p>Origin Vector: IN [20.59N, 78.96E]</p>
        <p>Active Target: {activeProviderId.toUpperCase()}</p>
        <p className="text-[#00B873] font-bold mt-0.5">● Routing scanner connected</p>
      </div>

      {/* Top Right Mini Badge */}
      <div className="absolute top-4 right-4 pointer-events-none hidden sm:flex flex-col items-end text-[9px] font-mono text-[#77776F] bg-white px-3 py-2 border border-[#050505] shadow-[2px_2px_0px_#050505]">
        <p className="text-[#77776F] uppercase font-bold tracking-wider text-[8px]">Trace Confidence</p>
        <p className="text-[#3B00FF] font-extrabold">90% VERIFIED ENDPOINT</p>
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex flex-col gap-2 text-[9px] font-mono text-[#050505] bg-white p-3.5 border border-[#050505] shadow-[3px_3px_0px_#050505] max-w-[240px]">
        <p className="font-extrabold uppercase border-b border-[#050505] pb-1 tracking-wider text-[9px] text-[#77776F]">Path Evidence Levels</p>
        
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#00AEEF] font-extrabold text-[12px]">━━</span>
            <span className="font-extrabold text-black">VERIFIED ENDPOINT</span>
          </div>
          <span className="text-[7.5px] text-[#77776F] uppercase leading-tight pl-6 block">Runtime/provider endpoint evidence</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#3B00FF] font-extrabold text-[12px]">- -</span>
            <span className="font-extrabold text-black">DISCLOSED EXPOSURE</span>
          </div>
          <span className="text-[7.5px] text-[#77776F] uppercase leading-tight pl-6 block">Official provider policy/subprocessor evidence</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#DFA100] font-extrabold text-[12px]">···</span>
            <span className="font-extrabold text-black">INFERRED RISK</span>
          </div>
          <span className="text-[7.5px] text-[#77776F] uppercase leading-tight pl-6 block">Estimated uncertainty from routing/policy</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#77776F] font-extrabold text-[12px]">???</span>
            <span className="font-extrabold text-black">UNKNOWN INTERNAL PATH</span>
          </div>
          <span className="text-[7.5px] text-[#77776F] uppercase leading-tight pl-6 block">Not externally observable</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#00B873] font-extrabold text-[12px]">●</span>
            <span className="font-extrabold text-black">LOCAL SOVEREIGN</span>
          </div>
          <span className="text-[7.5px] text-[#77776F] uppercase leading-tight pl-6 block">Localhost loopback data</span>
        </div>
      </div>

      {/* Bottom Right Help text */}
      <div className="absolute bottom-4 right-4 pointer-events-none text-[8px] font-mono text-[#77776F] bg-white px-2.5 py-1 border border-[#050505] uppercase tracking-widest font-bold shadow-[1px_1px_0px_#050505]">
        DRAG TO ROTATE // CLICK ROUTE FOR EVIDENCE
      </div>
    </div>
  );
}
