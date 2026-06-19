'use client';

import React from 'react';
import { useScanStore } from '../../store/useScanStore';

interface TagItem {
  label: string;
  ruleId: string;
  severity: 'critical' | 'high' | 'medium' | 'methodology' | 'safe';
  targetNodeId?: string;
  targetEdgeId?: { from: string; to: string };
}

const HEAT_TAGS: Record<string, TagItem> = {
  HEALTH_DATA: {
    label: "HEALTH DATA EXPOSED",
    ruleId: "R-101",
    severity: "critical",
    targetNodeId: "vertex"
  },
  GOV_ID: {
    label: "DPDP GOV ID RISK",
    ruleId: "R-102",
    severity: "critical",
    targetNodeId: "user"
  },
  PHONE_EMAIL: {
    label: "CONTACT EXPOSURE",
    ruleId: "R-103",
    severity: "medium",
    targetNodeId: "dns"
  },
  CONFIDENTIAL: {
    label: "BUSINESS SECRET EXPOSURE",
    ruleId: "R-104",
    severity: "high",
    targetNodeId: "storage"
  },
  FOREIGN_API: {
    label: "FOREIGN API GATEWAY",
    ruleId: "R-105",
    severity: "medium",
    targetNodeId: "gateway"
  },
  UNKNOWN_PATH: {
    label: "UNKNOWN INTERNAL PATH",
    ruleId: "R-110",
    severity: "methodology",
    targetNodeId: "storage"
  },
  LOCAL_ROUTE: {
    label: "LOCAL SAFE ROUTE",
    ruleId: "R-108",
    severity: "safe",
    targetNodeId: "localhost"
  },
  REDACTION_OK: {
    label: "REDACTION SHIELD ACTIVE",
    ruleId: "R-109",
    severity: "safe",
    targetNodeId: "user"
  }
};

interface TagsProps {
  triggeredKeys: string[];
}

export default function ComplianceHeatTags({ triggeredKeys }: TagsProps) {
  const { setActiveNodeId, setActiveEdgeId, setDrawerOpen } = useScanStore();

  const handleTagClick = (tag: TagItem) => {
    if (tag.targetNodeId) {
      setActiveNodeId(tag.targetNodeId);
    } else if (tag.targetEdgeId) {
      setActiveEdgeId(tag.targetEdgeId);
    }
  };

  const getSeverityColors = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'bg-[#EF2B2B] text-white border-black hover:bg-black';
      case 'medium':
        return 'bg-[#DFA100] text-black border-black hover:bg-black hover:text-white';
      case 'safe':
        return 'bg-[#00B873] text-white border-black hover:bg-black';
      case 'methodology':
      default:
        return 'bg-[#77776F] text-white border-black hover:bg-black';
    }
  };

  const renderedTags = triggeredKeys
    .map(key => HEAT_TAGS[key])
    .filter((tag): tag is TagItem => !!tag);

  if (renderedTags.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 font-mono text-[9px] select-none">
      <span className="text-[#77776F] font-bold uppercase tracking-wider block mb-1">
        VULNERABILITY HEAT TAGS (CLICK TO AUDIT):
      </span>
      <div className="flex flex-wrap gap-2">
        {renderedTags.map((tag, idx) => (
          <button
            key={idx}
            onClick={() => handleTagClick(tag)}
            className={`border border-black px-2.5 py-1 font-black uppercase tracking-tight shadow-[1.5px_1.5px_0px_#050505] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-[0.5px_0.5px_0px_#050505] transition-all cursor-pointer ${getSeverityColors(
              tag.severity
            )}`}
            title={`Triggered Rule: ${tag.ruleId}. Click to view details.`}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
