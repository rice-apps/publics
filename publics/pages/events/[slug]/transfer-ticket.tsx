import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {useEffect, useState} from "react";
import {
    SupabaseClient,
    createServerSupabaseClient,
  } from "@supabase/auth-helpers-nextjs";

async function getEventInfo(supabase: SupabaseClient, slug: string): Promise<Object> {
    const {data, error} = await supabase
    .from("events")
    .select("id, name")
    .eq("slug", slug)
    .single();

    if (error) {
        return "ERROR";
    }

    return {
        id: data?.id,
        name: data?.name
    };
}
async function isUserRegistered(supabase: SupabaseClient, user_id: string, event_id: string): Promise<boolean> {
    const {data, error} = await supabase
    .from("registrations")
    .select("waitlist")
    .eq("event", event_id)
    .eq("person", user_id);

    if (error || data.length < 1 || data[0].waitlist) {
        return false;
    }

    return true;
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

    //getting event id from slug
    const event_info: Object = await getEventInfo(supabase, ctx.params.slug);

    if (event_info["id"] === "ERROR") {
        return {
            redirect: {
              destination: `http://${ctx.req.headers.host}/events`,
              permanent: false,
            },
        };
    }
    //Checking if this user is actually registered for this event
    //Useful in case anyone wants to manually navigate to this page again after they've transferred tickets
    const is_registered = await isUserRegistered(supabase, session.user.id, event_info["id"]);

    if (!is_registered) {
        return {
            redirect: {
              destination: `http://${ctx.req.headers.host}/events`,
              permanent: false,
            },
        };
    }

    return {
        props: {
            params: ctx.params,
            user: session.user,
            event_info: event_info
        }
    };
}

/**
 * Gets and sets message to be displayed when a user tries to transfer a ticket
 * @param supabase
 * @param netID - net id of the person that we are trying to transfer the ticket to
 * @param setTranferMessage - setter function for the message we want to display
 * @param setTransfereeID - setter function for the UUID of the person that we are trying to transfer the ticket to
 */
async function getTransferMessage(supabase:SupabaseClient, netID: string, setTranferMessage, setTransfereeID) {
    const {data, error} = await supabase
    .from("profiles")
    .select(`
        id,
        first_name,
        last_name
    `)
    .eq("netid", netID)
    .single();

    if(!error) {
        setTranferMessage("Are you sure you want to transfer your ticket to " + data?.first_name + " " + data?.last_name + "?");
        setTransfereeID(data?.id);
    } else {
        setTranferMessage("There is no profile associated with that netID! Please make sure they have signed into the website already and that their netID is spelled correctly. If issues persist, send an email!")
        setTransfereeID("");
    }
}

/**
 * Updates the registration for the "from" user to be set to the "to" user
 * Has basic error checking to ensure that tickets can only be transferred once!
 * @param from - person sending the ticket
 * @param to - person receiving the ticket
 */
async function transferTicket(
    supabase: SupabaseClient, 
    from: string, to: string,
     event_id: string, 
     setTranferedTicketMessage,
     setCanTransfer) {

    if (from === to) {
        setTranferedTicketMessage("You can't transfer a ticket to yourself!")
        return
    }

    //is from already in the DB for this event?
    const transferee_info =  await supabase
    .from("registrations")
    .select("waitlist")
    .eq("person", to)
    .eq("event", event_id)
    .single();

    //if they're on the registrations table and they're on the waitlist then we can still transfer
    if(!transferee_info.error && transferee_info.data?.waitlist) {
        const deleted = await supabase
        .from("registrations")
        .delete()
        .eq("person", to)
        .eq("event", event_id);

        //if we can't delete that row then return
        if (deleted.error) {
            setTranferedTicketMessage("An error occured. Please try again; If the problems persist then please contact the dev team.")
            return;
        }
    }

    //update to's registration to hold from's id
    const {data, error} = await supabase
    .from("registrations")
    .update({person : to})
    .eq("event", event_id)
    .eq("person", from);

    if (error) {
        switch (error.code) {
            case "23505":
                setTranferedTicketMessage("Cannot transfer ticket as they are already registered for this event!")
                break;
            default:
                setTranferedTicketMessage("An error occured. Please try again; If the problems persist then please contact the dev team.") //Setting it to error m
        }
        return
    }

    setTranferedTicketMessage("Successfully Transferred Ticket!");
    setCanTransfer(false);

}

function TransferTicketPage(props) {
    const router = useRouter();
    const supabase: SupabaseClient = useSupabaseClient();
    //net id of the person who is being sent this ticket
    const [to, setTo] = useState<string>("");
    //UUID of the person who is being sent this ticket
    const [transfereeID, setTransfereeID] = useState<string>("");
    //message displayed in pop-up box after you click the transfer button
    const [transferMessage, setTransferMessage] = useState<string>("");
    //message displayed indicating success/failure of trying to transfer a ticket
    const [tranferedTicketMessage, setTranferedTicketMessage] = useState<string>("");
    //set to true when we try and actually transfer a ticket (i.,e when the transfer ticket button gets pressed)
    const [transferRequest, setTransferRequest] = useState<boolean>(false);
    //boolean indicating when the user is still able to transfer a ticket (this is set to false after they've already transfered a ticket)
    //used in making sure users don't try and transfer their own ticket twice
    const [canTransfer, setCanTransfer] = useState<boolean>(true);

    //makes backend call when a user tries to transfer
    useEffect(() => {
        getTransferMessage(supabase, to, setTransferMessage, setTransfereeID)
    }, [transferRequest]);

    return (
        
        <div className = "flex flex-col justify-center items-center m-5">
            <div className="card w-96 bg-base-100">
                <div className="card-body items-center text-center">
                    <h1>Transfer Tickets for {props.event_info["name"]}</h1>
                    <div className="form-control w-full max-w-xs">
                        <input type="text" placeholder="Enter NetID here" onChange={(e) => setTo(e.target.value)} className="input input-bordered w-full max-w-xs" />
                        <label className="label">
                            <span className="label-text-alt">Net ID</span>
                        </label>
                    </div>
                    <div className="card-actions justify-end">
                    <label htmlFor="transfer-modal" className="btn btn-primary" onClick = {() => setTransferRequest(true)}>Transfer Ticket</label>
                <input type="checkbox" id="transfer-modal" className="modal-toggle" />
                <div className="modal">
                    <div className="modal-box">
                        <h1 className="font-bold text-lg">{transferMessage}</h1>
                        <div className="modal-action">
                        <label htmlFor="transfer-modal" className="btn btn-outline btn-primary" onClick = {() => {setTransferRequest(false); setTranferedTicketMessage("")}}>Cancel</label>
                        <label htmlFor="transfer-modal" className="btn btn-primary" onClick = {() => {
                                if (!canTransfer) {
                                    setTranferedTicketMessage("You are unable to transfer at this time!")
                                }
                                else {
                                    transferTicket(supabase, props.user.id, transfereeID, props.event_info["id"], setTranferedTicketMessage, setCanTransfer)
                                }
                                setTransferRequest(false);
                            }
                        }>Transfer</label>
                        </div>
                    </div>
                    </div>
                        <button className="btn btn-ghost" onClick={() => router.push("/events")}>Go Back</button>
                        </div>
                    </div>
                </div>
            <div>
            </div>
                <div className = "card w-96 bg-base m-5">
                    <span className = "font-bold text-center">
                        {tranferedTicketMessage}
                    </span>
                </div>
        </div>
    )   
}

export default TransferTicketPage;