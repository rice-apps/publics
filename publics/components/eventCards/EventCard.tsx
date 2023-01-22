import type { ListEvent } from "../../utils/types"
import Link from "next/link"
import Image from "next/image"
import { registrationOpen } from "../../utils/registration"
import { eventCardDate } from "./cardDate"

type Props = {
  event: ListEvent
}

export default function EventCard(props: Props) {
  return (
    <div className="card w-full bg-base-100 shadow-xl hover:shadow-md transform hover:-translate-y-1 transition-transform ">
      <div className="card-body">
        <h2 className="card-title">{props.event.name}</h2>
        <p>{`${eventCardDate(props.event.event_datetime, false)}`} </p>
        <p className="font-medium flex items-center">
          <Image
            width={32}
            height={32}
            className="avatar w-8 bg-opacity-0 mr-2"
            src={props.event.organization.photo}
            alt={props.event.organization.name}
          />
          {props.event.organization.name}
        </p>
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
        <div className="card-actions justify-end">
          <Link href={`/events/${props.event.slug}`} passHref>
            <button className="btn btn-primary">Event Details</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
