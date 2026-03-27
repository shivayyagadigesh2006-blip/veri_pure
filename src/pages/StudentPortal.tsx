import React, { useState, useEffect } from 'react';
import { ArrowLeft, QrCode, ShieldCheck, AlertTriangle, Droplets, Activity, Clock, Hash, Camera, X, AlertCircle, CheckCircle2, Bell, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { veripureLedger, Block } from '@/src/lib/blockchain';
import { reportStore, Report } from '@/src/lib/reports';
import { format } from 'date-fns';

interface StudentPortalProps {
  onBack: () => void;
}

export default function StudentPortal({ onBack }: StudentPortalProps) {
  const [scannedId, setScannedId] = useState('');
  const [activeStation, setActiveStation] = useState<string | null>(null);
  const [history, setHistory] = useState<Block[]>([]);
  const [stationReports, setStationReports] = useState<Report[]>([]);
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isReportingIssue, setIsReportingIssue] = useState(false);
  const [isViewingStandards, setIsViewingStandards] = useState(false);
  const [issueCategory, setIssueCategory] = useState<string | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  const ISSUE_CATEGORIES = [
    'Taste / Odor',
    'Low Pressure',
    'Leaking',
    'No Water',
    'Hardware Damage',
    'Other'
  ];

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (scannedId.trim()) {
      setActiveStation(scannedId.toUpperCase());
    }
  };

  useEffect(() => {
    if (activeStation) {
      const records = veripureLedger.getHistoryForStation(activeStation);
      setHistory(records.sort((a, b) => b.timestamp - a.timestamp));
      setStationReports(reportStore.getReportsForStation(activeStation));
    }
  }, [activeStation]);

  useEffect(() => {
    const unsubscribe = reportStore.subscribe((event) => {
      if (activeStation && event.report.stationId === activeStation) {
        setStationReports(reportStore.getReportsForStation(activeStation));
        if (event.type === 'resolved') {
          setNotification({
            title: 'Issue Resolved',
            message: `Maintenance has resolved the issue: ${event.report.category || 'General Issue'}`
          });
          setTimeout(() => setNotification(null), 5000);
        }
      }
    });
    return unsubscribe;
  }, [activeStation]);

  const calculateTrustScore = (records: Block[]) => {
    if (records.length === 0) return 0;
    const latest = records[0].data;
    let score = 100;
    
    if (latest.phLevel < 6.5 || latest.phLevel > 8.5) score -= 30;
    if (latest.tdsLevel > 300) score -= 40;
    else if (latest.tdsLevel > 150) score -= 10;

    const hasFilterChange = records.some(r => r.data.filterChanged);
    if (!hasFilterChange) score -= 20;

    return Math.max(0, score);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueCategory && !issueDescription.trim()) return;
    
    setIsSubmittingIssue(true);
    // Simulate API call to log the issue
    setTimeout(() => {
      reportStore.addReport({
        stationId: activeStation!,
        category: issueCategory,
        description: issueDescription
      });

      setIsSubmittingIssue(false);
      setIssueSubmitted(true);
      setIssueDescription('');
      setIssueCategory(null);
      setTimeout(() => {
        setIssueSubmitted(false);
        setIsReportingIssue(false);
      }, 2500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-8 relative">
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-neutral-900 text-white p-4 rounded-2xl shadow-2xl flex items-start space-x-3 max-w-sm animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="bg-green-500/20 p-2 rounded-full shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            <p className="text-neutral-300 text-sm mt-0.5 leading-relaxed">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="text-neutral-400 hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="ghost" onClick={onBack} className="mb-2 hover:bg-neutral-200/50 rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {isScanning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
              <div className="p-6 flex justify-between items-center border-b border-neutral-100">
                <h3 className="font-semibold text-lg flex items-center tracking-tight text-neutral-900">
                  <Camera className="w-5 h-5 mr-3 text-neutral-500" /> Scan Station QR
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setIsScanning(false)} className="rounded-full hover:bg-neutral-100">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="bg-black relative aspect-square w-full">
                <Scanner 
                  onScan={(result) => {
                    if (Array.isArray(result) && result.length > 0) {
                      const id = result[0].rawValue;
                      setScannedId(id);
                      setActiveStation(id.toUpperCase());
                      setIsScanning(false);
                    } else if (typeof result === 'string') {
                      setScannedId(result);
                      setActiveStation((result as string).toUpperCase());
                      setIsScanning(false);
                    }
                  }}
                  onError={(error) => {
                    console.error('QR Scan Error:', error);
                  }}
                />
              </div>
              <div className="p-6 bg-neutral-50 text-center text-sm text-neutral-500 font-light">
                Point your camera at the QR code on the water dispenser.
              </div>
            </div>
          </div>
        )}

        {isViewingStandards && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
              <div className="p-6 flex justify-between items-center border-b border-neutral-100">
                <h3 className="font-semibold text-lg flex items-center tracking-tight text-neutral-900">
                  <Info className="w-5 h-5 mr-3 text-blue-500" /> Water Quality Standards
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setIsViewingStandards(false)} className="rounded-full hover:bg-neutral-100">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-2">
                  <h4 className="font-semibold text-neutral-900 flex items-center"><Activity className="w-4 h-4 mr-2 text-neutral-500"/> pH Level (Ideal: 6.5 - 8.5)</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    pH measures how acidic or basic water is. The EPA recommends drinking water have a pH between 6.5 and 8.5. Water outside this range may have a noticeable taste or affect the pipes, but is generally not a health risk.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-neutral-900 flex items-center"><Droplets className="w-4 h-4 mr-2 text-neutral-500"/> TDS (Ideal: &lt; 300 ppm)</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Total Dissolved Solids (TDS) refers to the amount of minerals, salts, and metals dissolved in the water. A lower TDS generally means purer water, though some minerals are beneficial.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-neutral-900 flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-neutral-500"/> Added Minerals</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Purified water often has essential minerals like Calcium, Magnesium, Potassium, and Zinc added back in. This improves the taste and provides health benefits, as these minerals are naturally found in spring water.
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                <Button onClick={() => setIsViewingStandards(false)} className="w-full h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white">
                  Got it
                </Button>
              </div>
            </div>
          </div>
        )}

        {isReportingIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
              <div className="p-6 flex justify-between items-center border-b border-neutral-100">
                <h3 className="font-semibold text-lg flex items-center tracking-tight text-neutral-900">
                  <AlertCircle className="w-5 h-5 mr-3 text-red-500" /> Report an Issue
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setIsReportingIssue(false)} className="rounded-full hover:bg-neutral-100">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-6">
                {issueSubmitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-neutral-900">Report Submitted</h4>
                    <p className="text-neutral-500 text-sm">Thank you. Maintenance staff have been notified and will review this station.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReportIssue} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-neutral-700">What's wrong with {activeStation}?</label>
                      <div className="flex flex-wrap gap-2">
                        {ISSUE_CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setIssueCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                              issueCategory === cat 
                                ? 'bg-neutral-900 border-neutral-900 text-white' 
                                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label htmlFor="issue" className="text-sm font-medium text-neutral-700">
                        Additional Details {issueCategory !== 'Other' && <span className="text-neutral-400 font-normal">(Optional)</span>}
                      </label>
                      <textarea 
                        id="issue"
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        required={issueCategory === 'Other' || !issueCategory}
                        placeholder={issueCategory === 'Other' || !issueCategory ? "Please describe the issue..." : "Any other details you'd like to add..."}
                        className="w-full min-h-[100px] p-4 rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none text-sm"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsReportingIssue(false)} className="flex-1 h-12 rounded-xl">Cancel</Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmittingIssue || (!issueCategory && !issueDescription.trim())} 
                        className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:bg-red-600"
                      >
                        {isSubmittingIssue ? 'Submitting...' : 'Submit Report'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {!activeStation ? (
          <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden">
            <div className="flex flex-col items-center justify-center py-20 px-6 space-y-8">
              <div className="p-5 bg-neutral-50 rounded-3xl border border-neutral-100">
                <QrCode className="w-12 h-12 text-neutral-900" />
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Scan Station QR</h2>
                <p className="text-neutral-500 max-w-md font-light leading-relaxed">
                  Enter the Station ID found on the water dispenser to view its immutable trust ledger.
                </p>
              </div>
              <form onSubmit={handleScan} className="flex w-full max-w-md items-center space-x-3">
                <Input 
                  type="text" 
                  placeholder="Enter Station ID" 
                  value={scannedId}
                  onChange={(e) => setScannedId(e.target.value)}
                  className="uppercase h-14 rounded-xl bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-900 text-lg px-4"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsScanning(true)} 
                  title="Scan QR Code"
                  className="h-14 w-14 rounded-xl border-neutral-200 hover:bg-neutral-100"
                >
                  <Camera className="w-5 h-5 text-neutral-700" />
                </Button>
                <Button type="submit" className="h-14 px-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium">
                  Verify
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-5">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-neutral-200 hidden sm:block">
                  <QRCodeSVG value={activeStation} size={56} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">{activeStation}</h1>
                  <p className="text-neutral-500 flex items-center mt-2 font-medium text-sm">
                    <ShieldCheck className="w-4 h-4 mr-1.5 text-neutral-900" /> 
                    Verified on VeriPure Ledger
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsViewingStandards(true)} className="h-12 rounded-xl border-neutral-200 hover:bg-neutral-100 text-neutral-700 hidden sm:flex">
                  <Info className="w-4 h-4 mr-2" /> Standards
                </Button>
                <Button variant="outline" onClick={() => setIsReportingIssue(true)} className="h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                  <AlertCircle className="w-4 h-4 mr-2" /> Report Issue
                </Button>
                <Button variant="outline" onClick={() => setActiveStation(null)} className="h-12 rounded-xl border-neutral-200 hover:bg-neutral-100">
                  Scan Another
                </Button>
              </div>
            </div>

            {history.length > 0 ? (
              <>
                {/* Trust Score Card */}
                <div className="bg-neutral-950 text-neutral-50 shadow-xl rounded-[2rem] overflow-hidden">
                  <div className="p-8 md:p-10">
                    <div className="grid md:grid-cols-3 gap-10 items-center">
                      <div className="text-center md:text-left space-y-3">
                        <p className="text-neutral-400 font-medium uppercase tracking-widest text-xs">Trust Score</p>
                        <div className="text-7xl font-light tracking-tighter">
                          {calculateTrustScore(history)}<span className="text-3xl text-neutral-600 font-normal">/100</span>
                        </div>
                        <p className="text-xs text-neutral-500 font-mono">Cryptographically verified</p>
                      </div>
                      
                      <div className="md:col-span-2 grid grid-cols-2 gap-5">
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                          <div className="flex items-center text-neutral-400 mb-3 text-sm font-medium">
                            <Activity className="w-4 h-4 mr-2" /> pH Level
                          </div>
                          <div className="text-4xl font-light">{history[0].data.phLevel.toFixed(1)}</div>
                          <div className="text-xs text-neutral-500 mt-3 font-mono">Ideal: 6.5 - 8.5</div>
                        </div>
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                          <div className="flex items-center text-neutral-400 mb-3 text-sm font-medium">
                            <Droplets className="w-4 h-4 mr-2" /> TDS (ppm)
                          </div>
                          <div className="text-4xl font-light">{history[0].data.tdsLevel}</div>
                          <div className="text-xs text-neutral-500 mt-3 font-mono">Ideal: &lt; 300</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ledger History */}
                <div className="space-y-6 pt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 flex items-center">
                    <Hash className="w-4 h-4 mr-2" />
                    Immutable Ledger History
                  </h3>
                  
                  <div className="space-y-4">
                    {history.map((block, idx) => (
                      <div key={block.hash} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 transition-colors shadow-sm">
                        <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex justify-between items-center text-xs font-mono text-neutral-500">
                          <div className="flex items-center">
                            <span className="font-bold text-neutral-900 mr-3">Block #{block.index}</span>
                            <span className="truncate w-24 md:w-64 opacity-60" title={block.hash}>{block.hash}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1.5" />
                            {format(block.timestamp, 'MMM d, yyyy HH:mm')}
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start">
                            <div>
                              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1.5 font-semibold">Technician</p>
                              <p className="text-sm font-medium text-neutral-900">{block.data.maintenanceTech}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1.5 font-semibold">Readings</p>
                              <p className="text-sm text-neutral-700 font-mono">pH {block.data.phLevel} &middot; TDS {block.data.tdsLevel}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1.5 font-semibold">Filter</p>
                              {block.data.filterChanged ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-900 text-white text-xs font-medium">Replaced</span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 text-xs font-medium">Checked</span>
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1.5 font-semibold">Minerals Added</p>
                              {block.data.mineralsAdded && block.data.mineralsAdded.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {block.data.mineralsAdded.map(mineral => (
                                    <span key={mineral} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100">
                                      {mineral}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-neutral-500 font-mono">—</span>
                              )}
                            </div>
                            <div className="md:col-span-4">
                              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1.5 font-semibold">Notes</p>
                              <p className="text-sm text-neutral-600" title={block.data.notes}>
                                {block.data.notes || '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Reports History */}
                {stationReports.length > 0 && (
                  <div className="space-y-6 pt-8 border-t border-neutral-200">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Reported Issues
                    </h3>
                    
                    <div className="space-y-4">
                      {stationReports.map(report => (
                        <div key={report.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${report.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {report.status === 'resolved' ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : <Clock className="w-3 h-3 mr-1.5" />}
                                  {report.status}
                                </span>
                                <span className="text-sm font-semibold text-neutral-900">{report.category || 'General Issue'}</span>
                              </div>
                              <span className="text-xs text-neutral-500 font-medium">{format(report.timestamp, 'MMM d, yyyy')}</span>
                            </div>
                            <p className="text-sm text-neutral-600 leading-relaxed">{report.description || 'No additional details provided.'}</p>
                            
                            {report.status === 'resolved' && report.resolvedAt && (
                              <div className="mt-5 pt-4 border-t border-neutral-100 text-xs text-neutral-500 flex items-center font-medium">
                                <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
                                Resolved by maintenance on {format(report.resolvedAt, 'MMM d, yyyy HH:mm')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-[2rem] shadow-sm">
                <div className="flex flex-col items-center justify-center py-20 px-6 space-y-5 text-center">
                  <div className="p-4 bg-neutral-50 rounded-full">
                    <AlertTriangle className="w-10 h-10 text-neutral-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">No Records Found</h2>
                  <p className="text-neutral-500 font-light max-w-sm">
                    This station ID does not exist on the VeriPure blockchain. Please check the ID and try again.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
