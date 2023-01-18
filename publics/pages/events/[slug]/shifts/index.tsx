import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import ShiftCard from "../../../../components/shifts/ShiftCard"
import { useSession } from "@supabase/auth-helpers-react"
import AddShiftModal from "../../../../components/shifts/AddShiftModal"

export default function Shifts({ shifts, event }) {
  const session = useSession()

  return (
    <div className="mx-auto mx-4 space-y-4">
      <div className="flex justify-between mt-4">
        <h1>{event.name}: Shifts</h1>
        <AddShiftModal eventId={event.id} />
      </div>
      {/* create a grid with 3 columns of shiftcards */}
      <div key="shifts" className="grid md:grid-cols-3 gap-4">
        {shifts.filter((shift) => shift.name == "Capacity Counter").length >
          0 && (
          <div className="md:col-span-3">
            <h2>Capacity Counter</h2>
          </div>
        )}
        {shifts
          .filter((shift) => shift.name == "Capacity Counter")
          .map((shift) => (
            <ShiftCard
              key={shift.id}
              id={shift.id}
              start={shift.start}
              end={shift.end}
              count={shift.checkedIn}
              total={shift.count}
            />
          ))}
        {shifts.filter((shift) => shift.name == "Security").length > 0 && (
          <div className="md:col-span-3">
            <h2>Security</h2>
          </div>
        )}
        {shifts
          .filter((shift) => shift.name == "Security")
          .map((shift) => (
            <ShiftCard
              key={shift.id}
              id={shift.id}
              start={shift.start}
              end={shift.end}
              count={shift.checkedIn}
              total={shift.count}
            />
          ))}
        {shifts.filter((shift) => shift.name == "Caregiver").length > 0 && (
          <div className="md:col-span-3">
            <h2>Caregivers</h2>
          </div>
        )}
        {shifts
          .filter((shift) => shift.name == "Caregiver")
          .map((shift) => (
            <ShiftCard
              key={shift.id}
              id={shift.id}
              start={shift.start}
              end={shift.end}
              count={shift.checkedIn}
              total={shift.count}
            />
          ))}
      </div>
    </div>
  )
}

export const getServerSideProps = async (ctx) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx)
  // // Check if we have a session
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

  const { data: shifts, error } = await supabase
    .from("shifts")
    .select(`*, event!inner(id, slug, name)`)
    .eq("event.slug", ctx.query.slug)
    .order("start", { ascending: true })

  // get number of volunteers for each shift
  const { data: volunteers, error: volunteersError } = await supabase
    .from("volunteers")
    .select(`*, event!inner(slug)`)
    .eq("event.slug", ctx.query.slug)

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(`id, name, slug`)
    .eq("slug", ctx.query.slug)
    .single()

  if (error || eventError || volunteersError || event.length === 0) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/404`,
        permanent: false,
      },
    }
  }

  // add number of volunteers to shifts
  shifts.forEach((shift) => {
    shift.count = volunteers.filter(
      (volunteer) => volunteer.shift === shift.id
    ).length
  })
  // get number of volunteers checked in for each shift
  shifts.forEach((shift) => {
    shift.checkedIn = volunteers.filter(
      (volunteer) => volunteer.shift === shift.id && volunteer.checked_in
    ).length
  })

  return {
    props: {
      initialSession: session,
      shifts: shifts,
      event: event,
    },
  }
}
