import { useState, useEffect } from 'react'
import { supabase } from '../utils/db'

<<<<<<< HEAD
export default function Account({ session }: { session: any }) {
=======
export default function Account({session }) {
>>>>>>> added details of event list, wip date formatting of myevents
  const [loading, setLoading] = useState(true)
  const [first_name, setFirst] = useState<string | null>(null)
  const [last_name, setLast] = useState<string | null>(null)
  const [netid, setNetid] = useState<string | null>(null)

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
      if (error instanceof Error)
      {
        //alert(error.message)
        console.log(error.message);
      }
      
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getProfile()
  }, [session])

  type Profile = {
    first_name: string | null
    last_name: string | null
    netid: string | null
    id?: string
    updated_at?: Date
  }

  async function updateProfile({ first_name, last_name, netid }: Profile) {
    try {
      setLoading(true)
      const user = await getCurrentUser()

      const updates = {
        id: user.id,
        first_name,
        last_name,
        netid,
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      //alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-widget">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.data.session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="first_name">First Name</label>
        <input
          id="first_name"
          type="text"
          value={first_name || ''}
          onChange={(e) => setFirst(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor='last_name'>Last Name</label>
        <input
          id="last_name"
          type="text"
          value={last_name || ''}
          onChange={(e) => setLast(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button primary block"
          onClick={() => updateProfile({ first_name, last_name, netid })}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button
          className="button block"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}