import { redirect_url } from "../utils/admin"
import {
    SupabaseClient,
    createServerSupabaseClient,
  } from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import {useState} from "react";
/**
 * Simple type containing info about a college
 */
type CollegeDetails = {
    id: string,
    name: string
}

/*
* Simple backend call that gets a list of all the colleges and their UUID's
*/
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

    /* Checks if the current user is a super admin, if they aren't then boot them from the page */
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
    //college that the superadmin selects to add a social to 
    const [selectedEvent, setSelectedEvent] = useState<string>("None");
    //netid of the person the superadmin is trying to make a social
    const [netID, setNetID] = useState<string>("None");
    //UUID of the supabase entry associated with netid
    const [supabaseProfileID, setSupabaseProfileID] = useState<string>("");
    //Text displayed on modals that pops up when a superadmin tries to add a social
    const [modalText, setModalText] = useState<string>("Loading...")
    const [removeModalText, setRemoveModalText] = useState<string>("Loading...");
    //Text that gets below normal inputs. This indicates the success/failure of whatever you just tried to do
    const [actionStatusText, setActionStatusText] = useState<string>("");

    /*
    * Handles input from user and populates modal with appropriate text. 
    * I.e. if the superadmin puts in a bad netID this will indicate as such on the modal that pops up 
    */
    async function handleAddSocial(props, supabase, selectedEvent: string, netID: string, setModalText, setSupabaseProfileID) {
        const profile_data = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("netid", netID)
        .single();

        if (profile_data.error) {
            setModalText("There is no profile associated with that netID!")
            setSupabaseProfileID("");   
            return;
        }

        setSupabaseProfileID(profile_data.data.id);

        let event_name = props.colleges.filter(datum => datum.id == selectedEvent);
        if (event_name.length == 0) {
            setModalText("Please select an event!")
            return;
        }

        let full_name = profile_data.data.first_name + " " + profile_data.data.last_name;

        setModalText("Are you sure you want to add " + full_name + " as an admin for " + event_name[0].name + "?");
    }

    /*
    * Handles input from user and populates modal with appropriate text. 
    * I.e. if the superadmin puts in a bad netID this will indicate as such on the modal that pops up 
    */
    async function handleRemoveSocial(props, supabase, selectedEvent: string, netID: string, setModalText, setSupabaseProfileID) {
        const profile_data = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("netid", netID)
        .single();

        if (profile_data.error) {
            setModalText("There is no profile associated with that netID!")
            setSupabaseProfileID("");
            return;
        }

        setSupabaseProfileID(profile_data.data.id);

        let event_name = props.colleges.filter(datum => datum.id == selectedEvent);
        if (event_name.length == 0) {
            setModalText("Please select an event!")
            return;
        }

        let full_name = profile_data.data.first_name + " " + profile_data.data.last_name;

        setModalText("Are you sure you want to remove " + full_name + " as an admin for " + event_name[0].name + "?");
    }

    /*
    * Populates backend with new social that the superadmin selected
    */
    async function addSocial(supabase, supabaseProfileID: string, selectedEvent: string, setActionStatusText) {
        /* Checks if this person is already an admin for this event */
        const is_already_there = await supabase
        .from("organizations_admins")
        .select("id")
        .eq("profile", supabaseProfileID)
        .eq("organization", selectedEvent);

        if(is_already_there.error) {
            setActionStatusText("An error occured. Check your inputs and please try again!");
            return;
        }

        if (is_already_there.data.length > 0) {            
            setActionStatusText("That person is already an admin for the selected college!");
            return;
        }
        /* Uploads the user to be an admin for the given event */
        const {data, error} = await supabase.from("organizations_admins")
        .upsert({"profile" : supabaseProfileID, "organization" : selectedEvent});

        console.log(supabaseProfileID)
        console.log(data);

        if (error) {
            console.log(error)
            setActionStatusText("Could not successfully add social to this event. Please try again. If the issue persists, please email us.")
            return;
        }
        
        setActionStatusText("Successfully added social!")
    }

    /*
    * Populates backend with new social that the superadmin selected
    */
    async function RemoveSocial(supabase, supabaseProfileID: string, selectedEvent: string, setActionStatusText) {
        /* Checks if this person is already an admin for this event */
        const is_already_there = await supabase
        .from("organizations_admins")
        .select("id")
        .eq("profile", supabaseProfileID)
        .eq("organization", selectedEvent);

        if(is_already_there.error) {
            setActionStatusText("An error occured. Check your inputs and please try again!");
            return;
        }

        if (is_already_there.data.length == 0) {            
            setActionStatusText("That person is not currently a social for this event!");
            return;
        }
        /* Remove the user as a social for the given event */
        const {data, error} = await supabase.from("organizations_admins")
        .delete()
        .eq("profile", supabaseProfileID)
        .eq("organization", selectedEvent);

        if (error) {
            console.log(error)
            setActionStatusText("Could not successfully remove social to this event. Please try again. If the issue persists, please email us.")
            return;
        }
        
        setActionStatusText("Successfully removed social!")
    }


    return (
        <div>
            <div className="flex max-w-full items-center justify-center mt-3">
                <input type="text" placeholder="Enter netID here" className="input input-bordered w-25 mr-3" onChange = {(e) => setNetID(e.target.value)} />
                <select className="select select-primary w-full max-w-xs mr-3" onChange = {(e) => setSelectedEvent(e.target.value)} >
                    <option disabled selected>Select Event Here</option>
                    {props.colleges.map(datum => {
                        return <option value = {datum.id}>{datum.name}</option>
                    })}
                </select>
                <label htmlFor="add-social-modal" className="btn btn-primary mr-3" onClick = {() => handleAddSocial(props, supabase, selectedEvent, netID, setModalText, setSupabaseProfileID)}>Add Social</label>
                <label htmlFor="remove-social-modal" className="btn" onClick = {() => handleRemoveSocial(props, supabase, selectedEvent, netID, setRemoveModalText, setSupabaseProfileID)}>Remove Social</label>
            </div>

            <input type="checkbox" id="add-social-modal" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box">
                    <div><h4>{modalText}</h4></div>
                    <div className = "flex items-end justify-end mt-5">
                        <label htmlFor="add-social-modal" className="btn btn-primary mr-3" onClick = {() => {addSocial(supabase, supabaseProfileID, selectedEvent, setActionStatusText); setModalText("Loading...")}}>Add Social</label>
                        <label htmlFor="add-social-modal" className="btn" onClick = {() => {setModalText("Loading..."); setActionStatusText("")}}>Cancel</label>
                    </div>
                </div>
            </div>
            <input type="checkbox" id="remove-social-modal" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box">
                    <div><h4>{removeModalText}</h4></div>
                    <div className = "flex items-end justify-end mt-5">
                        <label htmlFor="remove-social-modal" className="btn btn-primary mr-3" onClick = {() => {RemoveSocial(supabase, supabaseProfileID, selectedEvent, setActionStatusText); setRemoveModalText("Loading...")}}>Remove Social</label>
                        <label htmlFor="remove-social-modal"  className="btn" onClick = {() => {setRemoveModalText("Loading..."); setActionStatusText("")}}>Cancel</label>
                    </div>
                </div>
            </div>
            <div className = "flex items-center justify-center mt-10"><h4>{actionStatusText}</h4></div>
        </div>
    );
  }

  export default addSocials;