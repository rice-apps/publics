import { supabase } from '../../utils/db'
import { GetServerSideProps } from 'next'
import { render } from 'react-dom';
import { useEffect, useState } from 'react';

type EventDetails = {
    eventName: string,
}

interface rowObject {
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
    const [event, setEvent] = useState("");

    //Gets the public that the user accessing this page is an admin of
    async function getPublic() {
        //TODO populate this with data that uses the auth of the person using this site
        //Find the event that this person is an admit of and return it
        return 'afdbe8da-f2cd-47a2-848c-6c5aa891b881';
    };
    //Gets the set of registrations for the given event
    async function getRegistrations(event: string) {
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
            //Throw bigger error
            console.log(error)
            return formatted_data;
        }
        
        for(var i = 0; i < data.length; i++) {
            var current_object = data[i];
            var profiles = current_object["profiles"] as Object;
            if (profiles == null) {
                return []
            }
            //TODO fix this, typescript for some reason doesn't think that I can index the profiles object with the given keys
            //ERROR Element implicitly has an 'any' type because expression of type '"created_at"' can't be used to index type 'Object'. Property 'created_at' does not exist on type 'Object'
            var formatted_object = {
                "created_at" : new Date(current_object["created_at"]).toLocaleString(),
                "first_name" : Object.values(profiles)[1],
                "last_name" : Object.values(profiles)[2],
                "email" : Object.values(profiles)[4] + "@rice.edu",
                "netid" :  Object.values(profiles)[4],
                "college" : Object.values(profiles)[3],
            }

            formatted_data[i] = formatted_object;
        }

        return formatted_data;
    }; 

    //Getting the public
    getPublic().then((value) => {
        if(value != null) {
            getRegistrations(value).then((value) => {
                setLoading(false)
                setRegistrations(value)
            })
        }
    })

    if (loading) return <div>Loading...</div>

    return (
        <div key = "registration_results_page">
            <div key = "event_title">
                <h1>{props.eventName}: Event Results</h1>
            </div>
            <div className="btn-group btn-group-vertical lg:btn-group-horizontal">
                <button className="btn">Copy Emails</button>
                <button className="btn">Add Attendee</button>
            </div>
            <div className="overflow-x-auto">
            <table className="table table-compact w-full">
                <thead>
                <tr>
                    <th></th> 
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
function Page() {
    return (
        <div>
            <ResultPage eventName={"Sid 80's"}></ResultPage>
        </div>
    );
}

export default Page;