import LoginButton from "./LoginButton"
import {
  SupabaseClient,
  useSession,
  useSupabaseClient,
} from "@supabase/auth-helpers-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const canCreateEvent = async (session: any, supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("can_create_event")
    .eq("id", session.user.id)
    .single()
  if (error) {
    return false
  }
  return data.can_create_event
}

export default function Navbar() {
  const [canCreate, setCanCreate] = useState(false)
  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (session && session.user) {
      canCreateEvent(session, supabase).then((canCreate) => {
        setCanCreate(canCreate)
      })
    }
  }, [session, supabase])

  const navbar_content = (
    <>
      <button className="btn btn-ghost normal-case text-lg">
        <Link href="/events" passHref>
          Events
        </Link>
      </button>
      {canCreate && (
        <button className="btn btn-ghost normal-case text-lg">
          <Link href="/events/create" passHref>
            Create Event
          </Link>
        </button>
      )}
      <button className="btn btn-ghost normal-case text-lg">
        <Link href="/about" passHref>
          About
        </Link>
      </button>
      <button className="btn btn-ghost normal-case text-lg">
        <Link href="mailto:awj3@rice.edu" passHref>
          Feedback
        </Link>
      </button>
    </>
  )

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
          <div
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            {navbar_content}
          </div>
        </div>
        <button className="btn btn-ghost normal-case text-xl">
          <Link href="/">
            Party Owl
            <span className="inline-block ml-2 align-middle">
              <Image src="/owl.svg" alt="Owl" width={50} height={40} />
            </span>
          </Link>
        </button>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal p-0">{navbar_content}</ul>
      </div>
      <div className="navbar-end">
        {session && session.user && session.user.user_metadata.avatar_url ? (
          <Link
            href="/account"
            className="btn btn-circle hover:scale-110 hover:drop-shadow-lg transition-all border-none"
          >
            <div className="avatar">
              <div className="w-12 rounded-full">
                <img src={session.user.user_metadata.avatar_url} />
              </div>
            </div>
            {/* <div className="avatar">
              <div className="w-8 rounded">
                <img
                  src={session.user.user_metadata.picture}
                  alt="Google profile avatar"
                  className="w-fit"
                />
              </div>
            </div> */}
          </Link>
        ) : (
          <LoginButton text="Sign in" />
        )}
      </div>
    </div>
  )
}
