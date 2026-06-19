'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { getPassportRecord } from '../../../lib/db';
import DataPassport from '../../../components/passport/DataPassport';
import { ArrowLeft, AlertTriangle, Cpu } from 'lucide-react';

interface PageProps {
  params: Promise<{ passportId: string }>;
}

export default function PassportDetailPage({ params }: PageProps) {
  const { passportId } = use(params);

  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPassport() {
      try {
        setLoading(true);
        const record = await getPassportRecord(passportId);
        if (record) {
          setPassport(record);
        }
      } catch (e) {
        console.error('Failed to load passport record:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPassport();
  }, [passportId]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[500px] text-center bg-[#F4F2EC] font-mono">
        <div className="w-8 h-8 border-4 border-black border-t-[#3B00FF] animate-spin rounded-none mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-black">
          Decrypting AI Data Passport {passportId}...
        </p>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="flex-grow w-full bg-[#F4F2EC] text-[#050505] font-mono py-12 px-6 max-w-3xl mx-auto flex flex-col gap-8 justify-center select-none">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#050505] text-center flex flex-col gap-6 items-center">
          <AlertTriangle size={48} className="text-red-600 animate-bounce" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-black uppercase text-black">PASSPORT VERIFICATION FAILED</h1>
            <p className="text-xs text-[#77776F] font-bold uppercase">ID: {passportId}</p>
          </div>
          <p className="text-sm font-semibold uppercase text-black leading-relaxed max-w-md">
            This AI Data Passport is not registered in the LeakMap secure ledger. The certificate signature could not be verified.
          </p>
          <div className="flex flex-wrap gap-4 mt-2 justify-center w-full">
            <Link 
              href="/passport"
              className="py-2.5 px-6 border border-black hover:bg-black hover:text-[#F8F7F2] text-xs font-bold uppercase transition-colors bg-white shadow-[2px_2px_0px_#050505]"
            >
              Back to Passport Hub
            </Link>
            <Link 
              href="/scanner"
              className="py-2.5 px-6 bg-[#3B00FF] hover:bg-black text-white text-xs font-bold uppercase transition-colors border border-black shadow-[3px_3px_0px_#050505]"
            >
              Scan New Prompt
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full bg-[#F4F2EC] text-[#050505] font-mono py-10 px-6 max-w-3xl mx-auto flex flex-col gap-6 select-none print:bg-white print:py-0 print:px-0">
      
      {/* Navigation (Hidden in print) */}
      <div className="border-b border-black pb-4 print:hidden">
        <Link 
          href="/passport"
          className="flex items-center gap-2 text-xs font-bold uppercase hover:text-[#3B00FF] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Passport Hub</span>
        </Link>
      </div>

      {/* Title block */}
      <div className="flex flex-col gap-2 print:hidden">
        <div className="flex items-center gap-2 text-[10px] font-black text-[#77776F] uppercase">
          <Cpu size={12} className="text-[#3B00FF] shrink-0" />
          <span>VERIFIED SECURE LEDGER CERTIFICATE</span>
        </div>
        <h1 className="text-4xl font-black uppercase text-black tracking-tight leading-none">
          Passport Audit
        </h1>
        <p className="text-xs font-semibold text-[#77776F] uppercase leading-relaxed max-w-xl">
          Detailed sovereign compliance certificate tracking data processing locations, subprocessors, and redaction efficacy.
        </p>
      </div>

      {/* Render the DataPassport Component card */}
      <div className="flex justify-center mt-4">
        <DataPassport passport={passport} />
      </div>

    </div>
  );
}
