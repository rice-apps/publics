import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {useEffect, useState} from "react";
import {
    SupabaseClient,
    createServerSupabaseClient,
  } from "@supabase/auth-helpers-nextjs";

async function getEventID(supabase: SupabaseClient, slug: string): Promise<string> {
    const {data, error} = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .single();

    if (error) {
        return "ERROR";
    }

    return data?.id;
}
async function isUserRegistered(supabase: SupabaseClient, user_id: string, event_id: string): Promise<boolean> {
    const {data, error} = await supabase
    .from("registrations")
    .select("*")
    .eq("event", event_id)
    .eq("person", user_id);

    if (error || data.length < 1) {
        return false;
    }

    return true;
}

export const getServerSideProps = async (ctx) => {
    /*
    session stuff might be useless
    */
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
    const event_id: string = await getEventID(supabase, ctx.params.slug);

    if (event_id === "ERROR") {
        return {
            redirect: {
              destination: `http://${ctx.req.headers.host}/events`,
              permanent: false,
            },
        };
    }
    //Checking if this user is actually registered for this event
    //Useful in case anyone wants to manually navigate to this page again after they've transferred tickets
    const is_registered = await isUserRegistered(supabase, session.user.id, event_id);

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
            event_id: event_id
        }
    };
}

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
        setTranferMessage("There is no profile associated with that netID, please check your spelling. If issues persist, send an email!")
        setTransfereeID("");
    }
}

/**
 * 
 * @param from - person sending the ticket
 * @param to - person receiving the ticket
 */
async function transferTicket(supabase: SupabaseClient, from: string, to: string, event_id: string, setTranferedTicketMessage, setCanTransfer) {
    console.log("FROM")
    console.log(from)
    console.log(to)
    if (from === to) {
        setTranferedTicketMessage("You can't transfer a ticket to yourself!")
        return
    }

    const {data, error} = await supabase
    .from("registrations")
    .update({person : to})
    .eq("event", event_id)
    .eq("person", from);

    if (error) {
        setTranferedTicketMessage("Error in transferring ticket " + error.message)
        return
    }

    setTranferedTicketMessage("Successfully Transferred Ticket!");
    setCanTransfer(false);

}

function TransferTicketPage(props) {
    const supabase: SupabaseClient = useSupabaseClient();
    const [netID, setnetID] = useState<string>("");
    const [transfereeID, setTransfereeID] = useState<string>("");
    const [transferMessage, setTransferMessage] = useState<string>("");
    const [tranferedTicketMessage, setTranferedTicketMessage] = useState<string>("");
    const [transferRequest, setTransferRequest] = useState<boolean>(false);
    const [canTransfer, setCanTransfer] = useState<boolean>(true);

    useEffect(() => {
        getTransferMessage(supabase, netID, setTransferMessage, setTransfereeID)
    }, [transferRequest]);

    return (
        <div>
            <div>
                <h1>Transfer Tickets for {props.params.slug}</h1>
            </div>
            <div className="form-control w-full max-w-xs">
                <input type="text" placeholder="Enter NetID here" onChange={(e) => setnetID(e.target.value)} className="input input-bordered w-full max-w-xs" />
                <label className="label">
                    <span className="label-text-alt">Net ID</span>
                </label>
            </div>
            <div>
                <label htmlFor="transfer-modal" className="btn btn-primary" onClick = {() => setTransferRequest(true)}>Transfer Ticket</label>
                <input type="checkbox" id="transfer-modal" className="modal-toggle" />
                <div className="modal">
                <div className="modal-box">
                    <h1 className="font-bold text-lg">{transferMessage}</h1>
                    <div className="modal-action">
                    <label htmlFor="transfer-modal" className="btn btn-outline btn-primary" onClick = {() => setTransferRequest(false)}>Cancel</label>
                    <label htmlFor="transfer-modal" className="btn btn-primary" onClick = {() => {
                        if (!canTransfer) {
                            setTranferedTicketMessage("You are unable to transfer at this time!")
                        }
                        else {
                            transferTicket(supabase, props.user.id, transfereeID, props.event_id, setTranferedTicketMessage, setCanTransfer)}
                        }
                    }>Transfer</label>
                    </div>
                </div>
                </div>
            </div>
            <div>
                {tranferedTicketMessage}
            </div>
        </div>
    )   
}

export default TransferTicketPage;