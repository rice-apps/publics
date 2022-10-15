import { withApiAuth } from "@supabase/auth-helpers-nextjs";

export default withApiAuth(async function ProtectedRoute(
    req, 
    res,
    supabaseServerClient
) {
    const body = req.body;
    //Add lots of if statements to make sure everything looks right
    if (!body.name) {
        return res.status(400).json({data : 'Name not found!'});
    }
    //Not sure if we need to enter ID or slug?

    //Gross code, will fix later please don't yell at us :)
    //TODO add type checks later
    if (!body.created_at) {
        return res.status(400).json({data : 'Creation timestamp not found!'});
    }
    if (!body.capacity) {
        return res.status(400).json({data : 'Capacity not found!'});
    }
    if (!body.signup_size) {
        return res.status(400).json({data : 'Signup size not found!'});
    }
    if (!body.waitlist_size) {
        return res.status(400).json({data : 'Waitlist Size not found!'});
    }
    if (!body.admins) {
        return res.status(400).json({data : 'Admins not found!'});
    }
    if (!body.counters) {
        return res.status(400).json({data : 'Counters not found!'});
    }
    if (!body.description) {
        return res.status(400).json({data : 'Description not found!'});
    }
    if (!body.event_datetime) {
        return res.status(400).json({data : 'Event timestamp not found!'});
    }
    if (!body.registration_datetime) {
        return res.status(400).json({data : 'Registration timestamp not found!'});
    }
    if (!body.registration) {
        return res.status(400).json({data : 'Registration status not found!'});
    }

    const {data, error} = await supabaseServerClient.from("events").insert(body).single();

    if(error) {
        res.status(400).json({data : "Error!"})
    } else {
        res.status(200).json({data : `Created ${data?.name}!`})
    }
});
