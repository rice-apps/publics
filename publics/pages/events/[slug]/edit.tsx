import Head from "next/head"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import React from "react"
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { authorize } from "../../../utils/admin"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

async function getData(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from("events")
    .select()
    .eq("slug", slug)
    .single()

  if (error) {
    throw error
  }

  return data
}

async function getOrgs(supabase: SupabaseClient, userId: string) {
  const { data: orgs, error } = await supabase
    .from("organizations_admins")
    .select("organization ( id, name )")
    .eq("profile", userId)
  if (error) {
    throw error
  }

  return orgs
}

export default function Edit(props) {
  const router = useRouter()
  const supabase = useSupabaseClient()

  const [name, setName] = useState(String)
  const [slug, setSlug] = useState(String)
  const [origSlug] = useState(String)
  const [eventDateTime, setEventDateTime] = useState(Date)
  const [host, setHost] = useState<String>(props.orgs[0].organization.id)
  const [location, setLocation] = useState(String)
  const [capacity, setCapacity] = useState(Number)
  const [description, setDescription] = useState(String)

  const [registration, setRegistration] = useState(Boolean)
  const [collegeRegistration, setCollegeRegistration] = useState(Date)
  const [registrationDatetime, setRegistrationDatetime] = useState(Date)
  const [signupSize, setSignupSize] = useState(Number)
  const [waitlistSize, setWaitlistSize] = useState(Number)

  const [orgs] = useState<any[]>(props.orgs)

  function format_date(date: string) {
    if (date === null) {
      return "purposely-nonformatted-date"
    }
    let eventDate = new Date(date).toISOString()
    return eventDate.slice(0, eventDate.indexOf("+"))
  }

  async function setData(data) {
    setName(data.name)
    setSlug(data.slug)
    setEventDateTime(format_date(data.event_datetime))
    setHost(data.organization)
    setLocation(data.location)
    setCapacity(data.capacity)
    setDescription(data.description)
    setRegistration(data.registration)
    if (data.registration) {
      setCollegeRegistration(format_date(data.college_registration_datetime))
      setRegistrationDatetime(format_date(data.registration_datetime))
      setSignupSize(data.signup_size)
      setWaitlistSize(data.waitlist_size)
    } else {
      setCollegeRegistration("purposely-nonformatted-date")
      setRegistrationDatetime("purposely-nonformatted-date")
      setSignupSize(0)
      setWaitlistSize(0)
    }
  }

  useEffect(() => {
    setData(props.data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function update() {
    const insert = {
      name,
      slug,
      event_datetime: eventDateTime,
      organization: host,
      location,
      capacity,
      description,
      registration,
      ...(registration
        ? {
            college_registration_datetime: collegeRegistration,
            registration_datetime: registrationDatetime,
            signup_size: signupSize,
            waitlist_size: waitlistSize,
          }
        : {}),
    }

    const { error } = await supabase
      .from("events")
      .update(insert)
      .eq("slug", origSlug)
    if (error) {
      alert(error.message)
    } else {
      router.push(`/events/${slug}`)
    }
  }

  return (
    <div id="form">
      <Head>
        <title>Edit Event Form</title>
        <meta name="eventedit" content="Form for editting existing event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-[#F5F5F5s]">
        <h1 className="mx-3 text-2xl normal-case leading-[3rem] font-family: inter font-bold">
          Edit {name}
        </h1>
        <div>
          <h2 className="mx-3 text-lg leading-[2rem] normal-case font-family-inter font-medium">
            Event Details
          </h2>
          <div className="mx-3 divider leading-[1px]"></div>
        </div>
        <form onSubmit={update}>
          <div className="p-2">
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  required
                  className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"
                />
                <label className="label">
                  <span className="label-text-alt">Name of event</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs mr-2">
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  type="text"
                  required
                  className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"
                />
                <label className="label">
                  <span className="label-text-alt">Slug</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs">
                <input
                  value={eventDateTime}
                  onChange={(e) => setEventDateTime(e.target.value)}
                  type="datetime-local"
                  required
                  className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"
                />
                <label className="label">
                  <span className="label-text-alt">Date</span>
                </label>
              </div>
            </div>
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <select
                  className="select select-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"
                  onChange={(e) => {
                    setHost(e.target.value)
                  }}
                >
                  {orgs.length > 0 ? (
                    orgs.map((org) => (
                      <option
                        key={org.organization!.id}
                        value={org.organization.id}
                      >
                        {org.organization.name}
                      </option>
                    ))
                  ) : (
                    <option disabled key="null">
                      You are not a part of any organizations
                    </option>
                  )}
                </select>
                <label className="label">
                  <span className="label-text-alt hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700">
                    Host
                  </span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs mr-2">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  type="text"
                  required
                  className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"
                />
                <label className="label">
                  <span className="label-text-alt">Location</span>
                </label>
              </div>
              <div className="form-control w-full max-w-xs">
                <input
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.valueAsNumber)}
                  type="number"
                  required
                  className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"
                />
                <label className="label">
                  <span className="label-text-alt">Capacity</span>
                </label>
              </div>
            </div>
            <div className="sm:flex">
              <div className="form-control w-full max-w-xs mr-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea textarea-bordered max-w-xs h-24 hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"
                ></textarea>
                <label className="label">
                  <span className="label-text-alt">Description</span>
                </label>
              </div>
              <div>
                <button className="btn normal-case">Upload Cover Photo</button>
              </div>
            </div>
            <div className="sm:flex">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-2">Allow registration?</span>
                  <input
                    checked={registration}
                    onChange={(e) => setRegistration(e.target.checked)}
                    type="checkbox"
                    className="h-5 w-5 accent-primary"
                  />
                </label>
              </div>
            </div>
            <div className={`${registration ? "" : "hidden"}`}>
              <div>
                <h2 className="text-lg leading-10 normal-case font-family: inter font-medium">
                  Registration Details
                </h2>
                <div className="mx-3 divider leading-[1px]"></div>
              </div>
              <div className={`sm:flex`}>
                <div className="form-control w-full max-w-xs mr-2">
                  <input
                    value={collegeRegistration}
                    onChange={(e) => setCollegeRegistration(e.target.value)}
                    required={registration}
                    type="datetime-local"
                    className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      Date registration opens for college members
                    </span>
                  </label>
                </div>
              </div>
              <div className={`sm:flex`}>
                <div className="form-control w-full max-w-xs mr-2">
                  <input
                    value={registrationDatetime}
                    onChange={(e) => setRegistrationDatetime(e.target.value)}
                    required={registration}
                    type="datetime-local"
                    className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      Date registration opens
                    </span>
                  </label>
                </div>
                <div className="form-control w-full max-w-xs mr-2">
                  <input
                    value={signupSize}
                    onChange={(e) => setSignupSize(e.target.valueAsNumber)}
                    required={registration}
                    type="number"
                    className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"
                  />
                  <label className="label">
                    <span className="label-text-alt">Registration Maximum</span>
                  </label>
                </div>
                <div className="form-control w-full max-w-xs">
                  <input
                    value={waitlistSize}
                    onChange={(e) => setWaitlistSize(e.target.valueAsNumber)}
                    required={registration}
                    type="number"
                    className="input input-bordered w-full max-w-xs hover:border-fuchsia-100 focus:outline-none focus:ring focus:ring-fuchsia-700"
                  />
                  <label className="label">
                    <span className="label-text-alt">Waitlist Maximum</span>
                  </label>
                </div>
              </div>
            </div>
            <div>
              <input
                type="submit"
                value="Update"
                className="btn sm:float-right normal-case border-0 focus:outline-none focus:ring"
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

export const getServerSideProps = async (ctx) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx)
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    //navigate to account page
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/account`,
        permanent: false,
      },
    }
  }

  //Check if user is admin
  const admin_status = await authorize(
    supabase,
    ctx.params.slug,
    session.user.id
  )

  //If not admin, redirect to event page
  if (!admin_status) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/events/${ctx.params.slug}`,
        permanent: false,
      },
    }
  }
  //Get event data
  const data = await getData(supabase, ctx.params.slug)

  const orgs = await getOrgs(supabase, session.user.id)

  return {
    props: {
      initialSession: session,
      orgs,
      data,
      params: ctx.params,
    },
  }
}
