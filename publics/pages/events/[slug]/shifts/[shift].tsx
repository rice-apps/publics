import { redirect_url } from "../../../../utils/admin"
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

/**
 * Simple type containing a friendly name for an event, and the UUID of the event
 */
type EventDetails = {
  //friendly name
  eventName: string
  //uuid of event
  eventID: string //Using string as unsure what UUID type is in TS
  organization: string //Organization ID overseeing this event
}

/**
 * Simple interface containing values stored within a row in the table of registrations presented to the userp
 */
type volunteerRowObject = {
  //uuid of person
  person_id: string
  //date this registration was created
  created_at: string
  //first name of registered person
  first_name: string
  //last name of registered person
  last_name: string
  //email of registered person
  email: string
  //netid of registered
  netid: string
  //residential college that that registered person is contained within
  college: string
  //start time of this volunteers shift
  start_time: string
  //end time of this volunteers shift
  end_time: string
  //is this volunteer checked in?
  checked_in: boolean
  //is this volunteer a counter(?)
  is_counter: boolean
}

/**
 * Gets the event that this user is an admin of, if they are one
 * @returns Event Details corresponding to said event
 */
async function getEvent(
  supabase: SupabaseClient,
  slug: String
): Promise<EventDetails> {
  const { data, error } = await supabase
    .from("events")
    .select("id, name, organization")
    .eq("slug", slug)
    .single()

  if (error) {
    return {
      eventName: "Error",
      eventID: "Error",
      organization: "Error",
    }
  }

  return {
    eventName: data.name,
    eventID: data!.id,
    organization: data!.organization,
  }
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
 * Gets registrations from backend for appropriate event and reformats them into an array of row objects
 * @param event_detail - information for the event we want to get information for
 * @returns Array of row objects based on registration table on backend
 */
async function getVolunteers(
  supabase: SupabaseClient,
  event_detail: EventDetails,
  slug
): Promise<volunteerRowObject[]> {
  //Gets raw backend data corresponding to our event
  //uses a inner join on the shifts table to get the relevant shift info
  const { data, error } = await supabase
    .from("volunteers")
    .select(
      `
            profile,
            created_at,
            checked_in,
            is_counter,
            profiles (
                id,
                first_name,
                last_name,
                organizations (
                     name
                ),
                netid
            ),
            shifts!inner (
                start,
                end,
                id
            )
        `
    )
    .eq("event", event_detail.eventID)
    .eq("shifts.id", slug)

  //Holds data reformatted as array of rowobjects
  let formatted_data: volunteerRowObject[] = []

  if (error || data === null) {
    console.log("GOT ERROR:")
    console.log(error)
    return formatted_data
  }

  for (var i = 0; i < data.length; i++) {
    let current_object = data[i]
    let profiles = current_object["profiles"] as Object
    let shifts = current_object["shifts"] as Object
    if (profiles == null) {
      return []
    }

    let formatted_object = {
      person_id: current_object["profile"],
      created_at: current_object["created_at"],
      first_name: profiles["first_name"],
      last_name: profiles["last_name"],
      email: profiles["netid"] + "@rice.edu",
      netid: profiles["netid"],
      college: profiles["organizations"].name,
      start_time: shifts["start"],
      end_time: shifts["end"],
      checked_in: current_object["checked_in"],
      is_counter: current_object["is_counter"],
    }

    formatted_data[i] = formatted_object
  }

  return formatted_data
}

async function getShiftName(
  supabase,
  shift,
  event_detail: EventDetails
): Promise<String> {
  const { data, error } = await supabase
    .from("shifts")
    .select("name")
    .eq("id", shift)
    .single()

  if (error) {
    console.log("GOT ERROR:", error.message)
    return "ERROR"
  }

  return data?.name
}

/**
 * Used to reliably get slug and avoid first render problems
 * Will probably be used later for loading other data
 * @param context - default paramater for server side props
 * @returns props holding the slug
 */
export async function getServerSideProps(context) {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(context)
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    //navigate to account page
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}${redirect_url}`,
        permanent: false,
      },
    }
  }

  const event_detail = await getEvent(supabase, context.params.slug)

  if (event_detail.eventName === "Error") {
    return {
      redirect: {
        destination: `http://${context.req.headers.host}/events/${context.params.slug}`,
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
        destination: `http://${context.req.headers.host}/events/${context.params.slug}`,
        permanent: false,
      },
    }
  }

  const registrations = await getVolunteers(
    supabase,
    event_detail,
    context.params.shift
  )

  const shift_id = context.params.shift
  //get shift name
  const shift_name = await getShiftName(supabase, shift_id, event_detail)

  return {
    props: {
      initialSession: session,
      user: session.user,
      params: context.params,
      registrations,
      event_detail,
      shift_id,
      shift_name,
    },
  }
}

/**
 * Page holding registration results. Check figma for design source
 */
function VolunteerPage(props) {
  const supabase = useSupabaseClient()
  //Array of registration entries formatted as an array of row objects
  const [registration, setRegistration] = useState<volunteerRowObject[]>(
    props.registrations
  )
  //Event details for this page
  const [eventDetails, setEventDetails] = useState<EventDetails>(
    props.event_detail
  )
  //netID of user to add to registration table, used with the add attendee button
  const [netID, setNetID] = useState("")
  //shift id taken from the shift slug
  const [shift, setShift] = useState<String>(props.shift_id)
  const [filterByAll, setFilterByAll] = useState(true) //starts as true as we want to start by initially showing the admin the entire set of registered users
  const [filterByCheckedIn, setFilterByCheckedIn] = useState(false)
  const [filterByCounter, setFilterByCounter] = useState(false)
  const router = useRouter()

  // Setup realtime for updates to registration table
  useEffect(() => {
    const channel = supabase
      .channel(`volunteers:${props.params.slug}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "volunteers" },
        (payload) => {
          //TODO
          setRegistration((prev) => {
            let new_arr = prev.map((item) => {
              if (item.person_id == payload.new.profile) {
                return {
                  ...item,
                  checked_in: payload.new.checked_in,
                  is_counter: payload.new.is_counter,
                }
              }
              return item
            })
            return new_arr
          })
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  /**
   * Copies set of emails to clipboard
   */
  function copyEmails() {
    let emails: string[] = []
    //Filtering by what we currently are showing to the screen
    registration
      .filter((row) => {
        if (
          filterByAll ||
          (row.checked_in == filterByCheckedIn &&
            row.is_counter == filterByCounter)
        ) {
          return row
        }
      })
      .forEach((row) => emails.push(row.email))

    navigator.clipboard.writeText(emails!.join(", "))
  }

  /**
   * Registers attendee to this event given an inputted netID
   * @param netID - you know what this is
   */
  async function addVolunteer(netID: string) {
    //check if volunteer is already in table
    const { data: inTable } = await supabase
      .from("volunteers")
      .select("id, profile!inner(netid)")
      .eq("event", eventDetails!.eventID)
      .eq("profile.netid", netID)
      .eq("shift", shift)
      .single()

    if (inTable) {
      alert("Volunteer already registered for this shift")
      return
    }

    //Get UUID of user by netID
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("netid", netID)
      .single()

    if (error) {
      console.log("Got error")
      console.log(error)
    }

    let personID = data!.id

    //if props.shift_name is "Capacity Counter" then set is_counter to true, else false
    let is_counter = props.shift_name == "Capacity Counter" ? true : false

    //Insert person into registrations table for this event
    const res = await supabase
      .from("volunteers")
      .insert({
        event: eventDetails!.eventID,
        profile: personID,
        shift: shift,
        is_counter: is_counter,
      })
      .select()

    //refresh page
    setRegistration(
      await getVolunteers(supabase, eventDetails!, props.params.shift)
    )
  }

  /**
   * Unregisters attendee from this event. Updates backend and refreshes page
   * @param user_id
   */
  async function removeAttendee(user_id: string) {
    const res = await supabase
      .from("volunteers")
      .delete()
      .eq("event", eventDetails?.eventID)
      .eq("profile", user_id)
      .eq("shift", shift)
      .select()

    if (!res) {
      console.log("ERROR in removing attendee")
      console.log(res)
    }

    //refresh page
    setRegistration(registration.filter((v, i) => v.person_id !== user_id))
  }

  async function updateCheckedInStatus(row: volunteerRowObject) {
    const { error } = await supabase
      .from("volunteers")
      .update({ checked_in: !row["checked_in"] })
      //Ensuring we only update the person who is registered for this event
      .eq("event", eventDetails?.eventID)
      .eq("profile", row["person_id"])
      .eq("shift", shift)

    if (error) {
      console.log(error)
    }
  }

  async function updateIsCounterStatus(row: volunteerRowObject) {
    const { error } = await supabase
      .from("volunteers")
      .update({ is_counter: !row["is_counter"] })
      //Ensuring we only update the person who is registered for this event
      .eq("event", eventDetails?.eventID)
      .eq("profile", row["person_id"])

    if (error) {
      console.log(error)
    }
  }

  return (
    <div key="registration_results_page" className="mx-auto mx-4 space-y-4">
      <div key="event_title">
        <h1>Volunteers for {props.event_detail.eventName}</h1>
      </div>
      <div className="flex justify-end gap-4">
        <div className="tooltip" data-tip="Copy Emails">
          <button className="btn btn-circle btn-outline" onClick={copyEmails}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 32 32"
              stroke="currentColor"
            >
              <path
                d="M27.845 7.385l-5.384-5.384h-11.845v4.307h-6.461v23.69h17.229v-4.307h6.461v-18.306zM22.461 3.524l3.861 3.861h-3.861v-3.861zM5.232 28.922v-21.537h9.692v5.384h5.384v16.153h-15.076zM16 7.831l3.861 3.861h-3.861v-3.861zM21.384 24.615v-12.922l-5.384-5.384h-4.307v-3.231h9.692v5.384h5.384v16.153h-5.384z"
                fill="#000000"
              />
            </svg>
          </button>
        </div>
        <div className="tooltip" data-tip="Filter Results">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-circle btn-outline">
              <svg
                className="h-8 w-8"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M11 12L6 7V6L19 6L19 7L14 12V17L11 19V12Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="square"
                  ></path>
                </g>
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <div className="AllCheckbox">
                <label className="label cursor-pointer">
                  <span className="label-text">Show All</span>
                  <input
                    type="checkbox"
                    defaultChecked={filterByAll}
                    onClick={() => {
                      setFilterByAll(!filterByAll)
                    }}
                    className="checkbox"
                  />
                </label>
              </div>
              <div className="WristbandCheckbox">
                <label className="label cursor-pointer">
                  <span className="label-text">Checked In?</span>
                  <input
                    type="checkbox"
                    defaultChecked={filterByCheckedIn}
                    onClick={() => {
                      setFilterByCheckedIn(!filterByCheckedIn)
                    }}
                    className="checkbox"
                  />
                </label>
              </div>
              <div className="WaitlistCheckbox">
                <label className="label cursor-pointer">
                  <span className="label-text">Counter?</span>
                  <input
                    type="checkbox"
                    defaultChecked={filterByCounter}
                    onClick={() => {
                      setFilterByCounter(!filterByCounter)
                    }}
                    className="checkbox"
                  />
                </label>
              </div>
            </ul>
          </div>
        </div>
        <label htmlFor="add-modal" className="btn btn-primary">
          Add Volunteer
        </label>
        <input type="checkbox" id="add-modal" className="modal-toggle" />
        <div className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Volunteer</h3>
            <div className="form-control w-full max-w-xs">
              <input
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full max-w-xs"
                onChange={(event) => setNetID(event.target.value)}
              />
              <label className="label">
                <span className="label-text-alt">netID</span>
              </label>
            </div>
            <div className="modal-action">
              <label
                htmlFor="add-modal"
                className="btn btn-outline btn-primary"
              >
                Cancel
              </label>
              <label
                htmlFor="add-modal"
                className="btn btn-primary"
                onClick={() => {
                  addVolunteer(netID)
                }}
              >
                Add
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-compact w-full">
          <thead>
            <tr>
              <th></th>
              <th>Remove?</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email Address</th>
              <th>NetID</th>
              <th>Residential College</th>
              <th>Shift Start</th>
              <th>Shift End</th>
              <th>Checked In?</th>
              <th>Counter?</th>
            </tr>
          </thead>
          <tbody>
            {
              //Add simple filter for row entries
              registration
                .filter((row) => {
                  if (
                    filterByAll ||
                    (row.checked_in == filterByCheckedIn &&
                      row.is_counter == filterByCounter)
                  ) {
                    return row
                  }
                })
                .map((row, index) => {
                  let checkedIn = row["checked_in"]
                  let isCounter = row["is_counter"]
                  return (
                    <tr key={index}>
                      <th></th>
                      <td>
                        <label
                          htmlFor={index.toString()}
                          className="btn btn-square"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </label>
                        <input
                          type="checkbox"
                          id={index.toString()}
                          className="modal-toggle"
                        />
                        <div className="modal">
                          <div className="modal-box">
                            <h3 className="font-bold text-lg">
                              Are you sure you want to remove{" "}
                              {row["first_name"] + " " + row["last_name"] + "?"}
                            </h3>

                            <div className="modal-action">
                              <label
                                htmlFor={index.toString()}
                                className="btn btn-outline btn-primary"
                              >
                                Cancel
                              </label>
                              <label
                                htmlFor={index.toString()}
                                className="btn btn-primary"
                                onClick={() => removeAttendee(row["person_id"])}
                              >
                                Remove
                              </label>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{row["first_name"]}</td>
                      <td>{row["last_name"]}</td>
                      <td>{row["email"]}</td>
                      <td>{row["netid"]}</td>
                      <td>{row["college"]}</td>
                      <td>
                        {new Date(row["start_time"]).toLocaleString("en-US", {
                          timeZone: "CST",
                        })}
                      </td>
                      <td>
                        {new Date(row["end_time"]).toLocaleString("en-US", {
                          timeZone: "CST",
                        })}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox"
                          defaultChecked={checkedIn}
                          onChange={(e) => updateCheckedInStatus(row)}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox"
                          defaultChecked={isCounter}
                          onChange={(e) => updateIsCounterStatus(row)}
                        />
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VolunteerPage
