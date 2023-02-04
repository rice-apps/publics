
import { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie'

/**
 * Simple type containing a friendly name for an event, and the UUID of the event
 */
type EventDetails = {
  //friendly name
  eventName: string
  //uuid of event
  eventID: string //Using string as unsure what UUID type is in TS
  organization: string //Organization ID overseeing this event
  capacity: number //Capacity of this event
}

type nivo_element = {
  id: string,
  value: number,
}

/**
 * Checks if the user trying to look at this page is an admin of the associated event (and thus has the permission to look at this page)
 * @param event_detail : event details of this page
 * @returns true if the user looking at this page is an admin, false otherwise
 */
async function isAdminUser(
  supabase: SupabaseClient,
  event_detail: EventDetails,
  userId: string
): Promise<boolean> {
  let { data, error } = await supabase
    .from("organizations_admins")
    .select("organization")
    .eq("profile", userId)

  if (error || data === null) {
    return false
  }

  return data.some((event) => event.organization === event_detail!.organization)
}

/**
 * Gets the event that this user is an admin of, if they are one
 * @returns Event Details corresponding to said event
 */
async function getEvent(
  supabase: SupabaseClient,
  slug: string
): Promise<EventDetails> {
  const { data, error } = await supabase
    .from("events")
    .select("id, name, organization, capacity")
    .eq("slug", slug)
    .single()

  if (error) {
    return {
      eventName: "Error",
      eventID: "Error",
      organization: "Error",
      capacity: 0,
    }
  }

  return {
    eventName: data.name,
    eventID: data.id,
    organization: data.organization,
    capacity: data.capacity,
  }
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

    //Get event details
    const event_detail = await getEvent(supabase, ctx.params.slug)
    if (event_detail.eventName === "Error") {
      return {
        redirect: {
          destination: `http://${ctx.req.headers.host}/events/${ctx.params.slug}`,
          permanent: false,
        },
      }
    }
    //Get admin status
    const admin_status = await isAdminUser(
      supabase,
      event_detail,
      session.user.id
    )
    //If not admin, redirect to 404 page
    if (!admin_status) {
      return {
        redirect: {
          destination: `http://${ctx.req.headers.host}/events/${ctx.params.slug}`,
          permanent: false,
        },
      }
    }

  return {
    props: {
      InitialSession: session,
      params: ctx.params,
      event_info: event_detail
    }
  }
}

export default function Analytics(props) {
  /*
  Helpful stuff
  */
  const session = props.InitialSession;
  const event_info = props.event_info;
  const slug = props.params.slug;
  const supabase = useSupabaseClient();
  const router = useRouter();
  /*
  state for handling tabs
  */
  const [openTab, setOpenTab] = useState(1);
  const [renderTab2, setRenderTab2] = useState(false);
  const [tab1Class, setTab1Class] = useState("tab tab-active")
  const [tab2Class, setTab2Class] = useState("tab")

    // set tab classes on tab change
    function handleClick(tab) {
      if (tab === 1) {
        setOpenTab(1)
        setTab1Class("tab tab-active")
        setTab2Class("tab")
      } else if (tab === 2) {
        setOpenTab(2)
        setTab1Class("tab")
        setTab2Class("tab tab-active")
    }
  }

  /*
  state for data
  */
  const [registration_data, setRegistrationData] = useState<nivo_element[]>([]);

    // Going to need to calculate:

    // 1. Total people counted night of the public
    // 2. In and out by hour
    // 3. In and out by volunteer
    // 4. Number of volunteers
    // 5. Number of volunteers in an hour (registered v. showed up)
    // 6. Registration analytics
        // - Number of registrants: residential college hosting and general registration
        // - Registered versus pick up
        // - Chances of getting off the waitlist

    // 7. [This one depends on some serious checking] caregiving rate in/rate out

    const fetchPosts = async () => {
        if (!slug) return;

        /*
        Getting and formatting registration data
        */
        const registration_response = await supabase
        .from("registrations")
        .select(`
          profiles (
            organizations (
              name
            )
          )
        `)  
        .eq("event", event_info.eventID);

        //TODO make this look pretty with some functional goodness
        if (registration_response.error || registration_response === undefined) {
          console.log(registration_response.error); 
        }

        let registration_data = {};
        
        registration_response.data?.forEach(datum => {
          let name = datum.profiles?.organizations.name;

          if (!(name in registration_data)) {
            registration_data[name] = 0;
          }
          registration_data[name] += 1;
        });

        let formatted_registration_data: nivo_element[] = [];

        for (let datum in registration_data) {
          formatted_registration_data.push({id : datum, value : registration_data[datum]})
        }

        setRegistrationData(formatted_registration_data);
    }
        

    // Filters data into the format required by the library
    /*
    {
      "id": "##:00", // Hour in military time
      "color": "hsl(220, 70%, 50%)",
      "data": [
        {
          "x": "##:00",
          "y": #
        },
        {...}
      ]
    }
     */

    // For reference: https://nivo.rocks/line/
    const RegistrationPieChart = () => (
      <ResponsivePie
          data={registration_data}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{
              from: 'color',
              modifiers: [
                  [
                      'darker',
                      0.2
                  ]
              ]session
          }
      ]}

          }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
              from: 'color',
              modifiers: [
                  [
                      'darker',
                      2
                  ]
              ]
          }}
          defs={[]}
          fill={[]}
          legends={[
              {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: 'circle',
                  effects: [
                      {
                          on: 'hover',
                          style: {
                              itemTextColor: '#000'
                          }
                      }
                  ]
              }
          ]}
      />
  );

  fetchPosts();

  return (
    <div>
      <div>
        <h1>Analytics Dashboard</h1>
      </div>
      <div className = "tabs underline">
        <a className={tab1Class} onClick = {() => handleClick(1)}>Attendees</a>
        <a className={tab2Class} onClick = {() => handleClick(2)}>Registrations</a>
      </div>
      <div className={openTab === 1 ? "block" : "hidden"}><h1>TODO</h1></div> 
      <div className={openTab === 2 ? "block" : "hidden"}>
        <div className = "h-96">
          {RegistrationPieChart()}
        </div>
      </div> 
    </div>
  );
}