'use client';

import { useState } from 'react';
import { Host } from '@/types';

interface HostSandboxModalProps {
  host?: Host;
  onClose: () => void;
}

export function HostSandboxModal({ host, onClose }: HostSandboxModalProps) {
  const [hasDoc, setHasDoc] = useState<boolean>(!!host?.idDocUrl);
  const [hasSelfie, setHasSelfie] = useState<boolean>(!!host?.selfieUrl);
  const [nameMatch, setNameMatch] = useState<boolean>(host?.name !== 'Anonymous Host');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{ score: number; verified: boolean } | null>(null);

  const handleRunScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      let score = 0;
      if (hasDoc) score += 30;
      if (hasSelfie) score += 30;
      if (hasDoc && hasSelfie) score += 20;
      if (nameMatch) score += 20;
      setScanResult({ score, verified: score >= 70 });
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪪</span>
            <div>
              <h2 className="text-lg font-bold">Host Identity Verification Sandbox</h2>
              <p className="text-xs text-slate-300">Simulate document heuristics & selfie biometric matching</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        <div className="p-6 space-y-5 text-sm">
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
            <span className="font-semibold text-slate-800 block">Identity Inputs</span>

            <label className="flex items-center justify-between cursor-pointer">
              <span>Government ID Document Upload</span>
              <input
                type="checkbox"
                checked={hasDoc}
                onChange={(e) => setHasDoc(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span>Live Selfie Verification Match</span>
              <input
                type="checkbox"
                checked={hasSelfie}
                onChange={(e) => setHasSelfie(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span>Legal Name Consistency Check</span>
              <input
                type="checkbox"
                checked={nameMatch}
                onChange={(e) => setNameMatch(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>
          </div>

          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Scanning Document Metadata & Biometrics...</span>
              </>
            ) : (
              <>Execute Heuristic Scan</>
            )}
          </button>

          {scanResult && (
            <div className={`p-4 rounded-xl border animate-fade-in ${
              scanResult.verified ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase">{scanResult.verified ? '✓ VERIFIED HOST' : '✗ UNVERIFIED HOST'}</span>
                  <h4 className="text-2xl font-extrabold">{scanResult.score} / 100</h4>
                </div>
                <div className="text-right text-xs">
                  <p>Document Valid: {hasDoc ? 'Yes (+30)' : 'No'}</p>
                  <p>Selfie Match: {hasSelfie ? 'Yes (+30)' : 'No'}</p>
                  <p>Dual Document: {hasDoc && hasSelfie ? 'Yes (+20)' : 'No'}</p>
                  <p>Name Check: {nameMatch ? 'Yes (+20)' : 'No'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
