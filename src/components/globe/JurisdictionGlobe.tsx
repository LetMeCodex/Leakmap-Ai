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
  const timelineTime = useRef(0); // tracks frames for sequential staged animation

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
    timelineTime.current = 0; // reset timeline sequence
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

  // Canvas Node Labels drawer helper
  const drawLabel = (
    ctx: CanvasRenderingContext2D,
    title: string,
    x: number,
    y: number,
    type: string,
    subtitle: string,
    isActive: boolean,
    dx: number,
    dy: number
  ) => {
    const lx = x + dx;
    const ly = y + dy;

    // Draw leader line
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(lx, ly);
    ctx.strokeStyle = 'rgba(5, 5, 5, 0.35)';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Draw little node tick dot
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#050505';
    ctx.fill();

    // Color indicators
    let color = '#00AEEF';
    if (type === 'verified') color = '#00AEEF';
    else if (type === 'disclosed') color = '#3B00FF';
    else if (type === 'inferred') color = '#DFA100';
    else if (type === 'local') color = '#00B873';
    else if (type === 'unknown') color = '#EF2B2B';

    ctx.font = 'bold 7px monospace';
    const paddingX = 4;
    const paddingY = 3.5;
    const lineSpacing = 8.5;

    const textLines = [
      `■ ${title}`,
      subtitle
    ];

    let maxWidth = 0;
    textLines.forEach(line => {
      const w = ctx.measureText(line).width;
      if (w > maxWidth) maxWidth = w;
    });

    const boxW = maxWidth + paddingX * 2 + 2;
    const boxH = textLines.length * lineSpacing + paddingY;

    ctx.save();
    
    // Draw offset shadow if active/hovered
    if (isActive) {
      ctx.fillStyle = '#050505';
      ctx.fillRect(lx - boxW / 2 + 2, ly - boxH / 2 + 2, boxW, boxH);
    }

    ctx.fillStyle = '#F8F7F2';
    ctx.strokeStyle = '#050505';
    ctx.lineWidth = 1.0;
    ctx.fillRect(lx - boxW / 2, ly - boxH / 2, boxW, boxH);
    ctx.strokeRect(lx - boxW / 2, ly - boxH / 2, boxW, boxH);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    textLines.forEach((line, idx) => {
      const textY = ly - boxH / 2 + paddingY + idx * lineSpacing;
      if (line.startsWith('■')) {
        ctx.fillStyle = color;
        ctx.fillText('■', lx - boxW / 2 + paddingX, textY);
        ctx.fillStyle = '#050505';
        ctx.fillText(line.substring(2), lx - boxW / 2 + paddingX + 8, textY);
      } else {
        ctx.fillStyle = '#77776F';
        ctx.fillText(line, lx - boxW / 2 + paddingX, textY);
      }
    });

    ctx.restore();
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
      timelineTime.current += 1.0; // increments on each frame for stages sequence

      if (scanAnimationProgress.current < 1.0) {
        scanAnimationProgress.current += 0.015; // smooth draw speed
      } else {
        scanAnimationProgress.current = 1.0;
      }

      // Smooth camera LERP
      if (!isDraggingRef.current) {
        targetRotationRef.current[0] += 0.05;
      }
      rotationRef.current[0] += (targetRotationRef.current[0] - rotationRef.current[0]) * 0.15;
      rotationRef.current[1] += (targetRotationRef.current[1] - rotationRef.current[1]) * 0.15;

      projection.current.rotate([rotationRef.current[0], rotationRef.current[1], 0]);

      // --- Draw Cycle ---
      const size = Math.min(dimensions.width, dimensions.height);
      ctx.clearRect(0, 0, size, size);

      const r = size * 0.33; // Occupies 66% of panel height to give room for outer compass dials
      projection.current.scale(r).translate([size / 2, size / 2]);
      const pathGenerator = d3.geoPath(projection.current, ctx);

      // 1. Globe Ambient Shadow (Soft blend background)
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r - 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#F4F2EC';
      ctx.fill();
      ctx.restore();

      // 2. Globe Ocean base with translucency
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(244, 242, 236, 0.78)';
      ctx.fill();

      // 3. Render Back Hemisphere (Transparent Globe continent backings)
      if (worldData) {
        projection.current.clipAngle(180);

        // Back graticule lines
        ctx.beginPath();
        pathGenerator(graticule.current());
        ctx.strokeStyle = 'rgba(5, 5, 5, 0.02)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Back countries (translucent grey-olive)
        const countries = (topojson.feature(worldData, worldData.objects.countries) as any).features;
        ctx.beginPath();
        countries.forEach((d: any) => {
          pathGenerator(d);
        });
        ctx.fillStyle = 'rgba(120, 120, 105, 0.18)';
        ctx.fill();
      }

      // 4. Render Front Hemisphere
      projection.current.clipAngle(90);

      // Front graticule lines
      ctx.beginPath();
      pathGenerator(graticule.current());
      ctx.strokeStyle = 'rgba(5, 5, 5, 0.06)';
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
            ctx.fillStyle = 'rgba(59, 0, 255, 0.08)'; // Soft electric blue overlay
          } else {
            ctx.fillStyle = '#6F7066'; // Muted olive-grey continents front
          }
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'; // High-detail white country borders
          ctx.lineWidth = 0.55;
          ctx.stroke();
        });
      }

      // Globe Outline border
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(5, 5, 5, 0.20)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // 5. Technical Dial Compass Rings (Scientific Instrument styling)
      ctx.save();
      ctx.strokeStyle = 'rgba(5, 5, 5, 0.07)';
      ctx.lineWidth = 0.7;
      // Inner Dial
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r + 6, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Outer Dial
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r + 12, 0, 2 * Math.PI);
      ctx.stroke();

      // Dial Ticks
      for (let angle = 0; angle < 360; angle += 15) {
        const rad = angle * Math.PI / 180;
        const x1 = size / 2 + (r + 6) * Math.cos(rad);
        const y1 = size / 2 + (r + 6) * Math.sin(rad);
        const x2 = size / 2 + (r + (angle % 90 === 0 ? 14 : 10)) * Math.cos(rad);
        const y2 = size / 2 + (r + (angle % 90 === 0 ? 14 : 10)) * Math.sin(rad);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = angle % 90 === 0 ? 'rgba(5, 5, 5, 0.20)' : 'rgba(5, 5, 5, 0.07)';
        ctx.stroke();
      }
      ctx.restore();

      // 6. Sweeping loop-based Scanline Y
      const scanlineY = (pulseTime.current % 360) / 360 * (r * 2) + (size / 2 - r);
      ctx.save();
      ctx.strokeStyle = 'rgba(59, 0, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
      ctx.clip();
      ctx.moveTo(size / 2 - r, scanlineY);
      ctx.lineTo(size / 2 + r, scanlineY);
      ctx.stroke();
      ctx.restore();

      // 7. Elegant India Origin Marker & Pulsing concentric rings
      const indiaCoords: [number, number] = [78.9629, 20.5937];
      if (isVisible(indiaCoords, size)) {
        const pos = projection.current(indiaCoords);
        if (pos) {
          const [x, y] = pos;

          // Origin scan halo
          const scanRadius = 13 + Math.sin(pulseTime.current * 0.05) * 3;
          const scanGradient = ctx.createRadialGradient(x, y, 2, x, y, scanRadius);
          scanGradient.addColorStop(0, 'rgba(59, 0, 255, 0.14)');
          scanGradient.addColorStop(1, 'rgba(59, 0, 255, 0)');
          ctx.beginPath();
          ctx.arc(x, y, scanRadius, 0, 2 * Math.PI);
          ctx.fillStyle = scanGradient;
          ctx.fill();

          // Concentric pulses
          for (let i = 0; i < 2; i++) {
            const delay = i * 25;
            const t = (pulseTime.current + delay) % 50;
            const ringRadius = 4 + t * 0.25;
            const ringOpacity = (1 - t / 50) * 0.35;
            ctx.beginPath();
            ctx.arc(x, y, ringRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = `rgba(59, 0, 255, ${ringOpacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }

          // Center marker
          ctx.beginPath();
          ctx.arc(x, y, 3.8, 0, 2 * Math.PI);
          ctx.fillStyle = '#3B00FF';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      }

      // 8. Passport Stamp near India (Phase 1+)
      const frame = timelineTime.current;
      if (frame > 20 && isVisible([79.5, 23.0], size)) {
        const stampPos = projection.current([79.5, 23.0]);
        if (stampPos) {
          const [sx, sy] = stampPos;
          const stampAge = Math.min(30, frame - 20);
          const stampOpacity = stampAge / 30 * 0.55;
          
          ctx.save();
          ctx.globalAlpha = stampOpacity;
          ctx.strokeStyle = 'rgba(59, 0, 255, 0.4)';
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 1]);
          ctx.strokeRect(sx - 10, sy - 10, 20, 20);
          ctx.fillStyle = 'rgba(59, 0, 255, 0.05)';
          ctx.fillRect(sx - 10, sy - 10, 20, 20);
          ctx.fillStyle = 'rgba(59, 0, 255, 0.7)';
          ctx.font = 'bold 5px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('AIDP', sx, sy);
          ctx.restore();
        }
      }

      // 9. Draw Upgraded Geopolitical Routes (Sequential staged drawing animation)
      const routes = getProviderRoutes(activeProviderId);

      routes.forEach((route) => {
        const start = route.from.coords;
        const end = route.to.coords;
        const interpolator = d3.geoInterpolate(start, end);

        // Determine drawing sequence progress based on timeline time
        let routeProg = 1.0;
        let isActivePhase = false;
        
        if (route.type === 'verified') {
          routeProg = Math.max(0, Math.min(1, (frame - 40) / 40));
          isActivePhase = frame >= 40;
        } else if (route.type === 'disclosed') {
          routeProg = Math.max(0, Math.min(1, (frame - 100) / 40));
          isActivePhase = frame >= 100;
        } else if (route.type === 'inferred') {
          routeProg = Math.max(0, Math.min(1, (frame - 150) / 40));
          isActivePhase = frame >= 150;
        } else if (route.type === 'unknown') {
          routeProg = Math.max(0, Math.min(1, (frame - 170) / 45));
          isActivePhase = frame >= 170;
        } else if (route.type === 'local') {
          routeProg = Math.max(0, Math.min(1, (frame - 30) / 30));
          isActivePhase = frame >= 30;
        }

        if (!isActivePhase) return;

        const points: [number, number][] = [];
        const numSamples = 40;
        for (let i = 0; i <= numSamples; i++) {
          const t = (i / numSamples) * routeProg;
          points.push(interpolator(t));
        }

        const geoLine = {
          type: 'LineString',
          coordinates: points,
        };

        // Draw path line glow if activeResult exists
        if (storeActiveResult) {
          ctx.beginPath();
          pathGenerator(geoLine as any);
          
          let glowColor = 'rgba(0, 174, 239, 0.12)';
          let glowWidth = 6;

          const sens = storeActiveResult.sensitivityLevel;
          if (sens === 'Public') {
            glowColor = 'rgba(0, 174, 239, 0.14)';
            glowWidth = 6;
          } else if (sens === 'Personal') {
            glowColor = 'rgba(223, 161, 0, 0.20)';
            glowWidth = 9;
          } else if (sens === 'Confidential' || sens === 'Sensitive') {
            glowColor = 'rgba(239, 161, 43, 0.20)';
            glowWidth = 11;
          } else if (sens === 'Critical') {
            const opacity = 0.12 + Math.sin(pulseTime.current * 0.1) * 0.08;
            glowColor = `rgba(239, 43, 43, ${opacity})`;
            glowWidth = 14;
          }

          ctx.strokeStyle = glowColor;
          ctx.lineWidth = glowWidth;
          if (route.type === 'disclosed') {
            ctx.setLineDash([5, 3]);
          } else if (route.type === 'inferred') {
            ctx.setLineDash([2, 2]);
          } else if (route.type === 'unknown') {
            ctx.setLineDash([1, 4]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw path line core
        ctx.beginPath();
        pathGenerator(geoLine as any);

        let color = '#00AEEF';
        if (route.type === 'verified') color = '#00AEEF';
        else if (route.type === 'disclosed') color = '#3B00FF';
        else if (route.type === 'inferred') color = '#DFA100';
        else if (route.type === 'local') color = '#00B873';
        else if (route.type === 'unknown') color = '#EF2B2B';

        ctx.strokeStyle = color;
        const isRouteHovered = hoveredRoute?.id === route.id;
        ctx.lineWidth = isRouteHovered ? 2.8 : (route.type === 'local' ? 2.0 : 1.4);

        if (route.type === 'disclosed') {
          ctx.setLineDash([5, 3]);
          ctx.lineDashOffset = -flowTime.current * 0.18; // Slowly moving dash pattern
        } else if (route.type === 'inferred') {
          ctx.setLineDash([2, 2]);
          const flicker = 0.75 + Math.sin(pulseTime.current * 0.35) * 0.2 * Math.random();
          ctx.strokeStyle = `rgba(223, 161, 0, ${flicker})`; // Unstable flickering
        } else if (route.type === 'unknown') {
          ctx.setLineDash([1, 4]); // broken dotted fragments
          ctx.strokeStyle = 'rgba(239, 43, 43, 0.45)';
        } else {
          ctx.setLineDash([]);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // Draw "?" enclosing warning badge mid-way on unknown paths
        if (route.type === 'unknown' && routeProg > 0.8) {
          const centerCoords = interpolator(0.5);
          if (isVisible(centerCoords, size)) {
            const pos = projection.current(centerCoords);
            if (pos) {
              const [cx, cy] = pos;
              ctx.beginPath();
              ctx.arc(cx, cy, 6.0, 0, 2 * Math.PI);
              ctx.fillStyle = '#EF2B2B';
              ctx.fill();
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 0.8;
              ctx.stroke();

              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 8px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('?', cx, cy + 0.5);
            }
          }
        }

        // Expand Singapore visa stamp ring at Phase 2 when verified path reaches destination
        if (route.type === 'verified' && routeProg >= 0.95) {
          const sgCoords: [number, number] = [103.8198, 1.3521];
          if (isVisible(sgCoords, size)) {
            const pos = projection.current(sgCoords);
            if (pos) {
              const [sx, sy] = pos;
              const stampAge = (frame - 80) % 80;
              if (stampAge >= 0) {
                const stampRadius = 5 + stampAge * 0.18;
                const stampOpacity = Math.max(0, 1 - stampAge / 80) * 0.55;
                ctx.save();
                ctx.beginPath();
                ctx.arc(sx, sy, stampRadius, 0, 2 * Math.PI);
                ctx.strokeStyle = `rgba(0, 174, 239, ${stampOpacity})`;
                ctx.lineWidth = 0.8;
                ctx.setLineDash([3, 2]);
                ctx.stroke();
                ctx.restore();
              }
            }
          }
        }

        // Flowing Telemetry Data Capsule
        if (routeProg > 0.6 && route.type !== 'unknown') {
          const numPackets = route.type === 'local' ? 1 : 2;
          for (let p = 0; p < numPackets; p++) {
            const packetOffset = p * 0.5;
            const speed = route.type === 'disclosed' ? 0.008 : 0.012;
            const progress = ((flowTime.current * speed + packetOffset) * routeProg) % 1.0;
            
            // Draw trailing particles along D3 path curve
            const numTrail = 5;
            for (let i = 0; i < numTrail; i++) {
              const trailT = progress - i * 0.012;
              if (trailT < 0) continue;
              const trailCoords = interpolator(trailT);
              if (isVisible(trailCoords, size)) {
                const pos = projection.current(trailCoords);
                if (pos) {
                  const [tx, ty] = pos;
                  const opacity = (1 - i / numTrail) * (route.type === 'inferred' ? (Math.random() > 0.3 ? 0.45 : 0.15) : 0.55);
                  ctx.beginPath();
                  ctx.arc(tx, ty, 1.6 - i * 0.25, 0, 2 * Math.PI);
                  ctx.fillStyle = color;
                  ctx.save();
                  ctx.globalAlpha = opacity;
                  ctx.fill();
                  ctx.restore();
                }
              }
            }

            // Head Capsule core
            const packetCoords = interpolator(progress);
            if (isVisible(packetCoords, size)) {
              const pos = projection.current(packetCoords);
              if (pos) {
                const [px, py] = pos;
                ctx.save();
                ctx.translate(px, py);
                
                // Black core with colored route border
                ctx.beginPath();
                ctx.rect(-2.5, -2.5, 5, 5);
                ctx.fillStyle = '#050505';
                ctx.fill();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.0;
                ctx.stroke();
                
                ctx.restore();
              }
            }
          }
        }
      });

      // 10. Draw Destination Node Centers
      routes.forEach((route) => {
        const destCoords = route.to.coords;
        if (isVisible(destCoords, size) && destCoords.toString() !== indiaCoords.toString()) {
          const pos = projection.current(destCoords);
          if (pos) {
            const [x, y] = pos;
            const isRouteHovered = hoveredRoute?.id === route.id;

            ctx.beginPath();
            ctx.arc(x, y, isRouteHovered ? 5.0 : 3.5, 0, 2 * Math.PI);
            ctx.fillStyle = route.type === 'local' ? '#00B873' : '#050505';
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      });

      // 11. Render Canvas Node Labels (Singapore, US Central, US East, India)
      if (frame > 60) {
        const labelsToDraw = [
          {
            id: 'lbl-india',
            coords: indiaCoords,
            type: 'local',
            title: 'REDACTION ACTIVE',
            subtitle: 'RISK REDUCED',
            dx: -45,
            dy: 30,
            visible: true
          },
          {
            id: 'lbl-singapore',
            coords: [103.8198, 1.3521] as [number, number],
            type: 'verified',
            title: 'VERIFIED ENDPOINT',
            subtitle: '90% / 3 SOURCES',
            dx: 45,
            dy: -30,
            visible: activeProviderId !== 'local'
          },
          {
            id: 'lbl-us-central',
            coords: [-98.3500, 39.5000] as [number, number],
            type: 'disclosed',
            title: 'DISCLOSED PROCESSOR',
            subtitle: '80% / 2 SOURCES',
            dx: 45,
            dy: -25,
            visible: activeProviderId === 'gemini'
          },
          {
            id: 'lbl-us-west',
            coords: [-122.4194, 37.7749] as [number, number],
            type: 'disclosed',
            title: 'DISCLOSED PROCESSOR',
            subtitle: '85% / 2 SOURCES',
            dx: 45,
            dy: -25,
            visible: activeProviderId === 'openai'
          },
          {
            id: 'lbl-us-east',
            coords: [-78.0249, 37.9268] as [number, number],
            type: 'unknown',
            title: 'DATA RESIDENCY UNKNOWN',
            subtitle: 'INFERENCE / LIMITATION',
            dx: 40,
            dy: 30,
            visible: activeProviderId === 'gemini' || activeProviderId === 'claude'
          },
          {
            id: 'lbl-ireland',
            coords: [-8.2439, 53.4129] as [number, number],
            type: 'inferred',
            title: 'INFERRED RISK',
            subtitle: '45% / 1 SOURCE',
            dx: -45,
            dy: -20,
            visible: activeProviderId === 'openai' && (hoveredRoute?.id === 'oa-r4' || frame > 200)
          }
        ];

        labelsToDraw.forEach((lbl) => {
          if (!lbl.visible) return;
          if (isVisible(lbl.coords, size)) {
            const pos = projection.current(lbl.coords);
            if (pos) {
              const [nx, ny] = pos;
              
              const isHovered = hoveredRoute && (
                (lbl.type === 'verified' && hoveredRoute.type === 'verified') ||
                (lbl.type === 'disclosed' && hoveredRoute.type === 'disclosed') ||
                (lbl.type === 'unknown' && hoveredRoute.type === 'unknown') ||
                (lbl.type === 'inferred' && hoveredRoute.type === 'inferred') ||
                (lbl.type === 'local' && hoveredRoute.type === 'local')
              );

              drawLabel(
                ctx,
                lbl.title,
                nx,
                ny,
                lbl.type,
                lbl.subtitle,
                !!isHovered,
                lbl.dx,
                lbl.dy
              );
            }
          }
        });
      }

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
          className="absolute z-30 pointer-events-auto p-3.5 bg-[#050505] border-t-2 border-[#3B00FF] border-x border-b border-[#050505] text-[#F8F7F2] shadow-[6px_6px_0px_rgba(5,5,5,0.15)] text-left font-mono max-w-[245px] leading-tight select-none animate-fade-in"
          style={{ 
            left: `${mousePos.x + 15}px`, 
            top: `${mousePos.y + 15}px` 
          }}
        >
          <div className="flex justify-between items-start border-b border-[#F8F7F2]/10 pb-1.5 mb-2">
            <span className="font-black text-[9px] text-[#00AEEF]">
              ROUTE-{activeProviderId.toUpperCase()}-00{hoveredRoute.id.slice(-1)}
            </span>
            <svg className="w-3 h-3 fill-current text-[#F8F7F2]/60" viewBox="0 0 24 24">
              <path d="M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm13-2h3v2h-3zm-2 2h2v3h-2zm4 2h2v3h-2zm-2 2h2v2h-2zm-2-4h2v2h-2zm6-2h2v2h-2zm-6-2h2v2h-2z"/>
            </svg>
          </div>
          
          <div className="flex flex-col gap-1.5 text-[8.5px] leading-normal font-semibold">
            <div>
              <span className="text-[#77776F]">TRACE TYPE: </span>
              <span className="text-[#F8F7F2]">{hoveredRoute.source}</span>
            </div>
            <div>
              <span className="text-[#77776F]">CONFIDENCE: </span>
              <span className="text-[#F8F7F2]">{hoveredRoute.confidence}%</span>
            </div>
            <div>
              <span className="text-[#77776F]">SOURCES: </span>
              <span className="text-[#F8F7F2]">03</span>
            </div>
            <div>
              <span className="text-[#77776F]">CLAIM: </span>
              <span className="text-[#F8F7F2]">
                {hoveredRoute.type === 'verified' ? 'PROVIDER ENDPOINT MATCHED' : (hoveredRoute.type === 'disclosed' ? 'SUBPROCESSOR PIPELINE MATCHED' : 'JURISDICTION EXPOSURE INFERRED')}
              </span>
            </div>
            <div className="border-t border-[#F8F7F2]/10 pt-1.5 mt-0.5 text-[7px] text-[#9A9A91] uppercase">
              LIMITATION: NOT A PHYSICAL SERVER PATH
            </div>
            
            <button 
              onClick={() => handleCanvasClick()}
              className="mt-1.5 w-full bg-[#3B00FF] text-white hover:bg-blue-700 text-center py-1 text-[7.5px] uppercase font-bold tracking-wider transition-all pointer-events-auto cursor-pointer"
            >
              OPEN EVIDENCE ↗
            </button>
          </div>
        </div>
      )}

      {/* Top Left Node Array Card */}
      <div className="absolute top-12 left-4 z-20 pointer-events-none flex flex-col gap-1 text-[8px] font-mono text-[#050505] bg-[#F8F7F2] p-2 border border-[#050505] shadow-[2px_2px_0px_#050505] min-w-[145px]">
        <div className="font-extrabold uppercase border-b border-[#050505]/10 pb-0.5 mb-0.5 tracking-wider text-[7.5px] text-[#77776F]">Node Array</div>
        <div>ORIGIN: IN / 20.59N 78.96E</div>
        <div>PROVIDER: {activeProviderId.toUpperCase()}</div>
        <div>TRACE: EXPOSURE MODEL</div>
        <div className="flex items-center gap-1 text-[#00B873] font-bold mt-0.5">
          <span className="w-1.5 h-1.5 bg-[#00B873] rounded-full animate-pulse" />
          <span>CONNECTED</span>
        </div>
      </div>

      {/* Top Right Confidence Card */}
      <div className="absolute top-12 right-4 z-20 pointer-events-none flex flex-col gap-1 text-[8px] font-mono text-[#050505] bg-[#F8F7F2] p-2 border border-[#050505] shadow-[2px_2px_0px_#050505] text-right min-w-[125px]">
        <div className="font-extrabold uppercase border-b border-[#050505]/10 pb-0.5 mb-0.5 tracking-wider text-[7.5px] text-[#77776F] text-right">Confidence</div>
        <div className="text-[#3B00FF] font-black">90% EXPOSURE MODEL</div>
        <div>SOURCE PACKETS: 06</div>
        <div>UNKNOWN EDGES: 01</div>
      </div>

      {/* Bottom Horizontal Mini Legend Strip */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-[#F8F7F2]/90 backdrop-blur-sm border border-[#050505]/20 px-3.5 py-1.5 text-[7.5px] font-mono font-bold tracking-tight text-[#050505] shadow-[2px_2px_0px_rgba(5,5,5,0.05)] max-w-[90%] justify-center">
        <div className="flex items-center gap-1">
          <span className="text-[#00AEEF] font-bold">━━</span>
          <span>VERIFIED</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#3B00FF] font-bold">- -</span>
          <span>DISCLOSED</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#DFA100] font-bold">···</span>
          <span>INFERRED</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#EF2B2B] font-bold">???</span>
          <span>UNKNOWN</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#00B873] font-bold">●</span>
          <span>LOCAL</span>
        </div>
        <div className="h-2 w-[1px] bg-[#050505]/15 hidden xs:block" />
        <a href="/evidence" className="text-[#3B00FF] hover:underline flex items-center gap-0.5 pointer-events-auto">
          VIEW METHODOLOGY ↗
        </a>
      </div>

      {/* Bottom Caption Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-[6.5px] md:text-[7.5px] font-mono text-[#77776F] uppercase tracking-wide font-bold w-[90%] text-center leading-normal">
        “Exposure model based on endpoint telemetry, provider disclosures, and marked inference. Not a physical packet trace.”
      </div>
    </div>
  );
}
