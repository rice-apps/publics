import type { ListEvent } from "../../utils/types";
import Link from "next/link";
import { registrationOpen } from "../../utils/registration";
import { eventCardDate } from "./cardDate";

type Props = {
  event: ListEvent;
};

export default function EventCard(props: Props) {
  return (
    <div className="card w-full bg-base-100 shadow-xl hover:shadow-md  transform hover:-translate-y-1 transition-transform border-r border-b border-l border-gray-400 lg:border-t lg:border-gray-400">
      <div className="card-body">
        <h2 className="card-title">{props.event.name}</h2>
        <p>{`${eventCardDate(props.event.event_datetime, false)}`} </p>
        <p className="font-medium flex items-center">
          <img
            className="avatar w-8 rounded-full ring ring-primary ring-offset-base-100 mr-2"
            src={props.event.organization.photo}
            alt={props.event.organization.name}
          />
          {props.event.organization.name}
        </p>
        <p className="font-medium text-primary">
          {!props.event.registration
            ? "No registration required"
            : registrationOpen(props.event)
            ? "Registration open!"
            : `Registration opens: ${eventCardDate(
                props.event.registration_datetime,
                true
              )}`}
        </p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">
            <Link href={`/events/${props.event.slug}`}>Event Details</Link>
          </button>
        </div>
      </div>
    </div>
  );
}
