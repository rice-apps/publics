import EventCard from "../../components/EventCard"
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

export default function Events(props: any) {
    return (
        <div className="grid grid-cols-4 gap-4">
            {mockData.map((event) => <EventCard event={event}/>)}
            
        </div>
    )
}