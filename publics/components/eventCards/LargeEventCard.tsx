import { registrationOpen } from "../../utils/registration"
import { ListEvent } from "../../utils/types"
import { eventCardDate } from "./cardDate"
import Link from "next/link" 
import { useSupabaseClient, SupabaseClient } from "@supabase/auth-helpers-react"
import { useState, useEffect } from "react"

import {useState} from "react";

type Props = {
  event: ListEvent
  registration_status?: string
  type: string
}

const LargeEventCard = (props: Props) => {
  const link = "/events/" + props.event.slug
  const supabase = useSupabaseClient()

  const [registrationAvailable, setRegistrationAvailable] = useState(props.event.registration_closed)

  async function toggle_registration(eventid: String) {
    
    const {data, error} = await supabase.from("events")
    .update({"registration_closed": registrationAvailable? false: true})
    .eq("id", eventid)
    .select()

    if (error) {
      throw error
    }

    setRegistrationAvailable(registrationAvailable? false : true)
  }


  const setButtons = () => {
    if (props.type === "hosting") {
      return (
        <div className="card-actions sm:justify-end">
          {(props.event.registration && registrationOpen(props.event)) &&
              <button className = "btn" onClick = {() => toggle_registration(props.event.id)}>{registrationAvailable? "Open Registration": "Close Registration"} </button>
          }
          <Link href={`${link}/registration_result`}>
            <button className="btn btn-primary">Registration Results</button>
          </Link>
          <Link href={`${link}/shifts`}>
            <button className="btn btn-primary btn-outline">Volunteers</button>
          </Link>
          {/* <Link href={`${link}/analytics`}>
            <button className="btn btn-primary btn-outline">Analytics</button>
          </Link> */}
        </div>

      )
    } else if (props.type === "volunteering") {
      return (
        <div className="card-actions sm:justify-end">
          <Link href={`${link}/checkin`} passHref>
            <button className="btn btn-primary">Check In/Out</button>
          </Link>
          <Link href={`${link}/counter`} passHref>
            <button className="btn btn-primary btn-outline">
              Capacity Counter
            </button>
          </Link>
        </div>
      )
    } else {
      return (
        <div className="card-actions sm:justify-end">
          <Link href={link} passHref>
            <button className="btn btn-primary">Event Details</button>
          </Link>
        </div>
      )
    }
  }
  return (
    <div className="card md:card-side bg-base-100 shadow-xl max-w-4xl max-h-[600px]">
      <figure className="max-w-sm max-h-sm">
        <img
          className="aspect-square"
          src={
            props.event.img_url
              ? props.event.img_url
              : "https://placeimg.com/900/900/arch"
          }
          alt="Event Image"
        />
      </figure>
      <div className="card-body">
        <div className="flex justify-between">
          <h2 className="card-title">{props.event.name}</h2>
            {props.type === "hosting" && (
            <Link className="text-primary" href={`${link}/edit`}>
              Edit
            </Link>
            )}
        </div>
        <p>{`${eventCardDate(props.event.event_datetime, false)}`} </p>
        <p className="font-medium flex items-center">
          <img
            className="avatar w-8 bg-opacity-0 mr-2"
            src={props.event.organization.photo}
            alt={props.event.organization.name}
          />
          {props.event.organization.name}
        </p>
        <p>{props.event.description}</p>
        {props.type === "my-events" ? (
          <p className="font-medium text-primary">
            {props.registration_status}
          </p>
        ) : (
          <p className="font-medium text-primary  ">
            {!props.event.registration
              ? "No registration required"
              : registrationAvailable
              ? `Registration closed`
              : registrationOpen(props.event)
              ? "Registration open!"
              : `Registration opens: ${eventCardDate(
                  props.event.registration_datetime,
                  true
                )}`}
          </p>
        )}
        {setButtons()}
      </div>
    </div>
  )
}

export default LargeEventCard
