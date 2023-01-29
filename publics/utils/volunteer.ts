import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Checks if the user trying to look at this page is a volunteer of the associated event (and thus has the permission to look at this page)
 * @param slug : slug of the page
 * @returns true if the user looking at this page is a volunteer, false otherwise
 */
export async function get_event(supabase: SupabaseClient, slug: string) {
  const { data: event, error: eventsError } = await supabase
    .from("events")
    .select("id, codeword")
    .eq("slug", slug)
    .single()

  if (eventsError || !event) {
    throw eventsError
  }

  return event
}

export async function get_volunteer(
  supabase: SupabaseClient,
  event_id: string,
  userId: string
) {
  const { data: volunteer, error: volunteerError } = await supabase
    .from("volunteers")
    .select("shift, checked_in, checked_out")
    .eq("event", event_id)
    .eq("profile", userId)

  if (volunteerError || !volunteer) {
    throw volunteerError
  }

  return volunteer
}
