import EventCard from "../../components/EventCard"
import { supabase } from "../../utils/db"
import type { ListEvent } from "../../utils/types"

type Props = {
    data: ListEvent[]
}

function Events(props: Props) {
    return (
        <div className="grid grid-cols-4 gap-4">
            {props.data.map((event) => <EventCard event={event}/>)}
            
        </div>
    )
}
  
// This gets called on every request
export async function getServerSideProps() {
    const { data, error } = await supabase
    .from('events')
    .select(`name, description, slug`)
    if (error) {
        throw error
    }
    return {props: {data}} // will be passed to the page component as props
    
}

export default Events
