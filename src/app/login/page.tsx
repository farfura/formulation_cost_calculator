'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Calculator, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;
      
      toast({
        title: "✨ Welcome back!",
        description: "Successfully signed in.",
      });

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: err instanceof Error ? err.message : 'Failed to sign in',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-block"
          >
            <Calculator className="w-16 h-16 text-purple-500 mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent">
            Beauty Formula Calculator
          </h1>
          <p className="text-gray-600 mt-2">Sign in to manage your formulations</p>
        </div>

        <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl border-purple-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-50 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 hover:from-purple-600 hover:via-pink-600 hover:to-yellow-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⭐
                </motion.div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="mt-4 text-center space-y-2">
              <Link
                href="/signup"
                className="text-sm text-purple-600 hover:text-purple-700 block"
              >
                Don't have an account? Sign up
              </Link>
              <Link
                href="/forgot-password"
                className="text-sm text-gray-600 hover:text-gray-700 block"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 