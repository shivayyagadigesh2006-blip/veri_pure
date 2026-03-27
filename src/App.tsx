import React, { useState } from 'react';
import Landing from './pages/Landing';
import StaffPortal from './pages/StaffPortal';
import StudentPortal from './pages/StudentPortal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'staff' | 'student'>('landing');

  return (
    <div className="min-h-screen font-sans">
      {currentPage === 'landing' && (
        <Landing onNavigate={(page) => setCurrentPage(page)} />
      )}
      {currentPage === 'staff' && (
        <StaffPortal onBack={() => setCurrentPage('landing')} />
      )}
      {currentPage === 'student' && (
        <StudentPortal onBack={() => setCurrentPage('landing')} />
      )}
    </div>
  );
}
