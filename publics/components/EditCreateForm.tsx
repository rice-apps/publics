import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    SupabaseClient,
    createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { authorize } from "../utils/admin";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { InferGetServerSidePropsType,  GetServerSideProps } from 'next'
import type { Session } from "@supabase/auth-helpers-react";

export default function EditCreateForm(props) {
    console.log(props);
    return
    const router = useRouter();
    const supabase = useSupabaseClient();

    const [name, setName] = useState(String);
    const [slug, setSlug] = useState(String);
    const [origSlug, setOrigSlug] = useState(String);
    const [eventDateTime, setEventDateTime] = useState(Date);
    const [host, setHost] = useState<String>("hi");
    // const [host, setHost] = useState<String>(props.orgs[0].organization.id);
    const [location, setLocation] = useState(String);
    const [capacity, setCapacity] = useState(Number);
    const [description, setDescription] = useState(String);

    const [registration, setRegistration] = useState(Boolean);
    const [collegeRegistration, setCollegeRegistration] = useState(Date);
    const [registrationDatetime, setRegistrationDatetime] = useState(Date);
    const [signupSize, setSignupSize] = useState(Number);
    const [waitlistSize, setWaitlistSize] = useState(Number);
    const [orgs] = useState<any[]>(data.orgs);

    function format_date(date: string) {
        if (date === null) {
            return "purposely-nonformatted-date";
        }
        let eventDate = new Date(date).toISOString();
        return eventDate.slice(0, eventDate.indexOf("+"));
    }
    async function setData(data) {
        setName(data.name);
        setSlug(data.slug);
        setOrigSlug(data.slug);
        setEventDateTime(format_date(data.event_datetime));
        setHost(data.organization);
        setLocation(data.location);
        setCapacity(data.capacity);
        setDescription(data.description);
        setRegistration(data.registration);
        if (data.registration) {
            setCollegeRegistration(format_date(data.college_registration_datetime));
            setRegistrationDatetime(format_date(data.registration_datetime));
            setSignupSize(data.signup_size);
            setWaitlistSize(data.waitlist_size);
        } else {
            setCollegeRegistration("purposely-nonformatted-date");
            setRegistrationDatetime("purposely-nonformatted-date");
            setSignupSize(0);
            setWaitlistSize(0);
        }
    }


    if (data.editing) {
        useEffect(() => {
            setData(data);
        }, []);
    }

    async function insert() {
        let insert1 = {
            name: name,
            slug: slug,
            event_datetime: eventDateTime,
            organization: host,
            location: location,
            capacity: capacity,
            description: description,
            registration: registration,
        };

        let insert2 = {};
        if (registration) {
            insert2 = {
                college_registration_datetime: collegeRegistration,
                registration_datetime: registrationDatetime,
                signup_size: signupSize,
                waitlist_size: waitlistSize,
            };
        }

        let insert = Object.assign({}, insert1, insert2);
        const { error } = await supabase.from("events").insert(insert).single();
        if (error) {
            alert(error.message);
        } else {
            router.push(slug);
        }
    }

    async function update() {
        const insert = {
            name,
            slug,
            event_datetime: eventDateTime,
            organization: host,
            location,
            capacity,
            description,
            registration,
            ...(registration
                ? {
                    college_registration_datetime: collegeRegistration,
                    registration_datetime: registrationDatetime,
                    signup_size: signupSize,
                    waitlist_size: waitlistSize,
                }
                : {}),
        };

        const { error } = await supabase
            .from("events")
            .update(insert)
            .eq("slug", origSlug);
        if (error) {
            alert(error.message);
        } else {
            router.push(`/events/${slug}`);
        }
    }

    return (
        <div id="form">
            <Head>
                <title>Create Event Form</title>
                <meta name="eventcreate" content="Form for creating new event" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1 className="mx-3 text-2xl">
                    Create an Event
                </h1>
                <div>
                    <h2 className="mx-3 text-lg mt-2">
                        Event Details
                    </h2>
                    <div className="mx-3 divider"></div>
                </div>
                <form onSubmit={insert}>
                    <div className="px-2">
                        <div className="sm:flex">
                            <div className="form-control w-full max-w-xs mr-2">
                                <label className="label">
                                    <span>Name of event</span>
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    type="text"
                                    required
                                    className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary"
                                />
                            </div>
                            <div className="form-control w-full max-w-xs mr-2">
                                <label className="label">
                                    <span>Slug</span>
                                </label>
                                <input
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    type="text"
                                    required
                                    className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary"
                                />
                            </div>
                            <div className="form-control w-full max-w-xs">
                                <label className="label">
                                    <span>Date</span>
                                </label>
                                <input
                                    value={eventDateTime}
                                    onChange={(e) => setEventDateTime(e.target.value)}
                                    type="datetime-local"
                                    required
                                    className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="sm:flex">
                            <div className="form-control w-full max-w-xs mr-2">
                                <label className="label">
                                    <span className="hover:border-primary focus:outline-none focus:ring focus:ring-primary">
                                        Host
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary"
                                    onChange={(e) => {
                                        setHost(e.target.value);
                                    }}
                                >
                                    {props.orgs?.length > 0 ? (
                                        props.orgs.map((org) => (
                                            <option
                                                key={org.organization.id}
                                                value={org.organization.id}
                                            >
                                                {org.organization.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled key="null">
                                            You are not a part of any organizations
                                        </option>
                                    )}
                                </select>
                            </div>
                            <div className="form-control w-full max-w-xs mr-2">
                                <label className="label">
                                    <span>Location</span>
                                </label>
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    type="text"
                                    required
                                    className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary"
                                />
                            </div>
                            <div className="form-control w-full max-w-xs">
                                <label className="label">
                                    <span>Capacity</span>
                                </label>
                                <input
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.valueAsNumber)}
                                    type="number"
                                    onInput={(e) => {
                                        if (e.target.value < 1) {
                                            console.log("here")
                                            e.target.setCustomValidity('The capacity must be greater than 0.');
                                        } else {
                                            // input is fine -- reset the error message
                                            e.target.setCustomValidity('');
                                        }
                                    }}
                                    required
                                    className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="sm:flex">
                            <div className="form-control w-full max-w-xs mr-2">
                                <label className="label">
                                    <span>Description</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="textarea textarea-bordered max-w-xs h-24 hover:border-primary focus:outline-none focus:ring focus:ring-primary"
                                ></textarea>
                            </div>

                            <div className="form-control w-full max-w-xs mr-2">
                                <label className="label">
                                    <span>Cover Image</span>
                                </label>
                                <input type="file" className="file-input file-input-bordered file-input-primary w-full max-w-xs" />
                            </div>
                        </div>
                        <div className="sm:flex">
                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text mr-2">Allow registration?</span>
                                    <input
                                        checked={registration}
                                        onChange={(e) => setRegistration(e.target.checked)}
                                        type="checkbox"
                                        className="h-5 w-5 accent-primary border-primary dark:focus:ring-primary focus:ring-2 dark:bg-primary dark:border-primary checked:dark:bg-primary"
                                    />
                                </label>
                            </div>
                        </div>
                        <div className={`${registration ? "" : "hidden"}`}>
                            <div>
                                <h2 className="text-lg leading-10 normal-case font-family: inter font-medium">
                                    Registration Details
                                </h2>
                                <div className="mx-3 divider"></div>
                            </div>
                            <div className={`sm:flex`}>
                                <div className="form-control w-full max-w-xs mr-2">
                                    <label className="label">
                                        <span>
                                            Date registration opens for college members
                                        </span>
                                    </label>
                                    <input
                                        value={collegeRegistration}
                                        onChange={(e) => setCollegeRegistration(e.target.value)}
                                        required={registration}
                                        type="datetime-local"
                                        className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className={`sm:flex`}>
                                <div className="form-control w-full max-w-xs mr-2">
                                    <label className="label">
                                        <span>
                                            Date registration opens
                                        </span>
                                    </label>
                                    <input
                                        value={registrationDatetime}
                                        onChange={(e) => setRegistrationDatetime(e.target.value)}
                                        required={registration}
                                        type="datetime-local"
                                        className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary"
                                    />
                                </div>
                                <div className="form-control w-full max-w-xs mr-2">
                                    <label className="label">
                                        <span>Registration Maximum</span>
                                    </label>
                                    <input
                                        value={signupSize}
                                        onChange={(e) => setSignupSize(e.target.valueAsNumber)}
                                        required={registration}
                                        type="number"
                                        className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary"
                                    />
                                </div>
                                <div className="form-control w-full max-w-xs">
                                    <label className="label">
                                        <span>Waitlist Maximum</span>
                                    </label>
                                    <input
                                        value={waitlistSize}
                                        onChange={(e) => setWaitlistSize(e.target.valueAsNumber)}
                                        required={registration}
                                        type="number"
                                        className="input input-bordered w-full max-w-xs hover:border-primary focus:outline-none focus:ring focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <input
                                type="submit"
                                value="Submit"
                                className="btn btn-primary sm:float-right normal-case border-0"
                            />
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}

interface Organization {
    id: string;
    name: string;
}

async function getOrgs(supabase: SupabaseClient, userId: string): Promise<Organization[]> {
    const { data: orgs, error } = await supabase
        .from("organizations_admins")
        .select("organization ( id, name )")
        .eq("profile", userId);
    if (error) {
        throw error;
    }
    if (!orgs) {
        return [];
    }

    return orgs;
}

interface Event {
    name: string;
    slug: string;
    event_datetime: string;
    organization: string;
    location: string;
    capacity: number;
    description: string;
    registration: boolean;
    college_registration_datetime: string;
    registration_datetime: string;
    signup_size: number;
    waitlist_size: number;
}

async function getData(supabase: SupabaseClient, slug: string): Promise<Event> {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        throw error;
    }

    return data;
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
    const admin_status = await authorize(
        supabase,
        ctx.params.slug,
        session.user.id
    );

    //If not admin, redirect to event page
    if (!admin_status) {
        return {
            redirect: {
                destination: `http://${ctx.req.headers.host}/events/${ctx.params.slug}`,
                permanent: false,
            },
        };
    }
    //Get event data
    const data = await getData(supabase, ctx.params.slug);

    const orgs = await getOrgs(supabase, session.user.id);

    return {
        props: {
            initialSession: session,
            orgs,
            events: data,
            params: ctx.params,
        },
    };
};
