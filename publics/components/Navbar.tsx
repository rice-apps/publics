import Link from "next/link"
//import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { handleLogin } from "../utils/login"
import { useEffect, useState } from "react"
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import CreateEventButton from "./eventCards/CreateEventButton"
import { off } from "process"



export default function Navbar() {
  const supabaseClient = useSupabaseClient()
  //const [canCreate, setCanCreate] = useState(false);
  /*const user = useUser()

  useEffect(() => {
    async function setAuth(){
      const { data } = await supabaseClient
      .from("profiles")
      .select("can_create_event")
      .eq("can_create_event", true)
      setCanCreate(true)
    }
    if (user) setAuth()
  }, [user]
  )

  if(!user)
    setCanCreate(false)*/

  
  const navbar_content = (
    <>
      <li>
        <Link href="/events">Events</Link>
      </li>
      <li className={canCreate() ? "block" : "hidden"}>
        <Link href="/events/create">Create Event</Link>
      </li>
      <li>
        <Link href="mailto:awj3@rice.edu">Contact</Link>
      </li>

    </>
  )


  const session = useSession()
  //const authorized = await authorize(supabase, session.user.id)

  return (
    <div className="navbar bg-base-100 min-h-fit">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            {navbar_content}
          </ul>
        </div>
        <span className="btn btn-ghost normal-case text-xl">
          <Link href="/">Publics</Link>
        </span>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal p-0">{navbar_content}</ul>
      </div>
      <div className="navbar-end">
        {session && session.user && session.user.user_metadata.picture ? (
          <Link
            href="/account"
            className="btn btn-outline hover:scale-110 hover:drop-shadow-lg transition-all"
          >
            <div className="avatar">
              <div className="w-8 rounded">
                <img
                  src={session.user.user_metadata.picture}
                  alt="Google profile avatar"
                  className="w-fit"
                />
              </div>
            </div>
          </Link>
        ) : (
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault()
              handleLogin(supabaseClient)
            }}
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  )
}

async function isAdminUser(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  let { data, error } = await supabase
    .from("profiles")
    .select("id, can_create_event")
    .eq("can_create_event", true)

  if (!error && data) {
    return true
  }
  return false;
  
  //return data.some((event) => event.organization === event_detail!.organization)
}

export const getServerSideProps = async (ctx) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx)
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const admin_status = await isAdminUser(
    supabase,
    session.user.id
  )
  
  if(!admin_status){
    return {
      props: {
        canCreateEvent: false,
      },
    }
  }

  return {
    props: {
      canCreateEvent: true,
    },
  }
}

function canCreate(props){
  return props.canCreateEvent;
}
