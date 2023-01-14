import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {useEffect, useState} from "react";
import {
    SupabaseClient,
    createServerSupabaseClient,
  } from "@supabase/auth-helpers-nextjs";

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

    return {
        props: {
            params: ctx.params
        }
    };
}

async function getTransferMessage(supabase:SupabaseClient, netID: string, setTranferMessage) {
    const {data, error} = await supabase
    .from("profiles")
    .select(`
        first_name,
        last_name
    `)
    .eq("netid", netID)
    .single();

    if(!error) {
        setTranferMessage("Are you sure you want to transfer your ticket to " + data?.first_name + " " + data?.last_name + "?");
    } else {
        setTranferMessage("There is no profile associated with that netID, please check your spelling. If issues persist, send an email!")
    }
}

function TransferTicketPage(props) {
    const supabase: SupabaseClient = useSupabaseClient();
    const [netID, setnetID] = useState<string>("");
    const [tranferMessage, setTranferMessage] = useState<string>("");
    const [transfer, setTransfer] = useState<boolean>(false);

    useEffect(() => {
        getTransferMessage(supabase, netID, setTranferMessage)
    }, [transfer]);

    return (
        <div>
            <div>
                <h1>Transfer Tickets for {props.params.slug}</h1>
            </div>
            <div className="form-control w-full max-w-xs">
                <input type="text" placeholder="Type here" onChange={(e) => setnetID(e.target.value)} className="input input-bordered w-full max-w-xs" />
                <label className="label">
                    <span className="label-text-alt">Net ID</span>
                </label>
            </div>
            <div>
                <label htmlFor="transfer-modal" className="btn btn-primary" onClick = {() => setTransfer(true)}>Transfer Ticket</label>
                <input type="checkbox" id="transfer-modal" className="modal-toggle" />
                <div className="modal">
                <div className="modal-box">
                    <h1 className="font-bold text-lg">{tranferMessage}</h1>
                    <div className="modal-action">
                    <label htmlFor="transfer-modal" className="btn btn-outline btn-primary" onClick = {() => setTransfer(false)}>Cancel</label>
                    <label htmlFor="transfer-modal" className="btn btn-primary">Transfer</label>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )   
}

export default TransferTicketPage;