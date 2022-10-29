// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseClient = createClient(
  // Supabase API URL - env var exported by default.
  Deno.env.get('SUPABASE_URL') ?? '',
  // Supabase API ANON KEY - env var exported by default.
  Deno.env.get('SUPABASE_SERVICE_KEY') ?? '',
)

serve(async (req) => {
  const { id, email } = await req.json()
  const username = email.split("@")[0]

  const response = await fetch(`https://search.rice.edu/json/people/p/0/0/?q=${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const json = await response.json()

  if (json.stats.count == 0) {
    return new Response("No results found", {
      status: 404,
      headers: {
        "content-type": "application/json",
      },
    })
  }

  
  //add entry to supabase if not already there
  const { data, error } = await supabaseClient
    .from('profiles')
    .insert([
      { 
        id: id,
        first_name: json.results[0].name.split(" ")[0],
        last_name: json.results[0].name.split(" ")[1],
        college: json.results[0].college,
        netid: json.results[0].netid,
        can_create_event: false,
        },
    ])

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "content-type": "application/json",
      },
    })
  }
  else {
    return new Response("Success", {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    })
  }

})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"email":"awj3@rice.edu"}'
