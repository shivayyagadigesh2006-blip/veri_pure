export interface Report {
  id: string;
  stationId: string;
  category: string | null;
  description: string;
  timestamp: number;
  status: 'pending' | 'resolved';
  resolvedAt?: number;
}

type Listener = (event: { type: 'added' | 'resolved', report: Report }) => void;

class ReportStore {
  reports: Report[] = [];
  listeners: Listener[] = [];

  constructor() {
    this.loadFromAPI();
  }

  async loadFromAPI() {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const parsed = await res.json();
        if (Array.isArray(parsed)) {
          this.reports = parsed;
          // Notify listeners that data loaded
          this.reports.forEach(r => this.listeners.forEach(l => l({ type: 'added', report: r })));
        }
      }
    } catch (e) {
      console.error('Failed to load reports from API', e);
    }
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async addReport(report: Omit<Report, 'id' | 'timestamp' | 'status'>) {
    const newReport: Report = {
      ...report,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      status: 'pending'
    };
    this.reports.push(newReport);
    this.listeners.forEach(l => l({ type: 'added', report: newReport }));
    
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      });
    } catch (e) {
      console.error('Failed to save to API', e);
    }
    return newReport;
  }

  getPendingReports() {
    return this.reports.filter(r => r.status === 'pending').sort((a, b) => b.timestamp - a.timestamp);
  }

  getResolvedReports() {
    return this.reports.filter(r => r.status === 'resolved').sort((a, b) => (b.resolvedAt || 0) - (a.resolvedAt || 0));
  }

  getReportsForStation(stationId: string) {
    return this.reports.filter(r => r.stationId === stationId).sort((a, b) => b.timestamp - a.timestamp);
  }

  async resolveReport(id: string) {
    const report = this.reports.find(r => r.id === id);
    if (report && report.status !== 'resolved') {
      report.status = 'resolved';
      report.resolvedAt = Date.now();
      this.listeners.forEach(l => l({ type: 'resolved', report }));
      
      try {
        await fetch(`/api/reports/${id}/resolve`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolvedAt: report.resolvedAt })
        });
      } catch (e) {
        console.error('Failed to update API', e);
      }
    }
  }
}

export const reportStore = new ReportStore();
