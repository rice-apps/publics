import Head from 'next/head'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/db'
import Auth from '../../components/Auth'
import Account from '../../components/Account'
import { Session } from '@supabase/supabase-js'

export default function Create() {
  
  const [name, setName] = useState(String)
  const [capacity, setCapacity] = useState(Number)
  const [signup, setSignup] = useState(Number)
  const [waitlist, setWaitlist] = useState(Number)
  const [description, setDescription] = useState(String)
  const [eventDateTime, setEventDateTime] = useState(Date)
  const [signupDateTime, setSignupDateTime] = useState(Date)
  const [slug, setSlug] = useState(String)

  /*
  function refreshPage() {
    window.location.reload();
  }
  */
  
  function printing() {
    console.log(name);
    console.log(capacity);
    console.log(signup);
    console.log(waitlist);
    console.log(description);
    console.log(eventDateTime);
    console.log(signupDateTime);
    console.log(slug);
  }

  
  async function insert() {
    const { error } = await supabase
      .from('events')
      .insert({name: name, capacity: capacity, signup_size: signup, waitlist_size: waitlist, description: description, 
               event_datetime: eventDateTime, registration_datetime: signupDateTime, slug: slug})
  }
  
  
  return (
    <div id = "form">
      <Head>
        <title>Create Event Form</title>
        <meta name="eventcreate" content="Form for creating new event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>
          Create an Event with this Form
        </h1>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the name of your event?</span>
          </label>
          <input value={name} onChange={(e)=>setName(e.target.value)} type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the maximum capacity of your event?</span>
          </label>
          <input value={capacity} onChange={(e)=>setCapacity(e.target.valueAsNumber)} type="number" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the maximum signup size for your event?</span>
          </label>
          <input value={signup} onChange={(e)=>setSignup(e.target.valueAsNumber)} type="number" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the maximum waitlist size for your event?</span>
          </label>
          <input value={waitlist} onChange={(e)=>setWaitlist(e.target.valueAsNumber)} type="number" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Enter a description for your event here</span>
          </label> 
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="textarea textarea-bordered max-w-xs h-24" placeholder="Bio"></textarea>
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the date and time of your event?</span>
          </label>
          <input value={eventDateTime} onChange={(e)=>setEventDateTime(e.target.value)} type="datetime-local" placeholder="Enter valid date" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the starting date and time of registration?</span>
          </label>
          <input value={signupDateTime} onChange={(e)=>setSignupDateTime(e.target.value)} type="datetime-local" placeholder="Enter valid date" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Enter a unique URL name you want for your event (e.g., nod22)</span>
          </label>
          <input value={slug} onChange={(e)=>setSlug(e.target.value)} type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </div>
        <div>
          <input type="submit" value="Submit" className="btn" onClick={insert}/>
        </div>
        
      </main>
    </div>
  )
}
