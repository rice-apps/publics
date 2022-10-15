import type { NextPage } from 'next'
import Head from 'next/head'
import { supabase } from '../../utils/db'

import { useRouter } from 'next/router'

export async function getServerSideProps(context) {
    console.log(context)

    const { data, error } = await supabase.from("events").select(`name, description, event_datetime, registration_datetime, registration`).eq("slug", context.params.slug)

    if (error) throw (error)
    console.log(data)
    return {
        props: { data },
    }
}
const details = (props) => {

    const event = props.data

    const router = useRouter()
    const { eventName } = router.query

    return (
        <div>
            <main>
                <div className="hero min-h-screen bg-base-200">
                    <div className="hero-content">
                        <div className="max-w-md">
                            <h1 className="text-5xl font-bold">{eventName} Details!</h1>

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