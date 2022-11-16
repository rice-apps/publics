import { supabase } from '../../utils/db'
import { useEffect, useState } from 'react';
/**
 * Simple type containing a friendly name for an event, and the UUID of the event
 */
type EventDetails = {
    //friendly name
    eventName: string,
    //uuid of event
    eventID: string, //Using string as unsure what UUID type is in TS
}

/**
 * Simple interface containing values stored within a row in the table of registrations presented to the userp
 */
interface rowObject {
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
}

/**
 * Page holding registration results. Check figma for design source
 */
function ResultPage() {
 
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
    let email_arr: string[] = [];
    
    /**
     * Gets the event that this user is an admin of, if they are one
     * @returns Event Details corresponding to said event
     */
    async function getEvent(): Promise<EventDetails> {
        //TODO populate this with data that uses the auth of the person using this site

        //Find the event that this person is an admit of and return it
        //still returns null
        //const {data, error} = await supabase.auth.getUser();
        //console.log(data)

        //Dummy data
        return {
            eventName: "sid80s", 
            eventID: '239e8d30-f3ad-4a52-8834-7973324004f1'
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
                profiles (
                    id,
                    first_name,
                    last_name,
                    college,
                    netid
                )
            `)
            .eq('event', event_detail.eventID)
        
        //Holds data reformatted as array of rowobjects
        let formatted_data: rowObject[] = []

        if (error) {
            //TODO Throw bigger error
            console.log("GOT ERROR:")
            console.log(error)
            return formatted_data;
        }
        
        for(var i = 0; i < data.length; i++) {
            var current_object = data[i];
            var profiles = current_object["profiles"] as Object;
            if (profiles == null) {
                return []
            }
            //TODO fix this, I don't understand typescript and for some reason it doesn't think that I can index the profiles object with the given keys
            var formatted_object = {
                "person_id" : current_object["person"],
                "created_at" : new Date(current_object["created_at"]).toLocaleString(),
                "first_name" : Object.values(profiles)[1],
                "last_name" : Object.values(profiles)[2],
                "email" : Object.values(profiles)[4] + "@rice.edu",
                "netid" :  Object.values(profiles)[4],
                "college" : Object.values(profiles)[3],
            }

            //Appending email to global email array
            email_arr.push(Object.values(profiles)[4] + "@rice.edu");

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
     * @param netID 
     */
    async function addAttendee(netID: string) {
        //Get UUID of user by netID
        const {data, error} = await supabase
        .from("profiles")
        .select("id")
        .eq("netid", netID)
        .single();

        if(!error) {
            let personID = data!.id;

            //ERROR: Runs into Row level security error here
            //Insert person into registrations table for this event
            const res = await supabase
            .from("registrations")
            .insert({"event" : eventDetails!.eventID, "person": personID})
            .select();

            console.log(res);

            setLoading(true);
        } else {
            //TODO throw bigger error!
            console.log(error)
        }
    }

    /**
     * Unregisters attendee from this event. Updates backend and refreshes page
     * @param user_id 
     */
    async function removeAttendee(user_id: string) {
        const res = await supabase.
        from("registrations")
        .delete()
        .match({"event": eventDetails?.eventID})
        .match({"person": user_id});

        console.log(res);
        setLoading(true);
    }

    /**
     * Initial call that populates page
     */
    if (loading) {
        //Get the event, and then get registrations for that event. Set state once data is available.
        getEvent().then((event_detail) => {
            getRegistrations(event_detail).then((registrations) => {
                //Get the event we are looking at
                setEventDetails(event_detail)
                //Get the registrations for that event
                setRegistration(registrations)
                //Stop loading
                setEmails(email_arr)
                setLoading(false)
            });
        })
    }

    if (loading) return <div>Loading...</div>

    return (
        <div key = "registration_results_page">
            <div key = "event_title">
                <h1>{eventDetails!.eventName}: Registration Results</h1>
            </div>
            <div className="btn-group btn-group-vertical lg:btn-group-horizontal">
                <button className="btn" onClick={copyEmails}>Copy Emails</button>
                <label htmlFor="add-modal" className="btn">Add Attendee</label>
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
                        <label htmlFor="add-modal" className="btn">Cancel</label>
                        <label htmlFor="add-modal" className="btn btn-primary" onClick={() => {addAttendee(netID)}}>Add</label>
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
                            return <tr key = {index}>
                            <th></th>
                            <td>
                                <label htmlFor="remove-modal" className="btn btn-square">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </label>
                                <input type="checkbox" id="remove-modal" className="modal-toggle" />
                                <div className="modal">
                                <div className="modal-box">
                                    <h3 className="font-bold text-lg">Are you sure you want to remove {row["first_name"] + " " + row["last_name"] + "?"}</h3>

                                    <div className="modal-action">
                                        <label htmlFor="remove-modal" className="btn">Cancel</label>
                                        <label htmlFor="remove-modal" className="btn btn-primary" onClick={() => removeAttendee(row["person_id"])}>Remove</label>
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
                            <td><input type="checkbox" className="checkbox checkbox-primary" /></td>
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