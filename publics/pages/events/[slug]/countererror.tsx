import { redirect_url } from "../../../utils/admin"
import {
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/router"

export default function CounterError(props) {
  const checked_in = props.checked_in
  const checked_out = props.checked_out
  const in_time_range = props.in_time_range

  const router = useRouter()

  function returnHome() {
    router.push('/events')
  }

  return (
    <div>
      <h1 className="mx-3">Capacity Counter Error</h1>
      <div className="divider mx-3"></div>
      
      {checked_out ? (
        <p className="text-lg font-normal mx-3">You are already checked out.</p>
      ) : (
        !checked_in && (
          <p className="text-lg font-normal mx-3">You are not checked in yet.</p>
        )
      )}

      {!in_time_range && (
        <p className="text-lg font-normal mx-3">You are not within your shift&apos;s time range &#40;within 15 minutes of shift start or end&#41;.</p>
      )}

      <button className="mx-3 mt-8 btn btn-primary" onClick={returnHome}>
        Return Home
      </button>
      
    </div>
  )
}

export const getServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}${redirect_url}`,
        permanent: false,
      },
    }
  }

  const { data: eventData } = await supabase
    .from("events")
    .select("id")
    .eq("slug", ctx.params.slug)
    .single()

  if (!eventData) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}${redirect_url}`,
        permanent: false,
      },
    }
  }

  const { data } = await supabase
    .from("counts")
    .select("volunteer")
    .eq("event", eventData.id)
  
  if (!data) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}${redirect_url}`,
        permanent: false,
      },
    }
  }

  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("checked_in, checked_out, shift(start, end)")
    .match({
      profile: session.user.id,
      event: eventData.id,
      is_counter: true,
    })
    .single()
  
  if (!volunteer) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}${redirect_url}`,
        permanent: false,
      },
    }
  }

  var shift_start;
  var shift_end;
  if (volunteer) {
    shift_start = new Date(volunteer.shift?.start)
    shift_end = new Date(volunteer.shift?.end)
  }

  var minutes_start;
  var minutes_end;
  if (shift_start && shift_end) {
    minutes_start = Math.abs(
      Math.floor((new Date().getTime() - shift_start.getTime()) / 60000)
    )
    minutes_end = Math.abs(
      Math.floor((new Date().getTime() - shift_end.getTime()) / 60000)
    )
  }

  var timeAllowed = false
  if (minutes_start && minutes_end) {
    timeAllowed = minutes_start >= -15 && minutes_end <= 15
  }

  return{
    props : {
      checked_out: volunteer.checked_out,
      checked_in: volunteer.checked_in,
      in_time_range: timeAllowed,
    }
  }

}