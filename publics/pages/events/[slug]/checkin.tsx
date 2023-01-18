import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from "next/router";
import React from "react";
import {
    SupabaseClient,
    createServerSupabaseClient,
  } from "@supabase/auth-helpers-nextjs";
  import { volunteer_authorize } from "../../../utils/volunteer";
  import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function CheckIn(props) {

    const supabase = useSupabaseClient()

    const [eventID] = useState<string>(props.eventID)
    const [codeword] = useState<string>(props.codeword)
    const [entered_cw, setEnteredCW] = useState(String)
    const [correct_cw_entered, setCorrectCWEntered] = useState(Boolean)
    const [checked_in, setCheckIn] = useState<boolean>(props.checked_in)
    const [checked_out, setCheckOut] = useState<boolean>(props.checked_out)
    const [checking_in_wrong_time, setCheckingInWrongTime] = useState(Boolean)
    const [checking_out_wrong_time, setCheckingOutWrongTime] = useState(Boolean)
    const [shift] = useState<any[]>(props.shift)
    const [instructions, setInstructions] = useState<string>(props.shift.volunteer_instructions)
    const [authorizedVolunteer] = useState<boolean>(props.volunteer_status)

    const shift_start = new Date(shift.start)
    const shift_end = new Date(shift.end)

    function parse_time(date: Date) {
        let time = date.toLocaleTimeString()
        let ampm = time.slice(time.indexOf(" "))
        let hrmin = time.slice(0, time.indexOf(":", 3))
        return hrmin + ampm
    }

    async function update() {

        const { data: { user } } = await supabase.auth.getUser()

        if (!checked_in) {
            const minutes = Math.abs(Math.floor((new Date().getTime() - shift_start.getTime()) / 60000));
            if (minutes <= 15) {
                if (codeword === entered_cw) {
                    setCorrectCWEntered(true)
                    setCheckIn(true)
                    const { error } = await supabase
                        .from('volunteers')
                        .update({checked_in: true, start_shift: new Date()})
                        .eq('profile', user?.id)
                        .eq('event', eventID)
                    if (error) {
                        throw error
                    }
                } else {
                    setCorrectCWEntered(false)
                    setEnteredCW("")
                }
            } else {
                alert("Cannot check in now")
            }
        } else {
            const minutes = Math.abs(Math.floor((new Date().getTime() - shift_end.getTime()) / 60000));
            if (minutes <= 15) {
                setCheckOut(true)
                const { error } = await supabase
                    .from('volunteers')
                    .update({checked_out: true, end_shift: new Date()})
                    .eq('profile', user?.id)
                    .eq('event', eventID)
                if (error) {
                    throw error
                }
            } else {
                alert("Cannot check out now")
            }
        }
    }

    useEffect(() => {
        setCorrectCWEntered(true)
    }, [])

    return (
        <div id="checkin">
            <Head>
                <title>Volunteer Check In</title>
                <meta name="volunteercheckin" content="page for volunteer check in"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main>
                <h1 className = "mx-3 text-2xl normal-case leading-[3rem] font-family: inter font-bold">
                    Volunteer Check In
                </h1>
                <div className='leading-[1rem]'>
                    <h2 className = "mx-3 text-lg leading-[2rem] normal-case font-family-inter font-medium">
                        Shift Details
                    </h2>
                    <div className="mx-3 divider leading-[1px]"></div>
                </div>
                <div className="mx-3 mt-3">
                    <p className="text-lg normal-case font-family-inter font-medium">Your shift: {shift.name}</p>
                </div>
                <div className='mx-3 mt-3'>
                    <p className="text-lg normal-case font-family-inter font-medium">{parse_time(shift_start)} to {parse_time(shift_end)}</p>
                </div>
                {!checked_in && !checked_out && (
                    <div className='mx-3 mt-3'>
                        <p className="text-lg text-[#AC1FB8] normal-case font-family-inter font-medium">Status: Not checked in</p>
                    </div>
                )}
                {checked_in && !checked_out && (
                    <div className='mx-3 mt-3'>
                        <p className="text-lg text-[#AC1FB8] normal-case font-family-inter font-medium">Status: Checked in</p>
                    </div>
                )}
                {checked_in && checked_out && (
                    <div className='mx-3 mt-3'>
                        <p className="text-lg text-[#AC1FB8] normal-case font-family-inter font-medium">Status: Checked out</p>
                    </div>
                )}
                <div className='mx-3 mt-8'>
                    <p className="text-lg normal-case font-family-inter font-medium">Volunteer Instructions:</p>
                </div>
                <div className='mx-3 mt-3'>
                    <p className="text-lg normal-case font-family-inter font-normal">{instructions}</p>
                </div>
                {!checked_in && !checked_out && (
                    <div className='mx-3 mt-8'>
                        <p className="text-lg normal-case font-family-inter font-bold">You can check in any time within 15 minutes of your shift's start.</p>
                    </div>
                )}
                {checked_in && !checked_out && (
                    <div className='mx-3 mt-8'>
                        <p className="text-lg normal-case font-family-inter font-bold">You can check out any time within 15 minutes of your shift's end.</p>
                    </div>
                )}
                {checked_in && checked_out && (
                    <div className='mx-3 mt-8'>
                        <p className="text-lg normal-case font-family-inter font-bold">You have checked out of your shift. You may exit the page.</p>
                    </div>
                )}
                {correct_cw_entered && !checked_in && (
                    <div className="mx-3 mt-3 form-control w-full max-w-xs">
                        <input
                            value = {entered_cw}
                            onChange = {(e) => setEnteredCW(e.target.value)} 
                            type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
                        <label className="label">
                            <span className="label-text-alt">Code word</span>
                        </label>
                    </div>
                )}
                {!correct_cw_entered && !checked_in && (
                    <div className="mx-3 mt-3 form-control w-full max-w-xs">
                        <input
                            value = {entered_cw}
                            onChange = {(e) => setEnteredCW(e.target.value)}  
                            type="text" placeholder="Type here" className="input input-bordered border-4 input-error w-full max-w-xs" />
                        <label className="label">
                            <span className="label-text-alt text-error">Incorrect code word</span>
                        </label>
                    </div>
                )}
                {!checked_in && !checked_out && (<button className='mx-3 mt-8 btn btn-primary' onClick={update}>Check In</button>)}
                {checked_in && !checked_out && (<button className='mx-3 mt-8 btn btn-primary' onClick={update}>Check Out</button>)}
            </main>
        </div>
    )
}

export const getServerSideProps = async (ctx) => {
    // Create authenticated Supabase Client
    const supabase = createServerSupabaseClient(ctx);
    // Check if we have a session
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
    //navigate to account page
        return {
            redirect: {
                destination: `http://${ctx.req.headers.host}/account`,
                permanent: false,
            },
        };
    }

    //Check if user is admin
    const authorizations = await volunteer_authorize(
        supabase,
        ctx.params.slug,
        session.user.id
    );
    
    const volunteer = authorizations[0]
    const volunteer_status = volunteer.length > 0
    const eventID = authorizations[1].id
    const codeword = authorizations[1].codeword
    const checked_in = volunteer[0].checked_in
    const checked_out = volunteer[0].checked_out

    //If not admin, redirect to event page
    if (!volunteer_status) {
        return {
            redirect: {
                destination: `http://${ctx.req.headers.host}/events/${ctx.params.slug}`,
                permanent: false,
            },
        };
    }
    //Get event data

    const shift = await supabase
        .from('volunteers')
        .select('shift ( start, end, name, volunteer_instructions )')
        .eq('profile', session.user.id)
        .eq('event', eventID)

    return {
        props: {
            initialSession: session,
            eventID: eventID,
            codeword: codeword,
            checked_in: checked_in,
            checked_out: checked_out,
            volunteer_status: volunteer_status,
            shift: shift.data[0].shift,
            params: ctx.params,
        },
    };
};