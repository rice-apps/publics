import ThemeChange from "./ThemeChange"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"

export default function Account({ session }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [adminOrgs, setAdminOrgs] = useState("Not an organization admin")
  const [avatarUrl, setAvatarUrl] = useState("/owl.png")
  const supabaseClient = useSupabaseClient()
  const router = useRouter()

  async function getProfile() {
    try {
      let { data, error, status } = await supabaseClient
        .from("profiles")
        .select(`first_name, last_name, netid, college (name)`)
        .eq("id", session.user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setProfile(data)
      }

      if (session.user.user_metadata.avatar_url) {
        setAvatarUrl(session.user.user_metadata.avatar_url)
      }

      let response = await supabaseClient
        .from("organizations_admins")
        .select(`organization(name)`)
        .eq("profile", session.user.id)

      if (response.error) {
        throw error
      } else {
        let orgs = response.data.map((org) => {
          if (org.organization && !Array.isArray(org.organization)) {
            return org.organization.name
          }
        })
        if (orgs.length > 0) {
          setAdminOrgs(orgs.join(", "))
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
        console.log(error.message)
      }
    }
  }

  useEffect(() => {
    if (session) {
      getProfile()
    }
  }, [session])

  type Profile = {
    first_name: string | null
    last_name: string | null
    netid: string | null
    college: {
      name: string
    }
    id?: string
    updated_at?: Date
  }

  return (
    <div className="flex flex-col justify-center items-center space-y-4">
      <div className="pt-10">
        <h1 className="text-3xl font-bold">Account Information</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="avatar">
          <div className="w-12 rounded-full">
            <img src={avatarUrl} />
          </div>
        </div>
        <p className="text-lg font-medium">
          {profile?.first_name} {profile?.last_name}
        </p>
      </div>

      <div className="card bg-base-100 px-10 py-5 max-w-md flex justify-center border-primary border gap-y-2">
        <p>
          {" "}
          Name: {profile?.first_name} {profile?.last_name}{" "}
        </p>
        <p> Email: {session.user.email} </p>
        <p> Net ID: {profile?.netid}</p>
        <p> College: {profile?.college.name}</p>
        {adminOrgs.length > 0 ? (
          <p className="inline"> Admin: {adminOrgs} </p>
        ) : null}
        <ThemeChange />
      </div>

      <div>
        <button
          className="btn btn-primary"
          onClick={async () => {
            await supabaseClient.auth.signOut()
            router.push("/")
          }}
        >
          Sign Out
        </button>
      </div>

      <div>
        <p className="text-xs text-primary">
          Notice: Please contact the Office of the Registrar to change your
          preferred name
        </p>
      </div>
    </div>
  )
}
