import type { ListEvent } from "../utils/types"
import Link from 'next/link'

type Props = {
    event: ListEvent
}

function registrationOpen(event: ListEvent) {
    return (event.registration && new Date(event.event_datetime) < new Date() && new Date(event.registration_datetime) >= new Date())
}
function getOrdinal(n: number) {
    let ord = ["st", "nd", "rd"]
    let exceptions = [11, 12, 13]
    let nth = 
    ord[(n % 10) - 1] == undefined || exceptions.includes(n % 100) ? "th" : ord[(n % 10) - 1]
    return n.toString() + nth
}

function eventCardDate(datetime: string) {
    const dt: Date = new Date(datetime)
    const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    
    var weekday = dayNames[dt.getDay()]
    var month = months[dt.getMonth()]
    var day = getOrdinal(dt.getDate())
    var date = dt.toLocaleDateString('en-us', { weekday:"long", month:"long", day:"numeric"});
    var time = dt.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
   


    return `$date @ ${time}`

}


export default function EventCard(props: Props) {
    console.log(props.event)
    console.log(eventCardDate(props.event.event_datetime))
    console.log("registration datetime:" + props.event.registration_datetime)
    return (
<<<<<<< HEAD
        <div className="card w-full bg-base-100 shadow-xl hover:scale-110 transition-transform border border-primary">
            <figure><img src="https://placeimg.com/400/225/arch" alt="Shoes" /></figure>
=======
        <div className="card w-full bg-base-100 shadow-xl hover:scale-110 transition-transform">
>>>>>>> added details of event list, wip date formatting of myevents
            <div className="card-body">
                <h2 className="card-title">{props.event.name}</h2>
                <p>{new Date(props.event.event_datetime).toDateString()} </p>
                <p className="flex"><img className="w-8 mr-2" src={props.event.organization.photo} alt={props.event.organization.name}></img>{props.event.organization.name}</p>
                <p>{!props.event.registration ? 'No registration required' : registrationOpen(props.event) ? 'Registration open' : `Registration opens ${eventCardDate(props.event.registration_datetime)}`}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">
                        <Link href={`events/${props.event.slug}`}>Event Details</Link>
                    </button>
                </div>
            </div>
        </div>
    )

}