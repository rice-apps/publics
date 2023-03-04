import { registrationOpen } from "../../utils/registration"
import { ListEvent } from "../../utils/types"
import { eventCardDate } from "./cardDate"
import Link from "next/link"

type Props = {
  event: ListEvent
  registration_status?: string
  type: string
  sameColl?: boolean
  userId?: string
}

async function vol_data(props: Props, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('volunteers')
    .select('is_counter, shift (start, end)')
    .eq('profile', props.userId)
    .eq('event', props.event.id)
    //.single()
  
  if (error) {
    throw error
  }
  return data
}

const LargeEventCard = (props: Props) => {
  const link = "/events/" + props.event.slug
  const supabase = useSupabaseClient()
  var checkin
  var checkout;
  const [isTime, setTime]= useState(false)
  const [isCounter, setCounter ]= useState(false)
  

  useEffect(() => {
    Promise.resolve(vol_data(props, supabase)).then((data) => {
      var currentDate = new Date();

      // Find earliest shift in data that has not ended yet (data2Use)
      // This is the data we will use
      var data2Use = data[0];
      for (var i = 0; i < data.length; i++) { 
        if ((new Date(data2Use.shift?.end).getTime() < currentDate.getTime())){
          data2Use = data[i]
        } else if (new Date(data[i].shift?.start) < new Date (data2Use.shift?.start)){
          data2Use = data[i]
        }
      }

      checkin = new Date(data2Use.shift?.start)
      checkout = new Date(data2Use.shift?.end)

      // Can check in between 15 min (900,000 ms) before start of shift time until end of shift)
      setTime(((checkin.getTime()-currentDate.getTime()) < 900000) && (checkout.getTime() > currentDate.getTime()))

      // Check if shift is capacity counter shift
      setCounter(data2Use.is_counter)
    })
  }, [])

  const setButtons = () => {
    if (props.type === "hosting") {
      return (
        <div className="card-actions sm:justify-end">
          <Link href={`${link}/registration_result`}>
            <button className="btn btn-primary">Registration Results</button>
          </Link>
          <Link href={`${link}/shifts`}>
            <button className="btn btn-primary btn-outline">Volunteers</button>
          </Link>
          {/* <Link href={`${link}/analytics`}>
            <button className="btn btn-primary btn-outline">Analytics</button>
          </Link> */}
        </div>
      )
    } else if (props.type === "volunteering") {
      return (
        <div className="card-actions sm:justify-end">
          {(isTime) ? 
            (<Link href={`${link}/checkin`} passHref>
              <button className="btn btn-primary">Check In/Out</button>
            </Link>) : (
              <button className="btn btn-disabled">Check In/Out</button>
            )}
          {isCounter && (
            (isTime) ? (
              <Link href={`${link}/counter`} passHref>
                <button className="btn btn-primary btn-outline">
                  Capacity Counter
                </button>
              </Link>
            ) : (
              <button className="btn btn-disabled">
                Capacity Counter
              </button>
            )
          )}
        </div>
      )
    } else {
      return (
        <div className="card-actions sm:justify-end">
          <Link href={link} passHref>
            <button className="btn btn-primary">Event Details</button>
          </Link>
        </div>
      )
    }
  }
  return (
    <div className="card md:card-side bg-base-100 shadow-xl max-w-4xl max-h-[600px]">
      <figure className="max-w-sm max-h-sm">
        <img
          className="aspect-square"
          src={
            props.event.img_url
              ? props.event.img_url
              : "https://placeimg.com/900/900/arch"
          }
          alt="Event Image"
        />
      </figure>
      <div className="card-body">
        <div className="flex justify-between">
          <h2 className="card-title">{props.event.name}</h2>
          {props.type === "hosting" && (
            <Link className="text-primary" href={`${link}/edit`}>
              Edit
            </Link>
          )}
        </div>
        <p>{`${eventCardDate(props.event.event_datetime, false)}`} </p>
        <p className="font-medium flex items-center">
          <img
            className="avatar w-8 bg-opacity-0 mr-2"
            src={props.event.organization.photo}
            alt={props.event.organization.name}
          />
          {props.event.organization.name}
        </p>
        <p>{props.event.description}</p>
        {props.type === "my-events" ? (
          <p className="font-medium text-primary">
            {props.registration_status}
          </p>
        ) : (
          <p className="font-medium text-primary">
            {!props.event.registration
              ? "No registration required"
              : props.event.registration_closed
              ? `Registration closed`
              : registrationOpen(props.event)
              ? "Registration open!"
              : `Registration opens: ${eventCardDate(
                  props.event.registration_datetime,
                  true
                )}`}
          </p>
        )}
        {setButtons()}
      </div>
    </div>
  )
}

export default LargeEventCard
