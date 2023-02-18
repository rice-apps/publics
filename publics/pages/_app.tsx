import Layout from "../components/Layout"
import Seo from "../components/Seo"
import "../styles/global.css"
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react"
import type { NextPage } from "next"
import type { AppProps } from "next/app"
import { useState } from "react"
import type { ReactElement, ReactNode } from "react"

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

export default function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session
}> & {
  Component: NextPageWithLayout
}) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  const getLayout =
    Component.getLayout ||
    ((page) => (
      <>
        <Seo />
        <SessionContextProvider
          supabaseClient={supabaseClient}
          initialSession={pageProps.initialSession}
        >
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SessionContextProvider>
      </>
    ))

  return getLayout(
    <>
      <Seo />
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <Component {...pageProps} />
      </SessionContextProvider>
    </>
  )
}