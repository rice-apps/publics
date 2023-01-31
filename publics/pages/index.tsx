import Auth from "../components/Auth"
import Layout from "../components/LayoutMinimal"
import LoginButton from "../components/LoginButton"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { Session } from "@supabase/auth-helpers-react"
import type { AppProps } from "next/app"

export default function Index(
  pageProps: AppProps<{ initialSession: Session }>
) {
  return <Auth />
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
