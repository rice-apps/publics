import { redirect_url } from "../../utils/admin"
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import React from "react"

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
  const [registrationMode, setRegistrationMode] = useState(String)
  const [uploadImg, setUploadImg] = useState<File>()

  const supabase = useSupabaseClient()

  async function insert() {
    // uploading image to supabase

    var url = ""

    if (uploadImg) {
      const fileExt = uploadImg.name.split(".").pop()
      const fileName = `cover_image.${fileExt}`
      let { error: uploadError } = await supabase.storage
        .from("images/" + slug)
        .upload(fileName, uploadImg)

      if (uploadError) {
        alert(uploadError.message)
      }
      if (process.env.NEXT_PUBLIC_SUPABASE_URL == undefined) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL is undefined")
      }
      url =
        process.env.NEXT_PUBLIC_SUPABASE_URL +
        "/storage/v1/object/public/images/" +
        slug +
        "/" +
        fileName
    }

    const insert = {
      name,
      slug,
      event_datetime: new Date(eventDateTime),
      organization: host,
      location,
      capacity,
      description,
      img_url: url == "" ? null : url,
      registration,
      ...(registration
        ? {
            college_registration_datetime: new Date(collegeRegistration),
            registration_datetime: new Date(registrationDatetime),
            signup_size: signupSize,
            registration_mode: registrationMode,
          }
        : {}),
    }

    const { data: _, error } = await supabase.from("events").insert(insert)
    if (error) {
      alert(error.message)
      return
    } else {
      window.location.href = "/events/" + slug
      return
    }
  }

  return (
    <div id="form">
      <h1 className="mx-3">Create an Event</h1>
      <div>
        <h3 className="mx-3">Event Details</h3>
        <div className="mx-3 divider"></div>
      </div>
      <form onSubmit={insert}>
        <div className="p-2">
          <div className="sm:flex">
            <div className="form-control w-full max-w-xs mr-2">
              <label className="label">
                <span className="label-text">Name of event</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                required
                className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus"
              />
            </div>
            <div className="form-control w-full max-w-xs mr-2">
              <label className="label">
                <span className="label-text">Slug</span>
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                type="text"
                required
                className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus"
              />
            </div>
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Date</span>
              </label>
              <input
                value={eventDateTime}
                onChange={(e) => setEventDateTime(e.target.value)}
                type="datetime-local"
                required
                className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus"
              />
            </div>
          </div>
          <div className="sm:flex">
            <div className="form-control w-full max-w-xs mr-2">
              <label className="label">
                <span className="label-text hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus">
                  Host
                </span>
              </label>
              <select
                className="select select-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus"
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
            </div>
            <div className="form-control w-full max-w-xs mr-2">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                type="text"
                required
                className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus"
              />
            </div>
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Capacity</span>
              </label>
              <input
                value={capacity}
                onChange={(e) => setCapacity(e.target.valueAsNumber)}
                type="number"
                onInput={(e) => {
                  if (parseInt((e.target as HTMLInputElement).value) < 1) {
                    ;(e.target as HTMLInputElement).setCustomValidity(
                      "The capacity must be greater than 0."
                    )
                  } else {
                    // input is fine -- reset the error message
                    ;(e.target as HTMLInputElement).setCustomValidity("")
                  }
                }}
                required
                className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus"
              />
            </div>
          </div>
          <div className="sm:flex">
            <div className="form-control w-full max-w-xs mr-2">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered max-w-xs h-24 hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus"
              ></textarea>
            </div>
            <div>
              <label className="label">
                <span className="label-text">Cover Image</span>
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const files = e.target.files
                  if (files && files.length > 0) {
                    setUploadImg(files[0])
                  }
                }}
                className="file-input file-input-bordered file-input-primary w-full max-w-xs"
              />
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
                  className="h-5 w-5 accent-primary-focus border-primary focus:ring-2 checked:bg-primary"
                />
              </label>
            </div>
          </div>
          <div className={`${registration ? "" : "hidden"}`}>
            <div>
              <h2 className="text-lg leading-10 normal-case font-family: inter font-medium">
                Registration Details
              </h2>
              <div className="mx-3 divider"></div>
            </div>
            <div className={`sm:flex`}>
              <div className="form-control w-full max-w-xs mr-2">
                <label className="label">
                  <span className="label-text">
                    Date registration opens for college members
                  </span>
                </label>
                <input
                  value={collegeRegistration}
                  onChange={(e) => setCollegeRegistration(e.target.value)}
                  required={registration}
                  type="datetime-local"
                  className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus"
                />
              </div>
            </div>
            <div className={`sm:flex`}>
              <div className="form-control w-full max-w-xs mr-2">
                <label className="label">
                  <span className="label-text">Date registration opens</span>
                </label>
                <input
                  value={registrationDatetime}
                  onChange={(e) => setRegistrationDatetime(e.target.value)}
                  required={registration}
                  type="datetime-local"
                  className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus"
                />
              </div>
              <div className="form-control w-full max-w-xs mr-2">
                <label className="label">
                  <span className="label-text">Registration Maximum</span>
                </label>
                <input
                  value={signupSize}
                  onChange={(e) => setSignupSize(e.target.valueAsNumber)}
                  required={registration}
                  type="number"
                  className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus"
                />
              </div>
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Registration Type</span>
                </label>
                <select
                  className="select select-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary-focus"
                  value={registrationMode}
                  onChange={(e) => {
                    setRegistrationMode(e.target.value)
                  }}
                >
                  <option>Random</option>
                  <option>First come first serve</option>
                </select>
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
        destination: `http://${ctx.req.headers.host}${redirect_url}`,
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
