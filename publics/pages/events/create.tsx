import Head from 'next/head'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/db'
import { useRouter } from 'next/router'

export default function Create() {
  const router = useRouter()

  const [name, setName] = useState(String)
  const [slug, setSlug] = useState(String)
  const [eventDateTime, setEventDateTime] = useState(Date)
  const [host, setHost] = useState(String)
  const [location, setLocation] = useState(String)
  const [capacity, setCapacity] = useState(Number)
  const [description, setDescription] = useState(String)

  const [registration, setRegistration] = useState(Boolean)
  const [registrationDatetime, setRegistrationDatetime] = useState(Date)
  const [signupSize, setSignupSize] = useState(Number)
  const [waitlistSize, setWaitlistSize] = useState(Number)

  

  const [orgs, setOrgs] = useState([])

  /*
  function refreshPage() {
    window.location.reload();
  }
  */

  async function getOrgs() {
    const { data: { user } } = await supabase.auth.getUser()
    console.log(user)
    const { data: orgs, error } = await supabase
      .from('organizations_admins')
      .select('organization ( id, name )')
      .eq('profile', user?.id)
    console.log(orgs)
    if (error) {
      throw error
    }
    if (orgs) {
      setOrgs(orgs)
      if (orgs.length > 0) {
        setHost(orgs[0].organization.id)
      }
    } 
  }

  useEffect(() => {
    getOrgs()
    setRegistrationDatetime(null)
    setSignupSize(null)
    setWaitlistSize(null)
  }, [])


  async function insert() {
    //setCurrDateTime(Date().toLocaleUpperCase());
    console.log(registrationDatetime)
    console.log(signupSize)
    console.log(waitlistSize)
    let insert = {
      name: name,
      slug: slug,
      event_datetime: eventDateTime,
      organization: host,
      location: location,
      capacity: capacity,
      description: description,
      registration: registration,
    }
    if (!registrationDatetime === null) {
      insert.registration_datetime = registrationDatetime
    }
    if (signupSize !== null) {
      insert.signup_size = signupSize
    }
    if (waitlistSize !== null) {
      insert.waitlist_size = waitlistSize
    }


    const { error } = await supabase
      .from('events')
      .insert(insert)
    if (error) {
      alert(error.message);
    } else {
      router.push(slug);
    }
  }


  return (
    <div id="form">
      <Head>
        <title>Create Event Form</title>
        <meta name="eventcreate" content="Form for creating new event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>
          Create an Event
        </h1>
        <div className="form-control w-full max-w-xs" style={{width: 264, height: 52}}>
          <input value={name} onChange={(e)=>setName(e.target.value)} type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
          <label className="label">
            <span className="label-text-alt">What is the name of your event?</span>
          </label>
        </div>
        <form>
          <div className="p-2">
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <input value={name} onChange={(e) => setName(e.target.value)} type="text" required className="input input-bordered w-full max-w-xs" />
                <label className="label">
                  <span className="label-text-alt">Name of event</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs mr-2">
                <input value={slug} onChange={(e) => setSlug(e.target.value)} type="text" required className="input input-bordered w-full max-w-xs" />
                <label className="label">
                  <span className="label-text-alt">Slug</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs">
                <input value={eventDateTime} onChange={(e) => setEventDateTime(e.target.value)} type="datetime-local" required className="input input-bordered w-full max-w-xs" />
                <label className="label">
                  <span className="label-text-alt">Date</span>
                </label>
              </div>
            </div>
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <select className="select select-bordered w-full max-w-xs" onChange={(e) => setHost(e.target.value)}>
                  {orgs.length > 0 ? orgs.map((org) => (
                    <option value={org.organization.id}>{org.organization.name}</option>
                  )) : <option disabled value="null">You are not a part of any organizations</option>}
                </select>
                <label className="label">
                  <span className="label-text-alt">Host</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs mr-2">
                <input value={location} onChange={(e) => setLocation(e.target.value)} type="text" required className="input input-bordered w-full max-w-xs" />
                <label className="label">
                  <span className="label-text-alt">Location</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs">
                <input value={capacity} onChange={(e) => setCapacity(e.target.valueAsNumber)} type="number" required className="input input-bordered w-full max-w-xs" />
                <label className="label">
                  <span className="label-text-alt">Capacity</span>
                </label>
              </div>
            </div>
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered max-w-xs h-24"></textarea>
                <label className="label">
                  <span className="label-text-alt">Description</span>
                </label>
              </div>
              <div>
                <button className="btn">
                  Upload Cover Photo
                </button>
              </div>
            </div>
            <div className='sm:flex'>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-2">Allow registration</span>
                  <input type="checkbox" className="checkbox" checked={registration} onChange={(e) => setRegistration(e.target.checked)} />
                </label>
              </div>
            </div>
            <div className={`${registration ? "" : "hidden"}`}>
              <div className={`sm:flex`}>
                <div className="form-control w-full max-w-xs mr-2">
                  <input value={registrationDatetime} onChange={(e) => setRegistrationDatetime(e.target.value)} required type="datetime-local" className="input input-bordered w-full max-w-xs" />
                  <label className="label">
                    <span className="label-text-alt">Registration opens</span>
                  </label>
                </div>
                <div className="form-control w-full max-w-xs mr-2">
                  <input value={signupSize} onChange={(e) => setSignupSize(e.target.valueAsNumber)} required type="number" className="input input-bordered w-full max-w-xs" />
                  <label className="label">
                    <span className="label-text-alt">Registration Maximum</span>
                  </label>
                </div>
                <div className="form-control w-full max-w-xs">
                  <input value={waitlistSize} onChange={(e) => setWaitlistSize(e.target.valueAsNumber)} required type="number" className="input input-bordered w-full max-w-xs" />
                  <label className="label">
                    <span className="label-text-alt">Waitlist Maximum</span>
                  </label>
                </div>
              </div>
            </div>
            <div>
              <input type="submit" value="Submit" className="btn btn-primary sm:float-right" onClick={insert} />
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}