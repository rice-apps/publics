import type { NextPage } from 'next'
import Head from 'next/head'

import { useRouter } from 'next/router'

const details = () => {

    const event = {
        "created_at": new Date(2022, 10, 15, 20, 0, 0),
        "name": "NOD",
        "capacity": 500,
        "event_size": 500,
        "waitlist_size": 100,
        "admins": [1, 2, 3],
        "counters": [1, 2, 3],
        "description": "Some description blablab",
        "event_datetime": new Date('2022-10-15 20:10:10.555555'),
        "registration_datetime": new Date('2022-10-13 14:30:10.555555'),
        "slug": "mock data",
        "registration": true,
    }

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