import { NextApiHandler } from 'next';
import { createServerSupabaseClient} from '@supabase/auth-helpers-nextjs';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

const create: NextApiHandler = async (req, res) => {
    // Create authenticated Supabase Client
    const serverclient = createServerSupabaseClient({ req, res })

    // Check if we have a session
    await serverclient.auth.getUser()
    const {
       data: { session },
      } = await serverclient.auth.getSession()
  
      if (!session) {
          return res.status(401).json({
              error: 'not_authenticated',
              description: 'The user does not have an active session or is not authenticated!!!',
          })
      }
  
      const body = req.body;
  
      const fields = [
          "name", 
          "capacity", 
          "signup_size", 
          "waitlist_size",
          "description", 
          "event_datetime", 
          "registration_datetime",    
          "registration",
          "slug",
          "location",
      ];
  
      //Send an error if a field is missing
      fields.forEach((field) => {
          if(!body[field]) {
              return res.status(400).json({data : `${field} not Found!`})
          }
      });
  
      //Writing to the DB
      const {data, error} = await serverclient.from("events").insert(body).single();
      //Sending the response back
      if(error) {
          res.status(400).json({data : "Error!: " + error})
      } else {
          res.status(200).json({data : `Created ${data?['name'] : null}!`})
      }
}

export default create;
