import Layout from "../components/Layout"
import "../styles/global.css"
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react"
import type { NextPage } from "next"
import { DefaultSeo } from "next-seo"
import type { AppProps } from "next/app"
import Head from "next/head"
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
        <Head>
          <link rel="icon" href="/owl.svg" />
          <meta
            name="google-site-verification"
            content="pQJj2FGXHM4uMmvH23WE8XS_7GPJIiCUXMwqc_24wOI"
          />
        </Head>
        <DefaultSeo
          title="PartyOwl"
          description="PartyOwl streamlines public parties at Rice University with useful features for attendees, volunteers, and socials."
          openGraph={{
            type: "website",
            locale: "en_uS",
            url: "https://publics.rice.edu/",
            siteName: "PartyOwl",
            images: [
              {
                url: "https://publics.vercel.app/owl.png",
                width: 712,
                height: 512,
                alt: "Owl",
              },
            ],
          }}
          twitter={{
            cardType: "summary_large_image",
          }}
        />
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

  return getLayout(<Component {...pageProps} />)
}
