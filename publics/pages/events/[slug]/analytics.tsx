
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
 * TODO:
 * Get attendance through public data and graph it
 * Consolidate reused code into single function
 * Add "Data will be available once the event is concluded"
 * Style to fit figma
 */
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
  value: number
}

type coordinate = {
  x: string, 
  y: number
}

type nivo_line_element = {
  id: string, //i.e. total, attendees in, attendees out
  data: coordinate[]
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

/**
 * Gets registration data for an event given identified by event_id and formats it into nivo-pie chart friendly data
 * @returns list of {college, count} pairs for each college with non-zero registrations
 */
async function get_registration_data(supabase, event_id) {
  const registration_response = await supabase
  .from("registrations")
  .select(`
    profiles (
      organizations (
        name
      )
    )
  `)  
  .eq("event", event_id);

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

  return formatted_registration_data;

}


/**
 * Gets registration data for an event given identified by event_id and formats it into nivo-pie chart friendly data
 * @returns list of {college, count} pairs for each college with non-zero registrations
 */
async function get_wristband_data(supabase, event_id) {
  const wristband_response = await supabase
  .from("registrations")
  .select(`
    profiles (
      organizations (
        name
      )
    )
  `)  
  .eq("event", event_id)
  .eq("picked_up_wristband", true);

  //TODO make this look pretty with some functional goodness
  if (wristband_response.error || wristband_response === undefined) {
    console.log(wristband_response.error); 
  }

  let wristband_data = {};
  
  wristband_response.data?.forEach(datum => {
    let name = datum.profiles?.organizations.name;

    if (!(name in wristband_data)) {
      wristband_data[name] = 0;
    }
    wristband_data[name] += 1;
  });

  let formatted_wristband_data: nivo_element[] = [];

  for (let datum in wristband_data) {
    formatted_wristband_data.push({id : datum, value : wristband_data[datum]})
  }

  return formatted_wristband_data;

}

/**
 * Gets registration data for an event given identified by event_id and formats it into nivo-pie chart friendly data
 * @returns list of {college, count} pairs for each college with non-zero registrations
 */
async function get_count_data(supabase, event_id) {
  const count_response = await supabase
  .from("registrations")
  .select(`
    picked_up_wristband
  `)  
  .eq("event", event_id);

  //TODO make this look pretty with some functional goodness
  if (count_response.error || count_response === undefined) {
    console.log(count_response.error);
    return {
      total_registrants: 0,
      picked_up_wristband: 0,
    }
  }

  let total_registrants = 0;
  let picked_up_wristband = 0;

  count_response.data.forEach(datum => {
    total_registrants += 1;
    if (datum.picked_up_wristband) {
      picked_up_wristband += 1;
    }
  });

  return {
    total_registrants: total_registrants,
    picked_up_wristband: picked_up_wristband
  }
}

async function get_attendee_data(supabase, event_id) {
  const {data, error} = await supabase
  .from("counts")
  .select("created_at, inout")
  .eq("event", event_id);

  if (error) {
    console.log(error);
    return {};
  }

  //data.forEach(element => element.created_at = new Date(element.created_at).toLocaleTimeString().slice(0, 4));
  //data.forEach(element => element.created_at = new Date(element.created_at).toLocaleTimeString());
  return data;
}

function makePieChart(data) {
  return (
    <ResponsivePie
        data={data}
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
            ]
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
                anchor: 'right',
                direction: 'column',
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 40,
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
  )
}

function groupBy(list, keyGetter) {
  let map = new Map();
  list.forEach((item) => {
       const key = keyGetter(item);
       const num = map.get(key);
       if (!num) {
           map.set(key, 1)
           console.log(map.get[key])
       } else {
         //fix this!
         let val = map.get(key); 
         map.set(key, val + 1);
       }
  });

  return Array.from(map);
}

function compare_party_time(a, b) {
  //figure out if PM comes first
}

function convert_to_coordinate(data): coordinate[] {
  //NEED TO GROUP INTO DISCRETE TIME INTERVALS BETWEEN START AND END TIME
  //THEN SORT THOSE GROUPS BY TIME PERIOD
  //RETURN
  let arr: coordinate[]= [];

  for (let datum in data) {
    let x = new Date(data[datum].created_at).toLocaleTimeString();
    let y = 1;
    arr.push({x, y})
  }

  
  let grouped_data = groupBy(arr, e => e.x);
  let accumulated = 0;

  let transformed_arr: coordinate[] = [];

  for (let i = 0; i < grouped_data.length; i++) {
    accumulated = accumulated +  grouped_data[i][1];
    let time: string = grouped_data[i][0];
    transformed_arr.push({x : time, y : accumulated})
  }


  return transformed_arr;
}

function makeLineGraph(data) {
  //total = attendees in - attendees outd

  let total_line_graph_data =[...data];
  let in_line_graph_data = data.filter(elem => elem.inout);
  let out_line_graph_data = data.filter(elem => !elem.inout);
  convert_to_coordinate(Array.from(in_line_graph_data));

  let chart_data: nivo_line_element[] = [{id: "Total_In", data: convert_to_coordinate(Array.from(in_line_graph_data).sort())}]
  
  return (
    <ResponsiveLine
        data={chart_data}
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
            legend: 'transportation',
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
  );
  //
  
  //get timestamptz, then get them on the granularity of minutes
  //then group by, and create line graph
  return null;
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

    const registration_data = await get_registration_data(supabase, event_detail.eventID);
    const wristband_data = await get_wristband_data(supabase, event_detail.eventID);
    const count_data = await get_count_data(supabase, event_detail.eventID);
    const attendee_data = await get_attendee_data(supabase, event_detail.eventID);

  return {
    props: {
      InitialSession: session,
      params: ctx.params,
      event_info: event_detail,
      registration_data: registration_data,
      wristband_data : wristband_data,
      count_data: count_data,
      attendee_data: attendee_data,
    }
  }
}

function Analytics(props) {
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
  const [registration_data] = useState<nivo_element[]>(props.registration_data);
  const [wristband_data] = useState<nivo_element[]>(props.wristband_data);
  const [attendee_data] = useState<nivo_element[]>(props.attendee_data);
  const [total_registrants] = useState<number>(props.count_data.total_registrants);
  const [total_attendees, setTotalAttendees] = useState<number>(4);
  const [picked_up_wristband] = useState<number>(props.count_data.picked_up_wristband);

  const RegistrationPieChart = makePieChart(registration_data);
  const WristBandPieChart = makePieChart(wristband_data);
  const Attendee_LineGraph = makeLineGraph(attendee_data);

  return (
    <div>
      <div>
        <h1>Analytics Dashboard</h1>
      </div>
      <div className = "tabs underline">
        <a className={tab1Class} onClick = {() => handleClick(1)}>Attendees</a>
        <a className={tab2Class} onClick = {() => handleClick(2)}>Registrations</a>
      </div>
      <div className={openTab === 1 ? "block" : "hidden"}>
        Total Attendees: {total_attendees}
        <div className = "h-96">
          {Attendee_LineGraph}
        </div>
      </div> 
      <div className={openTab === 2 ? "block" : "hidden"}>
        <div>
          <div className = "text-2xl">
            Total Registrants <span className = "m-10">{total_registrants}</span>
          </div>
          <div className = "text-2xl">
            Picked Up Wristband <span className = "m-10">{picked_up_wristband}</span>
          </div>
        </div>
        <div className = "h-96 text-center">
          <h4>Online Registration (Including Transfers)</h4>
          {RegistrationPieChart}
        </div>
        <div className = "h-96 text-center">
          <h4>Wristband Pickup</h4> 
          {WristBandPieChart}
        </div>
      </div> 
    </div>
  );
}

export default Analytics;