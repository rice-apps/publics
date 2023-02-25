import { ResponsiveLine } from "@nivo/line"
import { ResponsivePie } from "@nivo/pie"
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import Router, { useRouter } from "next/router"
import { useState, useEffect } from "react"

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
  id: string //college name
  value: number //count associated with that college
}
/*
Type for a coordinate on a 2D-plane
*/
type coordinate = {
  x: string | Date
  y: number
}
/*
 * Type for data to be plotted on a 2D-plane
 */
type nivo_line_element = {
  id: string //i.e. total, attendees in, attendees out
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
    .select(
      `
    profiles (
      organizations (
        name
      )
    )
  `
    )
    .eq("event", event_id)
  //TODO make this look pretty with some functional goodness
  if (registration_response.error || registration_response === undefined) {
    console.log(registration_response.error)
  }
  let registration_data = {}

  registration_response.data?.forEach((datum) => {
    let name = datum.profiles?.organizations.name
    if (!(name in registration_data)) {
      registration_data[name] = 0
    }
    registration_data[name] += 1
  })
  let formatted_registration_data: nivo_element[] = []
  for (let datum in registration_data) {
    formatted_registration_data.push({
      id: datum.split(" ")[0],
      value: registration_data[datum],
    })
  }
  return formatted_registration_data
}
/**
 * Gets registration data for an event given identified by event_id and formats it into nivo-pie chart friendly data
 * @returns list of {college, count} pairs for each college with non-zero registrations
 */
async function get_wristband_data(supabase, event_id): Promise<nivo_element[]> {
  const wristband_response = await supabase
    .from("registrations")
    .select(
      `
    profiles (
      organizations (
        name
      )
    )
  `
    )
    .eq("event", event_id)
    .eq("picked_up_wristband", true)
  if (wristband_response.error || wristband_response === undefined) {
    console.log(wristband_response.error)
    return []
  }
  let wristband_data = {}

  //Putting everything from the DB response into a JS object where the key is the college name and the value is the count associated with that college
  wristband_response.data?.forEach((datum) => {
    let name = datum.profiles?.organizations.name
    if (!(name in wristband_data)) {
      wristband_data[name] = 0
    }
    wristband_data[name] += 1
  })
  //Reducing object into array
  let formatted_wristband_data: nivo_element[] = []
  for (let datum in wristband_data) {
    //only getting the college name. I.e. "Hanszen College" => "Hanszen"
    formatted_wristband_data.push({
      id: datum.split(" ")[0],
      value: wristband_data[datum],
    })
  }
  return formatted_wristband_data
}
/**
 * Gets registration data for an event given identified by event_id and formats it into nivo-pie chart friendly data
 * @returns list of {college, count} pairs for each college with non-zero registrations
 */
async function get_count_data(supabase, event_id) {
  const count_response = await supabase
    .from("registrations")
    .select(
      `
    picked_up_wristband
  `
    )
    .eq("event", event_id)
  if (count_response.error || count_response === undefined) {
    console.log(count_response.error)
    return {
      total_registrants: 0,
      picked_up_wristband: 0,
    }
  }
  let total_registrants = 0
  let picked_up_wristband = 0
  //Accumulating count data
  count_response.data.forEach((datum) => {
    total_registrants += 1
    if (datum.picked_up_wristband) {
      picked_up_wristband += 1
    }
  })
  return {
    total_registrants: total_registrants,
    picked_up_wristband: picked_up_wristband,
  }
}
/*
 * Gets counter data from backend in the form of an array of {timestamp, true/false} where the boolean is true if someone entered the party and false otherwise
 */
async function get_attendee_data(supabase, event_id) {
  const { data, error } = await supabase
    .from("counts")
    .select("created_at, inout")
    .eq("event", event_id)
  if (error) {
    console.log(error)
    return {}
  }
  return data
}
/*
  Helper function to create pie charts
*/
function makePieChart(data, legend) {
  if (legend) {
    return (
      <ResponsivePie
        data={data}
        margin={{ top: 40, right: 50, bottom: 80, left: 80 }}
        padAngle={0.7}
        cornerRadius={0}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.2]],
        }}
        colors={{ scheme: "paired" }}
        enableArcLabels={false}
        enableArcLinkLabels={false}
        defs={[]}
        fill={[]}
        legends={[
          {
            anchor: "right",
            direction: "column",
            justify: false,
            translateX: 50,
            translateY: -115,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 40,
            itemTextColor: "#999",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000",
                },
              },
            ],
          },
        ]}
      />
    )
  }
  return (
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      padAngle={0.7}
      cornerRadius={0}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      colors={{ scheme: "paired" }}
      enableArcLabels={false}
      enableArcLinkLabels={false}
      defs={[]}
      fill={[]}
    />
  )
}
/**
 * Takes in raw count data and converts it to coordinate form via grouping the dates into time buckets and counting them
 * @param data - raw count data
 * @returns Arrays containing graph data needed for "Total Attendees", "Attendees In", and the "Attendees Out" lines
 */
function convert_to_coordinate(data): coordinate[][] {
  if (data.length < 2) {
    return [[], [], []]
  }
  //getting the number of data points to use (dividing by 10 is an arbitary value, can be replaced with something else if chart's get too crowded or what not)
  let num_groups = Math.max(data.length / 10, 10) //number of buckets we put arrange data points around

  //making an equally spaced array of dates between the first and last event
  let date_interval =
    (new Date(data[data.length - 1].created_at).getTime() -
      new Date(data[0].created_at).getTime()) /
    num_groups
  let date_array: Date[] = []
  //These are the total in/total out/total attendees data
  let accumulated_in_counts: coordinate[] = []
  let accumulated_out_counts: coordinate[] = []
  let accumulated_total_counts: coordinate[] = []
  //initializing date array to hold empty dates
  for (let i = 0; i < num_groups; i++) {
    date_array.push(new Date())
  }
  //setting beginning and end of date array to be the beginning and end of the party respectively, and then placing equally spaced dates in between
  date_array[0] = new Date(data[0].created_at)
  date_array[num_groups - 1] = new Date(data[data.length - 1].created_at)
  for (let i = 1; i < num_groups - 1; i++) {
    date_array[i] = new Date(date_array[i - 1].getTime() + date_interval)
  }

  //Initializing acculumuated counts to start at 0
  for (let i = 0; i < num_groups; i++) {
    accumulated_in_counts.push({ x: date_array[i], y: 0 })
    accumulated_out_counts.push({ x: date_array[i], y: 0 })
    accumulated_total_counts.push({ x: date_array[i], y: 0 })
  }
  //input data array is aready sorted by time
  let date_ptr = 0
  //Mapping each count event to the date range they fall into and counting
  //Note: this code assumes the data that got returned by the DB is sorted by date.
  data.forEach((elem) => {
    let curr_date = new Date(elem.created_at)
    while (curr_date > date_array[date_ptr] && date_ptr < num_groups - 1) {
      date_ptr += 1
    }
    if (elem.inout) {
      accumulated_in_counts[date_ptr].y += 1
    } else {
      accumulated_out_counts[date_ptr].y += 1
    }
  })
  for (let i = 0; i < num_groups; i++) {
    //React doesn't like rendering dates with this library at compile time for some reason, so I just use strings for the x axis
    //total in/out is the total amount of people that entered between the last point and the current point
    let time_without_date = accumulated_in_counts[i].x
      .toLocaleString()
      .split(" ")[1]
    accumulated_in_counts[i].x = time_without_date
    accumulated_out_counts[i].x = time_without_date
    //total attendees is the amount of people in the party at the previous coordinate plus the people who came in minus the people who came out
    accumulated_total_counts[i].x = time_without_date
    if (i > 0) {
      let new_total =
        accumulated_total_counts[i - 1].y +
        accumulated_in_counts[i].y -
        accumulated_out_counts[i].y
      accumulated_total_counts[i].y = new_total
    } else {
      accumulated_total_counts[i].y =
        accumulated_in_counts[i].y - accumulated_out_counts[i].y
    }
  }
  return [
    accumulated_in_counts,
    accumulated_out_counts,
    accumulated_total_counts,
  ]
}
/*
 * Helper to make line graphs
 */
function makeLineGraph(data) {
  //total = attendees in - attendees outd
  let formated_data = convert_to_coordinate(data)
  let chart_data: nivo_line_element[] = [
    { id: "Attendees In", data: formated_data[0] },
    { id: "Attendees Out", data: formated_data[1] },
    { id: "Attendees Total", data: formated_data[2] },
  ]
  return (
    <ResponsiveLine
      data={chart_data}
      margin={{ top: 50, right: 110, bottom: 75, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: 0,
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      theme={{ textColor: "hsl(var(--bc))" }}
      yFormat=" > .0f"
      enableGridX={false}
      curve="linear"
      axisTop={null}
      axisRight={null}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      lineWidth={3}
      colors={{ scheme: "set1" }}
      legends={[
        {
          anchor: "top",
          direction: "row",
          justify: false,
          translateX: 35,
          translateY: -50,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 100,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
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
  const registration_data = await get_registration_data(
    supabase,
    event_detail.eventID
  )
  const wristband_data = await get_wristband_data(
    supabase,
    event_detail.eventID
  )
  const count_data = await get_count_data(supabase, event_detail.eventID)
  const attendee_data = await get_attendee_data(supabase, event_detail.eventID)
  return {
    props: {
      InitialSession: session,
      params: ctx.params,
      event_info: event_detail,
      registration_data: registration_data,
      wristband_data: wristband_data,
      count_data: count_data,
      attendee_data: attendee_data,
    },
  }
}
function get_total_attendee_count(data): number {
  let total_attendees = 0
  data.forEach((datum) => {
    if (datum.inout) {
      total_attendees += 1
    }
  })
  return total_attendees
}

function get_current_attendee_count(data): number {
  let current_attendees = 0
  data.forEach((datum) => {
    if (datum.inout) {
      current_attendees += 1
    } else {
      current_attendees -= 1
    }
  })
  return current_attendees
}

function Analytics(props) {
  const supabase = useSupabaseClient()
  /*
  state for handling tabs
  */
  const [openTab, setOpenTab] = useState(1)
  const [tab1Class, setTab1Class] = useState(
    "tab tab-lg tab-active text-[hsl(var(--s))]"
  )
  const [tab2Class, setTab2Class] = useState("tab tab-lg")
  // set tab classes on tab change
  function handleClick(tab) {
    if (tab === 1) {
      setOpenTab(1)
      setTab1Class("tab tab-lg tab-active text-[hsl(var(--s))]")
      setTab2Class("tab tab-lg")
    } else if (tab === 2) {
      setOpenTab(2)
      setTab1Class("tab tab-lg")
      setTab2Class("tab tab-lg tab-active text-[hsl(var(--s))]")
    }
  }
  /*
  state for data
  */
  const [registration_data] = useState<nivo_element[]>(props.registration_data)
  const [wristband_data] = useState<nivo_element[]>(props.wristband_data)
  const [attendee_data] = useState<nivo_element[]>(props.attendee_data)
  const [total_registrants] = useState<number>(
    props.count_data.total_registrants
  )
  const [total_attendees] = useState<number>(
    get_total_attendee_count(attendee_data)
  )
  const [picked_up_wristband] = useState<number>(
    props.count_data.picked_up_wristband
  )
  const [count, setCount] = useState<number>(
    get_current_attendee_count(attendee_data)
  )
  const RegistrationPieChart = makePieChart(registration_data, false)
  const WristBandPieChart = makePieChart(wristband_data, true)
  const Attendee_LineGraph = makeLineGraph(attendee_data)

  useEffect(() => {
    const channel = supabase.channel(`analytics:${query.slug}`)

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "counts" },
      (payload: any) => {
        //set count and my count
        setCount((count) => count + (payload.new.inout ? 1 : -1))
      }
    )
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div className="mx-auto mx-24 pt-10">
        <h1>Analytics Dashboard</h1>
      </div>
      <div className="tabs underline mx-auto mx-20 pt-5">
        <a className={tab1Class} onClick={() => handleClick(1)}>
          Attendees
        </a>
        <a className={tab2Class} onClick={() => handleClick(2)}>
          Registrations
        </a>
      </div>
      <div className={openTab === 1 ? "block" : "hidden"}>
        <table className="table-fixed mx-auto mx-24 py-5">
          <thead></thead>
          <tbody>
            <tr>
              <td className="w-48 py-5 text-lg text-[hsl(var(--bc))]">
                Total Attendees
              </td>
              <td className="text-lg text-[hsl(var(--bc))]">
                {total_attendees}
              </td>
              <td className="w-48 py-5 text-lg text-[hsl(var(--bc))]">
                Current Count
              </td>
              <td className="text-lg text-[hsl(var(--bc))]">{count}</td>
            </tr>
          </tbody>
        </table>
        <div className="bg-[hsl(var(--b2))] border border-gray-400 text-center mx-auto mx-24">
          <div className="h-[32rem]">
            <h4 className="py-5">Attendance throughout Public</h4>
            {Attendee_LineGraph}
          </div>
        </div>
      </div>
      <div className={openTab === 2 ? "block" : "hidden"}>
        <div className="">
          <table className="table-fixed mx-auto mx-24 space-y-4">
            <thead></thead>
            <tbody>
              <tr>
                <td className="w-72 text-lg text-[hsl(var(--bc))] py-5">
                  Total Registrants
                </td>
                <td className="text-lg text-[hsl(var(--bc))]">
                  {total_registrants}
                </td>
              </tr>
              <tr>
                <td className="text-lg text-[hsl(var(--bc))]">
                  Picked Up Wristband
                </td>
                <td className="text-lg text-[hsl(var(--bc))]">
                  {picked_up_wristband}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className="mx-auto mx-24 py-5">
            <div className="text-xl text-center pt-5">
              Registration by Residential College
            </div>
            <div className="flex mb-4 h-96 text-center py-5">
              <div className="w-6/12 h-[28rem]">
                <p className="text-lg">
                  Online Registration (Including Transfers)
                </p>
                {RegistrationPieChart}
              </div>
              <div className="w-2/5 h-[28rem]">
                <p className="text-lg">Wristband Pickup</p>
                {WristBandPieChart}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Analytics
