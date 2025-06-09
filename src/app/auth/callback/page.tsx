'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams?.get('code');
      const next = searchParams?.get('next') ?? '/';

      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code for session:', error);
          }
        } catch (error) {
          console.error('Critical error exchanging code for session:', error);
        }
      }
      router.push(next);
      router.refresh();
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border-purple-100">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-block"
          >
            <Calculator className="w-16 h-16 text-purple-500 mx-auto" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-purple-600 mt-4">
              Verifying...
            </h2>
            <p className="text-gray-600 mt-2">
              Please wait while we verify your account.
            </p>
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mt-6 text-3xl"
          >
            ⭐
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
} 