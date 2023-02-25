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
    //Useful in case anyone wants to manually navigate to this page again after they've forfeited tickets
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

async function forfeitTicket(
    supabase: SupabaseClient, 
    from: string,
    event_id,
    setForfeitedTicketMessage,
    setCanForfeit) {
    

    const {data, error} = await supabase
    .from("registrations")
    .delete()
    .eq("person", from)
    .eq("event", event_id);

    if (error) {
        setForfeitedTicketMessage("Something went wrong. Please Try Again. If you keep seeing this error, please contact the dev team.")
        return;
    } else {
        setForfeitedTicketMessage("Successfully forfeited Ticket!");
        setCanForfeit(false);
        return;
    }
        
}

function TransferTicketPage(props) {
    const router = useRouter();
    const supabase: SupabaseClient = useSupabaseClient();
    //message displayed in pop-up box after you click the forfeit button
    const [forfeitMessage, setForfeitMessage] = useState<string>("");
    //message displayed indicating success/failure of trying to forfeit a ticket
    const [forfeitedTicketMessage, setForfeitedTicketMessage] = useState<string>("");
    //set to true when we try and actually forfeit a ticket (i.,e when the forfeit ticket button gets pressed)
    const [forfeitRequest, setForfeitRequest] = useState<boolean>(false);
    //boolean indicating when the user is still able to forfeit a ticket (this is set to false after they've already forfeited a ticket)
    //used in making sure users don't try and forfeit their own ticket twice
    const [canForfeit, setCanForfeit] = useState<boolean>(true);

    return (
        
        <div className = "flex flex-col justify-center items-center m-5">
            <div className="card w-96 bg-base-100">
                <div className="card-body items-center text-center">
                    <h1>Transfer Tickets for {props.event_info["name"]}</h1>
                    <div className="card-actions justify-end">
                    <label htmlFor="transfer-modal" className="btn btn-primary " onClick = {() => {setForfeitMessage("Are you sure? This action is NOT reversible!"); setForfeitRequest(true)}}>Forfeit Ticket</label>
                <input type="checkbox" id="transfer-modal" className="modal-toggle" />
                <div className="modal">
                    <div className="modal-box">
                        <h1 className="font-bold text-lg">{forfeitMessage}</h1>
                        <div className="modal-action flex justify-center">
                            <label htmlFor="transfer-modal" className="btn btn-outline btn-primary" onClick = {() => {setForfeitRequest(false); setForfeitedTicketMessage("")}}>Cancel</label>
                            <label htmlFor="transfer-modal" className="btn btn-primary" onClick = {() => {
                                    if (!canForfeit) {
                                        setForfeitedTicketMessage("You are unable to forfeit at this time!")
                                    }
                                    else {
                                        forfeitTicket(supabase, props.user.id, props.event_info["id"], setForfeitedTicketMessage, setCanForfeit)
                                    }
                                    setForfeitRequest(false);
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
                        {forfeitedTicketMessage}
                    </span>
                </div>
        </div>
    )   
}

export default TransferTicketPage;