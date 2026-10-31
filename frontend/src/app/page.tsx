'use client';

import { useState } from 'react';
import { AppView, ScanResult, PatchResult, RescanResult } from '@/types';
import LandingView from '@/components/LandingView';
import ScannerView from '@/components/ScannerView';
import ResultsView from '@/components/ResultsView';
import PatchView from '@/components/PatchView';
import ReportView from '@/components/ReportView';
import Navbar from '@/components/Navbar';

export default function Home() {
  const [view, setView] = useState<AppView>('landing');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [patchResult, setPatchResult] = useState<PatchResult | null>(null);
  const [rescanResult, setRescanResult] = useState<RescanResult | null>(null);
  const [originalCode, setOriginalCode] = useState<string>('');

  const handleScanComplete = (result: ScanResult, code: string) => {
    setScanResult(result);
    setOriginalCode(code);
    setPatchResult(null);
    setRescanResult(null);
    setView('results');
  };

  const handlePatchGenerated = (result: PatchResult) => {
    setPatchResult(result);
    setView('patch');
  };

  const handleRescanComplete = (result: RescanResult) => {
    setRescanResult(result);
  };

  const handleViewReport = () => {
    setView('report');
  };

  const handleNewScan = () => {
    setScanResult(null);
    setPatchResult(null);
    setRescanResult(null);
    setOriginalCode('');
    setView('scanner');
  };

  return (
    <main className="min-h-screen">
      {view !== 'landing' && (
        <Navbar
          currentView={view}
          onNavigate={setView}
          hasScan={!!scanResult}
          hasPatch={!!patchResult}
          onNewScan={handleNewScan}
        />
      )}

      <div className={view === 'landing' ? '' : 'pt-16'}>
        {view === 'landing' && (
          <LandingView onGetStarted={() => setView('scanner')} />
        )}

        {view === 'scanner' && (
          <ScannerView onScanComplete={handleScanComplete} />
        )}

        {view === 'results' && scanResult && (
          <ResultsView
            scanResult={scanResult}
            originalCode={originalCode}
            onPatchGenerated={handlePatchGenerated}
            onViewReport={handleViewReport}
            onNewScan={handleNewScan}
          />
        )}

        {view === 'patch' && scanResult && patchResult && (
          <PatchView
            scanResult={scanResult}
            patchResult={patchResult}
            rescanResult={rescanResult}
            onRescanComplete={handleRescanComplete}
            onViewReport={handleViewReport}
          />
        )}

        {view === 'report' && scanResult && (
          <ReportView
            scanResult={scanResult}
            patchResult={patchResult}
            rescanResult={rescanResult}
          />
        )}
      </div>
    </main>
  );
}
