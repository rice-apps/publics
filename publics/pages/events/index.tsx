import EventCard from "../../components/EventCard"
import { supabase } from "../../utils/db"
import type { ListEvent } from "../../utils/types"

type Props = {
    eventList: ListEvent[]
}

function Events(props: Props) {
    return (
<<<<<<< HEAD
        <div className="p-3">
            <h1>Events</h1>
            <div className="grid grid-cols-4 gap-4">
                {props.data.map((event) => <div key={event.name}><EventCard event={event} /></div>)}
            </div>
        </div>
    )
}

=======
        <>
            <div className="grid grid-cols-2">
                {/* this one */}
            </div>
            <div className="divider">OR</div>
            <div className="grid grid-cols-4 gap-4">
                {props.eventList.map((event) => <EventCard event={event} />)}
            </div>
        </>
    )
}


>>>>>>> added details of event list, wip date formatting of myevents
// This gets called on every request
export async function getServerSideProps() {
    const { data, error } = await supabase
        .from('events')
<<<<<<< HEAD
        .select(`name, description, slug`)
    if (error) {
        throw error
    }
    return { props: { data } } // will be passed to the page component as props
=======
        .select(`name, description, event_datetime, slug, organization (name, photo, id), registration, registration_datetime`)
    if (error) {
        throw error
    }
    let props: any = {}
    props.eventList = data

    // const { data, error } = await supabase
    //     .from('registrations')
    //     .select()
    //     .eq('person', supabase.auth.getUser().id)

    return { props } // will be passed to the page component as props
>>>>>>> added details of event list, wip date formatting of myevents

}

export default Events
