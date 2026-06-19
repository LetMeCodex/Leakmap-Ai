'use client';

import React, { useRef } from 'react';
import { ScanReceipt } from '../../lib/scanReceipt';
import EvidenceQRCode from '../evidence/EvidenceQRCode';
import { getScanVerificationUrl } from '../../lib/qr';
import { Printer, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface ReceiptProps {
  receipt: ScanReceipt;
  onGeneratePassport?: () => void;
}

export default function EvidenceReceipt({ receipt, onGeneratePassport }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(receipt, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `leakmap-receipt-${receipt.scanId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formattedDate = new Date(receipt.timestamp).toUTCString().toUpperCase();
  const verificationUrl = getScanVerificationUrl(receipt.scanId);

  return (
    <div className="flex flex-col gap-6 max-w-md w-full font-mono text-xs select-none">
      
      {/* Brutalist Audit Receipt */}
      <div 
        ref={receiptRef}
        className="bg-white border-4 border-black p-5 relative overflow-hidden flex flex-col gap-4 shadow-[6px_6px_0px_#050505] print:shadow-none print:border-black print:bg-white"
      >
        {/* Receipt Header */}
        <div className="text-center border-b-2 border-dashed border-black pb-4 flex flex-col items-center">
          <span className="font-black text-sm tracking-widest block text-black">LEAKMAP SECURITY</span>
          <span className="text-[9px] text-[#77776F] uppercase tracking-wider block mt-0.5">VULNERABILITY AUDIT SLIP</span>
          <span className="text-[8px] text-white bg-black px-2 py-0.5 mt-2 uppercase font-black tracking-wider">
            OFFICIAL SECURE RECEIPT
          </span>
        </div>

        {/* Receipt Body */}
        <div className="flex flex-col gap-2 py-2 border-b-2 border-dashed border-black">
          <div className="flex justify-between">
            <span className="text-[#77776F] font-bold">SCAN ID:</span>
            <span className="text-black font-black">{receipt.scanId.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#77776F] font-bold">PROVIDER:</span>
            <span className="text-black font-black uppercase">{receipt.provider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#77776F] font-bold">PROVIDER MODE:</span>
            <span className="text-black font-black uppercase">{receipt.mode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#77776F] font-bold">SENSITIVITY:</span>
            <span className="text-black font-black uppercase">{receipt.sensitivityLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#77776F] font-bold">ORIGINAL RISK:</span>
            <span className="text-black font-black">{receipt.originalRisk} / 100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#77776F] font-bold">REDACTED RISK:</span>
            <span className="text-black font-black">{receipt.redactedRisk} / 100</span>
          </div>

          <div className="border-t border-black/10 my-2 pt-2 flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] text-black">
              <span>VERIFIED EDGES:</span>
              <span className="font-extrabold">{receipt.verifiedEdgesCount}</span>
            </div>
            <div className="flex justify-between text-[10px] text-black">
              <span>DISCLOSED EDGES:</span>
              <span className="font-extrabold">{receipt.disclosedEdgesCount}</span>
            </div>
            <div className="flex justify-between text-[10px] text-black">
              <span>INFERRED EDGES:</span>
              <span className="font-extrabold">{receipt.inferredEdgesCount}</span>
            </div>
            <div className="flex justify-between text-[10px] text-black">
              <span>UNKNOWN EDGES:</span>
              <span className="font-extrabold">{receipt.unknownEdgesCount}</span>
            </div>
          </div>

          <div className="border-t border-black/10 my-2 pt-2 flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-[#77776F] font-bold">RAW PROMPT STORED:</span>
              <span className="text-[#EF2B2B] font-black">{receipt.rawPromptStored}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77776F] font-bold">REDACTION APPLIED:</span>
              <span className="text-[#00B873] font-black">{receipt.redactionApplied}</span>
            </div>
          </div>

          <div className="text-[8px] text-[#77776F] font-bold uppercase mt-2 text-center">
            {formattedDate}
          </div>
        </div>

        {/* Verification QR */}
        <div className="flex flex-col items-center py-2 gap-2">
          <EvidenceQRCode value={verificationUrl} label="SCAN FULL EVIDENCE CHAIN" size={100} />
        </div>

        <div className="text-center text-[7.5px] text-[#77776F] font-semibold uppercase leading-normal border-t border-black/10 pt-3">
          LeakMap separates verified network telemetry, disclosed policy evidence, and inferred risk. Audit receipt is QR-verifiable.
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 print:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="border border-black bg-white px-3 py-2 text-[10px] font-black hover:bg-black hover:text-white transition-colors uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_#050505] flex items-center justify-center gap-1.5"
          >
            <Printer size={12} /> Print Receipt
          </button>
          <button
            onClick={handleExportJSON}
            className="border border-black bg-white px-3 py-2 text-[10px] font-black hover:bg-black hover:text-white transition-colors uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_#050505] flex items-center justify-center gap-1.5"
          >
            <Download size={12} /> Export JSON
          </button>
        </div>

        {onGeneratePassport && (
          <button
            onClick={onGeneratePassport}
            className="w-full py-2.5 bg-[#00B873] hover:bg-black text-white text-center text-xs font-bold uppercase tracking-wider border border-black shadow-[4px_4px_0px_#050505] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#050505] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck size={14} /> Generate Data Passport
          </button>
        )}

        <Link
          href="/evidence"
          className="w-full py-2.5 bg-[#3B00FF] hover:bg-black text-white text-center text-xs font-bold uppercase tracking-wider border border-black shadow-[4px_4px_0px_#050505] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#050505] transition-all flex items-center justify-center gap-1.5 block"
        >
          View Evidence Vault <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
