import { get_volunteer, get_event } from "../../../utils/volunteer"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import Head from "next/head"
import { useState, useEffect } from "react"
import React from "react"

export default function CheckIn(props) {
  const supabase = useSupabaseClient()

  const eventID = props.eventID
  const codeword = props.codeword
  const [entered_cw, setEnteredCW] = useState(String)
  var correct_cw_entered = true
  const [checked_in, setCheckIn] = useState<boolean>(props.checked_in)
  const [checked_out, setCheckOut] = useState<boolean>(props.checked_out)
  const shift = props.shift
  const instructions = props.shift.volunteer_instructions
  const userID = props.userID

  const shift_start = new Date(shift.start)
  const shift_end = new Date(shift.end)

  /* gets current time (in milliseconds from the epoch) and subtracts that from the shift's start or end time,
   * which is also found in milliseconds from the epoch;
   * divides their difference by 60000 to obtain the difference in minutes, which is floored to only account
   * for minutes, and then absolute value is taken so give a window of time that is anywhere between 15 minutes
   * before and after the shift's start/end
   */
  const minutes_start = Math.abs(
    Math.floor((new Date().getTime() - shift_start.getTime()) / 60000)
  )
  const minutes_end = Math.abs(
    Math.floor((new Date().getTime() - shift_end.getTime()) / 60000)
  )

  async function update() {
    const minutes_start1 = Math.abs(
      Math.floor((new Date().getTime() - shift_start.getTime()) / 60000)
    )
    const minutes_end1 = Math.abs(
      Math.floor((new Date().getTime() - shift_end.getTime()) / 60000)
    )

    if (!checked_in && !checked_out && minutes_start1 > 15) {
      alert("Cannot check in now")
    } else if (checked_in && !checked_out && minutes_end1 > 15) {
      alert("Cannot check out now")
    } else if (checked_in && checked_out) {
      alert("Already checked out")
    }

    if (!checked_in) {
      if (codeword === entered_cw) {
        correct_cw_entered = true
        setCheckIn(true)
        const { error } = await supabase
          .from("volunteers")
          .update({ checked_in: true, start_shift: new Date() })
          .eq("profile", userID)
          .eq("event", eventID)
          .eq("shift", shift.id)
        if (error) {
          throw error
        }
      } else {
        correct_cw_entered = false
        setEnteredCW("")
      }
    } else if (checked_in) {
      setCheckOut(true)
      const { error } = await supabase
        .from("volunteers")
        .update({ checked_out: true, end_shift: new Date() })
        .eq("profile", userID)
        .eq("event", eventID)
        .eq("shift", shift.id)
      if (error) {
        throw error
      }
    }
  }

  return (
    <div id="checkin">
      <Head>
        <title>Volunteer Check In</title>
        <meta name="volunteercheckin" content="page for volunteer check in" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="mx-3 text-2xl leading-[3rem] font-bold">
          Volunteer Check In
        </h1>
        <div>
          <h2 className="mx-3 text-lg font-medium">Shift Details</h2>
          <div className="mx-3 divider"></div>
        </div>
        <div className="mx-3 mt-3">
          <p className="text-lg font-medium">Your shift: {shift.name}</p>
        </div>
        <div className="mx-3 mt-3">
          <p className="text-lg font-medium">
            {shift_start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            to{" "}
            {shift_end.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="mx-3 mt-3">
          <p className="text-lg text-primary font-medium">
            Status:{" "}
            {!checked_in
              ? "Not checked in"
              : checked_out
              ? "Checked out"
              : "Checked in"}
          </p>
        </div>
        <div className="mx-3 mt-8">
          <p className="text-lg font-medium">Volunteer Instructions:</p>
          <p className="text-lg font-normal">{instructions}</p>
        </div>
        {!checked_out &&
          (checked_in ? (
            <div className="mx-3 mt-8">
              <p className="text-lg font-bold">
                You can check out any time within 15 minutes of your
                shift&apos;s end.
              </p>
            </div>
          ) : (
            <div className="mx-3 mt-8">
              <p className="text-lg font-bold">
                You can check in any time within 15 minutes of your shift&apos;s
                start.
              </p>
            </div>
          ))}
        {checked_out && (
          <div className="mx-3 mt-8">
            <p className="text-lg font-normal">Codeword: {codeword}</p>
            <p className="text-lg font-bold">
              You have checked out of your shift. You may exit the page.
            </p>
          </div>
        )}
        {!checked_in &&
          (correct_cw_entered ? (
            <div>
              <div className="mx-3 mt-8">
                <p className="text-lg font-normal">Enter code word</p>
              </div>
              <div className="mx-3 mt-3 form-control w-full max-w-xs">
                <input
                  value={entered_cw}
                  onChange={(e) => setEnteredCW(e.target.value)}
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered w-full max-w-xs"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="mx-3 mt-8">
                <p className="text-lg font-normal text-error">
                  Incorrect code word entered
                </p>
              </div>
              <div className="mx-3 mt-3 form-control w-full max-w-xs">
                <input
                  value={entered_cw}
                  onChange={(e) => setEnteredCW(e.target.value)}
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered border-4 input-error w-full max-w-xs"
                />
              </div>
            </div>
          ))}
        {minutes_start > 15 && !checked_in && !checked_out && (
          <button className="mx-3 mt-8 btn btn-disabled">Check In</button>
        )}
        {minutes_start <= 15 && !checked_in && !checked_out && (
          <button className="mx-3 mt-8 btn btn-primary" onClick={update}>
            Check In
          </button>
        )}
        {minutes_end <= 15 && checked_in && !checked_out && (
          <div>
            <label htmlFor="check-out-modal" className="mx-3 mt-8 btn btn-primary">Check Out</label>
            <input type="checkbox" id="check-out-modal" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <p className="py-2 text-center">Are you sure you want to check out of your shift?</p>
                <div className="flex flex-row gap-4 justify-center">
                  <div className="modal-action">
                    <label htmlFor="check-out-modal" className="btn btn-outline btn-primary">Cancel</label>
                  </div>
                  <div className="modal-action">
                    <label htmlFor="check-out-modal" className="btn btn-primary" onClick={update}>
                    Check Out
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {minutes_end > 15 && checked_in && !checked_out && (
          <button className="mx-3 mt-8 btn btn-disabled">Check Out</button>
        )}
      </main>
    </div>
  )
}

export const getServerSideProps = async (ctx) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx)
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    //navigate to account page
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/account`,
        permanent: false,
      },
    }
  }

  const event = await get_event(supabase, ctx.params.slug)

  const volunteer = await get_volunteer(supabase, event["id"], session.user.id)

  if (volunteer.length === 0) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/events/${ctx.params.slug}`,
        permanent: false,
      },
    }
  }

  const { data: shiftData } = await supabase
    .from("volunteers")
    .select("shift ( id, start, end, name, volunteer_instructions )")
    .eq("profile", session.user.id)
    .eq("event", event.id)

  if (!shiftData || shiftData.length === 0) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/events/${ctx.params.slug}`,
        permanent: false,
      },
    }
  }

  // get shifts where end time is greater than fifteen minutes ago
  const now = new Date()
  now.setMinutes(now.getMinutes() - 15)
  const futureShifts = shiftData.filter((shift) => {
    if (shift.shift === null) {
      return false
    }
    return new Date(shift.shift["end"]) > now
  })

  if (futureShifts.length === 0) {
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/events/${ctx.params.slug}`,
        permanent: false,
      },
    }
  }

  //order future shifts by start time
  futureShifts.sort((a, b) => {
    return (
      new Date(a.shift!["start"]).valueOf() -
      new Date(b.shift!["start"]).valueOf()
    )
  })

  const checked_in = volunteer.filter((volunteer) => {
    return volunteer.shift === futureShifts[0].shift["id"]
  })[0].checked_in

  const checked_out = volunteer.filter((volunteer) => {
    return volunteer.shift === futureShifts[0].shift["id"]
  })[0].checked_out

  return {
    props: {
      initialSession: session,
      eventID: event.id,
      codeword: event.codeword,
      checked_in: checked_in,
      checked_out: checked_out,
      shift: futureShifts[0].shift,
      userID: session.user.id,
      params: ctx.params,
    },
  }
}
