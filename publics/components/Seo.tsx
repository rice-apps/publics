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
              width: 512,
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
