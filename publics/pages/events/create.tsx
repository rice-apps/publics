import Head from 'next/head'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/db'
import { useRouter } from 'next/router'
import React from 'react'

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
  const [registrationDatetime, setRegistrationDatetime] = useState<string | null>(Date)
  const [signupSize, setSignupSize] = useState<number | null>(Number)
  const [waitlistSize, setWaitlistSize] = useState<number | null>(Number)
  const [orgs, setOrgs] = useState(Array<any>)

  async function getOrgs() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: org, error } = await supabase
      .from('organizations_admins')
      .select('organization ( id, name )')
      .eq('profile', user?.id)
    if (error) {
      throw error
    }
    if (org) {
      setOrgs(org)
      if (org.length > 0) {
        setHost(org[0].organization.name)
      }
      console.log(host)
    } 
    
  }

  useEffect(() => {
    getOrgs()
    setRegistration(false)
    setRegistrationDatetime(null)
    setSignupSize(null)
    setWaitlistSize(null)
  }, [])  

  async function insert() {
    let insert1 = {
      name: name,
      slug: slug,
      event_datetime: eventDateTime,
      organization: host,
      location: location,
      capacity: capacity,
      description: description,
      registration: registration,
    }
   let insert2 = {};
   if (registration) {
    insert2 = {
      registration_datetime: registrationDatetime,
      signup_size: signupSize,
      waitlist_size: waitlistSize
    }
   }

   let insert = Object.assign({}, insert1, insert2);

    const { error } = await supabase
      .from('events')
      .insert(insert)
      .single();
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
      
      <main className = "h-screen bg-[#F5F5F5]">
        <h1 className = "mr-2 text-2xl normal-case flex font-family-inter font-bold">
          Create an Event
        </h1>
        <h2 className = "space-x-10 text-lg left-[15px] leading-[3rem] normal-case font-family-inter font-medium">Event Details</h2>
        <div className="space-x-10 divider leading-[1rem] h-[0.5px] w-[950px]"></div>
        <form>
          <div className="p-2">
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <input value={name} onChange={(e) => setName(e.target.value)} type="text" required className="input input-bordered w-full max-w-xs hover:border-[#AC1FB8]" />
                <label className="label">
                  <span className="label-text-alt">Name of event</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs mr-2">
                <input value={slug} onChange={(e) => setSlug(e.target.value)} type="text" required className="input input-bordered w-full max-w-xs hover:border-[#AC1FB8]" />
                <label className="label">
                  <span className="label-text-alt">Slug</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs">
                <input value={eventDateTime} onChange={(e) => setEventDateTime(e.target.value)} type="datetime-local" required className="input input-bordered w-full max-w-xs hover:border-[#AC1FB8]" />
                <label className="label">
                  <span className="label-text-alt">Date</span>
                </label>
              </div>
            </div>
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <select className="select select-bordered w-full max-w-xs hover:border-[#AC1FB8]" onChange={(e) => setHost(e.target.value)}>
                  {orgs.length > 0 ? orgs.map(org => (
                    <option key={org.organization.id}>{org.organization.name}</option>
                  )) : <option disabled key="null">You are not a part of any organizations</option>}
                </select>
                <label className="label">
                  <span className="label-text-alt hover:border-[#AC1FB8]">Host</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs mr-2">
                <input value={location} onChange={(e) => setLocation(e.target.value)} type="text" required className="input input-bordered w-full max-w-xs hover:border-[#AC1FB8]" />
                <label className="label">
                  <span className="label-text-alt">Location</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs">
                <input value={capacity} onChange={(e) => setCapacity(e.target.valueAsNumber)} type="number" required className="input input-bordered w-full max-w-xs hover:border-[#AC1FB8]" />
                <label className="label">
                  <span className="label-text-alt">Capacity</span>
                </label>
              </div>
            </div>
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered max-w-xs h-24 hover:border-[#AC1FB8]"></textarea>
                <label className="label">
                  <span className="label-text-alt">Description</span>
                </label>
              </div>
              <div>
                <button className="btn normal-case text-black font-family: inter bg-[#D9D9D9] border-none hover:bg-fuchsia-300">
                  Upload Cover Photo
                </button>
              </div>
            </div>
            <div className='sm:flex'>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-2">Allow registration</span>
                  <input checked={registration} onChange={(e) => setRegistration(e.target.checked)} type="checkbox" className= "checkbox checkbox-sm checbox-bg-fuchsia-700" />
                </label>
              </div>
            </div>
            <div className={`${registration ? "" : "hidden"}`}>
              <div>
                <h2 className = "text-lg leading-10 normal-case font-family: inter font-medium">Registration Details</h2>
              </div>
              <div className={`sm:flex`}>
                <div className="form-control w-full max-w-xs mr-2">
                  <input value={registrationDatetime} onChange={(e) => setRegistrationDatetime(e.target.value)} required type="datetime-local" className="input input-bordered w-full max-w-xs hover:border-[#AC1FB8]" />
                  <label className="label">
                    <span className="label-text-alt">Date registration opens</span>
                  </label>
                </div>
                <div className="form-control w-full max-w-xs mr-2" >
                  <input value={signupSize} onChange={(e) => setSignupSize(e.target.valueAsNumber)} required type="number" className="input input-bordered w-full max-w-xs hover:border-[#AC1FB8]" />
                  <label className="label">
                    <span className="label-text-alt">Registration Maximum</span>
                  </label>
                </div>
                <div className="form-control w-full max-w-xs">
                  <input value={waitlistSize} onChange={(e) => setWaitlistSize(e.target.valueAsNumber)} required type="number" className="input input-bordered w-full max-w-xs hover:border-[#AC1FB8]" />
                  <label className="label">
                    <span className="label-text-alt">Waitlist Maximum</span>
                  </label>
                </div>
              </div>
            </div>
            <div>
              <input type="submit" value="Submit" className="btn sm:float-right normal-case font-family: inter bg-[#AC1FB8] hover:bg-fuchsia-900 border-none font-sans" onClick={insert} />
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}