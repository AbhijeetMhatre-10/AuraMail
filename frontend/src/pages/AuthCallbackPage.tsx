import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    refreshAuth()
      .then(() => {
        navigate('/inbox', { replace: true });
      })
      .catch((err) => {
        navigate(`/login?error=${encodeURIComponent(err?.message || 'Authentication session could not be established')}`, { replace: true });
      });
  }, [searchParams, navigate, refreshAuth]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
      <h3 className="text-base font-bold text-slate-100">Connecting Gmail Account...</h3>
      <p className="text-xs text-slate-400 mt-1">Establishing secure encrypted session...</p>
    </div>
  );
}
