import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Checks if the user trying to look at this page is an admin of the associated event (and thus has the permission to look at this page)
 * @param slug : slug of the page
 * @returns true if the user looking at this page is an admin, false otherwise
 */
export async function authorize(
  supabase: SupabaseClient,
  slug: string,
  userId: string
) {
  const { data: org, error: eventsError } = await supabase
    .from("events")
    .select("organization ( id, name )")
    .eq("slug", slug)

  if (eventsError) {
    throw eventsError
  }

  const { data: user_orgs, error: adminError } = await supabase
    .from("organizations_admins")
    .select("organization ( id, name )")
    .eq("profile", userId)

  if (adminError) {
    throw adminError
  }

  return (
    user_orgs &&
    org.length > 0 && user_orgs.length > 0 &&
    user_orgs.some(
      (user_org) => user_org.organization!["id"] === org[0].organization!["id"]
    )
  )
}
