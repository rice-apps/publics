import EventCard from "../../components/eventCards/EventCard"
import LargeEventCard from "../../components/eventCards/LargeEventCard"
import { redirect_url } from "../../utils/admin"
import type { ListEvent } from "../../utils/types"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { SupabaseClient } from "@supabase/supabase-js"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

type Props = {
  events: ListEvent[]
  hosting: string[]
  volunteering: string[]
  registrations: Registration[]
  userData 
}

interface Registration {
  event: ListEvent
  waitlist: boolean
}

// get all events
const getEvents = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("events")
    .select(`*, organization (name, photo, id)`)
  // .gt('event_datetime', new Date().toISOString())
  if (error) {
    throw error
  }

  return data
}

// get all events that the user is registered for
const getRegistrations = async (supabase: SupabaseClient, userId: string) => {
  const { data, count, error } = await supabase
    .from("registrations")
    .select(`event(*, organization (name, photo, id)), waitlist`)
    .eq("person", userId)

  if (error) {
    throw error
  }

  if (data.length < 1) {
    return []
  }

  let reg: Registration[] = data.map((reg) => {
    return {
      event: reg.event,
      waitlist: reg.waitlist,
    }
  })

  return reg
}

// get all events that the user is volunteering for
const getVolunteerStatus = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("volunteers")
    .select(`event(id)`)
    .eq("profile", userId)

  if (error) {
    throw error
  }

  if (data.length < 1) {
    return []
  }

  return data.map((vol) => vol.event!["id"])
}

// get all events that the user is hosting
const getHostedEvents = async (
  supabase: SupabaseClient,
  userId: string,
  events: ListEvent[]
) => {
  const { data, error } = await supabase
    .from("organizations_admins")
    .select(`organization(id)`)
    .eq("profile", userId)
  if (error) {
    throw error
  }

  if (data.length < 1) {
    return []
  }

  // get events with oragnization id from data
  const hostedEvents = events.filter((event) =>
    data.map((org) => org.organization!["id"]).includes(event.organization!.id)
  )
  return hostedEvents.map((event) => event.id)
}

function Events(props: Props) {
  const router = useRouter()

  let tabNum = 0
  const urlTab = router.query.tab
  if (urlTab && !Array.isArray(urlTab) && /^\d+$/.test(urlTab)) {
    const urlNum = parseInt(urlTab)
    if (urlNum > 0) {
      tabNum = urlNum
    }
  }
  const [openTab, setOpenTab] = useState(tabNum)

  let startingTabs = ["Upcoming Events"]
  if (props.registrations.length > 0) {
    startingTabs.push("My Events")
  }
  if (props.volunteering.length > 0) {
    startingTabs.push("Volunteering")
  }

  if (props.hosting.length > 0) {
    startingTabs.push("Hosting")
  }
  const [tabs, setTabs] = useState(["Upcoming Events"])

  useEffect(() => {
    setTabs(startingTabs)
    if (tabNum > startingTabs.length) {
      setOpenTab(0)
    }
  }, [])

  function handleClick(tab: number) {
    setOpenTab(tab)
    // add ?tab=${tab} to the url
    router.push(`/events?tab=${tab}`, undefined, { shallow: true })
  }

  return (
    <div>
      <div className="tabs bg-base-100">
        {tabs.map((tab, index) => {
          return (
            <a
              className={openTab === index ? "tab tab-active" : "tab"}
              onClick={() => handleClick(index)}
              key={index}
            >
              {tab}
            </a>
          )
        })}
      </div>
      <div className={tabs[openTab] == "Upcoming Events" ? "block" : "hidden"}>
        <div className="divider">Upcoming Events</div>
        {props.events.length > 0 ? (
          <div className="px-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {props.events
              .filter((event) => new Date(event.event_datetime) >= new Date())
              .map((event) => (
                <EventCard key={event.slug} event={event} sameColl={event.organization!["id"] == props.userData.college}/>
              ))}
          </div>
        ) : (
          <div className="px-8">There are currently no upcoming events.</div>
        )}
      </div>
      <div className={tabs[openTab] == "My Events" ? "block" : "hidden"}>
        <div className="divider">My Events</div>
        {props.registrations.length > 0 ? (
          <div className="flex flex-col gap-4 px-8">
            {props.registrations.map((reg) => (
              <LargeEventCard
                event={reg.event}
                registration_status={
                  reg.waitlist ? "Waitlisted" : "Succesfully Registered!"
                }
                key={reg.event.slug}
                type="my-events"
              />
            ))}
          </div>
        ) : (
          <div className="px-8">
            You are not currently registered for any events.
          </div>
        )}
      </div>
      <div className={tabs[openTab] == "Volunteering" ? "block" : "hidden"}>
        <div className="divider">Volunteering</div>
        {props.volunteering.length > 0 ? (
          <div className="flex flex-col gap-4 px-8">
            {props.events
              .filter((event) => props.volunteering.includes(event.id))
              .map((event) => (
                <LargeEventCard
                  event={event}
                  key={event.slug}
                  type="volunteering"
                />
              ))}
          </div>
        ) : (
          <div className="px-8">You are not volunteering for any events.</div>
        )}
      </div>
      <div className={tabs[openTab] == "Hosting" ? "block" : "hidden"}>
        <div className="divider">Hosting</div>
        {props.hosting.length > 0 ? (
          <div className="flex flex-col gap-4 px-8">
            {props.events
              .filter((event) => props.hosting.includes(event.id))
              .map((event) => (
                <LargeEventCard event={event} key={event.slug} type="hosting" />
              ))}
          </div>
        ) : (
          <div className="px-8">You are not hosting any events.</div>
        )}
      </div>
    </div>
  )
}

// This gets called on every request
export async function getServerSideProps(ctx) {
  const supabase = createServerSupabaseClient(ctx)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}${redirect_url}`,
        permanent: false,
      },
    }

  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select(`college`)
    .eq("id", session.user?.id)
    .single()
  
  if (userError) {
    throw userError
  }
  const events = await getEvents(supabase)
  const registrations = await getRegistrations(supabase, session.user.id)
  const volunteering = await getVolunteerStatus(supabase, session.user.id)
  const hosting = await getHostedEvents(supabase, session.user.id, events)

  let props: Props = { events, hosting, registrations, volunteering, userData }

  return { props } // will be passed to the page component as props
}

export default Events
