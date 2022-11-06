import type { ListEvent } from "../utils/types"
import { useRouter } from 'next/router'

type Props = {
    event: ListEvent
}

export default function EventCard(props: Props) {
    const router = useRouter()
    return (
        <div className="card w-full bg-base-100 shadow-xl hover:scale-110 transition-transform border border-primary">
            <figure><img src="https://placeimg.com/400/225/arch" alt="Shoes" /></figure>
            <div className="card-body">
                <h2 className="card-title">{props.event.name}</h2>
                <p>{props.event.description}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary" onClick={() => router.push(`events/${props.event.slug}`)}>More Information</button>
                </div>
            </div>
        </div>
    )
}