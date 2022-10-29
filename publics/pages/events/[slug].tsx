import { supabase } from '../../utils/db'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { data, error } = await supabase
        .from("events")
        .select(`name, description, event_datetime, registration_datetime, registration, capacity, waitlist_size, organization (
            name,
            photo
        )`)
        .eq("slug", context.params.slug)
        .single()

    if (error) throw (error)
    console.log(data)

    // if no event is found, redirect to 404 page
    if (data === null) {
        return {
            notFound: true
        }
    }
    return {
        props: { data },
    }
}

type EventDetail = {
    name: string
    description: string
    event_datetime: string | Date
    registration_datetime: string | Date
    registration: boolean
    capacity: number
    waitlist_size: number
    organization: OrganizationDetail
}

type OrganizationDetail = {
    name: string,
    photo: string
}

type Props = {
    data: EventDetail
}

const details = (props: Props) => {
    const event = props.data

    // process datetimes
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    event.registration_datetime = new Date(event.registration_datetime)
    event.event_datetime = new Date(event.event_datetime)
    console.log(event)

    return (
        <div>
            <main>
                <div className="hero min-h-screen bg-base-200">
                    <div className="hero-content flex-col lg:flex-row">
                        <img src="https://visit-oxford.s3.amazonaws.com/wp-content/uploads/2018/05/16180528/pum.jpg" className="max-w-sm rounded-lg shadow-2xl" />
                        <div>
                            <h1 className="text-5xl font-bold">{event.name}</h1>
                            <p className="text-xl">{weekday[event.event_datetime.getDay()] + ", " + month[event.event_datetime.getMonth()] + " " + event.event_datetime.getDate() + "th"} </p>

                            <div style = display: flex, justify-content: space-between>
                            <img className="object-scale-down h-5 w-5" src={event.organization.photo} />
                            <p className="">Hosted by {event.organization.name}</p>
                        </div>

                        <p className="py-6">Description: {event.description}</p>
                        <button className="btn btn-primary">Get Started</button>
                    </div>
                </div>
        </div >

                {/* <div className="hero min-h-screen bg-base-200">
                    <div className="hero-content">
                        <div className="max-w-md">
                            <h1 className="text-5xl font-bold">{event.name} Details!</h1>
                            <p>Name: {event.name}</p>
                            <p>Event Date: {event.event_datetime.getMonth() + 1 + "/" + event.event_datetime.getDate()}</p>
                            <p>Event Time: {event.event_datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p>Registration Date: {event.registration_datetime.getMonth() + 1 + "/" + event.registration_datetime.getDate()}</p>
                            <p>Registration Time: {event.registration_datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p>Capacity: {event.capacity}</p>
                            <p>Waitlist: {event.waitlist_size}</p>
                            <p>Description: {event.description}</p>

                            <div className="hero justify-end">
                                <button className="btn btn-primary" disabled={!event.registration}>Sign Up</button>
                            </div>
                        </div>
                    </div>
                </div> */}
            </main >
        </div >
    )
}

export default details