import { DefaultSeo } from "next-seo"
import Head from "next/head"

export default function Seo() {
  return (
    <>
      <Head>
        <link rel="icon" href="/owl.svg" />
        <meta
          name="google-site-verification"
          content="pQJj2FGXHM4uMmvH23WE8XS_7GPJIiCUXMwqc_24wOI"
        />
        <meta name="application-name" content="Party Owl" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Party Owl" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#AC1FB8" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="mask-icon"
          href="/icons/manifest-icon-512.png"
          color="#5bbad5"
        />
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
      </Head>
      <DefaultSeo
        title="Party Owl"
        description="Party Owl streamlines public parties at Rice University with useful features for attendees, volunteers, and socials."
        openGraph={{
          type: "website",
          locale: "en_uS",
          url: "https://publics.rice.edu/",
          siteName: "Party Owl",
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
    </>
  )
}
