import { registrationOpen } from "../../utils/registration"
import { ListEvent } from "../../utils/types"
import { eventCardDate } from "./cardDate"

type Props = {
    event: ListEvent
    registration_status: string | null
    type: string
}
const LargeEventCard = (props) => {

    const setButtons = () => {
        if (props.type === 'hosting') {
          return (
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Event Details</button>
              <button className="btn btn-primary btn-outline">Volunteers</button>
            </div>
            
          )
        } else if (props.type === 'volunteering') {
          return (
            //add 2 buttons, one for checking in and one for going to capacity counter page
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Check In</button>
              <button className="btn btn-primary btn-outline">Capacity Counter</button>
            </div>
          )
        } else {
          //return button for event details and seeing volunteers
          return (
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Event Details</button>
            </div>
          )
        }
      }
    return (
        <div className="card lg:card-side bg-base-100 shadow-xl max-w-4xl">
  <figure><img src="https://placeimg.com/400/400/arch" alt="Album"/></figure>
  <div className="card-body">
    <h2 className="card-title">{props.event.name}</h2>
    <p>{`${eventCardDate(props.event.event_datetime, false)}`} </p>
    <p className="font-medium flex items-center">
      <img className="avatar w-8 rounded-full ring ring-primary ring-offset-base-100 mr-2" src={props.event.organization.photo} alt={props.event.organization.name} />
      {props.event.organization.name}
    </p>
    <p>{props.event.description}</p>
    {
      props.type === 'my-events' ? <p className="font-medium text-primary">{props.registration_status}</p> : <p className="font-medium text-primary">{!props.event.registration ? 'No registration required' : registrationOpen(props.event) ? 'Registration open!' : `Registration opens: ${eventCardDate(props.event.registration_datetime, true)}`}</p>
    }
    {setButtons()}
  </div>
</div>
    )
}

export default LargeEventCard