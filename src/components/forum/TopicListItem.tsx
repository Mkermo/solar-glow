import { Link } from "react-router-dom";
import { MessageSquare, User, Clock, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface TopicListItemProps {
  topic: {
    id: string;
    title: string;
    content?: string;
    created_at: string;
    user_id: string;
    view_count?: number;
    comment_count?: number;
    profiles?: {
      username?: string;
      avatar_url?: string;
      email?: string;
    };
    forum_categories?: {
      name: string;
      name_ar?: string;
    };
  };
  showCategory?: boolean;
}

const TopicListItem = ({ topic, showCategory = true }: TopicListItemProps) => {
  const { t, lang } = useLanguage();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Link
      to={`/forum/topic/${topic.id}`}
      className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex-1">
        <h3 className="font-medium">{topic.title}</h3>
        <div className="flex items-center text-sm text-muted-foreground mt-1 flex-wrap gap-2">
          <span className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            {topic.profiles?.username || topic.profiles?.email || t("Unknown", "غير معروف")}
          </span>
          
          {showCategory && topic.forum_categories && (
            <span className="flex items-center">
              <span className="mx-1">•</span>
              <MessageSquare className="h-3 w-3 mr-1" />
              {lang === 'ar' && topic.forum_categories?.name_ar
                ? topic.forum_categories.name_ar
                : topic.forum_categories?.name}
            </span>
          )}
          
          {topic.view_count !== undefined && topic.view_count > 0 && (
            <>
              <span className="mx-1">•</span>
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {topic.view_count} {t("views", "مشاهدات")}
              </span>
            </>
          )}
          
          {topic.comment_count !== undefined && topic.comment_count > 0 && (
            <>
              <span className="mx-1">•</span>
              <Badge variant="outline" size="sm" className="text-xs">
                {topic.comment_count} {t("comments", "تعليقات")}
              </Badge>
            </>
          )}
        </div>
      </div>
      <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
        {formatDate(topic.created_at)}
      </span>
    </Link>
  );
};

export default TopicListItem;
