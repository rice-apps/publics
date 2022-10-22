import EventCard from "../../components/EventCard"
import { supabase } from "../../utils/db"

const mockData = [{
    name : "NOD",
    description: "Horny",
    date: new Date(2022,10,15, 22,0)
},
{
    name: "Baker 13",
    description: "Naked run",
    date: new Date(2022, 10, 13, 23, 0)
}
]
function Events(props: any) {
    console.log(props.data)
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
    .select()
    if (error) {
        throw error
    }
    return {props: {data}} // will be passed to the page component as props
    
}

export default Events

// export default function Events(props: any) {
//     return (
//         <div className="grid grid-cols-4 gap-4">
//             {.map((event) => <EventCard event={event}/>)}
            
//         </div>
//     )
// }
