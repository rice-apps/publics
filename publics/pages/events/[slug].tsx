import { supabase } from '../../utils/db'

export async function getServerSideProps(context) {
    console.log(context)

    const { data, error } = await supabase.from("events").select(`name, description, event_datetime, registration_datetime, registration, capacity, waitlist_size`).eq("slug", context.params.slug)

    if (error) throw (error)

    // if no event is found, redirect to 404 page
    if (data.length === 0) {
        return {
            notFound: true
        }
    }
    return {
        props: { data },
    }
}
const details = (props) => {
    // const router = useRouter()
    // const { eventName } = router.query

    const event = props.data[0]
    event.registration_datetime = new Date(event.registration_datetime)
    event.event_datetime = new Date(event.event_datetime)

    return (
        <div>
            <main>
                <div className="hero min-h-screen bg-base-200">
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
                </div>

            </main>
        </div>
    )
}

export default details