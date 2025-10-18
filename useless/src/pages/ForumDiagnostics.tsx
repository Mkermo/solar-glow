import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ForumDiagnostics from '@/components/forum/ForumDiagnostics';
import ForumPathFixer from '@/components/forum/ForumPathFixer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const ForumDiagnosticsPage = () => {
  const { toast } = useToast();

  const runFixScript = async () => {
    try {
      // Create profiles for users that are missing them
      const { error: profileError } = await supabase.rpc('create_missing_profiles');
      
      // Synchronize view counts
      const { error: viewCountError } = await supabase
        .rpc('sync_forum_view_counts');
        
      if (profileError) {
        console.error('Error creating missing profiles:', profileError);
        toast({
          title: 'Error',
          description: 'Failed to create missing profiles. See console for details.',
          variant: 'destructive'
        });
      } else if (viewCountError) {
        console.error('Error syncing view counts:', viewCountError);
        toast({
          title: 'Error',
          description: 'Failed to sync view counts. See console for details.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Forum relationships have been fixed',
        });
      }
    } catch (error) {
      console.error('Error running fix script:', error);
      toast({
        title: 'Error',
        description: 'Failed to run fix script. See console for details.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Forum Diagnostics</CardTitle>
          <CardDescription>
            Troubleshoot issues with forum topics, profiles, and comments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="diagnostics">
            <TabsList className="mb-4">
              <TabsTrigger value="diagnostics">Topic Diagnostics</TabsTrigger>
              <TabsTrigger value="fixes">Quick Fixes</TabsTrigger>
              <TabsTrigger value="pathfix">Path Fixer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="diagnostics">
              <ForumDiagnostics />
            </TabsContent>
            
            <TabsContent value="fixes">
              <Card>
                <CardHeader>
                  <CardTitle>Common Forum Fixes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Fix Profile Relationships</h3>
                    <p className="text-muted-foreground mb-4">
                      Creates missing user profiles for topics and comments. Also synchronizes view count fields.
                    </p>
                    <Button onClick={runFixScript}>Run Fix Script</Button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-2">SQL Script</h3>
                    <p className="text-muted-foreground mb-4">
                      For more comprehensive fixes, copy the fix-forum-profiles.sql script from the project's 
                      sql directory and run it in your Supabase SQL Editor.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pathfix">
              <ForumPathFixer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForumDiagnosticsPage;
