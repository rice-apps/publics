import { handleLogin } from "../utils/login"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
  const supabaseClient = useSupabaseClient()
  const navbar_content = (
    <>
      <li>
        <Link href="/events">Events</Link>
      </li>
      <li>
        <Link href="mailto:awj3@rice.edu">Contact</Link>
      </li>
    </>
  )

  const session = useSession()

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
          <Link href="/">
            PartyOwl
            <span className="inline-block ml-2 align-middle">
              <Image src="/owl.svg" alt="Owl" width={30} height={42} />
            </span>
          </Link>
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
