import { supabase } from "../../../utils/db";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Analytics(props) {
    // Going to need to calculate:

    // 1. Total people counted night of the public
    // 2. In and out by hour
    // 3. In and out by volunteer
    // 4. Number of volunteers
    // 5. Number of volunteers in an hour (registered v. showed up)
    // 6. Registration analytics
        // - Number of registrants: residential college hosting and general registration
        // - Registered versus pick up
        // - Chances of getting off the waitlist

    // 7. [This one depends on some serious checking] caregiving rate in/rate out

    const { session } = props;
  const { query } = useRouter() || { query: { slug: "" } };

    const fetchPosts = async () => {
        if (!query.slug) return;
        const { data } = await supabase
          .from("counts")
          .select("*, event!inner(*), volunteer(id, profile(first_name))")
          .eq("event.slug", query.slug);
        const { data: eventData } = await supabase
          .from("events")
          .select("id")
          .eq("slug", query.slug)
          .single();
        const { data: volunteer } = await supabase
          .from("volunteers")
          .select("id, event(slug)")
          .eq("profile", session?.user?.id)
          .single();
        const { data: volunteers } = await supabase
          .from("volunteers")
          .select("id, profile(first_name), event(slug)");

  return (
    <div></div>
  );
}