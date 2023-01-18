import { useSupabaseClient } from "@supabase/auth-helpers-react"

export default function Auth() {
  const supabaseClient = useSupabaseClient()

  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
      "http://localhost:3000/"
    // Make sure to include `https://` when not localhost.
    url = url.includes("http") ? url : `https://${url}`
    // Make sure to including trailing `/`.
    url = url.charAt(url.length - 1) === "/" ? url : `${url}/`
    return url
  }

  const handleLogin = async () => {
    const res = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getURL(),
      },
    })
    console.log(res)
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img
          src="https://placeimg.com/260/400/arch"
          className="max-w-sm rounded-lg shadow-2xl"
        />
        <div>
          <h1 className="text-4xl font-bold">
            Streamlining public parties at Rice.
          </h1>
          <p className="py-6">
            <span className="text-primary">Attendees</span> can register for
            events in-app and access important event information.
          </p>
          <p className="py-6">
            <span className="text-primary">Volunteers</span> can seamlessly
            check in and out of their shift and track event capacity.
          </p>
          <p className="py-6">
            <span className="text-primary">Socials</span> can create events,
            manage attendees and volunteers, and view event analytics.
          </p>
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            Sign in with your Rice Google
          </button>
        </div>
      </div>
    </div>
  )
}
