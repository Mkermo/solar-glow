import { supabase } from './supabase'

export async function createForumTopic({ 
  title, 
  content, 
  categoryId 
}: { 
  title: string
  content: string
  categoryId: string
}) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('You must be logged in to create a topic')
  }

  const { data, error } = await supabase
    .from('forum_topics')
    .insert([
      {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        user_id: session.user.id
      }
    ])
    .select('*')
    .single()

  if (error) {
    console.error('Error creating topic:', error)
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('No data returned from server')
  }

  return data
}