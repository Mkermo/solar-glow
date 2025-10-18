import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ForumTroubleshootingBanner = ({ isError = false }) => {
  const { user } = useAuth();
  
  // Only show for authenticated users
  if (!user) return null;

  // Do not render the non-error helper copy anymore
  if (!isError) return null;
  
  return (
    <div className="p-3 rounded-md mb-6 flex items-center justify-between bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
        <span className="text-sm text-red-800 dark:text-red-200">
          Experiencing issues with forum topics? Use our diagnostics tool to fix common problems.
        </span>
      </div>
      <Link to="/forum/diagnostics">
        <Button variant="destructive" size="sm">
          Open Diagnostics
        </Button>
      </Link>
    </div>
  );
};

export default ForumTroubleshootingBanner;
