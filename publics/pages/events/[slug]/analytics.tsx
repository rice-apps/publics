
import { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ResponsiveLine } from '@nivo/line';

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
      params: ctx.params
    }
  }
}

export default function Analytics(props) {
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

    const session = props.InitialSession;
    const slug = props.params.slug;
    const supabase = useSupabaseClient();
    const router = useRouter();

    const fetchPosts = async () => {
        if (!slug) return;
        const { data } = await supabase
          .from("counts")
          .select("*, event!inner(*), volunteer(id, profile(first_name))")
          .eq("event.slug", slug);
        const { data: eventData } = await supabase
          .from("events")
          .select("id")
          .eq("slug", slug)
          .single();
        const { data: volunteer } = await supabase
          .from("volunteers")
          .select("id, event(slug)")
          .eq("profile", session?.user?.id)
          .single();
        const { data: volunteers } = await supabase
          .from("volunteers")
          .select("id, profile(first_name), event(slug)");

        if (
          !data ||
          !eventData ||
          !volunteer ||
          !volunteers ||
          volunteer.event.slug !== slug
        ) {
          console.log("ERROR")
          return;
        }

        const countsData = data.group(data.eventData.id)
        .map((data) => {
          return {
            id: data.eventData.id,
            color: "hsl(220, 70%, 50%)",
            data: {
              x: data.created_at.getHours(),
              // Need to filter by event and hour, sum total for that event's hour save as a data entry
              y: data.filter((count) => count.eventData.id === data.eventData.id && count.created_at.getHours() === data.created_at.getHours())
            }
          };
        });

        return (
          countsData
        );
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
const countsLineGraph = ({ countsData }) => (
  <ResponsiveLine
      data={countsData}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: true,
          reverse: false
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
          orient: 'bottom',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'time',
          legendOffset: 36,
          legendPosition: 'middle'
      }}
      axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'count',
          legendOffset: -40,
          legendPosition: 'middle'
      }}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
          {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                  {
                      on: 'hover',
                      style: {
                          itemBackground: 'rgba(0, 0, 0, .03)',
                          itemOpacity: 1
                      }
                  }
              ]
          }
      ]}
  />
)
<<<<<<< HEAD
=======

return (
  <div>
    <h1>hi</h1>
    {countsLineGraph}
  </div>
);
}
>>>>>>> 25956dc (added admin-level security so only those who are admins of an event can see the analytics)
