import Layout from "../components/Layout"
import "../styles/global.css"
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react"
import { DefaultSeo } from "next-seo"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useState } from "react"

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session
}>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (
    <>
      <Head>
        <link rel="icon" href="/owl.png" />
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
  )
}

export default MyApp
