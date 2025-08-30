import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, X, RefreshCw } from 'lucide-react';
import ForumDatabaseDiagnostic from './ForumDatabaseDiagnostic';

export function ForumDiagnostics() {
  const [topicId, setTopicId] = useState('');
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [topicData, setTopicData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDatabaseDiagnostic, setShowDatabaseDiagnostic] = useState(false);
  
  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    setDiagnosticResults(null);
    setTopicData(null);
    
    try {
      // Step 1: Basic check if the topic exists
      console.log("Checking topic existence:", topicId);
      const { count, error: countError } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true })
        .eq('id', topicId);
      
      if (countError) {
        setError(`Error checking topic existence: ${countError.message}`);
        throw countError;
      }
      
      const results: any = {
        topicExists: count > 0,
        topicId: topicId,
        stages: []
      };
      
      // If topic doesn't exist, stop here
      if (count === 0) {
        setDiagnosticResults(results);
        setLoading(false);
        return;
      }
      
      // Step 2: Try to fetch the topic directly
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('id', topicId)
        .single();
      
      results.stages.push({
        name: 'Basic topic fetch',
        success: !topicError,
        error: topicError?.message,
        data: topicError ? null : topicData
      });
      
      if (!topicError && topicData) {
        setTopicData(topicData);
        
        // Step 3: Check if category exists
        const { data: categoryData, error: categoryError } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('id', topicData.category_id)
          .single();
        
        results.stages.push({
          name: 'Category check',
          success: !categoryError,
          error: categoryError?.message,
          data: categoryError ? null : categoryData
        });
        
        // Step 4: Check if user profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', topicData.user_id)
          .single();
        
        results.stages.push({
          name: 'User profile check',
          success: !profileError,
          error: profileError?.message,
          data: profileData ? profileData : null,
          note: profileError ? "Consider creating profile for this user" : ""
        });
        
        // Step 5: Check if comments/replies exist
        const { data: commentsData, error: commentsError } = await supabase
          .from('forum_comments')
          .select('*')
          .eq('topic_id', topicId);
        
        results.stages.push({
          name: 'Comments check',
          success: !commentsError,
          error: commentsError?.message,
          count: commentsData?.length || 0
        });
      }
      
      setDiagnosticResults(results);
    } catch (error: any) {
      setError(`Diagnostic failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').upsert({
        id: userId,
        username: `User_${userId.substring(0, 6)}`,
        updated_at: new Date().toISOString()
      }).select();
      
      if (error) throw error;
      
      alert('Profile created successfully!');
      runDiagnostics();
    } catch (error: any) {
      alert(`Error creating profile: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forum Topic Diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col mb-4">
          <div className="flex gap-3 mb-4">
            <Input 
              placeholder="Enter topic ID to diagnose..." 
              value={topicId} 
              onChange={(e) => setTopicId(e.target.value)}
            />
            <Button onClick={runDiagnostics} disabled={!topicId || loading}>
              {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : "Run Diagnostics"}
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowDatabaseDiagnostic(!showDatabaseDiagnostic)}
            className="mb-4"
          >
            {showDatabaseDiagnostic ? "Hide Database Diagnostic" : "Show Database Diagnostic"}
          </Button>
        </div>
        
        {showDatabaseDiagnostic && (
          <div className="mb-6 border rounded-lg p-4 bg-muted/50">
            <h3 className="text-lg font-medium mb-2">Database Contents</h3>
            <ForumDatabaseDiagnostic />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {diagnosticResults && (
          <div className="space-y-4">
            <Alert variant={diagnosticResults.topicExists ? "default" : "destructive"}>
              <AlertTitle className="flex items-center">
                {diagnosticResults.topicExists ? 
                  <Check className="h-4 w-4 mr-2 text-green-500" /> : 
                  <X className="h-4 w-4 mr-2 text-red-500" />}
                Topic Existence Check
              </AlertTitle>
              <AlertDescription>
                {diagnosticResults.topicExists ? 
                  `Topic with ID ${diagnosticResults.topicId} exists in the database.` : 
                  `Topic with ID ${diagnosticResults.topicId} does NOT exist in the database!`}
              </AlertDescription>
            </Alert>

            {diagnosticResults.stages.map((stage: any, index: number) => (
              <Alert key={index} variant={stage.success ? "default" : "destructive"}>
                <AlertTitle className="flex items-center">
                  {stage.success ? 
                    <Check className="h-4 w-4 mr-2 text-green-500" /> : 
                    <X className="h-4 w-4 mr-2 text-red-500" />}
                  {stage.name}
                </AlertTitle>
                <AlertDescription>
                  {stage.success ? 
                    <div>
                      <p>Success!</p>
                      {stage.count !== undefined && <p>Count: {stage.count}</p>}
                      {stage.note && <p className="text-yellow-500">{stage.note}</p>}
                    </div> :
                    <div>
                      <p className="text-red-500">Error: {stage.error}</p>
                      {stage.name === "User profile check" && topicData && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => createProfile(topicData.user_id)}
                          className="mt-2"
                        >
                          Create Missing Profile
                        </Button>
                      )}
                    </div>
                  }
                </AlertDescription>
              </Alert>
            ))}

            {topicData && (
              <div>
                <h3 className="text-lg font-bold mb-2">Topic Data:</h3>
                <Textarea 
                  className="font-mono text-sm h-64"
                  value={JSON.stringify(topicData, null, 2)}
                  readOnly
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ForumDiagnostics;
