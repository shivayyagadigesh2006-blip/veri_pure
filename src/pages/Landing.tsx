import React from 'react';
import { ShieldCheck, Droplets, QrCode, ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface LandingProps {
  onNavigate: (page: 'staff' | 'student') => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-16 text-center">
        <div className="space-y-6 flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-5 bg-white border border-neutral-200 shadow-sm rounded-3xl mb-4">
            <Droplets className="w-10 h-10 text-neutral-900" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-neutral-900">
            VeriPure
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto font-light leading-relaxed">
            Web3 Trust Ledger for Water Quality. Zero-Knowledge Proofs ensuring 100% transparent, immutable, and verifiable safety.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12 text-left">
          <div 
            className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-neutral-200 flex flex-col space-y-6 hover:shadow-lg hover:border-neutral-300 transition-all group cursor-pointer" 
            onClick={() => onNavigate('staff')}
          >
            <div className="p-4 bg-neutral-100 rounded-2xl w-fit group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Maintenance Staff</h2>
              <p className="text-neutral-500 mt-3 text-base leading-relaxed font-light">
                Log water quality metrics, filter changes, and maintenance records directly to the private blockchain.
              </p>
            </div>
            <div className="pt-6 mt-auto">
              <Button variant="outline" className="w-full h-12 rounded-xl text-base group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
                Open Portal <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div 
            className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-neutral-200 flex flex-col space-y-6 hover:shadow-lg hover:border-neutral-300 transition-all group cursor-pointer" 
            onClick={() => onNavigate('student')}
          >
            <div className="p-4 bg-neutral-100 rounded-2xl w-fit group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Student Access</h2>
              <p className="text-neutral-500 mt-3 text-base leading-relaxed font-light">
                Scan a station's QR code to instantly verify its Trust Score and immutable maintenance history.
              </p>
            </div>
            <div className="pt-6 mt-auto">
              <Button variant="outline" className="w-full h-12 rounded-xl text-base group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
                Scan Station <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
