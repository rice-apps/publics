import { useState } from 'react'
import { supabase } from '../utils/db'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
      'http://localhost:3000/';
    // Make sure to include `https://` when not localhost.
    url = url.includes('http') ? url : `https://${url}`;
    // Make sure to including trailing `/`.
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
    return url;
  };

  const handleLogin = async () => {
    const res = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getURL()
      }
    },
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