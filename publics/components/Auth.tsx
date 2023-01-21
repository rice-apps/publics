import { handleLogin } from "../utils/login"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

export default function Auth() {
  const supabaseClient = useSupabaseClient()
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img
          src="https://placeimg.com/260/400/arch"
          className="ml-2 max-w-sm rounded-lg shadow-2xl"
        />
        <div className="lg:max-w-2/5 md:max-w-2/3">
          <h1 className="text-4xl font-bold">
            Streamlining public parties at Rice.
          </h1>
          <p className="py-6 text-xl">
            <span className="text-primary">Attendees</span> can register for
            events in-app and access important event information.
          </p>
          <p className="py-6 text-xl">
            <span className="text-primary">Volunteers</span> can seamlessly
            check in and out of their shift and track event capacity.
          </p>
          <p className="py-6 text-xl">
            <span className="text-primary">Socials</span> can create events,
            manage attendees and volunteers, and view event analytics.
          </p>
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault()
              handleLogin(supabaseClient)
            }}
          >
            Sign in with your Rice Google
          </button>
        </div>
      </div>
    </div>
  )
}
