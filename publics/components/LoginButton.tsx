import { supabase } from "../utils/db"
import { handleLogin } from "../utils/login"

// useSupabaseClient was not working

export default function LoginButton() {
  return (
    <button
      className="btn btn-primary hover:shadow-lg hover:scale-110"
      onClick={(e) => {
        e.preventDefault()
        handleLogin(supabase)
      }}
    >
      Sign in with your Rice ID
    </button>
  )
}
