import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Mail, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 text-indigo-400 mb-4 shadow-xl">
        <Mail className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404</h1>
      <p className="mt-2 text-sm text-slate-400 max-w-sm">
        The page or mailbox view you are looking for does not exist.
      </p>
      <div className="mt-6">
        <Button variant="primary" size="md" onClick={() => navigate('/inbox')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Inbox
        </Button>
      </div>
    </div>
  );
}
