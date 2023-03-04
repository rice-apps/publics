import { redirect_url } from "../utils/admin"
import {
    SupabaseClient,
    createServerSupabaseClient,
  } from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import {useState} from "react";
import { profile } from "console";
import { env } from "process";

/**
 * Simple type containing info about a college
 */
type CollegeDetails = {
    id: string,
    name: string
}

async function getColleges(supabase): Promise<CollegeDetails[]> {
    let colleges: CollegeDetails[] = [];

    const {data, error} = await supabase
    .from("organizations")
    .select(`
        id,
        name
    `
    );

    if(error) {
        console.log(error)
        return colleges;
    }

    data.forEach(datum => {
        colleges.push(
            {
            "id" : datum.id,
            "name" : datum.name
            }
        )
    });


    return colleges;
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
                destination: `http://${ctx.req.headers.host}${redirect_url}`,
                permanent: false,
            },
        }
    }

    const is_superadmin = await supabase.from("superadmins").select("*").eq("profile", session.user.id).single();
    
    if(!is_superadmin.data || is_superadmin.data.length < 1) {
        return {
            redirect: {
                destination: `http://${ctx.req.headers.host}${redirect_url}`,
                permanent: false,
            },
        }
    }

    const colleges: CollegeDetails[] = await getColleges(supabase);
    
    return {
        props: {
            colleges,
        },
    }
}

  function addSocials(props) {
    const supabase = useSupabaseClient();
    const [selectedEvent, setSelectedEvent] = useState<string>("None");
    const [netID, setNetID] = useState<string>("None");
    const [supabaseProfileID, setSupabaseProfileID] = useState<string>("");
    const [modalText, setModalText] = useState<string>("Loading...")
    const [actionStatusText, setActionStatusText] = useState<string>("");

    async function handleAddSocial(props, supabase, selectedEvent: string, netID: string, setModalText, setSupabaseProfileID) {
        const profile_data = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("netid", netID)
        .single();

        if (profile_data.error) {
            setModalText("There is no profile associated with that netID!")
            return;
        }

        setSupabaseProfileID(profile_data.data.id);

        let event_name = props.colleges.filter(datum => datum.id == selectedEvent);
        if (event_name.length == 0) {
            setModalText("Please select an event!")
            return;
        }

        let full_name = profile_data.data.first_name + " " + profile_data.data.last_name;

        setModalText("Are you sure you want to set " + full_name + " as an admin for " + event_name[0].name + "?");
    }

    async function addSocial(supabase, supabaseProfileID: string, selectedEvent: string, setActionStatusText) {
        /* Checks if this person is already an admin for this event */
        const is_already_there = await supabase
        .from("organizations_admins")
        .select("id")
        .eq("profile", supabaseProfileID)
        .eq("organization", selectedEvent);

        if (is_already_there.data.length > 0) {            
            setActionStatusText("That person is already an admin for the selected college!");
            return;
        }
        /* Uploads the user to be an admin for the given event */
        const {data, error} = await supabase.from("organizations_admins")
        .upsert({"profile" : supabaseProfileID, "organization" : selectedEvent});

        if (error) {
            console.log(error)
            setActionStatusText("Could not successfully add social to this event. Please try again. If the issue persists, please email us.")
            return;
        }
        
        setActionStatusText("Successfully added social!")
    }

    return (
        <div>
            <div className="flex max-w-full items-center justify-center">
                <input type="text" placeholder="Enter netID here" className="input input-bordered w-25 mr-3" onChange = {(e) => setNetID(e.target.value)} />
                <select className="select select-primary w-full max-w-xs mr-3" value = {selectedEvent} onChange = {(e) => setSelectedEvent(e.target.value)} >
                    <option disabled selected>Select Event Here</option>
                    {props.colleges.map(datum => {
                        return <option value = {datum.id}>{datum.name}</option>
                    })}
                </select>
                <label htmlFor="add-social-modal" className="btn btn-primary" onClick = {() => handleAddSocial(props, supabase, selectedEvent, netID, setModalText, setSupabaseProfileID)}>Add Social</label>
            </div>

            <input type="checkbox" id="add-social-modal" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box">
                    <div><h4>{modalText}</h4></div>
                    <label htmlFor="add-social-modal" className="btn mr-3" onClick = {() => {addSocial(supabase, supabaseProfileID, selectedEvent, setActionStatusText); setModalText("Loading...")}}>Add Social</label>
                    <label htmlFor="add-social-modal" className="btn" onClick = {() => {setModalText("Loading..."); setActionStatusText("")}}>Exit</label>
                </div>
            </div>
            <div><h4>{actionStatusText}</h4></div>
        </div>
    );
  }

  export default addSocials;