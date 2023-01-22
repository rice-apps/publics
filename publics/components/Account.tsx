import { useState, useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from 'next/router'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import ThemeChange from './ThemeChange'

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [adminOrgs, setAdminOrgs] = useState("No Admin Orgs")
  const [avatarUrl, setAvatarUrl] = useState("https://t4.ftcdn.net/jpg/04/08/24/43/360_F_408244382_Ex6k7k8XYzTbiXLNJgIL8gssebpLLBZQ.jpg")
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

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
        setProfile(data)
      }

      if (session.user.user_metadata.avatar_url) {
        setAvatarUrl(session.user.user_metadata.avatar_url)
      }

      let response = await supabaseClient
        .from("organizations_admins")
        .select(`organization(name)`)
        .eq("profile", session.user.id);

      if (response.error) {
        throw error;
      } else {
        let orgs = response.data.map((org) => {
          if (org.organization && !Array.isArray(org.organization)) {
            return org.organization.name;
          }
        });
        if(orgs.length > 0){
          setAdminOrgs(orgs.join(", "));
        }
        
      }

    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
        console.log(error.message)
      }
    } finally {
      setLoading(false)
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
    id?: string
    updated_at?: Date
  }

  
  // console.log()
  return (
    <div className="flex flex-col justify-center items-center space-y-10">

      <div className="pt-10">
        <h1 className="text-3xl font-bold">Account Information</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="avatar">
        <div className="w-12 rounded-full">
          <img src={avatarUrl} />
        </div >
        </div>
        <div>
          <p className="text-lg font-medium"> {profile?.first_name} {profile?.last_name} </p>
        </div>
      </div>
      

      <div className="card bg-base-100 px-10 py-5 max-w-md">
        <div className="flex place-content-start space-x-4 py-1">
          <div>
            <p className="font-medium"> Name: </p>
          </div>
          <div>
            <p className="text-slate-500"> {profile?.first_name} {profile?.last_name} </p>
          </div>
        </div>
        <div className="flex place-content-start space-x-4 py-1">
          <div>
            <p className="font-medium"> Email: </p>
          </div>
          <div>
            <p className="text-slate-500"> {session.user.email} </p>
          </div>
        </div>
        <div className="flex place-content-start space-x-4 py-1">
          <div>
            <p className="font-medium"> Net ID: </p>
          </div>
          <div>
            <p className="text-slate-500"> {profile?.netid} </p>
          </div>
        </div>
        <div className="flex place-content-start space-x-4 py-1">
          <div>
            <p className="font-medium inline"> Admin: </p>
          </div>
          <div>
            <p className="text-slate-500"> {adminOrgs} </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div>
          <p className="text-lg font-medium">Theme </p>
        </div>
        <div>
          <ThemeChange />
        </div>
      </div>

      <div>
        <button className="btn btn-primary"
          onClick={async () => {
            await supabaseClient.auth.signOut();
            router.push('/account')
          }}
        >
          Sign Out
        </button>
      </div>

      <div>
        <p className="text-xs text-slate-500"> Notice: Please contact the Office of the Registrar to change your preffered name</p>
      </div>

    </div>
      
  )
}
