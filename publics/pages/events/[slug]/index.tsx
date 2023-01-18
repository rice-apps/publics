import { useRouter } from "next/router"
import Head from "next/head"
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { authorize } from "../../../utils/admin";
import { useState } from "react";
import React from "react";

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
  const { data: data, error: error0} = await supabase
    .from("events")
    .select(
      `id, name, description, event_datetime, registration_datetime, college_registration_datetime, registration, capacity, waitlist_size, registration_closed, organization (
            name,
            photo
        )`
    )
    .eq("slug", ctx.params?.slug)
    .single()

  if (error0) {
    return {
      notFound: true,
    }
  }

  // if no event is found, redirect to 404 page
  if (data === null) {
    return {
      notFound: true,
    }
  }

  // User Details
  const {data: user_data, error: error1} = await supabase
  .from("profiles")
  .select(`college (name)`)
  .eq("id", session.user?.id)

  if (error1) {
    return {
      notFound: true,
    };
  }

  const userid = session.user.id;
  const userCollege = user_data[0]["college"];
  const orgCollege = data["organization"];

  // check if same college
  var sameCollege = false;

  if (userCollege["name"] == orgCollege["name"]){
    sameCollege = true;
  }

  // check if registered already
  var userRegistered = false;
  const {data: check_user, error: error2 } = await supabase
  .from("registrations")
  .select()
  .match({'person': session.user.id, 'event': data.id})
  .single()

  if (check_user !== null) {
    userRegistered = true;
  }

  return {
    props: { data, authorized, sameCollege, userid, userRegistered},
  };
}

type EventDetail = {
  id: string;
  name: string;
  description: string;
  event_datetime: string | Date;
  registration_datetime: string | Date;
  college_registration_datetime: string | Date;
  registration: boolean;
  capacity: number;
  waitlist_size: number;
  registration_closed: boolean;
  organization: OrganizationDetail;
};

type OrganizationDetail = {
  name: string
  photo: string
}

type Props = {
  data: EventDetail;
  authorized: boolean;
  sameCollege: boolean;
  userid: string;
  userRegistered: boolean;
};


const Details = (props: Props) => {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false)

  const event = props.data;
  const collCheck = props.sameCollege;
  const user = props.userid;
  const userReg = props.userRegistered;

  // Registration function (used when register button is clicked)
  async function register() {
    setLoading(true)

    const {data: registration_closed} = await supabase
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
      alert("Your registration request has been processed. You will be notified via email about your registration status shortly")
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

  event.event_datetime = new Date(event.event_datetime)

  //current time
  const curr_date = new Date();

  //college check logic
  var reg_time = new Date();

  if(collCheck){
    event.college_registration_datetime = new Date(event.college_registration_datetime);
    reg_time = event.college_registration_datetime;
  }
  else{
    event.registration_datetime = new Date(event.registration_datetime);
    reg_time = event.registration_datetime;
  }

  const [enabled, setEnabled] = useState((!userReg && !event.registration_closed && (reg_time.getTime() < curr_date.getTime())))



  return (
    <div id="index">
      <Head>
        <title>Main event page</title>
        <meta name="eventindex" content="Page for displaying info for event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="hero min-h-[60vh] object-left-top">
          <div className="hero-content flex-col lg:flex-row min-w-[70vw]">
            <img
              src="https://as2.ftcdn.net/v2/jpg/03/09/55/15/1000_F_309551534_hkPIgAAsyc5EQg0Ny2bUYh8ttkUWc8fA.jpg"
              className="object-cover min-w-[30%] sm:max-w-[30%] min-h-sm rounded-lg shadow-2xl"
            />
            <div className="flex flex-col space-y-4">
              <h1 className="text-5xl font-bold">{event.name}</h1>
              <p className="text-xl">
                {weekday[event.event_datetime.getDay()] +
                  ", " +
                  month[event.event_datetime.getMonth()] +
                  " " +
                  event.event_datetime.getDate()}{" "}
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
              <p className="">Description: {event.description}</p>
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
          {loading ? <button className="btn btn-loading">loading</button> : <button onClick={register} className={enabled ? "btn btn-primary" : "btn btn-disabled"}>Register</button>}
        </div>
      </main>
    </div>
  )
}

export default Details
