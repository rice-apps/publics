
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

/*
* Used for pie charts
*/
type nivo_element = {
  id: string,
  value: number
}

/*
Type for a coordinate on a 2D-plane
*/
type coordinate = {
  x: string | Date, 
  y: number
}

/*
* Type for data to be plotted on a 2D-plane
*/
type nivo_line_element = {
  id:  string, //i.e. total, attendees in, attendees out
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
async function get_wristband_data(supabase, event_id): Promise<nivo_element[]> {
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

  if (wristband_response.error || wristband_response === undefined) {
    console.log(wristband_response.error); 
    return [];
  }

  let wristband_data = {};
  
  //Putting everything from the DB response into a JS object
  wristband_response.data?.forEach(datum => {
    let name = datum.profiles?.organizations.name;

    if (!(name in wristband_data)) {
      wristband_data[name] = 0;
    }
    wristband_data[name] += 1;
  });

  //Reducing object into array
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

  if (count_response.error || count_response === undefined) {
    console.log(count_response.error);
    return {
      total_registrants: 0,
      picked_up_wristband: 0,
    }
  }

  let total_registrants = 0;
  let picked_up_wristband = 0;

  //Accumulating count data
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

/*
* Gets counter data from backend in the form of an array of {timestamp, true/false} where the boolean is true if someone entered the party and false otherwise
*/
async function get_attendee_data(supabase, event_id) {
  const {data, error} = await supabase
  .from("counts")
  .select("created_at, inout")
  .eq("event", event_id);

  if (error) {
    console.log(error);
    return {};
  }

  return data;
}

/*
  Helper function to create pie charts
*/
function makePieChart(data, legend) {
  if (legend) {
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
          colors = {{'scheme' : 'set1'}}
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
                  translateX: -200,
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
        colors = {{'scheme' : 'set1'}}
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
    />
  ) 
}

function convert_to_coordinate(data): coordinate[][] {
  let num_groups = Math.max(data.length/10, 10); //number of buckets we put arrange data points around
  /*
  making an equally spaced array of dates between the first and last event
  */
  let date_interval = (new Date(data[data.length - 1].created_at).getTime() -  new Date(data[0].created_at).getTime())/num_groups;

  let date_array: Date[] = [];

  let accumulated_in_counts: coordinate[] = [];
  let accumulated_out_counts: coordinate[] = [];
  let accumulated_total_counts: coordinate[] = [];

  for (let i = 0; i < num_groups; i++) {
    date_array.push(new Date());
  }

  date_array[0] = new Date(data[0].created_at);
  date_array[num_groups - 1] = new Date(data[data.length - 1].created_at);

  for (let i = 1; i < num_groups - 1; i++) {
    date_array[i] = new Date(date_array[i - 1].getTime() + date_interval);
  }
  
  for (let i = 0; i < num_groups; i++) {
    accumulated_in_counts.push({x: date_array[i], y: 0});
    accumulated_out_counts.push({x: date_array[i], y: 0});
    accumulated_total_counts.push({x: date_array[i], y: 0});
  }

  //input data array is aready sorted by time
  let date_ptr = 0;

  data.forEach(elem => {
    let curr_date = new Date(elem.created_at);
    while (curr_date > date_array[date_ptr] && date_ptr < num_groups - 1) {
      date_ptr += 1;
    }

    if (elem.inout) {
      accumulated_in_counts[date_ptr].y += 1;
      accumulated_total_counts[date_ptr].y += 1;
    } else {
      accumulated_out_counts[date_ptr].y += 1;
      accumulated_total_counts[date_ptr].y -= 1;
    }
  })

  for (let i = 0; i < num_groups; i++) {
    //React doesn't like rendering dates with this library at compile time for some reason, so I just use strings for the x axis
    accumulated_in_counts[i].x = accumulated_in_counts[i].x.toLocaleString().substring(10); 
    accumulated_out_counts[i].x = accumulated_out_counts[i].x.toLocaleString().substring(10);
    accumulated_total_counts[i].x = accumulated_total_counts[i].x.toLocaleString().substring(10);
  }

  return [accumulated_in_counts, accumulated_out_counts, accumulated_total_counts];
}

function makeLineGraph(data) {
  //total = attendees in - attendees outd
  let formated_data = convert_to_coordinate(data);

  let chart_data: nivo_line_element[] = [{id : "Attendees In", data: formated_data[0]},
                                         {id : "Attendees Out", data : formated_data[1]},
                                         {id: "Attendees Total", data: formated_data[2]}]

  return (
    <ResponsiveLine
        data={chart_data}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
            type: 'linear',
            min: 0,
            max: 'auto',
            stacked: true,
            reverse: false
        }}
        yFormat=" > .0f"
        enableGridY = {false}
        curve = "linear"
        axisTop={null}
        axisRight={null}
        // axisBottom={{
        //   orient: 'bottom',
        //   tickSize: 5,
        //   tickPadding: 5,
        //   tickRotation: 0,
        //   legend: 'Time',
        //   legendOffset: 36,
        //   legendPosition: 'middle'
        // }}
        // axisLeft={{
        //   orient: 'left',
        //   tickSize: 5,
        //   tickPadding: 5,
        //   tickRotation: 0,
        //   legend: 'count',
        //   legendOffset: -40,
        //   legendPosition: 'middle'
        // }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        lineWidth = {3}
        colors = {{'scheme' : 'set1'}}
        legends={[
            {
                anchor: 'top',
                direction: 'row',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 100,
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

function get_total_attendee_count(data): number {
  let total_attendees = 0;
  data.forEach(datum => {
    if (datum.inout) {
      total_attendees += 1;
    }
  });

  return total_attendees;
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
  const [tab1Class, setTab1Class] = useState("tab tab-lg tab-active")
  const [tab2Class, setTab2Class] = useState("tab tab-lg")

    // set tab classes on tab change
    function handleClick(tab) {
      if (tab === 1) {
        setOpenTab(1)
        setTab1Class("tab tab-lg tab-active")
        setTab2Class("tab tab-lg")
      } else if (tab === 2) {
        setOpenTab(2)
        setTab1Class("tab tab-lg")
        setTab2Class("tab tab-lg tab-active")
    }
  }

  /*
  state for data
  */
  const [registration_data] = useState<nivo_element[]>(props.registration_data);
  const [wristband_data] = useState<nivo_element[]>(props.wristband_data);
  const [attendee_data] = useState<nivo_element[]>(props.attendee_data);
  const [total_registrants] = useState<number>(props.count_data.total_registrants);
  const [total_attendees] = useState<number>(get_total_attendee_count(attendee_data));
  const [picked_up_wristband] = useState<number>(props.count_data.picked_up_wristband);

  const RegistrationPieChart = makePieChart(registration_data, true);
  const WristBandPieChart = makePieChart(wristband_data, false);
  const Attendee_LineGraph = makeLineGraph(attendee_data);

  return (
    <div>
      <div className = "mx-auto mx-4 space-y-4">
        <h1>Analytics Dashboard</h1>
      </div>
      <div className = "tabs underline mx-auto">
        <a className={tab1Class} onClick = {() => handleClick(1)}>Attendees</a>
        <a className={tab2Class} onClick = {() => handleClick(2)}>Registrations</a>
      </div>
      <hr></hr>
      <div className={openTab === 1 ? "block" : "hidden"}>
        <p className = "mx-auto mx-4 space-y-4 text-lg">Total Attendees: {total_attendees}</p>
        <div className = "h-96 text-center">
          <h4>Attendance throughout Public</h4>
          {Attendee_LineGraph}
        </div>
      </div> 
      <div className={openTab === 2 ? "block" : "hidden"}>
        <div className="">
          <table className="table-fixed mx-auto mx-4 space-y-4">
            <thead>
            </thead>
            <tbody>
              <tr>
                <td className = "w-60 text-lg">Total Registrants</td>
                <td className = "text-lg font-bold">{total_registrants}</td>
              </tr>
              <tr>
                <td className = "w-60 text-lg">Picked Up Wristband</td>
                <td className = "text-lg font-bold">{picked_up_wristband}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className = "h-96 text-center">
            <p className = "text-lg font-bold">Online Registration (Including Transfers)</p>
            {RegistrationPieChart}
          </div>
          <div className = "h-96 text-center">
            <p className = "text-lg font-bold">Wristband Pickup</p> 
            {WristBandPieChart}
          </div>
        </div>
      </div>
      </div>
  );
}

export default Analytics;