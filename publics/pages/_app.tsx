import '../styles/global.css'
import React, {useState} from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'


function MyApp({ 
  Component, 
  pageProps 
}: AppProps<{
  initialSession : Session
}>) {
  const router = useRouter()
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (
    <SessionContextProvider
    supabaseClient={supabaseClient}
    initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  )
  //You can now determine if a user is authenticated by checking that the user object returned by the useUser() hook is defined.
}

export default MyApp