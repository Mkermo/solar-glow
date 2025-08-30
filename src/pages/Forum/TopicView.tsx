
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { incrementTopicViewCount } from "@/lib/forumUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user_email?: string | null;
}

interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  user_email?: string | null;
}

const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    
    const fetchTopic = async () => {
      try {
        if (!topicId) {
          setIsLoading(false);
          return;
        }
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.log('Loading timeout reached, stopping load operation');
            setIsLoading(false);
            toast({
              title: "Loading timeout",
              description: "The topic is taking too long to load. Please try again.",
              variant: "destructive",
            });
          }
        }, 10000); // 10 second timeout
        
        console.log('Fetching topic with ID:', topicId);
        
        // Skip the existence check to reduce database queries

        // Fetch all needed data in parallel to improve performance
        const [topicResult, commentsResult] = await Promise.all([
          // Get topic data
          supabase.from("forum_topics")
            .select('*, user_id, category_id')
            .eq("id", topicId)
            .single(),
            
          // Get comments for this topic in the same batch
          supabase.from("forum_comments")
            .select(`*, profiles(email)`)
            .eq("topic_id", topicId)
            .order("created_at", { ascending: true })
        ]);
        
        // Use let instead of const for topicData since we might need to reassign it
        let { data: topicData, error: topicError } = topicResult;
        const { data: commentsData, error: commentsError } = commentsResult;
        
        // Handle topic fetch error
        if (topicError) {
          console.error('Error fetching topic data:', topicError);
          
          // Try a more basic query as a fallback
          const { data: fallbackTopicData, error: fallbackError } = await supabase
            .from("forum_topics")
            .select('id, title, content, user_id, category_id, created_at')
            .eq("id", topicId)
            .single();
            
          if (fallbackError || !fallbackTopicData) {
            throw topicError;
          } else {
            // Use the fallback data
            topicData = fallbackTopicData;
          }
        }
        
        // If topic data exists, fetch profile and category info
        if (topicData) {
          try {
            // Fetch profile and category in parallel with error handling
            const [profileResult, categoryResult] = await Promise.all([
              supabase.from("profiles")
                .select('email, username, avatar_url')
                .eq("id", topicData.user_id)
                .single()
                .catch(err => {
                  console.log('Error fetching profile, using default', err);
                  return { data: { email: "Unknown User" } };
                }),
                
              supabase.from("forum_categories")
                .select('name, name_ar')
                .eq("id", topicData.category_id)
                .single()
                .catch(err => {
                  console.log('Error fetching category, using default', err);
                  return { data: { name: "Unknown Category" } };
                })
            ]);
            
            // Add profile and category data to topic
            topicData.profiles = profileResult.data || { email: "Unknown User" };
            topicData.forum_categories = categoryResult.data || { name: "Unknown Category" };
          } catch (err) {
            console.error('Error fetching related data:', err);
            // Continue with basic topic data
            topicData.profiles = { email: "Unknown User" };
            topicData.forum_categories = { name: "Unknown Category" };
          }
        }
        
        console.log('Topic data received:', topicData);

        // Format the topic data
        const formattedTopic = {
          ...topicData,
          user_email: topicData.profiles?.email || "Unknown User"
        };

        setTopic(formattedTopic);
        
        // Increment the view count when a topic is viewed - in the background
        // This won't block the UI rendering
        if (topicId) {
          // Update view count in UI immediately for better UX
          setTopic(prevTopic => {
            // Handle either view_count or views field
            if (prevTopic?.view_count !== undefined) {
              return {
                ...prevTopic,
                view_count: (prevTopic.view_count || 0) + 1
              };
            } else if (prevTopic?.views !== undefined) {
              return {
                ...prevTopic,
                views: (prevTopic.views || 0) + 1
              };
            }
            return prevTopic;
          });
          
          // Don't await this - let it run in the background
          incrementTopicViewCount(topicId)
            .then((newCount) => {
              if (newCount) {
                // Update with the actual count from server if available
                setTopic(prevTopic => {
                  if (!prevTopic) return prevTopic;
                  
                  // Use the appropriate field based on what the server returned
                  const viewCountField = prevTopic.view_count !== undefined ? 'view_count' : 'views';
                  return {
                    ...prevTopic,
                    [viewCountField]: newCount
                  };
                });
              }
            })
            .catch(err => console.error('Error incrementing view count:', err));
            
          console.log('View count increment initiated for topic:', topicId);
        }
        
        // We already fetched comments in parallel above
        if (commentsError) throw commentsError;

        // Format the comments data
        const formattedComments = commentsData.map(comment => ({
          ...comment,
          user_email: comment.profiles?.email || "Unknown User"
        }));

        setComments(formattedComments);
      } catch (error) {
        console.error("Error fetching topic:", error);
        toast({
          title: "Error",
          description: "Failed to load topic",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopic();
  }, [topicId, toast]);

  const onSubmit = async (values: CommentFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("forum_comments").insert({
        content: values.content,
        topic_id: topicId,
        user_id: user.id,
      });

      if (error) throw error;

      // Add new comment to the list
      const newComment = {
        id: Date.now().toString(), // Temporary ID until page refresh
        content: values.content,
        user_id: user.id,
        created_at: new Date().toISOString(),
        user_email: user.email,
      };

      setComments([...comments, newComment]);
      form.reset();

      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Topic not found</h1>
          <p>The topic you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{topic.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>Posted by {topic.user_email}</span>
          <span>•</span>
          <span>{new Date(topic.created_at).toLocaleDateString()}</span>
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <p>{topic.content}</p>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">
          Comments ({comments.length})
        </h2>

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>{comment.user_email}</span>
                <span>•</span>
                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p>{comment.content}</p>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>

        {user ? (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Add a comment</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Write your comment here..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <div className="mt-8 p-4 bg-muted rounded-lg text-center">
            Please log in to add a comment.
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicView;
