import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export function LoginSuccess() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        navigate('/login')
        return
      }
      
      setLoading(false)
    }
    
    checkSession()
  }, [navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Login Successful!</h1>
      <p className="mb-4">Welcome back! You have successfully logged in.</p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/forum')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Forum
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Go to Home
        </button>
      </div>
    </div>
  )
}
