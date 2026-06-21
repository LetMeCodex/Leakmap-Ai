import type { Metadata, Viewport } from "next";
import Link from "next/link";
import TopNav from "../components/nav/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEAKMAP AI — Geopolitical AI Jurisdiction Exposure Mapping",
  description: "Visualize where your sensitive prompts may travel across AI providers, subprocessor networks, and foreign cloud regions before you send them.",
  keywords: ["AI sovereignty", "AI compliance", "data security", "national data security", "prompt scanner", "PII redaction", "geopolitics", "jurisdiction tracking"],
  authors: [{ name: "LeakMap AI Team" }],
  icons: {
    icon: "/leakmap-mark.svg",
    shortcut: "/leakmap-mark.svg",
    apple: "/leakmap-mark.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F4F2EC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full select-none">
      <body className="min-h-screen bg-brutalist-bg text-brutalist-text flex flex-col relative overflow-x-hidden pr-[6px] selection:bg-brutalist-blue/10 selection:text-brutalist-blue">
        
        {/* Extreme Right Edge Acid Lime Marker Bar */}
        <div className="fixed top-0 right-0 w-[6px] h-screen bg-brutalist-lime z-50 pointer-events-none" />

        {/* Global Swiss Navigation Header */}
        <TopNav />

        {/* Core Page Content Viewport */}
        <main className="flex-1 flex flex-col z-10 relative">
          {children}
        </main>

        {/* Swiss Editorial Footer */}
        <footer className="z-10 border-t border-brutalist-text bg-white py-8 px-6 flex flex-col md:flex-row items-start justify-between gap-6 text-xs font-mono select-none">
          <div className="max-w-2xl flex flex-col gap-2">
            <p className="font-bold text-brutalist-text uppercase">
              LEAKMAP SPECIFICATIONS & GOVERNANCE COMPLIANCE:
            </p>
            <p className="text-brutalist-muted leading-relaxed text-[11px] font-medium uppercase">
              Map shows verified endpoint telemetry, disclosed processor chains, and inferred jurisdictional risk. 
              Possible exposure does not mean confirmed physical processing. LeakMap does not claim to observe 
              hidden internal processing paths. Redaction reduces sensitive prompt leakage before external API routing. 
              Sovereign route keeps prompt local by default.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 text-[10px] text-brutalist-muted font-medium">
            <p className="font-bold text-brutalist-text">TRACK: GOVERNANCE & GEOPOLITICS</p>
            <p>REF_SEC_LEVEL: 01 // AUDIT_REGISTER: TRUE</p>
            <p>© 2026 LEAKMAP PROTOCOL</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
