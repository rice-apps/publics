import { redirect_url } from "../../../utils/admin"
import {
  SupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"

interface Volunteer {
  name: string
  id: string
  count: number
}

interface Event {
  id: string
  capacity: number
  organization: string
}

interface Props {
  authorized: boolean
  volunteers: Volunteer[]
  count: number
  myCount: number
  event: Event
  capacity: number
  organization: string
  volunteer: Volunteer
}

const fetchCounts = async (
  supabase: SupabaseClient,
  slug: string,
  userId: string
) => {
  const { data: eventData } = await supabase
    .from("events")
    .select("id, capacity, organization")
    .eq("slug", slug)
    .single()

  if (!eventData) {
    return { authorized: false }
  }

  const { data } = await supabase
    .from("counts")
    .select("inout, volunteer, volunteer(id, profile(first_name))")
    .eq("event", eventData.id)

  if (!data) {
    return { authorized: false }
  }
  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("id, event, checked_in")
    .match({
      profile: userId,
      event: eventData.id,
      is_counter: true,
      checked_out: false,
    })
    .single()

  const { data: volunteers } = await supabase
    .from("volunteers")
    .select("id, profile(first_name)")
    .match({ event: eventData.id, is_counter: true, checked_in: true })

  if (!volunteer || !volunteers || !volunteer.event) {
    return { authorized: false }
  }

  const volunteerCountArray = volunteers.map((volunteer) => {
    return {
      name: volunteer.profile!["first_name"],
      id: volunteer.id,
      count:
        data.filter(
          (count) => count.volunteer.id === volunteer.id && count.inout
        ).length -
        data.filter(
          (count) => count.volunteer.id === volunteer.id && !count.inout
        ).length,
    }
  })

  return {
    authorized: true,
    volunteer: volunteer?.id,
    checked_in: volunteer?.checked_in,
    event: eventData,
    volunteers: volunteerCountArray,
    count:
      data.filter((row) => row.inout).length -
      data.filter((row) => !row.inout).length,
    myCount:
      data.filter((row) => row.volunteer.id === volunteer?.id && row.inout)
        .length -
      data.filter((row) => row.volunteer.id === volunteer?.id && !row.inout)
        .length,
  }
}

const Counter = (props: Props) => {
  const supabase = useSupabaseClient()
  const router = useRouter() || { query: { slug: "" } }
  const query = router.query
  const [count, setCount] = useState(0)
  const [myCount, setMyCount] = useState(0)
  const [allVolunteers, setAllVolunteers] = useState<Volunteer[]>([])

  useEffect(() => {
    if (!props) {
      return
    }
    setCount(props.count)
    setMyCount(props.myCount)
    setAllVolunteers(props.volunteers)
  }, [props])

  useEffect(() => {
    const channel = supabase.channel(`count:${query.slug}`)

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "counts" },
      (payload: any) => {
        //set count and my count
        setCount((count) => count + (payload.new.inout ? 1 : -1))
        //update count in allVolunteers
        setAllVolunteers((volunteers) => {
          return volunteers.map((volunteer) => {
            if (volunteer.id === payload.new.volunteer) {
              return {
                ...volunteer,
                count: volunteer.count + (payload.new.inout ? 1 : -1),
              }
            }
            return volunteer
          })
        })
      }
    )
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateCount = async (inout) => {
    await supabase.from("counts").insert([
      {
        inout: inout,
        volunteer: props.volunteer,
        event: props.event.id,
      },
    ])
    setMyCount((count) => count + (inout ? 1 : -1))
  }
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-row justify-center mt-8">
        <h1 className={count > props.event.capacity ? "text-red-600" : ""}>
          {count}
        </h1>
        <h1 className="text-primary">/{props.event.capacity}</h1>
      </div>
      <p className="text-sm grid place-items-center">total count</p>
      <div className="grid grid-cols-3 gap-4 place-items-center mt-8">
        {allVolunteers?.map((v) => {
          return (
            <div
              key={v.id}
              className="flex flex-col justify-center items-center"
            >
              <div className="badge badge-lg">{v.count}</div>
              <h4>{v.name}</h4>
            </div>
          )
        })}
      </div>
      <div className="flex flex-grow justify-center space-x-10 items-center">
        <button
          className="btn btn-circle h-24 w-24"
          onClick={() => {
            updateCount(false)
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 12H6"
            />
          </svg>
        </button>
        <button
          className="btn btn-circle h-24 w-24"
          onClick={() => {
            updateCount(true)
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
    </div>
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
        destination: `http://${ctx.req.headers.host}${redirect_url}`,
        permanent: false,
      },
    }
  }

  const {
    authorized,
    volunteer,
    checked_in,
    event,
    volunteers,
    count,
    myCount,
  } = await fetchCounts(supabase, ctx.query.slug, session.user.id)

  if (!authorized) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/404`,
        permanent: false,
      },
    }
  }

  if (!checked_in) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/events/${ctx.query.slug}/checkin`,
        permanent: false,
      },
    }
  }

  return {
    props: {
      initialSession: session,
      volunteer: volunteer,
      event: event,
      volunteers: volunteers,
      count: count,
      myCount: myCount,
    },
  }
}

export default Counter
