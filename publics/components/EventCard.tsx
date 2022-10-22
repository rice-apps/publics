export default function EventCard(props: any) {
    console.log("props" + props)
    return (
        <div className="card w-full bg-base-100 shadow-xl">
            <figure><img src="https://placeimg.com/400/225/arch" alt="Shoes" /></figure><div className="card-body">
                <h2 className="card-title">{props.event.name}</h2>
                <p>{props.event.description}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">More Information</button>
                </div>
            </div>
        </div>
    )
}