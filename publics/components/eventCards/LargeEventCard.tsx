import { registrationOpen } from "../../utils/registration"
import { ListEvent } from "../../utils/types"
import { eventCardDate } from "./cardDate"
import { SupabaseClient, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useEffect, useState } from "react"
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
    .single()
  
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
  const [minutes1, setMinutes1] = useState(-20)
  const [minutes2, setMinutes2] = useState(20)
  const [isCounter, setCounter ]= useState(false)
  useEffect(() => {
    Promise.resolve(vol_data(props, supabase)).then((data) => {
      checkin = new Date(data.shift?.start)
      checkout = new Date(data.shift?.end)
      setCounter(data.is_counter)
      setMinutes1(Math.floor((new Date().getTime() - checkin.getTime()) / 60000))
      setMinutes2(Math.floor((new Date().getTime() - checkout.getTime()) / 60000))
      console.log(checkin)
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
        </div>
      )
    } else if (props.type === "volunteering") {
      return (
        <div className="card-actions sm:justify-end">
          {(minutes1 >= -15 && minutes2 <= 15) ? 
            (<Link href={`${link}/checkin`} passHref>
              <button className="btn btn-primary">Check In/Out</button>
            </Link>) : (
              <button className="btn btn-disabled">Check In/Out</button>
            )}
          {isCounter && (
            (minutes1 >= -15 && minutes2 <= 15) ? (
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
              : props.sameColl
              ? `Registration opens for ${
                  props.event.organization.name
                }: ${eventCardDate(
                  props.event.college_registration_datetime,
                  true
                )}`
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
