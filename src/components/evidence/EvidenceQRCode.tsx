'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, AlertTriangle } from 'lucide-react';

interface QRCodeProps {
  value: string;
  label?: string;
  destinationType?: 'evidence' | 'sources' | 'receipt' | 'passport';
  id?: string;
  size?: number;
  providerName?: string;
}

export default function EvidenceQRCode({ 
  value, 
  label = "SCAN LEAKMAP EVIDENCE PACKET", 
  destinationType = "evidence",
  id,
  size = 110,
  providerName
}: QRCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isLocalhost = value.includes("localhost") || value.includes("127.0.0.1");

  return (
    <div className="flex flex-col items-center justify-center bg-[#F8F7F2] border-2 border-black p-4 w-full max-w-[240px] select-none text-center font-mono shadow-[4px_4px_0px_#050505] print:shadow-none print:bg-white print:border-black">
      {/* Target Preview Details */}
      <div className="w-full text-left border-b border-black pb-2 mb-3 text-[9px] font-black uppercase text-[#77776F]">
        <div className="text-black font-extrabold text-[10px] truncate leading-tight">
          {providerName ? `OFFICIAL ${providerName.toUpperCase()} SOURCE` : label}
        </div>
        {destinationType && <div className="mt-1 text-black text-[8px]">DESTINATION: /{destinationType}</div>}
        {id && <div className="text-black truncate text-[8px]">ID: {id}</div>}
      </div>

      {/* QR Code Graphic wrapper */}
      <div className="bg-white p-2 border border-black shadow-[1.5px_1.5px_0px_#050505]">
        <QRCodeSVG 
          value={value} 
          size={size} 
          bgColor="#FFFFFF"
          fgColor="#050505"
          level="H"
          includeMargin={false}
        />
      </div>

      {/* Public URL Preview */}
      <div className="w-full mt-3 text-center">
        <span className="text-[7.5px] text-[#77776F] uppercase font-bold block mb-1">Target Verification Endpoint</span>
        <div className="text-[8.5px] text-black font-bold lowercase truncate max-w-full select-all px-1.5 py-0.5 border border-black/10 bg-white">
          {value}
        </div>
      </div>

      {/* Localhost Warning block */}
      {isLocalhost && (
        <div className="w-full mt-3 bg-amber-50 border border-amber-600 p-2 text-left text-[8px] text-amber-900 leading-normal font-semibold uppercase flex gap-1 items-start">
          <AlertTriangle size={10} className="text-amber-700 shrink-0 mt-0.5" />
          <p>
            LOCAL QR — deploy app or use tunnel for phone scanning.
          </p>
        </div>
      )}

      {/* Copy Link Action Button */}
      <button
        onClick={handleCopy}
        className="w-full mt-3 py-1 bg-white hover:bg-black hover:text-white border border-black text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-[1.5px_1.5px_0px_#050505]"
      >
        {copied ? (
          <>
            <Check size={9} className="text-green-600" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy size={9} />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
