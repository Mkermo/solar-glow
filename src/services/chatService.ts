
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user_email?: string;
}

export const fetchMessages = async (): Promise<ChatMessage[]> => {
  try {
    // First check if table exists - this will return data if table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    if (tableError) {
      console.warn('Error checking chat_messages table:', tableError);
      return [];
    }
    
    // Table might not exist yet
    if (tableExists === null) {
      console.warn('Chat messages table may not exist');
      return [];
    }
    
    // Table exists, fetch messages
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        content,
        user_id,
        created_at,
        profiles:user_id (email)
      `)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
    
    console.log('Raw message data:', data);
    
    // Transform the data to match the ChatMessage interface
    const messages = data?.map(msg => {
      // Check if profiles exists and get the first item if it's an array
      const profileData = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles;
      
      return {
        id: msg.id,
        content: msg.content,
        user_id: msg.user_id,
        created_at: msg.created_at,
        user_email: profileData?.email
      };
    }) || [];
    
    console.log('Transformed messages:', messages);
    return messages;
    
  } catch (err) {
    console.error('Error in fetchMessages:', err);
    toast({
      title: "Error loading messages",
      description: "Could not load chat messages",
      variant: "destructive"
    });
    return [];
  }
};

export const sendMessage = async (content: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        user_id: userId
      });
      
    if (error) {
      throw error;
    }
  } catch (err) {
    console.error('Error sending message:', err);
    toast({
      title: "Failed to send message",
      description: "Your message could not be sent. Please try again.",
      variant: "destructive"
    });
    throw err;
  }
};

export const setupChatSubscription = (onNewMessage: (message: ChatMessage) => void) => {
  const channel = supabase.channel('chat_changes')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public',
      table: 'chat_messages'
    }, (payload) => {
      if (payload.table === 'chat_messages' && payload.eventType === 'INSERT') {
        const newMessage = payload.new as ChatMessage;
        onNewMessage(newMessage);
      }
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};
