import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Checks if the user trying to look at this page is a volunteer of the associated event (and thus has the permission to look at this page)
 * @param slug : slug of the page
 * @returns true if the user looking at this page is a volunteer, false otherwise
 */
export async function volunteer_authorize(supabase: SupabaseClient, slug: string, userId: string) {

    const { data: event, error: eventsError } = await supabase
        .from('events')
        .select('id, codeword')
        .eq('slug', slug);
    
    if (eventsError) {
        throw eventsError
    }

    const { data: volunteer, error: volunteerError } = await supabase
        .from('volunteers')
        .select('checked_in, checked_out')
        .eq('event', event[0].id)
        .eq('profile', userId)
    
    if (volunteerError) {
        throw volunteerError
    }

    return [volunteer, event[0]]
}