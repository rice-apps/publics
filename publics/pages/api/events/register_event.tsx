import { withApiAuth } from "@supabase/auth-helpers-nextjs"

export default withApiAuth(async function ProtectedRoute(
  req,
  res,
  supabaseServerClient
) {
  const body = req.body

  const fields = ["event", "person", "override"]

  //Send an error if a field is missing
  fields.forEach((field) => {
    if (!body[field]) {
      return res.status(400).json({ data: `${field} not Found!` })
    }
  })

  //Writing to the DB
  const { data, error } = await supabaseServerClient
    .from("registrations")
    .insert(body)
    .single()

  //Sending the response back
  if (error) {
    res.status(400).json({ data: "Error!: " + error })
  } else {
    res.status(200).json({ data: `Created ${data ? ["name"] : null}!` })
  }
})
