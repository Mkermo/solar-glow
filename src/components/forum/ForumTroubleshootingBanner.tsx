import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ForumTroubleshootingBanner = ({ isError = false }) => {
  const { user } = useAuth();
  
  // Only show for authenticated users
  if (!user) return null;
  
  return (
    <div className={`p-3 rounded-md mb-6 flex items-center justify-between ${isError ? 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
      <div className="flex items-center">
        {isError ? (
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
        ) : (
          <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
        )}
        <span className={`text-sm ${isError ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'}`}>
          {isError 
            ? 'Experiencing issues with forum topics? Use our diagnostics tool to fix common problems.' 
            : 'Manage forum settings and troubleshoot issues with the diagnostics tool.'}
        </span>
      </div>
      <Link to="/forum/diagnostics">
        <Button variant={isError ? "destructive" : "outline"} size="sm">
          Open Diagnostics
        </Button>
      </Link>
    </div>
  );
};

export default ForumTroubleshootingBanner;
