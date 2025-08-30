import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, Shield, Database } from "lucide-react";
import { checkAuthPermissions, getSessionInfo } from "@/lib/authHelpers";

const ForumDebug = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  async function runDiagnostics() {
    setLoading(true);
    setError(null);
    
    try {
      // Import diagnostic tools
      const { diagnoseForumIssues } = await import("@/lib/forumDataLoader");
      
      // Run the diagnostics
      const diagnosticResults = await diagnoseForumIssues();
      
      // Add authentication checks
      const sessionInfo = await getSessionInfo();
      const authChecks = {
        topics: await checkAuthPermissions('forum_topics', 'select'),
        comments: await checkAuthPermissions('forum_comments', 'select'),
        topicsWrite: await checkAuthPermissions('forum_topics', 'update'),
        commentsWrite: await checkAuthPermissions('forum_comments', 'insert')
      };
      
      // Combine all results
      diagnosticResults.auth = {
        session: sessionInfo,
        permissions: authChecks
      };
      
      setResults(diagnosticResults);
      console.log('Diagnostic results:', diagnosticResults);
    } catch (err) {
      console.error('Error running diagnostics:', err);
      setError(err.message || 'An error occurred during diagnostics');
    } finally {
      setLoading(false);
    }
  }
  
  // Run diagnostics on component mount
  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Forum Diagnostics</h1>
      
      <div className="mb-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Run Diagnostics
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{results.connection === 'OK' ? 'Connected to Supabase' : 'Connection issues detected'}</p>
              {results.error && (
                <div className="mt-2 p-2 bg-red-50 text-red-700 rounded">
                  {results.error}
                </div>
              )}
            </CardContent>
          </Card>
          
          {results.auth && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Authentication Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {results.auth.session.isLoggedIn ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-amber-500" />
                      )}
                      <span>User Session</span>
                    </div>
                    <div>
                      {results.auth.session.isLoggedIn ? (
                        <span className="text-sm text-green-600">Logged in as {results.auth.session.user?.email}</span>
                      ) : (
                        <span className="text-sm text-amber-600">Not logged in (anonymous access)</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {results.auth.permissions.topics.canAccess ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span>Read Topics</span>
                    </div>
                    <div>
                      {results.auth.permissions.topics.canAccess ? (
                        <span className="text-sm text-green-600">Access granted</span>
                      ) : (
                        <span className="text-sm text-red-600">Access denied</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {results.auth.permissions.comments.canAccess ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span>Read Comments</span>
                    </div>
                    <div>
                      {results.auth.permissions.comments.canAccess ? (
                        <span className="text-sm text-green-600">Access granted</span>
                      ) : (
                        <span className="text-sm text-red-600">Access denied</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {results.auth.permissions.topicsWrite.canAccess ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span>Update Topics (View Count)</span>
                    </div>
                    <div>
                      {results.auth.permissions.topicsWrite.canAccess ? (
                        <span className="text-sm text-green-600">Access granted</span>
                      ) : (
                        <span className="text-sm text-red-600">Access denied</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {results.tables && (
            <Card>
              <CardHeader>
                <CardTitle>Database Tables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <TableStatus 
                    name="Categories Table" 
                    status={results.tables.categories} 
                  />
                  <TableStatus 
                    name="Topics Table" 
                    status={results.tables.topics} 
                  />
                  <TableStatus 
                    name="Comments Table" 
                    status={results.tables.comments} 
                  />
                  <TableStatus 
                    name="Profiles Table" 
                    status={results.tables.profiles} 
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={async () => {
                  const { loadForumData } = await import("@/lib/forumDataLoader");
                  try {
                    const result = await loadForumData();
                    alert(`Forum data loaded successfully. Found ${result.categories.length} categories.`);
                  } catch (err) {
                    alert(`Error: ${err.message}`);
                  }
                }}>
                  Test Forum Data Loading
                </Button>
                
                <Button variant="outline" onClick={async () => {
                  try {
                    // First, get a test topic ID
                    const { data } = await supabase
                      .from('forum_topics')
                      .select('id')
                      .limit(1);
                    
                    if (!data || data.length === 0) {
                      alert('No topics found to test view count increment');
                      return;
                    }
                    
                    const topicId = data[0].id;
                    
                    // Now test the increment function
                    const { incrementTopicViewCount } = await import("@/lib/forumUtils");
                    const result = await incrementTopicViewCount(topicId);
                    
                    if (result) {
                      alert(`View count increment successful. New count: ${result}`);
                    } else {
                      alert('View count increment completed but no count returned');
                    }
                  } catch (err) {
                    alert(`Error: ${err.message || 'Unknown error'}`);
                  }
                }}>
                  Test View Count Increment
                </Button>
                
                <Button variant="outline" color="secondary" onClick={async () => {
                  const result = await getSessionInfo();
                  alert(
                    `Session Status:\n` +
                    `Logged in: ${result.isLoggedIn}\n` +
                    `Access Level: ${result.accessLevel}\n` +
                    (result.user ? `User: ${result.user.email}` : 'No user')
                  );
                }}>
                  Check Auth Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Helper component to show table status
const TableStatus = ({ name, status }) => {
  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <div className="flex items-center gap-2">
        {status.exists ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        <span>{name}</span>
      </div>
      <div>
        {status.exists ? (
          <span className="text-sm text-green-600">OK ({status.count} records)</span>
        ) : (
          <span className="text-sm text-red-600">Not found or error</span>
        )}
      </div>
    </div>
  );
};

export default ForumDebug;
