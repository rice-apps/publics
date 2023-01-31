import Layout from "../components/LayoutMinimal"
import LoginButton from "../components/LoginButton"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { Session } from "@supabase/auth-helpers-react"
import type { AppProps } from "next/app"
import Link from "next/link"

export default function Index(
  pageProps: AppProps<{ initialSession: Session }>
) {
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

Index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export const getServerSideProps = async (ctx) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx)
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/events`,
        permanent: false,
      },
    }
  }
  return {
    props: {
      initialSession: session,
    },
  }
}
