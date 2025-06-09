'use client';

import { PricingManager } from '@/components/PricingManager';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <PricingManager />
      </div>
    </div>
  );
} 