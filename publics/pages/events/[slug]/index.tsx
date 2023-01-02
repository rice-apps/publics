import { useRouter } from "next/router";
import Head from "next/head";
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { authorize } from "../../../utils/admin";
export async function getServerSideProps(ctx) {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/account`,
        permanent: false,
      },
    };
  }

  const authorized = await authorize(
    supabase,
    ctx.params.slug,
    session.user.id
  );

  const { data, error } = await supabase
    .from("events")
    .select(
      `name, description, event_datetime, registration_datetime, registration, capacity, waitlist_size, organization (
            name,
            photo
        )`
    )
    .eq("slug", ctx.params?.slug)
    .single();

  if (error) {
    return {
      notFound: true,
    };
  }

  // if no event is found, redirect to 404 page
  if (data === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: { data, authorized },
  };
}

type EventDetail = {
  name: string;
  description: string;
  event_datetime: string | Date;
  registration_datetime: string | Date;
  registration: boolean;
  capacity: number;
  waitlist_size: number;
  organization: OrganizationDetail;
};

type OrganizationDetail = {
  name: string;
  photo: string;
};

type Props = {
  data: EventDetail;
  authorized: boolean;
};

const Details = (props: Props) => {
  const router = useRouter();

  const event = props.data;

  // process datetimes
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
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
  ];

  event.registration_datetime = new Date(event.registration_datetime);
  event.event_datetime = new Date(event.event_datetime);

  return (
    <div id="index">
      <Head>
        <title>Main event page</title>
        <meta name="eventindex" content="Page for displaying info for event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="hero min-h-[60vh] object-left-top">
          <div className="hero-content items-stretch lg:flex-row items-center min-w-[70vw] place-content-start space-x-8 max-w-[70vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://as2.ftcdn.net/v2/jpg/03/09/55/15/1000_F_309551534_hkPIgAAsyc5EQg0Ny2bUYh8ttkUWc8fA.jpg"
              className="object-cover min-w-[30%] max-w-[30%] min-h-sm rounded-lg shadow-2xl"
              alt={"Cover Image"}
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
                  onClick={() => router.push("/edit")}
                >
                  Edit event
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="divider"></div>
        <div className="min-h-[15vh] flex-col sm:px-10 md:px-24">
          <h2 className="mb-2">Register for Event</h2>
          <button className="btn btn-primary">Register</button>
        </div>
      </main>
    </div>
  );
};

export default Details;
