import { eventCardDate } from "../../../components/eventCards/cardDate"
import { authorize } from "../../../utils/admin"
import { registrationOpen } from "../../../utils/registration"
import { ListEvent } from "../../../utils/types"
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { NextSeo } from "next-seo"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"

export async function getServerSideProps(ctx) {
  const supabase = createServerSupabaseClient(ctx)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/account`,
        permanent: false,
      },
    }
  }

  const authorized = await authorize(supabase, ctx.params.slug, session.user.id)

  // Event Details
  const { data: collData, error: eventError } = await supabase
    .from("events")
    .select(
      `id, name, description, event_datetime, registration_datetime, college_registration_datetime, registration, capacity, waitlist_size, registration_closed, img_url, organization (
            id,
            name,
            photo
        )`
    )
    .eq("slug", ctx.params?.slug)
    .single()

  if (eventError) {
    return {
      notFound: true,
    }
  }

  // if no event is found, redirect to 404 page
  if (collData === null) {
    return {
      notFound: true,
    }
  }

  // User Details
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select(`college`)
    .eq("id", session.user?.id)
    .single()

  if (userError || userData == null) {
    return {
      notFound: true,
    }
  }

  const userid = session.user.id

  // check if same college
  var sameCollege = false

  if (userData.college == collData.organization!["id"]) {
    sameCollege = true
  }

  // check if registered already
  var userRegistered = false
  const { data: check_user, error: error2 } = await supabase
    .from("registrations")
    .select()
    .match({ person: session.user.id, event: collData.id })
    .single()

  if (check_user !== null) {
    userRegistered = true
  }

  return {
    props: { collData, authorized, sameCollege, userid, userRegistered },
  }
}

type OrganizationDetail = {
  name: string
  photo: string
}

type Props = {
  collData: ListEvent
  authorized: boolean
  sameCollege: boolean
  userid: string
  userRegistered: boolean
}

const Details = (props: Props) => {
  const supabase = useSupabaseClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const event = props.collData
  const collCheck = props.sameCollege
  const user = props.userid
  const userReg = props.userRegistered

  // Registration function (used when register button is clicked)
  async function register() {
    setLoading(true)

    const { data: registration_closed } = await supabase
      .from("events")
      .select("id, registration_closed")
      .eq("id", event.id)
      .single()

    if (registration_closed?.registration_closed) {
      alert("Event registration has already closed")
      setLoading(false)
      setEnabled(false)
    }
    //check if registered
    const { error } = await supabase
      .from("registrations")
      .insert({ event: event["id"], person: user, waitlist: true })

    if (error) {
      alert(error.message)
    } else {
      alert(
        "Your registration request has been processed. You will be notified via email about your registration status shortly"
      )
      setEnabled(false)
    }

    setLoading(false)
  }

  // process datetimes
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const event_datetime = new Date(event.event_datetime)

  //current time
  const curr_date = new Date()

  //college check logic
  var reg_time = new Date(event.registration_datetime)

  if (collCheck) {
    reg_time = new Date(event.college_registration_datetime)
  }

  const [enabled, setEnabled] = useState(
    !userReg &&
      !event.registration_closed &&
      reg_time.getTime() < curr_date.getTime()
  )

  return (
    <>
      <NextSeo
        title={event.name}
        description={event.description}
        openGraph={{
          title: event.name,
          description: event.description,
          images: [
            {
              url: event.img_url,
              width: 800,
              height: 600,
              alt: "Event Image",
            },
          ],
        }}
      />
      <div id="index">
        <main>
          <div className="hero min-h-[60vh] object-left-top">
            <div className="hero-content flex-col lg:flex-row min-w-[70vw]">
              <img
                src={
                  event.img_url
                    ? event.img_url
                    : "https://placeimg.com/400/400/arch"
                }
                className="object-cover min-w-md sm:max-w-lg min-h-sm rounded-lg shadow-2xl"
                alt="Event"
              />
              <div className="flex flex-col space-y-4">
                <h1 className="text-5xl font-bold">{event.name}</h1>
                <p className="text-xl">
                  {weekday[event_datetime.getDay()] +
                    ", " +
                    month[event_datetime.getMonth()] +
                    " " +
                    event_datetime.getDate()}{" "}
                </p>
                <span>
                  <p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="rounded h-5 w-5 inline object-center"
                      src={event.organization.photo}
                      alt="Organization"
                    />
                    Hosted by {event.organization.name}
                  </p>
                </span>
                <p className="">{event.description}</p>

                <p className="font-medium text-primary">
                  {!event.registration
                    ? "No registration required"
                    : event.registration_closed
                    ? `Registration closed`
                    : registrationOpen(event)
                    ? "Registration open!"
                    : collCheck
                    ? `Registration opens for ${
                        event.organization.name
                      }: ${eventCardDate(
                        event.college_registration_datetime,
                        true
                      )}`
                    : `Registration opens: ${eventCardDate(
                        event.registration_datetime,
                        true
                      )}`}
                </p>
                {props.authorized && (
                  <button
                    className="btn btn-primary"
                    onClick={() => router.push(`${router.asPath}/edit`)}
                  >
                    Edit event
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="flex-col ml-4 sm:ml-8 md:ml-24">
            <h2 className="mb-2">Register for Event</h2>
            {loading ? (
              <button className="btn btn-loading">loading</button>
            ) : (
              <button
                onClick={register}
                className={enabled ? "btn btn-primary" : "btn btn-disabled"}
              >
                Register
              </button>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export default Details
