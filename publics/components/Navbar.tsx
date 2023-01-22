import Link from "next/link"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { handleLogin } from "../utils/login"
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import CreateEventButton from "./eventCards/CreateEventButton"

async function authorize(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("organizations_admins")
    .select("organization ( id, name )")
    .eq("profile", userId)

  if (error) {
    throw error
  }

  return data.length > 0
}

async function getOrgs(supabase: SupabaseClient, userId: string) {
  const { data: orgs, error } = await supabase
    .from("organizations_admins")
    .select("organization ( id, name )")
    .eq("profile", userId)
  if (error) {
    throw error
  }
  if (!orgs) {
    return []
  }

  return orgs
}

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
          <Link href="/">Publics</Link>
        </span>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal p-0">{navbar_content}</ul>
      </div>
      <div className={resultSuccess ? "block" : "hidden"}>
        <SuccessMsg message={`${action}`} />
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

export async function getServerSideProps(ctx) {
  const supabase = createServerSupabaseClient(ctx)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/account`,
        permanent: false,
      },
    }

  const authorized = await authorize(supabase, session.user.id)
  if (authorized)
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/404`,
        permanent: false,
      },
    }

  const orgs = await getOrgs(supabase, session.user.id)

  let props = { orgs }

  return { props } // will be passed to the page component as props
}
