import type { ListEvent } from "../utils/types"
import Link from 'next/link'
import { registrationOpen } from "../utils/registration"

type Props = {
    event: ListEvent
}


export default function EventCard(props: Props) {
    return (
        <div className="card w-full bg-base-100 shadow-xl hover:scale-110 transition-transform">
            <div className="card-body">
                <h2 className="card-title">{props.event.name}</h2>
                <p>{new Date(props.event.event_datetime).toDateString()} </p>
                <p className="flex">
                    <img className="w-8 mr-2" src={props.event.organization.photo} alt={props.event.organization.name}></img>
                    {props.event.organization.name}
                </p>
                <p>{!props.event.registration ? 'No registration required' : registrationOpen(props.event) ? 'Registration open' : `Registration opens ${new Date(props.event.registration_datetime).getDay()}`}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">
                        <Link href={`events/${props.event.slug}`}>Event Details</Link>
                    </button>
                </div>
            </div>
        </div>
    )

}