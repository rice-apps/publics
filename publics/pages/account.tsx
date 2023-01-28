import Account from "../components/Account"
import Auth from "../components/Auth"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { Session } from "@supabase/auth-helpers-react"
import type { AppProps } from "next/app"

export default function Home(pageProps: AppProps<{ initialSession: Session }>) {
  return (
    <div>
      {!pageProps["initialSession"] ? (
        <Auth />
      ) : (
        <Account session={pageProps["initialSession"]} />
      )}
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

  return {
    props: {
      initialSession: session,
    },
  }
}
