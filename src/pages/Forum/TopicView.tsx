
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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
    const fetchTopic = async () => {
      try {
        if (!topicId) return;

        const { data: topicData, error: topicError } = await supabase
          .from("forum_topics")
          .select(`
            *,
            users:user_id (email)
          `)
          .eq("id", topicId)
          .single();

        if (topicError) throw topicError;

        // Format the topic data
        const formattedTopic = {
          ...topicData,
          user_email: topicData.users?.email || "Unknown User"
        };

        setTopic(formattedTopic);

        // Fetch comments for this topic
        const { data: commentsData, error: commentsError } = await supabase
          .from("forum_comments")
          .select(`
            *,
            users:user_id (email)
          `)
          .eq("topic_id", topicId)
          .order("created_at", { ascending: true });

        if (commentsError) throw commentsError;

        // Format the comments data
        const formattedComments = commentsData.map(comment => ({
          ...comment,
          user_email: comment.users?.email || "Unknown User"
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
