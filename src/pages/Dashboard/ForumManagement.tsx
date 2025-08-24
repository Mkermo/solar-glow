import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ForumManagement = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pendingTopics, setPendingTopics] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchForumManagementData = async () => {
      setLoading(true);
      try {
        // Fetch pending topics
        const { data: pendingTopicsData, error: pendingTopicsError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profiles(username, avatar_url),
            forum_categories(name, name_ar)
          `)
          .eq('is_approved', false)
          .order('created_at', { ascending: false });

        if (pendingTopicsError) throw pendingTopicsError;
        setPendingTopics(pendingTopicsData || []);

        // Fetch reports
        const { data: reportsData, error: reportsError } = await supabase
          .from('forum_reports')
          .select(`
            *,
            profiles!reported_by(username, avatar_url)
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (reportsError) throw reportsError;
        setReports(reportsData || []);
      } catch (error) {
        console.error('Error fetching forum management data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForumManagementData();
  }, [user]);

  // Approve a topic
  const handleApproveTopic = async (topicId: string) => {
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_approved: true })
        .eq('id', topicId);
        
      if (error) throw error;
      
      // Update local state
      setPendingTopics(pendingTopics.filter(topic => topic.id !== topicId));
      
      toast({
        title: t("Topic Approved", "تمت الموافقة على الموضوع"),
        description: t("The topic is now visible to all users.", "الموضوع الآن مرئي لجميع المستخدمين."),
      });
    } catch (error) {
      console.error('Error approving topic:', error);
      toast({
        title: t("Error", "خطأ"),
        description: t("Failed to approve topic. Please try again.", "فشل في الموافقة على الموضوع. يرجى المحاولة مرة أخرى."),
        variant: "destructive"
      });
    }
  };

  // Reject a topic
  const handleRejectTopic = async (topicId: string) => {
    try {
      const { error } = await supabase
        .from('forum_topics')
        .delete()
        .eq('id', topicId);
        
      if (error) throw error;
      
      // Update local state
      setPendingTopics(pendingTopics.filter(topic => topic.id !== topicId));
      
      toast({
        title: t("Topic Rejected", "تم رفض الموضوع"),
        description: t("The topic has been removed.", "تمت إزالة الموضوع."),
      });
    } catch (error) {
      console.error('Error rejecting topic:', error);
      toast({
        title: t("Error", "خطأ"),
        description: t("Failed to reject topic. Please try again.", "فشل في رفض الموضوع. يرجى المحاولة مرة أخرى."),
        variant: "destructive"
      });
    }
  };

  // Handle report actions
  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
    try {
      const { error } = await supabase
        .from('forum_reports')
        .update({ 
          status: action === 'resolve' ? 'resolved' : 'dismissed',
          resolved_by: user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId);
        
      if (error) throw error;
      
      // Update local state
      setReports(reports.filter(report => report.id !== reportId));
      
      toast({
        title: action === 'resolve' 
          ? t("Report Resolved", "تم حل البلاغ")
          : t("Report Dismissed", "تم تجاهل البلاغ"),
        description: action === 'resolve'
          ? t("The reported content has been handled.", "تم التعامل مع المحتوى المُبلغ عنه.")
          : t("The report has been dismissed.", "تم تجاهل البلاغ.")
      });
    } catch (error) {
      console.error('Error handling report:', error);
      toast({
        title: t("Error", "خطأ"),
        description: t("Failed to handle report. Please try again.", "فشل في التعامل مع البلاغ. يرجى المحاولة مرة أخرى."),
        variant: "destructive"
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("Forum Management", "إدارة المنتدى")}</h1>
      
      <Tabs defaultValue="pending-topics">
        <TabsList>
          <TabsTrigger value="pending-topics">
            {t("Pending Topics", "المواضيع المعلقة")}
            {pendingTopics.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingTopics.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports">
            {t("Reports", "البلاغات")}
            {reports.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {reports.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending-topics">
          {pendingTopics.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <Check className="h-12 w-12 text-primary mx-auto mb-4" />
              <p>{t("No topics pending approval.", "لا توجد مواضيع بانتظار الموافقة.")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTopics.map((topic) => (
                <Card key={topic.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{topic.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("by", "بواسطة")} {topic.profiles?.username || t("Unknown", "غير معروف")} • {formatDate(topic.created_at)}
                        </p>
                        <p className="text-sm mt-1">
                          {t("Category", "الفئة")}: {topic.forum_categories?.name || t("Unknown", "غير معروف")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectTopic(topic.id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          {t("Reject", "رفض")}
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleApproveTopic(topic.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          {t("Approve", "موافقة")}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{topic.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reports">
          {reports.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <Check className="h-12 w-12 text-primary mx-auto mb-4" />
              <p>{t("No pending reports.", "لا توجد بلاغات معلقة.")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                          {t("Reported", "تم الإبلاغ عن")} {report.content_type === 'topic' ? t("Topic", "موضوع") : t("Reply", "رد")}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("Reported by", "تم الإبلاغ بواسطة")} {report.profiles?.username || t("Unknown", "غير معروف")} • {formatDate(report.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'dismiss')}
                        >
                          <X className="mr-2 h-4 w-4" />
                          {t("Dismiss", "تجاهل")}
                        </Button>
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReportAction(report.id, 'resolve')}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          {t("Resolve", "حل")}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{t("Content ID", "معرف المحتوى")}: {report.content_id}</p>
                    <p className="mt-2">{t("View the reported content to take action.", "اعرض المحتوى المُبلغ عنه لاتخاذ إجراء.")}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForumManagement;