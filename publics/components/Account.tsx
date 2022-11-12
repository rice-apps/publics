import { useState, useEffect } from 'react'
import { supabase } from '../utils/db'

export default function Account({ session }: { session: any }) {
  const [loading, setLoading] = useState(true)
  const [first_name, setFirst] = useState(null)
  const [last_name, setLast] = useState(null)
  const [netid, setNetid] = useState(null)

  async function getCurrentUser() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    if (!session?.user) {
      throw new Error('User not logged in')
    }

    return session.user
  }

  async function getProfile() {
    try {
      setLoading(true)
      const user = await getCurrentUser()

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name, last_name, netid`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFirst(data.first_name)
        setLast(data.last_name)
        setNetid(data.netid)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getProfile()
  }, [session])

  type Profile = {
    first_name: string
    last_name: string
    netid: string
    id?: string
    updated_at?: Date
  }

  return (
    <main className='px-3'>
      <h1>Your Account Info</h1>
      <div className="form-widget">
        <h3>Email: {session.user.email}</h3>
        <h3>Name: {first_name} {last_name}</h3>
        <h3>NetID: {netid}</h3>

        <div>
          <button
            className="btn btn-error"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  )
}