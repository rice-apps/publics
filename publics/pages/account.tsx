import type { AppProps } from 'next/app';
import Auth from '../components/Auth'
import Account from '../components/Account'
import { Session } from '@supabase/auth-helpers-react'

export default function Home({ session }: AppProps<{
  session: Session;
}>) {
  return (
    <div className="container">
      {!session ? (
        <Auth />
      ) : (
        <Account key={session.user?.id} session={session} />
      )}
    </div>
  )
}