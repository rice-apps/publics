import { useState, useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)
  const [first_name, setFirst] = useState<string | null>(null)
  const [last_name, setLast] = useState<string | null>(null)
  const [netid, setNetid] = useState<string | null>(null)
  const supabaseClient = useSupabaseClient()
  const router = useRouter()

  async function getProfile() {
    try {
      setLoading(true)

      let { data, error, status } = await supabaseClient
        .from("profiles")
        .select(`first_name, last_name, netid`)
        .eq("id", session.user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFirst(data.first_name)
        setLast(data.last_name)
        setNetid(data.netid)
      }
    } catch (error) {
      if (error instanceof Error) {
        //alert(error.message)
        console.log(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getProfile()
  }, [session])

  type Profile = {
    first_name: string | null
    last_name: string | null
    netid: string | null
    id?: string
    updated_at?: Date
  }

  return (
    <main className="px-3">
      <h1>Your Account Info</h1>
      <div className="form-widget">
        <h3>Email: {session.user.email}</h3>
        <h3>
          Name: {first_name} {last_name}
        </h3>
        <h3>NetID: {netid}</h3>

        <div>
          <button
            className="btn btn-error"
            onClick={async () => {
              await supabaseClient.auth.signOut()
              router.push("/account")
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  )
}
