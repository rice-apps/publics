import type { SupabaseClient } from "@supabase/supabase-js"

export async function authorize(supabase: SupabaseClient, user_id: string) {
  const { data, error } = await supabase
    .from("organizations_admins")
    .select("organization ( id, name )")
    .eq("profile", user_id)

  if (error) {
    throw error
  }

  if (data.length < 1) {
    return false
  }

  const { data: data2, error: error2 } = await supabase
    .from("profiles")
    .select("can_create_event")
    .eq("id", user_id)
    .single()

  if (error2) {
    throw error
  }

  return data2.can_create_event
}
