import EventCard from "../../components/EventCard"
import { supabase } from "../../utils/db"
import type { ListEvent } from "../../utils/types"

type Props = {
    eventList: ListEvent[]
}

function Events(props: Props) {
    return (
        <div className="px-8 grid grid-cols-3 gap-4">
            {props.eventList.map((event) => <EventCard key={event.slug} event={event} />)}
        </div>
    )
}

// This gets called on every request
export async function getServerSideProps() {
    const { data, error } = await supabase
        .from('events')
        .select(`name, description, event_datetime, slug, organization (name, photo, id), registration, registration_datetime`)
    if (error) {
        throw error
    }
    let props: Props = { eventList: data }

    // const { data, error } = await supabase
    //     .from('registrations')
    //     .select()
    //     .eq('person', supabase.auth.getUser().id)

    return { props } // will be passed to the page component as props
}

export default Events
