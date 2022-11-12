import type { ListEvent } from "../utils/types"
import Link from 'next/link'
import { registrationOpen } from "../utils/registration"

type Props = {
    event: ListEvent
}

function getOrdinal(n: string) {
    let ord = ["st", "nd", "rd"]
    let exceptions = [11, 12, 13]
    let newNum = Number(n.replace(/\s/g, ''))
    let nth = ord[(newNum % 10) - 1] == undefined || exceptions.includes(newNum % 100) ? "th" : ord[(newNum % 10) - 1]
    return newNum.toString() + nth
}

function eventCardDate(datetime: string, registration: boolean) {
    const dt: Date = new Date(datetime)

    const date = dt.toLocaleDateString('en-us', { weekday: "long", month: "long", day: "numeric" });
    const time = dt.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    //console.log(date.slice(date.length-2, date.length-1))
    const ordinalday = getOrdinal(date.slice(date.length - 2))

    if (registration) {
        return `${date.slice(0, date.length - 2)} ${ordinalday} @ ${time}`
    }
    else {
        return `${date.slice(0, date.length - 2)} ${ordinalday}`
    }
}


export default function EventCard(props: Props) {
    return (
        <div className="card w-full bg-base-100 shadow-xl hover:scale-110 transition-transform border border-primary">
            <div className="card-body">
                <h2 className="card-title">{props.event.name}</h2>
                <p>{`${eventCardDate(props.event.event_datetime, false)}`} </p>
                <p className="font-medium flex items-center">
                    <img className="avatar w-8 rounded-full ring ring-primary ring-offset-base-100 mr-2" src={props.event.organization.photo} alt={props.event.organization.name}>
                    </img>{props.event.organization.name}</p>
                <p className="font-medium">{!props.event.registration ? 'No registration required' : registrationOpen(props.event) ? 'Registration open' : `Registration opens: ${eventCardDate(props.event.registration_datetime, true)}`}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">
                        <Link href={`/events/${props.event.slug}`}>Event Details</Link>
                    </button>
                </div>
            </div>
        </div>
    )

}