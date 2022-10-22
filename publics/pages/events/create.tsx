import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Create() {
  
  const [name, setName] = useState(String)
  const [capacity, setCapacity] = useState(Number)
  const [signup, setSignup] = useState(Number)
  const [waitlist, setWaitlist] = useState(Number)
  const [description, setDescription] = useState(String)
  const [eventDate, setEventDate] = useState(Date)
  const [eventTimeStart, setEventTimeStart] = useState(String)
  const [eventTimeEnd, setEventTimeEnd] = useState(String)
  const [signupDateStart, setSignupDateStart] = useState(Date)
  const [signupDateEnd, setSignupDateEnd] = useState(Date)
  const [signupTimeStart, setSignupTimeStart] = useState(String)
  const [signupTimeEnd, setSignupTimeEnd] = useState(String)
  const [slug, setSlug] = useState(String)

  function refreshPage() {
    window.location.reload();
  }
  
  function printing() {
    console.log(name);
    console.log(capacity);
    console.log(signup);
    console.log(waitlist);
    console.log(description);
    console.log(eventDate);
    console.log(eventTimeStart);
    console.log(eventTimeEnd);
    console.log(signupDateStart);
    console.log(signupTimeStart);
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
          <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the maximum capacity of your event?</span>
          </label>
          <input type="number" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the maximum signup size for your event?</span>
          </label>
          <input type="number" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the maximum waitlist size for your event?</span>
          </label>
          <input type="number" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Enter a description for your event here</span>
          </label> 
          <textarea className="textarea textarea-bordered max-w-xs h-24" placeholder="Bio"></textarea>
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the date of your event?</span>
          </label>
          <input type="date" placeholder="Enter valid date" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the starting time of your event?</span>
          </label>
          <input type="time" placeholder="Enter valid time" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the ending time of your event?</span>
          </label>
          <input type="time" placeholder="Enter valid time" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the starting date of registration?</span>
          </label>
          <input type="date" placeholder="Enter valid date" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the starting time of registration?</span>
          </label>
          <input type="time" placeholder="Enter valid time" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the ending date of registration?</span>
          </label>
          <input type="date" placeholder="Enter valid date" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is the ending time of registration?</span>
          </label>
          <input type="time" placeholder="Enter valid time" className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Enter a unique URL name you want for your event (e.g., nod22)</span>
          </label>
          <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </div>
        <div>
          <input type="submit" value="Submit" className="btn" onClick={printing}/>
          <input type="submit" value="Reset" className="btn" onClick={refreshPage}/>
        </div>
        
      </main>
    </div>
  )
}
