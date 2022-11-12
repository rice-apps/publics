import { useState } from 'react'
import { supabase } from '../utils/db'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async () => {
    const res = await supabase.auth.signInWithOAuth({
      provider: 'google'
    },
      // {
      //   redirectTo: 'https://example.com/welcome'
      // }
    )
    console.log(res)
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <img src="https://placeimg.com/500/250/arch" className="max-w-sm rounded-lg shadow-2xl" />
          <h1 className="text-5xl font-bold">Publics</h1>
          <p className="py-6">Sentence description for publics application.</p>
          <button
            onClick={(e) => {
              e.preventDefault()
              handleLogin()
            }}
            className="btn btn-outline-primary"
            disabled={loading}
          >
            <span>Sign In With Rice Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}