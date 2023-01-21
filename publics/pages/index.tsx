import Auth from "../components/Auth"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { Session } from "@supabase/auth-helpers-react"
import type { AppProps } from "next/app"

export default function Home(pageProps: AppProps<{ initialSession: Session }>) {
  return (
    <div>
      <Auth />
    </div>
  )
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
