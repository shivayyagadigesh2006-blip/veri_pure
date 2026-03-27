import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ShieldAlert, Copy, Check, ClipboardEdit, AlertCircle, Clock, History, CheckSquare } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { veripureLedger, Block } from '@/src/lib/blockchain';
import { reportStore, Report } from '@/src/lib/reports';
import { formatDistanceToNow, format } from 'date-fns';

interface StaffPortalProps {
  onBack: () => void;
}

export default function StaffPortal({ onBack }: StaffPortalProps) {
  const [stationId, setStationId] = useState('');
  const [phLevel, setPhLevel] = useState('');
  const [tdsLevel, setTdsLevel] = useState('');
  const [filterChanged, setFilterChanged] = useState(false);
  const [mineralsAdded, setMineralsAdded] = useState<string[]>([]);
  const [techId, setTechId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'pending' | 'resolved'>('log');
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[]>([]);

  useEffect(() => {
    setPendingReports(reportStore.getPendingReports());
    setResolvedReports(reportStore.getResolvedReports());

    const unsubscribe = reportStore.subscribe(() => {
      setPendingReports(reportStore.getPendingReports());
      setResolvedReports(reportStore.getResolvedReports());
    });
    return unsubscribe;
  }, [activeTab]);

  const handleResolveIssue = (id: string) => {
    reportStore.resolveReport(id);
    setPendingReports(reportStore.getPendingReports());
    setResolvedReports(reportStore.getResolvedReports());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const AVAILABLE_MINERALS = ['Calcium', 'Magnesium', 'Potassium', 'Zinc'];

  const toggleMineral = (mineral: string) => {
    setMineralsAdded(prev => 
      prev.includes(mineral) 
        ? prev.filter(m => m !== mineral)
        : [...prev, mineral]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newBlock = new Block(
        veripureLedger.chain.length,
        Date.now(),
        {
          stationId,
          phLevel: parseFloat(phLevel),
          tdsLevel: parseInt(tdsLevel, 10),
          filterChanged,
          mineralsAdded,
          maintenanceTech: techId,
          notes,
          timestamp: Date.now(),
        }
      );

      veripureLedger.addBlock(newBlock);
      setIsSubmitting(false);
      setSuccess(true);
      setNotes('');
      setFilterChanged(false);
      setMineralsAdded([]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <Button variant="ghost" onClick={onBack} className="mb-2 hover:bg-neutral-200/50 rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-white border border-neutral-200 shadow-sm rounded-2xl">
            <ShieldAlert className="w-6 h-6 text-neutral-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Maintenance Portal</h1>
            <p className="text-neutral-500 font-light mt-1">Log immutable water quality data to the ledger.</p>
          </div>
        </div>

        <div className="flex p-1.5 bg-neutral-200/50 rounded-2xl w-fit mb-6 overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('log')} 
            className={`flex items-center px-4 md:px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'log' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
          >
            <ClipboardEdit className="w-4 h-4 mr-2" />
            Log Maintenance
          </button>
          <button 
            onClick={() => setActiveTab('pending')} 
            className={`flex items-center px-4 md:px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Pending Issues
            {pendingReports.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {pendingReports.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('resolved')} 
            className={`flex items-center px-4 md:px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'resolved' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
          >
            <History className="w-4 h-4 mr-2" />
            Resolved History
          </button>
        </div>

        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-md p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Record Secured</h2>
                <p className="text-sm text-neutral-500 leading-relaxed font-light">
                  Appended to the VeriPure ledger.
                </p>
              </div>
              
              <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 flex flex-col items-center space-y-5 w-full">
                <QRCodeSVG value={stationId} size={180} />
                <button 
                  onClick={handleCopy}
                  type="button"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900/50"
                  title="Copy to clipboard"
                >
                  <p className="text-lg font-mono text-neutral-900 font-medium tracking-widest">{stationId}</p>
                  {copied ? <Check className="w-4 h-4 text-neutral-900" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                </button>
              </div>
              
              <Button 
                onClick={() => setSuccess(false)} 
                className="w-full h-12 rounded-xl text-base font-medium bg-neutral-900 hover:bg-neutral-800 text-white"
              >
                Log Another Record
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'log' ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-8 border-b border-neutral-100 bg-neutral-50/50">
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900">New Maintenance Log</h2>
              <p className="text-sm text-neutral-500 mt-1 font-light">All entries are cryptographically signed and cannot be altered.</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="stationId" className="text-neutral-600 font-medium">Station ID</Label>
                    <Input 
                      id="stationId" 
                      value={stationId} 
                      onChange={(e) => setStationId(e.target.value)} 
                      required 
                      className="h-12 rounded-xl bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-900"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="techId" className="text-neutral-600 font-medium">Technician ID</Label>
                    <Input 
                      id="techId" 
                      value={techId} 
                      onChange={(e) => setTechId(e.target.value)} 
                      required 
                      className="h-12 rounded-xl bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="phLevel" className="text-neutral-600 font-medium">pH Level (0-14)</Label>
                    <Input 
                      id="phLevel" 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="14" 
                      value={phLevel} 
                      onChange={(e) => setPhLevel(e.target.value)} 
                      required 
                      className="h-12 rounded-xl bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-900"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="tdsLevel" className="text-neutral-600 font-medium">TDS Level (ppm)</Label>
                    <Input 
                      id="tdsLevel" 
                      type="number" 
                      value={tdsLevel} 
                      onChange={(e) => setTdsLevel(e.target.value)} 
                      required 
                      className="h-12 rounded-xl bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-900"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-5 border border-neutral-200 rounded-2xl bg-neutral-50/50">
                  <input 
                    type="checkbox" 
                    id="filterChanged" 
                    checked={filterChanged}
                    onChange={(e) => setFilterChanged(e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <Label htmlFor="filterChanged" className="font-medium cursor-pointer text-neutral-700">
                    Water Filter Replaced During Visit
                  </Label>
                </div>

                <div className="space-y-3">
                  <Label className="text-neutral-600 font-medium">Minerals Added</Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_MINERALS.map(mineral => (
                      <button
                        key={mineral}
                        type="button"
                        onClick={() => toggleMineral(mineral)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                          mineralsAdded.includes(mineral)
                            ? 'bg-neutral-900 border-neutral-900 text-white'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300'
                        }`}
                      >
                        {mineral}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-neutral-600 font-medium">Maintenance Notes</Label>
                  <Input 
                    id="notes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Enter maintenance notes"
                    className="h-12 rounded-xl bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-900"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-xl text-base font-medium bg-neutral-900 hover:bg-neutral-800 text-white transition-all" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Mining Block...' : 'Sign & Submit to Ledger'}
                </Button>
              </form>
            </div>
          </div>
        ) : activeTab === 'pending' ? (
          <div className="space-y-4">
            {pendingReports.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-[2rem] shadow-sm p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">All Caught Up!</h3>
                <p className="text-neutral-500 mt-2">There are no pending issues reported by students.</p>
              </div>
            ) : (
              pendingReports.map(report => (
                <div key={report.id} className="bg-white border border-neutral-200 rounded-[2rem] shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider border border-red-100">
                        <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                        {report.category || 'General Issue'}
                      </span>
                      <span className="text-sm font-mono text-neutral-700 font-semibold bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
                        {report.stationId}
                      </span>
                      <span className="text-sm text-neutral-500 flex items-center font-medium">
                        <Clock className="w-4 h-4 mr-1.5" />
                        Reported {formatDistanceToNow(report.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    {report.description && (
                      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                        <p className="text-neutral-700 text-base leading-relaxed">
                          {report.description}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={() => handleResolveIssue(report.id)}
                    className="h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white shrink-0 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Resolved
                  </Button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {resolvedReports.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-[2rem] shadow-sm p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                  <History className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">No History</h3>
                <p className="text-neutral-500 mt-2">Resolved issues will appear here.</p>
              </div>
            ) : (
              resolvedReports.map(report => (
                <div key={report.id} className="bg-white border border-neutral-200 rounded-[2rem] shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-wider border border-neutral-200">
                        {report.category || 'General Issue'}
                      </span>
                      <span className="text-sm font-mono text-neutral-500 font-semibold bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                        {report.stationId}
                      </span>
                      <span className="text-sm text-neutral-400 flex items-center font-medium">
                        <CheckSquare className="w-4 h-4 mr-1.5 text-green-600" />
                        Resolved {report.resolvedAt ? format(report.resolvedAt, 'MMM d, h:mm a') : 'Unknown'}
                      </span>
                    </div>
                    {report.description && (
                      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                        <p className="text-neutral-500 text-base leading-relaxed line-through decoration-neutral-300">
                          {report.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
