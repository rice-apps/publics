import Head from 'next/head'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/db'
import { useRouter } from 'next/router'
import React from 'react'
import CSS from 'csstype';

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
        const name = org[0].organization.id
        setHost(name)
      }
    } 
    
  }

  useEffect(() => {
    getOrgs()
    setRegistration(false)
    setRegistrationDatetime(null)
    setSignupSize(null)
    setWaitlistSize(null)
  }, [])

  const titleStyle: CSS.Properties = {
    position: "relative",
    width: "247px",
    height: "39px",
    left: "64px",
    top: "139px",

    fontFamily: 'Inter',
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "32px",
    lineHeight: "39px",

    color: "#212429"
    
  };
  const submitStyle: CSS.Properties ={
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "16px",
    gap: "16px",

    position: "relative",
    width: "165px",
    height: "51px",
    left: "1051px",
    top: "1024px",

    background: "#AC1FB8",
    borderRadius: "8px"

  };
  const uploadStyle: CSS.Properties = {
    width: "151px",
    height: "19px",
    fontFamily: 'Inter',
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "16px",
    lineHeight: "19px",

    color: "#212429",
    flex: "none",
    order: "0",
    flexGrow: "0",
  };
  const formInputStyle: CSS.Properties = {
    background: "#FFFFFF",
    border: "2px solid #D9D9D9",
    borderRadius: "8px"
  };
  

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
   console.log("insert is:", insert)
    const { error } = await supabase
      .from('events')
      .insert(insert)
      .single();
    if (error) {
      alert(error.message);
    }
    /*
    } else {
      router.push(`/events/${slug}`);
    }
    */
  }

  return (
    <div id="form">

      <Head>
        <title>Create Event Form</title>
        <meta name="eventcreate" content="Form for creating new event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className = "h-screen bg-[#F5F5F5]">
        <h1 className = "text-2xl normal-case leading-[3rem] font-family: inter font-bold">
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
                <select className="select select-bordered w-full max-w-xs hover:border-[#AC1FB8]" onChange={(e) => {setHost(e.target.value)}}>
                  {orgs.length > 0 ? orgs.map(org => (
                    <option key={org.organization.id} value={org.organization.id}>{org.organization.name}</option>
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
                <button className="btn" style = {uploadStyle}>
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
              <input type="submit" value="Submit" className="btn sm:float-right background-color:#AC1FB8" style = {submitStyle} onClick={insert} />
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}