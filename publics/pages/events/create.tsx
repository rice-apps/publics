import Head from "next/head"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import React from "react"
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

async function authorize(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("organizations_admins")
    .select("organization ( id, name )")
    .eq("profile", userId)

  if (error) {
    throw error
  }

  return data.length > 0
}

async function getOrgs(supabase: SupabaseClient, userId: string) {
  const { data: orgs, error } = await supabase
    .from("organizations_admins")
    .select("organization ( id, name )")
    .eq("profile", userId)
  if (error) {
    throw error
  }
  if (!orgs) {
    return []
  }

  return orgs
}

export default function Create(props) {
  const router = useRouter()

  const [name, setName] = useState(String)
  const [slug, setSlug] = useState(String)
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
  const [uploadImg, setUploadImg] = useState<File>()

  const supabase = useSupabaseClient()

  async function insert() {
    // uploading image to supabase

    var url = ""

    if (uploadImg) {
      const fileExt = uploadImg.name.split('.').pop()
      const fileName = `cover_image.${fileExt}`

      let { error: uploadError } = await supabase.storage.from('images/' + slug).upload(fileName, uploadImg)

      if (uploadError) {
        alert(uploadError.message)
      }
      url = "https://rgdrbnbynqacsbkzofyf.supabase.co/storage/v1/object/public/images/" + slug + "/" + fileName;
    }

    let insert1 = {
      name: name,
      slug: slug,
      event_datetime: new Date(eventDateTime),
      organization: host,
      location: location,
      capacity: capacity,
      description: description,
      registration: registration,
      img_url: (url == "" ? null : url)
    }

    let insert2 = {}
    if (registration) {
      insert2 = {
        college_registration_datetime: new Date(collegeRegistration),
        registration_datetime: new Date(registrationDatetime),
        signup_size: signupSize,
        waitlist_size: waitlistSize,
      }
    }

    let insert = Object.assign({}, insert1, insert2)
    const { error } = await supabase.from("events").insert(insert).single()
    if (error) {
      alert(error.message)
    } else {
      router.push(slug)
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
        <h1 className="mx-3 text-2xl normal-case leading-[3rem] font-family: inter font-bold">
          Create an Event
        </h1>
        <div className="leading-[1rem]">
          <h2 className="mx-3 text-lg leading-[2rem] normal-case font-family-inter font-medium">
            Event Details
          </h2>
          <div className="mx-3 divider"></div>
        </div>
        <form onSubmit={insert}>
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
                  {props.orgs.length > 0 ? (
                    props.orgs.map((org) => (
                      <option
                        key={org.organization.id}
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
                  onInput={(e) => {
                    if (e.target.value < 1) {
                      console.log("here")
                      e.target.setCustomValidity(
                        "The capacity must be greater than 0."
                      )
                    } else {
                      // input is fine -- reset the error message
                      e.target.setCustomValidity("")
                    }
                  }}
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
                <input type="file" onChange={(e) => {
                  const files = e.target.files
                  if (files && files.length > 0) {
                    setUploadImg(files[0])
                  }
                }} className="file-input file-input-bordered file-input-primary w-full max-w-xs" />
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
                    className="h-5 w-5 accent-fuchsia-700 border-fuchsia-100 dark:focus:ring-fuchsia-700 focus:ring-2 dark:bg-fuchsia-100 dark:border-fuchsia-900 checked:dark:bg-fuchsia-100"
                  />
                </label>
              </div>
            </div>
            <div className={`${registration ? "" : "hidden"}`}>
              <div>
                <h2 className="text-lg leading-10 normal-case font-family: inter font-medium">
                  Registration Details
                </h2>
                <div className="mx-3 divider leading-[1px] h-[0.5px] w-[950px]"></div>
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
                value="Submit"
                className="btn btn-primary sm:float-right normal-case border-0"
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const supabase = createServerSupabaseClient(ctx)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/account`,
        permanent: false,
      },
    }

  const authorized = await authorize(supabase, session.user.id)
  if (!authorized)
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/404`,
        permanent: false,
      },
    }

  const orgs = await getOrgs(supabase, session.user.id)

  let props = { orgs }

  return { props } // will be passed to the page component as props
}
