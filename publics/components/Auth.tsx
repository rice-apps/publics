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
    <div className="row flex-center flex">
      <div className="col-6 form-widget">
        <h1 className="header">Supabase + Next.js</h1>
        <form>
          <p className="description">
            Sign in with your Rice Gmail
          </p>
          <div>
            <input
              className="inputField"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button
              onClick={(e) => {
                e.preventDefault()
                handleLogin()
              }}
              className="button block"
              disabled={loading}
            >
              <span>Sign In With Rice Google</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}