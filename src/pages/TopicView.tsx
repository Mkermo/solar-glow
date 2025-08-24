import { useState, useEffect, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, Send, Loader2, Flag, Trash, AlertCircle } from "lucide-react";

const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopicData() {
      setLoading(true);
      try {
        // Fetch topic with author and category
        const { data: topicData, error: topicError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profiles(username, avatar_url),
            forum_categories(name, name_ar)
          `)
          .eq('id', topicId)
          .single();

        if (topicError) throw topicError;
        setTopic(topicData);

        // Fetch replies
        const { data: repliesData, error: repliesError } = await supabase
          .from('forum_replies')
          .select(`
            *,
            profiles(username, avatar_url)
          `)
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;
        setReplies(repliesData || []);
      } catch (error) {
        console.error('Error fetching topic data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (topicId) {
      fetchTopicData();
    }
  }, [topicId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Submit a new reply
  const handleReplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: t("Authentication Required", "مطلوب تسجيل الدخول"),
        description: t("Please login to reply.", "يرجى تسجيل الدخول للرد."),
        variant: "destructive"
      });
      return;
    }
    
    if (!replyContent.trim()) {
      toast({
        title: t("Empty Reply", "رد فارغ"),
        description: t("Please enter a reply.", "يرجى إدخال رد."),
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('forum_replies')
        .insert({
          content: replyContent.trim(),
          topic_id: topicId,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select();
        
      if (error) throw error;
      
      // Add the new reply to the list
      if (data) {
        const newReply = {
          ...data[0],
          profiles: {
            username: user.user_metadata?.username || user.email,
            avatar_url: user.user_metadata?.avatar_url
          }
        };
        
        setReplies([...replies, newReply]);
        setReplyContent("");
        
        toast({
          title: t("Reply Posted", "تم نشر الرد"),
          description: t("Your reply has been posted successfully.", "تم نشر ردك بنجاح."),
        });
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: t("Error", "خطأ"),
        description: t("Failed to post reply. Please try again.", "فشل في نشر الرد. يرجى المحاولة مرة أخرى."),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Report a topic or reply
  const handleReport = async (type: 'topic' | 'reply', id: string) => {
    if (!user) {
      toast({
        title: t("Authentication Required", "مطلوب تسجيل الدخول"),
        description: t("Please login to report content.", "يرجى تسجيل الدخول للإبلاغ عن المحتوى."),
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('forum_reports')
        .insert({
          reported_by: user.id,
          content_type: type,
          content_id: id,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: t("Report Submitted", "تم إرسال البلاغ"),
        description: t("Your report has been submitted for review.", "تم إرسال بلاغك للمراجعة."),
      });
    } catch (error) {
      console.error('Error reporting content:', error);
      toast({
        title: t("Error", "خطأ"),
        description: t("Failed to submit report. Please try again.", "فشل في إرسال البلاغ. يرجى المحاولة مرة أخرى."),
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("Topic Not Found", "الموضوع غير موجود")}</h1>
        <Button asChild>
          <Link to="/forum">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("Back to Forum", "العودة إلى المنتدى")}
          </Link>
        </Button>
      </div>
    );
  }

  const categoryName = lang === 'ar' && topic.forum_categories?.name_ar 
    ? topic.forum_categories.name_ar 
    : topic.forum_categories?.name;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to={`/forum/category/${topic.category_id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("Back to", "العودة إلى")} {categoryName}
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold">{topic.title}</h1>
        
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <span>
            {t("Posted by", "نشر بواسطة")} {topic.profiles?.username || t("Unknown", "غير معروف")}
          </span>
          <span className="mx-2">•</span>
          <span>{formatDate(topic.created_at)}</span>
        </div>
      </div>

      {/* Original post */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-2">
              <AvatarImage src={topic.profiles?.avatar_url} />
              <AvatarFallback>
                {topic.profiles?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{topic.profiles?.username || t("Unknown", "غير معروف")}</p>
              <p className="text-xs text-muted-foreground">{formatDate(topic.created_at)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{topic.content}</p>
        </CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReport('topic', topic.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Flag className="h-4 w-4 mr-2" />
            {t("Report", "إبلاغ")}
          </Button>
        </CardFooter>
      </Card>

      {/* Replies */}
      <h2 className="text-2xl font-semibold mb-4">
        {t("Replies", "الردود")} ({replies.length})
      </h2>
      
      {replies.length === 0 ? (
        <div className="text-center py-12 border rounded-lg mb-8">
          <p>{t("No replies yet. Be the first to reply!", "لا توجد ردود بعد. كن أول من يرد!")}</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {replies.map((reply) => (
            <Card key={reply.id}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={reply.profiles?.avatar_url} />
                    <AvatarFallback>
                      {reply.profiles?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{reply.profiles?.username || t("Unknown", "غير معروف")}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{reply.content}</p>
              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReport('reply', reply.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {t("Report", "إبلاغ")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Reply form */}
      {user ? (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">{t("Post a Reply", "نشر رد")}</h3>
          <form onSubmit={handleReplySubmit}>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={t("Write your reply here...", "اكتب ردك هنا...")}
              rows={5}
              disabled={isSubmitting}
              className="mb-4"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Posting...", "جاري النشر...")}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {t("Post Reply", "نشر الرد")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="border rounded-lg p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="mb-4">{t("You need to be logged in to reply.", "يجب أن تكون مسجل الدخول للرد.")}</p>
          <Button asChild>
            <Link to="/login">
              {t("Login to Reply", "تسجيل الدخول للرد")}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopicView;