import { NextApiHandler } from 'next';
import { createServerSupabaseClient} from '@supabase/auth-helpers-nextjs';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

const create: NextApiHandler = async (req, res) => {
    // Create authenticated Supabase Client
    const serverclient = createServerSupabaseClient({ req, res })

    // Check if we have a session
    const {
       data: { session },
      } = await serverclient.auth.getSession()
  
      if (!session) {
          //ALWAYS REACHES HERE!!!
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
          "organization"
      ];
  
      //Send an error if a field is missing
      fields.forEach((field) => {
          if(!body[field]) {
              return res.status(400).json({data : `${field} not Found!`})
          }
      });
  
      //Writing to the DB
      const {error} = await serverclient.from("events").insert(body).single();
      //Sending the response back
      if(error) {
          res.status(400).json({data : "Error!: " + error.message})
      } else {
          res.status(200).json({data : `Created ${body?.name}!`})
      }
}

export default create;
