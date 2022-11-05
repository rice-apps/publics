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
    if (error) {
        return {
            notFound: true
        }
    }
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
                <div className="hero min-h-[60vh] object-left-top">
                    <div className="hero-content items-stretch lg:flex-row min-w-[70vw] place-content-start space-x-8 max-w-[70vw]">
                        <img src="https://as2.ftcdn.net/v2/jpg/03/09/55/15/1000_F_309551534_hkPIgAAsyc5EQg0Ny2bUYh8ttkUWc8fA.jpg" className="max-w-sm rounded-lg shadow-2xl" />
                        <div className="flex flex-col space-y-4">
                            <h1 className="text-5xl font-bold">{event.name}</h1>
                            <p className="text-xl">{weekday[event.event_datetime.getDay()] + ", " + month[event.event_datetime.getMonth()] + " " + event.event_datetime.getDate() + "th"} </p>
                            <span>
                                <p className=""> <img className="rounded h-5 w-5 inline object-center" src={event.organization.photo} /> Hosted by {event.organization.name}</p>
                            </span>
                            <p className="">Description: {event.description}</p>

                        </div>
                    </div>
                </div>
                <div className="divider"></div>
                <div className="min-h-[20vh] flex-col sm:px-10 md:px-24">
                    <h2 className="mb-2">Register for Event</h2>
                    <div className="flex-wrap flex flex-col lg:flex-row  place-content-start min-w-[70vw] items-start space-x-8 max-w-[70vw]">
                        <div className="form-control w-full max-w-[16rem]">
                            <input type="text" placeholder="" className="input input-bordered w-full max-w-[16rem]" />
                            <label className="label">
                                <span className="label-text-alt">First Name</span>

                            </label>
                        </div>

                        <div className="form-control w-full max-w-[16rem]">
                            <input type="text" placeholder="" className="input input-bordered w-full max-w-[16rem]" />
                            <label className="label">
                                <span className="label-text-alt">Last Name</span>

                            </label>
                        </div>

                        <div className="form-control w-full max-w-[16rem]">
                            <input type="text" placeholder="" className="input input-bordered w-full max-w-[16rem]" />
                            <label className="label">
                                <span className="label-text-alt">Net ID</span>

                            </label>
                        </div>

                        <button className="btn btn-primary">Register</button>

                    </div>
                </div>

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