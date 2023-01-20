import { useEffect, useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { getPagination } from "../../../utils/registration"
import SuccessMsg from "../../../components/SuccessMsg"
import ErrorMsg from "../../../components/ErrorMsg"
import MoveRegistrationsModal from "../../../components/registrations/MoveRegistrationsModal"
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
 * Simple interface containing values stored within a row in the table of registrations presented to the userp
 */
type rowObject = {
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
  //Has this person picked up the wristband
  picked_up_wristband: boolean
  //Is this person on the waitlist?
  waitlist: boolean
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
 * Gets registrations from backend for appropriate event and reformats them into an array of row objects
 * @param event_detail - information for the event we want to get information for
 * @returns Array of row objects based on registration table on backend
 */
async function getRegistrations(
  supabase: SupabaseClient,
  event_detail: EventDetails,
  search: string = ""
): Promise<rowObject[]> {
  //Gets raw backend data corresponding to our event
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
        person,
        created_at,
        picked_up_wristband,
        profiles!inner(
            id,
            first_name,
            last_name,
            organizations (
                name
            ),
            netid
        ),
        waitlist
    `
    )
    .eq("event", event_detail.eventID)
    .like("profiles.netid", `%${search}%`)

  //Holds data reformatted as array of rowobjects
  let formatted_data: rowObject[] = []

  if (error) {
    return formatted_data
  }

  for (var i = 0; i < data.length; i++) {
    let current_object = data[i]
    let profiles = current_object["profiles"] as Object

    if (profiles == null) {
      return []
    }

    let formatted_object = {
      person_id: current_object["person"],
      created_at: new Date(current_object["created_at"]!).toLocaleString(),
      first_name: profiles["first_name"],
      last_name: profiles["last_name"],
      email: profiles["netid"] + "@rice.edu",
      netid: profiles["netid"],
      college: profiles["organizations"].name,
      picked_up_wristband: current_object["picked_up_wristband"],
      waitlist: current_object["waitlist"],
    }

    formatted_data[i] = formatted_object
  }

  return formatted_data
}

/**
 * Used to reliably get slug and avoid first render problems
 * Will probably be used later for loading other data
 * @param context - default paramater for server side props
 * @returns props holding the slug
 */
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
  //Get registrations for that event
  const page = +ctx.query.page || 0
  const registrations = await getRegistrations(supabase, event_detail)

  return {
    props: {
      initialSession: session,
      user: session.user,
      params: ctx.params,
      registrations,
      event_detail,
      page: page,
    },
  }
}

/**
 * Page holding registration results. Check figma for design source
 */
function ResultPage(props) {
  const supabase = useSupabaseClient()
  //Array of registration entries formatted as an array of row objects
  const [registration, setRegistration] = useState<rowObject[]>(
    props.registrations
  )
  //Event details for this page
  const [eventDetails] = useState<EventDetails>(props.event_detail)
  //netID of user to add to registration table, used with the add attendee button
  const [netID, setNetID] = useState("")
  //boolean values that we use to filter registrations by when displaying them to the screen
  const [filterByAll, setFilterByAll] = useState(true) //starts as true as we want to start by initially showing the admin the entire set of registered users
  const [filterByWristband, setFilterByWristband] = useState(false)
  const [filterByWaitlist, setFilterByWaitlist] = useState(false)
  //Search bar value
  const [search, setSearch] = useState("")
  // Pagination
  const [page, setPage] = useState(props.page)
  const { from, to } = getPagination(page, 50)

  //Confirmation Message
  const [resultError, setResultError] = useState(false)
  const [resultSuccess, setResultSuccess] = useState(false)
  const [copiedEmails, setCopiedEmails] = useState(false)
  const [action, setAction] = useState("")

  // Setup realtime for updates to registration table
  useEffect(() => {
    const channel = supabase
      .channel(`registrations:${props.params.slug}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "registrations" },
        (payload) => {
          setRegistration((prev) => {
            let new_arr = prev.map((item) => {
              if (item.person_id == payload.new.person) {
                return {
                  ...item,
                  picked_up_wristband: payload.new.picked_up_wristband,
                  waitlist: payload.new.waitlist,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    window.history.pushState(null, "", `?page=${page}`)
  }, [page])

  /**
   * Copies set of emails to clipboard
   */
  function copyEmails() {
    let emails: string[] = []
    //Filtering by what we currently are showing to the screen
    filterRegistrations().forEach((row) => emails.push(row.email))

    //Writing to clipboard
    navigator.clipboard.writeText(emails!.join(", "))
    setCopiedEmails(true)
    setTimeout(() => {
      setCopiedEmails(false)
    }, 2000)
  }

  /**
   * Registers attendee to this event given an inputted netID
   * @param netID - you know what this is
   */
  async function addAttendee(netID: string) {
    //Get UUID of user by netID
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("netid", netID)
      .single()

    if (!error) {
      let personID = data!.id

      //ERROR: Runs into Row level security error here
      //Insert person into registrations table for this event
      const { data: regData } = await supabase
        .from("registrations")
        .insert({ event: eventDetails!.eventID, person: personID })
        .select()
      setResultSuccess(true)
      setResultError(false)
      setAction(netID + " was successfully added.")
      setTimeout(() => {
        setResultSuccess(false)
      }, 2000)

      //refresh page
      setRegistration(await getRegistrations(supabase, eventDetails, search))
    } else {
      setResultSuccess(false)
      setResultError(true)
      setTimeout(() => {
        setResultError(false)
      }, 2000)
    }
  }

  /**
   * Unregisters attendee from this event. Updates backend and refreshes page
   * @param user_id
   */
  async function removeAttendee(user_id: string) {
    const res = await supabase
      .from("registrations")
      .delete()
      .eq("event", eventDetails?.eventID)
      .eq("person", user_id)
      .select()

    if (!res) {
      setResultError(true)
      setResultSuccess(false)
      setTimeout(() => {
        setResultError(false)
      }, 2000)
    }

    setResultError(false)
    setResultSuccess(true)
    setAction("User successfully removed.")
    setTimeout(() => {
      setResultSuccess(false)
    }, 2000)
    //refresh page
    setRegistration(registration.filter((v, i) => v.person_id !== user_id))
  }

  /**
   * Updates backend on status of a registered person having picked up their wristband
   * @param row - row object holding information so that we can uniquely find the correct registration in the database
   */
  async function updateWristband(row: rowObject) {
    const { error } = await supabase
      .from("registrations")
      .update({ picked_up_wristband: !row["picked_up_wristband"] })
      //Ensuring we only update the person who is registered for this event
      .eq("event", eventDetails?.eventID)
      .eq("person", row["person_id"])

    if (error) {
      console.log(error)
    }
  }

  async function updateWaitlist(row: rowObject) {
    const { error } = await supabase
      .from("registrations")
      .update({ waitlist: !row["waitlist"] })
      //Ensuring we only update the person who is registered for this event
      .eq("event", eventDetails?.eventID)
      .eq("person", row["person_id"])

    if (error) {
      console.log(error)
    }
  }

  async function handleSearch() {
    setRegistration(await getRegistrations(supabase, eventDetails, search))
    setPage(0)
  }

  function handleKeyPress(event) {
    if (event.key === "Enter") {
      handleSearch()
    }
  }

  async function handlePageIncrement() {
    setPage(page + 1)
    setRegistration(await getRegistrations(supabase, eventDetails, search))
  }

  async function handlePageDeincrement() {
    setPage(page - 1)
    setRegistration(await getRegistrations(supabase, eventDetails, search))
  }

  function filterRegistrations() {
    return registration.filter((row) => {
      return (
        filterByAll ||
        (row.picked_up_wristband == filterByWristband &&
          row.waitlist == filterByWaitlist)
      )
    })
  }

  return (
    <div key="registration_results_page" className="mx-auto mx-4 space-y-4">
      <div className={resultSuccess ? "block" : "hidden"}>
        <SuccessMsg message={`${action}`} />
      </div>
      <div className={resultError ? "block" : "hidden"}>
        <ErrorMsg message={"Error! User doesn't exist "} />
      </div>
      <div className={copiedEmails ? "block" : "hidden"}>
        <SuccessMsg message={`Emails copied to clipboard`} />
      </div>
      <div key="event_title">
        <h1>{eventDetails!.eventName}: Registration Results</h1>
      </div>

      <div className="flex justify-between gap-4 flex-wrap">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          {/* <input
            type="text"
            className="block w-full p-4 pl-10 input input-bordered w-full max-w-xs text-sm"
            placeholder="Search NetIDs"
            onChange={(e) => setSearch(e.target.value)}
          /> */}
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search NetIDs…"
                className="input input-bordered"
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button className="btn btn-square" onClick={handleSearch}>
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
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
                  fill="#000000"
                  className="h-8 w-8"
                  viewBox="-5.5 0 32 32"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <title>filter</title>{" "}
                    <path d="M8.48 25.72c-0.16 0-0.32-0.040-0.44-0.12-0.24-0.16-0.4-0.44-0.4-0.72v-8.72l-7.48-8.48c-0.2-0.24-0.28-0.6-0.12-0.88s0.44-0.48 0.76-0.48h19.8c0.32 0 0.64 0.2 0.76 0.48 0.12 0.32 0.080 0.64-0.12 0.92l-7.8 8.8v6.32c0 0.32-0.2 0.6-0.48 0.76l-4.080 2c-0.080 0.080-0.24 0.12-0.4 0.12zM2.64 7.96l6.48 7.32c0.12 0.16 0.2 0.36 0.2 0.56v7.64l2.4-1.2v-6.080c0-0.2 0.080-0.4 0.2-0.56l6.8-7.68c0.040 0-16.080 0-16.080 0z"></path>{" "}
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
                    <span className="label-text">Wristband</span>
                    <input
                      type="checkbox"
                      defaultChecked={filterByWristband}
                      onClick={() => {
                        setFilterByWristband(!filterByWristband)
                      }}
                      className="checkbox"
                    />
                  </label>
                </div>
                <div className="WaitlistCheckbox">
                  <label className="label cursor-pointer">
                    <span className="label-text">Waitlist</span>
                    <input
                      type="checkbox"
                      defaultChecked={filterByWaitlist}
                      onClick={() => {
                        setFilterByWaitlist(!filterByWaitlist)
                      }}
                      className="checkbox"
                    />
                  </label>
                </div>
              </ul>
            </div>
          </div>
          <MoveRegistrationsModal
            eventId={eventDetails.eventID}
            capacity={eventDetails.capacity}
          />
          <label htmlFor="add-modal" className="btn btn-primary">
            Add Attendee
          </label>
          <input type="checkbox" id="add-modal" className="modal-toggle" />
          <div className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Add attendee</h3>
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">netID</span>
                </label>
                <input
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered w-full max-w-xs"
                  onChange={(event) => setNetID(event.target.value)}
                />
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
                    addAttendee(netID)
                  }}
                >
                  Add
                </label>
              </div>
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
              <th>Date and Time</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email Address</th>
              <th>NetID</th>
              <th>Residential College</th>
              <th>Wristband?</th>
              <th>Waitlist?</th>
            </tr>
          </thead>
          <tbody>
            {
              //Add simple filter for row entries
              filterRegistrations()
                .splice(from, to)
                .map((row, index) => {
                  let isChecked = row["picked_up_wristband"]
                  let isWaitlist = row["waitlist"]
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
                      <td>{row["created_at"]}</td>
                      <td>{row["first_name"]}</td>
                      <td>{row["last_name"]}</td>
                      <td>{row["email"]}</td>
                      <td>{row["netid"]}</td>
                      <td>{row["college"]}</td>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={isChecked}
                          onChange={(e) => updateWristband(row)}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={isWaitlist}
                          onChange={(e) => updateWaitlist(row)}
                        />
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>

        {/* center following div */}
        <div className="flex justify-center mt-4">
          <div className="btn-group">
            <button
              className="btn"
              disabled={page < 1}
              onClick={handlePageDeincrement}
            >
              «
            </button>
            <button className="btn">Page {page}</button>
            <button
              className="btn"
              disabled={
                filterRegistrations().splice(from, to).length !== 50 ||
                page > 100
              }
              onClick={handlePageIncrement}
            >
              »
            </button>
          </div>
        </div>
        {/* display number of rows of the table */}
        <div className="text-center mt-4">
          <span className="text">
            {filterRegistrations().length} Attendee(s)
          </span>
        </div>
      </div>
    </div>
  )
}

export default ResultPage
