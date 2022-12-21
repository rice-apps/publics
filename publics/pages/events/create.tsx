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
  const [collegeRegistration, setCollegeRegistration] = useState(Date)
  const [registrationDatetime, setRegistrationDatetime] = useState(Date)
  const [signupSize, setSignupSize] = useState(Number)
  const [waitlistSize, setWaitlistSize] = useState(Number)

  const [orgs, setOrgs] = useState(Array<any>)

  const [createAuthorized, setCreateAuthorized] = useState(Boolean)

  async function authorize() {
    const { data: session, error: error0 } = await supabase.auth.getSession()

    if (error0) {
        throw error0
    }

    if (session.session === null) {
        return false
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { data: user_orgs, error: error1 } = await supabase
        .from('organizations_admins')
        .select('organization ( id, name )')
        .eq('profile', user?.id);
    
    if (error1) {
        throw error1
    }

    return user_orgs.length > 0

  }

  async function getOrgs() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: org, error } = await supabase
      .from('organizations_admins')
      .select('organization ( id, name )')
      .eq('profile', user?.id);
    if (error) {
      throw error
    }
    if (org) {
      setOrgs(org)
      if (org.length > 0) {
        const sub_org = org[0].organization
        if (sub_org) {
          setHost(sub_org.id)
        }
      }
    } 
    
  }

  useEffect(() => {
    Promise.resolve(authorize()).then((value) => {
      if (!value) {
          router.push('/events')
      }
      setCreateAuthorized(value)
    }).catch(e => {
      router.push('/events')
    })
    getOrgs()
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
        college_registration_datetime: collegeRegistration,
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

  if (!createAuthorized) {
    return (
      <div id="form">

        <Head>
          <title>Create Event Form</title>
          <meta name="eventcreate" content="Form for creating new event" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className = "h-screen bg-[#F5F5F5]">
          <h1 className = "mx-3 text-2xl normal-case leading-[3rem] font-family: inter font-bold">
            Create an Event
          </h1>
          <div className='leading-[1rem]'>
            <h2 className = "mx-3 text-lg leading-[2rem] normal-case font-family-inter font-medium">Event Details</h2>
            <div className="mx-3 divider leading-[1px] h-[0.5px] w-[950px]"></div>
          </div>
          <div className="mx-3 mt-3">
            <p className="text-lg normal-case font-family-inter font-medium">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div id="form">

      <Head>
        <title>Create Event Form</title>
        <meta name="eventcreate" content="Form for creating new event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className = "h-screen bg-[#F5F5F5]">
        <h1 className = "mx-3 text-2xl normal-case leading-[3rem] font-family: inter font-bold">
          Create an Event
        </h1>
        <div className='leading-[1rem]'>
          <h2 className = "mx-3 text-lg leading-[2rem] normal-case font-family-inter font-medium">Event Details</h2>
          <div className="mx-3 divider leading-[1px] h-[0.5px] w-[950px]"></div>
        </div>
        <form>
          <div className="p-2">
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <input value={name} onChange={(e) => setName(e.target.value)} type="text" required className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700" />
                <label className="label">
                  <span className="label-text-alt">Name of event</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs mr-2">
                <input value={slug} onChange={(e) => setSlug(e.target.value)} type="text" required className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700" />
                <label className="label">
                  <span className="label-text-alt">Slug</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs">
                <input value={eventDateTime} onChange={(e) => setEventDateTime(e.target.value)} type="datetime-local" required className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700" />
                <label className="label">
                  <span className="label-text-alt">Date</span>
                </label>
              </div>
            </div>
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <select className="select select-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700" onChange={(e) => {setHost(e.target.value)}}>
                  {orgs.length > 0 ? orgs.map(org => (
                    <option key={org.organization.id} value={org.organization.id}>{org.organization.name}</option>
                  )) : <option disabled key="null">You are not a part of any organizations</option>}
                </select>
                <label className="label">
                  <span className="label-text-alt hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700">Host</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs mr-2">
                <input value={location} onChange={(e) => setLocation(e.target.value)} type="text" required className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700" />
                <label className="label">
                  <span className="label-text-alt">Location</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs">
                <input value={capacity} onChange={(e) => setCapacity(e.target.valueAsNumber)} type="number" required className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700" />
                <label className="label">
                  <span className="label-text-alt">Capacity</span>
                </label>
              </div>
            </div>
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered max-w-xs h-24 hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"></textarea>
                <label className="label">
                  <span className="label-text-alt">Description</span>
                </label>
              </div>
              <div>
                <button className="btn normal-case border-0 bg-gray-400 hover:bg-fuchsia-700">
                  Upload Cover Photo
                </button>
              </div>
            </div>
            <div className='sm:flex'>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-2">Allow registration?</span>
                  <input checked={registration} onChange={(e) => setRegistration(e.target.checked)} type="checkbox" className= "h-5 w-5 accent-fuchsia-700 border-fuchsia-100 dark:focus:ring-fuchsia-700 focus:ring-2 dark:bg-fuchsia-100 dark:border-fuchsia-900 checked:dark:bg-fuchsia-100" />
                </label>
              </div>
            </div>
            <div className={`${registration ? "" : "hidden"}`}>
              <div>
                <h2 className = "text-lg leading-10 normal-case font-family: inter font-medium">Registration Details</h2>
                <div className="mx-3 divider leading-[1px] h-[0.5px] w-[950px]"></div>
              </div>
              <div className={`sm:flex`}>
              <div className="form-control w-full max-w-xs mr-2">
                  <input value={collegeRegistration} onChange={(e) => setCollegeRegistration(e.target.value)} required type="datetime-local" className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700" />
                  <label className="label">
                    <span className="label-text-alt">Date registration opens for college members</span>
                  </label>
                </div>
              </div>
              <div className={`sm:flex`}>
                <div className="form-control w-full max-w-xs mr-2">
                  <input value={registrationDatetime} onChange={(e) => setRegistrationDatetime(e.target.value)} required type="datetime-local" className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700" />
                  <label className="label">
                    <span className="label-text-alt">Date registration opens</span>
                  </label>
                </div>
                <div className="form-control w-full max-w-xs mr-2" >
                  <input value={signupSize} onChange={(e) => setSignupSize(e.target.valueAsNumber)} required type="number" className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700" />
                  <label className="label">
                    <span className="label-text-alt">Registration Maximum</span>
                  </label>
                </div>
                <div className="form-control w-full max-w-xs">
                  <input value={waitlistSize} onChange={(e) => setWaitlistSize(e.target.valueAsNumber)} required type="number" className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700" />
                  <label className="label">
                    <span className="label-text-alt">Waitlist Maximum</span>
                  </label>
                </div>
              </div>
            </div>
            <div>
              <input type="button" value="Submit" className="btn sm:float-right normal-case border-0 bg-[#AC1FB8] hover:bg-fuchsia-900 focus:outline-none focus:ring focus:ring-fuchsia-700" onClick={insert} />
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}