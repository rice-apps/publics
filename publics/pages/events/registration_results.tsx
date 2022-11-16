import { supabase } from '../../utils/db'
import { GetServerSideProps } from 'next'
import { render } from 'react-dom';
import { useEffect, useState } from 'react';
import { createServerSupabaseClient} from '@supabase/auth-helpers-nextjs';

//Simple type holding necessary details for an event
type EventDetails = {
    eventName: string,
}

//Simple type holding values to be put into a row
interface rowObject {
    person_id: string,
    created_at : string,
    first_name : string,
    last_name : string,
    email : string,
    netid : string,
    college: string,
}


function ResultPage(props: EventDetails) {
 
    const [loading, setLoading] = useState(true)
    const [registrations, setRegistrations] = useState<rowObject[]>([]);
    let event = "";
    let emails: string[] = [];
    //netID used in adding an attendee
    let netID = "";

    
    //Gets the public that the user accessing this page is an admin of
    //TODO
    async function getEvent() {
        //TODO populate this with data that uses the auth of the person using this site

        //Find the event that this person is an admit of and return it
        //still returns null
        //const {data, error} = await supabase.auth.getUser();
        //console.log(data)
        const event_id = '239e8d30-f3ad-4a52-8834-7973324004f1';
        event = event_id;
    };


    //Gets the set of registrations for the given event
    //Returns the an array of rowObject that is taken from data from the backend
    async function getRegistrations(event: string) {
        await getEvent();
        //Holds emails of registered people, used when copying to clipboard
        let email_arr = [];
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
        .eq('event', event)
        
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

            email_arr.push(Object.values(profiles)[4] + "@rice.edu");

            formatted_data[i] = formatted_object;
        }

        emails = email_arr

        return formatted_data;
    }; 

    //Copies emails to clipboard
    function copyEmails() {
        navigator.clipboard.writeText(emails.join(' '))
    }

    //Adds an attendee to the backend
    async function addAttendee(netID: string) {
        //TODO figure out query to add attendee given only netID

        //refresh table after adding attendee
        setLoading(true);
    }

    //Removes an attendee given their UUID from this event
    async function removeAttendee(user_id: string) {
        // const res = await supabase.
        // from("registrations")
        // .delete()
        // .match({"event": event})
        // .match({"person": user_id});

        // //Updates table after removing person
        // setLoading(true);
        //refreshing table after adding attendee
        setLoading(true);
    }

    getRegistrations(event).then((registrations) => {
        setLoading(false)
        setRegistrations(registrations)
    });

    //Getting registration table on first render
    //update_registration_table();

    if (loading) return <div>Loading...</div>

    return (
        <div key = "registration_results_page">
            <div key = "event_title">
                <h1>{props.eventName}: Event Results</h1>
            </div>
            <div className="btn-group btn-group-vertical lg:btn-group-horizontal">
                <button className="btn" onClick={copyEmails()}>Copy Emails</button>
                <label htmlFor="my-modal" className="btn">Add Attendee</label>
                <input type="checkbox" id="my-modal" className="modal-toggle" />
                <div className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Add attendee</h3>
                    <div className="form-control w-full max-w-xs">
                    <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" onChange={(event) => netID = event.target.value}/>
                    <label className="label">
                        <span className="label-text-alt">netID</span>
                    </label>
                    </div>
                    <div className="modal-action">
                        <label htmlFor="my-modal" className="btn">Cancel</label>
                        <label htmlFor="my-modal" className="btn btn-primary" onClick={(addAttendee(netID))}>Add</label>
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
                        registrations.map((row, index) => {
                            return <tr key = {index}>
                            <th></th>
                            <td>
                                <label htmlFor="my-modal" className="btn btn-square">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </label>
                                <input type="checkbox" id="my-modal" className="modal-toggle" />
                                <div className="modal">
                                <div className="modal-box">
                                    <h3 className="font-bold text-lg">Are you sure you want to remove {row["first_name"] + " " + row["last_name"] + "?"}</h3>

                                    <div className="modal-action">
                                        <label htmlFor="my-modal" className="btn">Cancel</label>
                                        <label htmlFor="my-modal" className="btn btn-primary" onClick={removeAttendee(row["person_id"])}>Remove</label>
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

//Used for testing purposes
//TODO change this to ResultPage() and use the slug or some other mechanism to get the event
function Page() {
    return (
        <div>
            <ResultPage eventName={"Sid80s"}></ResultPage>
        </div>
    );
}

export default Page;