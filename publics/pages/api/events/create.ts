import { withApiAuth } from "@supabase/auth-helpers-nextjs";

export default withApiAuth(async function ProtectedRoute(
    req, 
    res,
    supabaseServerClient
) {
    const body = req.body;

    const fields = [
        "name", 
        "created_at", 
        "capacity", 
        "signup_size", 
        "waitlist_size",
        "admins", 
        "counters", 
        "description", 
        "event_datetime", 
        "registration_datetime",    
        "registration"
    ];

    //Send an error if there are more/less elements in the data than we can put into the table
    if (Object.keys(body).length != fields.length) {
        return res.status(400).json({data : "Data not in correct format; Number of fields is incorrect"})
    }
    //Send an error if a field is missing
    for (let field in fields) {
        if (!body[field]) {
            return res.status(400).json({data : `${field} not Found!`})
        }
    }

    //Writing to the DB
    const {data, error} = await supabaseServerClient.from("events").insert(body).single();

    //Sending the response back
    if(error) {
        res.status(400).json({data : "Error!: " + error})
    } else {
        res.status(200).json({data : `Created ${data?['name'] : null}!`})
    }
});
