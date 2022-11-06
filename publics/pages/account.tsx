import { useState, useEffect } from 'react'
import { supabase } from '../utils/db'
import Auth from '../components/Auth'
import Account from '../components/Account'
import { Session } from '@supabase/auth-helpers-react'

export default function Home({ session: Session }) {

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session?.data.session ? (
        <Auth />
      ) : (
        <Account key={session.data.session.user?.id} session={session} />
      )}
    </div>
  )
}