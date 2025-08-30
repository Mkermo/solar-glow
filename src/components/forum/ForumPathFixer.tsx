import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { diagnoseForumIssues } from '@/lib/forumDiagnostics';

const ForumPathFixer = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const results = await diagnoseForumIssues();
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const createSampleCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .insert([
          {
            name: 'General Discussion',
            description: 'General topics related to solar energy',
            name_ar: 'مناقشة عامة',
            description_ar: 'مواضيع عامة تتعلق بالطاقة الشمسية'
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Created sample category',
      });
      
      runDiagnostics();
    } catch (error) {
      console.error('Error creating sample category:', error);
      toast({
        title: 'Error',
        description: 'Failed to create sample category',
        variant: 'destructive'
      });
    }
  };
  
  const createSampleTopic = async () => {
    try {
      // Find a category to attach to
      const { data: categories } = await supabase
        .from('forum_categories')
        .select('id')
        .limit(1);
      
      if (!categories || categories.length === 0) {
        toast({
          title: 'No Categories',
          description: 'Create a category first',
          variant: 'destructive'
        });
        return;
      }
      
      // Get current user or use anonymous
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';
      
      // Create topic
      const { data, error } = await supabase
        .from('forum_topics')
        .insert([
          {
            title: 'Sample Topic',
            content: 'This is a sample topic created to test the forum.',
            user_id: userId,
            category_id: categories[0].id
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Created sample topic',
      });
      
      runDiagnostics();
    } catch (error) {
      console.error('Error creating sample topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to create sample topic',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forum Path Fixer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? 'Running...' : 'Run Diagnostics'}
            </Button>
            <Button variant="outline" onClick={createSampleCategory}>
              Create Sample Category
            </Button>
            <Button variant="outline" onClick={createSampleTopic}>
              Create Sample Topic
            </Button>
          </div>
          
          {diagnosticResults && (
            <div className="space-y-4 text-sm">
              <h3 className="font-medium text-base">Diagnostic Results:</h3>
              
              <div>
                <h4 className="font-medium">Tables:</h4>
                <ul className="list-disc pl-5">
                  {Object.entries(diagnosticResults.tables || {}).map(([tableName, info]: [string, any]) => (
                    <li key={tableName}>
                      {tableName}: {info.exists ? (
                        <span className="text-green-600">{info.count} rows</span>
                      ) : (
                        <span className="text-red-600">Not found - {info.error}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Functions:</h4>
                <ul className="list-disc pl-5">
                  {Object.entries(diagnosticResults.functions || {}).map(([functionName, info]: [string, any]) => (
                    <li key={functionName}>
                      {functionName}: {info.exists ? (
                        <span className="text-green-600">Available</span>
                      ) : (
                        <span className="text-red-600">Not found - {info.error}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              {diagnosticResults.sampleData?.topics?.data?.length > 0 && (
                <div>
                  <h4 className="font-medium">Sample Topics:</h4>
                  <ul className="list-disc pl-5">
                    {diagnosticResults.sampleData.topics.data.map((topic: any) => (
                      <li key={topic.id}>
                        {topic.title} (ID: {topic.id.substring(0, 8)}...)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumPathFixer;
