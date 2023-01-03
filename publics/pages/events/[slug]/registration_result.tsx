import { supabase } from '../../../utils/db'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
//import ErrorMsg from './ErrorMsg';

/**
 * Simple type containing a friendly name for an event, and the UUID of the event
 */
type EventDetails = {
    //friendly name
    eventName: string,
    //uuid of event
    eventID: string, //Using string as unsure what UUID type is in TS
    organization: string, //Organization ID overseeing this event
}

/**
 * Simple interface containing values stored within a row in the table of registrations presented to the userp
 */
type rowObject =  {
    //uuid of person
    person_id: string,
    //date this registration was created
    created_at : string,
    //first name of registered person
    first_name : string,
    //last name of registered person
    last_name : string,
    //email of registered person
    email : string,
    //netid of registered
    netid : string,
    //residential college that that registered person is contained within
    college: string,
    picked_up_wristband: boolean,
}

/**
 * Used to reliably get slug and avoid first render problems
 * Will probably be used later for loading other data
 * @param context - default paramater for server side props
 * @returns props holding the slug
 */
export async function getServerSideProps(context) {
    return {
      props: {params: context.params}
    };
  }

/**
 * Page holding registration results. Check figma for design source
 */
function ResultPage(props) {
    //is the data for this page loading still loading?
    const [loading, setLoading] = useState(true)
    //Array of registration entries formatted as an array of row objects
    const [registration, setRegistration] = useState<rowObject[]>([]);
    //Event details for this page
    const [eventDetails, setEventDetails] = useState<EventDetails>();
    //netID of user to add to registration table, used with the add attendee button
    const [netID, setNetID] = useState("");
    //array of emails presented within the registration table, used to copy emails to clipboard
    const [emails, setEmails] = useState<string[]>([]);

    const [rError, setError] = useState(false);

    const router = useRouter();

     /**
     * Initial call that populates page
     */
    async function getData() {
        //Get event details
        const event_detail = await getEvent();
        //Get admin status
        const admin_status = await isAdminUser(event_detail);
        //If not admin, redirect to 404 page
        if (!admin_status) {
            router.push("/404");
            return
        }
        //Get registrations for that event
        const registrations = await getRegistrations(event_detail);
        // //Set event details
        setEventDetails(event_detail);
        // //Set registrations
        setRegistration(registrations);
        //Stop loading
        setLoading(false);
    }

    
    useEffect(() => {
        if (props.user) {
          getData();
        }
        }, [props]);

    // Setup realtime for updates to registration table
    useEffect(() => {
        supabase
          .channel(`registrations:${props.params.slug}`)
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "registrations" },
            (payload) => {
              setRegistration((prev) => {
                let new_arr = prev.map((item) => {
                  if (item.person_id == payload.new.person) {
                    return {
                      ...item,
                      picked_up_wristband: payload.new.picked_up_wristband,
                    };
                  }
                  return item;
                });
                return new_arr;
              });
            }
          )
          .subscribe();
      }, []);

    async function isAdminUser(event_detail: EventDetails): Promise<boolean> {
            let {data, error} = await supabase
            .from("organizations_admins")
            .select("organization")
            .eq("profile", props.user.id);

            if(error || data === null) {
                return false;
            }
    
            for(let i = 0; i < data.length; i++) {
                if(event_detail!.organization == data[i].organization) {
                    return true;
                }
            }
        return false;
    }
     /**
     * Gets the event that this user is an admin of, if they are one
     * @returns Event Details corresponding to said event
     */
    async function getEvent(): Promise<EventDetails> {
        const {data, error} = await supabase
        .from("events")
        .select("id, organization")
        .eq("slug", props.params.slug)
        .single();

        if (error) {
            router.push("/404")
        }

        return {
            eventName: props.params.slug,  
            eventID: data!.id,
            organization: data!.organization
        }

    };

    /**
     * Gets registrations from backend for appropriate event and reformats them into an array of row objects
     * @param event_detail - information for the event we want to get information for
     * @returns Array of row objects based on registration table on backend
     */
    async function getRegistrations(event_detail: EventDetails): Promise<rowObject[]> {
        //Gets raw backend data corresponding to our event
        const {data, error} = await supabase.
            from("registrations")
            .select(`
                person,
                created_at,
                picked_up_wristband,
                profiles (
                    id,
                    first_name,
                    last_name,
                    organizations (
                        name
                    ),
                    netid
                )
            `)
            .eq('event', event_detail.eventID)
        
        //Holds data reformatted as array of rowobjects
        let formatted_data: rowObject[] = []

        if (error) {
            console.log("GOT ERROR:")
            console.log(error)
            router.push("/404")
            return formatted_data;
        }
        
        for(var i = 0; i < data.length; i++) {
            let current_object = data[i];
            let profiles = current_object["profiles"] as Object;

            if (profiles == null) {
                return []
            }

            let formatted_object = {
                "person_id" : current_object["person"],
                "created_at" : new Date(current_object["created_at"]!).toLocaleString(),
                "first_name" : profiles["first_name"],
                "last_name" : profiles["last_name"],
                "email" : profiles["netid"] + "@rice.edu",
                "netid" :  profiles["netid"],
                "college" : profiles["organizations"].name,
                "picked_up_wristband" : current_object["picked_up_wristband"]
            }

            //Appending email to global email array
            setEmails(
                (prev) => {
                    return [...prev, profiles["netid"] + "@rice.edu"]
                }
            )

            formatted_data[i] = formatted_object;
        }
        
        return formatted_data;
    }; 

    /**
     * Copies set of emails to clipboard
     */
    function copyEmails() {
        navigator.clipboard.writeText(emails!.join(' '))
    }

    /**
     * Registers attendee to this event given an inputted netID
     * @param netID - you know what this is
     */
    async function addAttendee(netID: string) {
        //Get UUID of user by netID
        const {data, error} = await supabase
        .from("profiles")
        .select("id")
        .eq("netid", netID)
        .single();
        console.log(supabase.auth);

        if(!error) {
            let personID = data!.id;

            //ERROR: Runs into Row level security error here
            //Insert person into registrations table for this event
            const res = await supabase
            .from("registrations")
            .insert({"event" : eventDetails!.eventID, "person": personID})
            .select();

            //refresh page
            setRegistration(await getRegistrations(eventDetails!));
            return(
                <div className="alert alert-success shadow-lg">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>User successfully added!</span>
                    </div>
                </div>
            )


        } else {
            console.log("Got error")
            console.log(error)
            setError(true)
            /*
            return(
                <div className="alert alert-error shadow-lg">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Error! User already added or does not exist.</span>
                    </div>
                </div>
            )*/
        }

    }

    /**
     * Unregisters attendee from this event. Updates backend and refreshes page
     * @param user_id 
     */
    async function removeAttendee(user_id: string) {
        const res = await supabase.
        from('registrations')
        .delete()
        .eq('event', eventDetails?.eventID)
        .eq('person', user_id)
        .select();

        if (!res) {
            console.log("ERROR in removing attendee")
            console.log(res)
            setError(true)

        }

        //refresh page
        setRegistration(registration.filter((v, i) => v.person_id !== user_id));
    }

    /**
     * Updates backend on status of a registered person having picked up their wristband
     * @param row - row object holding information so that we can uniquely find the correct registration in the database
     */
    async function updateWristband(row: rowObject) {
        const {error} = await supabase.from("registrations")
        .update({picked_up_wristband : !row["picked_up_wristband"]})
        //Ensuring we only update the person who is registered for this event
        .eq("event", eventDetails?.eventID)
        .eq("person", row["person_id"]);

        if(error) {
            console.log(error)
        }
    }

    if(props.user === undefined || loading) {
        return (<div>Loading...</div>)
    }

    return (
        <div key = "registration_results_page" className="mx-auto mx-4 space-y-4">
            <div key = "event_title">
                <h1>{eventDetails!.eventName}: Registration Results</h1>
            </div>
            <div className="flex justify-end gap-4">
                <button className="btn btn-outline btn-primary" onClick={copyEmails}>Copy Emails</button>
                <label htmlFor="add-modal" className="btn btn-primary">Add Attendee</label>
                <input type="checkbox" id="add-modal" className="modal-toggle" />
                <div className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Add attendee</h3>
                    <div className="form-control w-full max-w-xs">
                    <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" onChange={(event) => setNetID(event.target.value)}/>
                    <label className="label">
                        <span className="label-text-alt">netID</span>
                    </label>
                    </div>
                    <div className="modal-action">
                        <label htmlFor="add-modal" className="btn btn-outline btn-primary">Cancel</label>
                        <label htmlFor="add-modal" className="btn btn-primary" onClick={() => {addAttendee(netID)}}>Add</label>
                        <div className={rError ? "block" : "hidden"}>
                            <div className="alert alert-error shadow-lg">
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>Error! User already added or does not exist.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            <div className="overflow-x-auto">
            <table className="table table-compact w-full">
                <thead>
                <tr>
                    <th></th> 
                    <th>Remove?</th>
                    <th>Date and Time</th> 
                    <th>First Name</th> 
                    <th>Last Name</th> 
                    <th>Email Address</th> 
                    <th>NetID</th> 
                    <th>Residential College</th>
                    <th>Wristband?</th>
                </tr>
                </thead> 
                <tbody>
                {
                        registration.map((row, index) => {
                            let isChecked = row["picked_up_wristband"];
                            return <tr key = {index}>
                            <th></th>
                            <td>
                                <label htmlFor={index.toString()} className="btn btn-square">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </label>
                                <input type="checkbox" id={index.toString()} className="modal-toggle" />
                                <div className="modal">
                                <div className="modal-box">
                                    <h3 className="font-bold text-lg">Are you sure you want to remove {row["first_name"] + " " + row["last_name"] + "?"}</h3>

                                    <div className="modal-action">
                                        <label htmlFor={index.toString()} className="btn btn-outline btn-primary">Cancel</label>
                                        <label htmlFor={index.toString()} className="btn btn-primary" onClick={() => removeAttendee(row["person_id"])}>Remove</label>
                                    </div>
                                </div>
                                </div>
                            </td>
                            <td>{row["created_at"]}</td>
                            <td>{row["first_name"]}</td>
                            <td>{row["last_name"]}</td>
                            <td>{row["email"]}</td>
                            <td>{row["netid"]}</td>
                            <td>{row["college"]}</td>
                            <td><input type="checkbox" className = "checkbox" checked = {isChecked} onChange = {(e) => updateWristband(row)}/></td>
                        </tr>
                        })
                }
                </tbody> 
            </table>
            </div>
        </div>
    );

}

export default ResultPage;
