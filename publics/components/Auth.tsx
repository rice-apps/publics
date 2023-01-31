import { handleLogin } from "../utils/login"
import LoginButton from "./LoginButton"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import Link from "next/link"

export default function Auth() {
  const supabaseClient = useSupabaseClient()
  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: `-webkit-image-set(
        url("nod.avif") type("image/avif"),
        url("nod.jpg") type("image/jpeg"))`,
      }}
    >
      <div className="hero-overlay bg-black opacity-60"></div>
      <div className="hero-content text-center">
        <div className="font-bold text-white text-lg">
          <div className="absolute top-10 left-10">Party Owl</div>
          <div className="absolute top-10 right-36 hover:underline">
            <Link href="/about">About</Link>
          </div>
          <div className="absolute top-10 right-10 hover:underline">
            <Link href="mailto:awj3@rice.edu">Feedback</Link>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-8 text-white">
            Streamlining publics parties at Rice.
          </h1>
          <LoginButton />
        </div>
      </div>
    </div>
  )
}
