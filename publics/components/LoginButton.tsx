import { handleLogin } from "../utils/login"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

export default function LoginButton() {
  const supabaseClient = useSupabaseClient()
  return (
    <button
      className="btn btn-primary hover:shadow-lg hover:scale-110"
      onClick={(e) => {
        e.preventDefault()
        handleLogin(supabaseClient)
      }}
    >
      Sign in with your Rice ID
    </button>
  )
}
