import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import EventCard from "../../components/eventCards/EventCard";
import type { ListEvent } from "../../utils/types";
import LargeEventCard from "../../components/eventCards/LargeEventCard";
import { SupabaseClient } from "@supabase/supabase-js";

type Props = {
  events: ListEvent[];
  hosting: string[];
  volunteering: string[];
  registrations: Registration[];
};

interface Registration {
  event: ListEvent;
  waitlist: boolean;
}

// get all events
const getEvents = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("events")
    .select(`*, organization (name, photo, id)`);
  // .gt('event_datetime', new Date().toISOString())
  if (error) {
    throw error;
  }

  return data;
};

// get all events that the user is registered for
const getRegistrations = async (supabase: SupabaseClient, userId: string) => {
  const { data, count, error } = await supabase
    .from("registrations")
    .select(
      `person!inner(id), event(*, organization (name, photo, id)), waitlist`
    )
    .eq("person.id", userId);

  if (error) {
    throw error;
  }

  if (data.length < 1) {
    return [];
  }

  let reg: Registration[] = data.map((reg) => {
    return {
      event: reg.event,
      waitlist: reg.waitlist,
    };
  });

  return reg;
};

// get all events that the user is volunteering for
const getVolunteerStatus = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("volunteers")
    .select(`profile!inner(id), event(id)`)
    .eq("profile.id", userId);

  if (error) {
    throw error;
  }

  if (data.length < 1) {
    return [];
  }

  return data.map((vol) => vol.event!["id"]);
};

// get all events that the user is hosting
const getHostedEvents = async (
  supabase: SupabaseClient,
  userId: string,
  events: ListEvent[]
) => {
  const { data, error } = await supabase
    .from("organizations_admins")
    .select(`organization(id), profile!inner(id)`)
    .eq("profile.id", userId);
  if (error) {
    throw error;
  }

  if (data.length < 1) {
    return [];
  }

  // get events with oragnization id from data
  const hostedEvents = events.filter((event) =>
    data.map((org) => org.organization!["id"]).includes(event.organization!.id)
  );
  return hostedEvents.map((event) => event.id);
};

function Events(props: Props) {
  const [openTab, setOpenTab] = useState(1);
  // only render tabs if the user has events in that category
  const [renderTab2, setRenderTab2] = useState(false);
  const [renderTab3, setRenderTab3] = useState(false);
  const [renderTab4, setRenderTab4] = useState(false);
  // tab classes
  const [tab1Class, setTab1Class] = useState("tab tab-active");
  const [tab2Class, setTab2Class] = useState("tab");
  const [tab3Class, setTab3Class] = useState("tab");
  const [tab4Class, setTab4Class] = useState("tab");

  // set tab classes on mount
  useEffect(() => {
    if (props.registrations.length > 0) {
      setRenderTab2(true);
    }
    if (props.volunteering.length > 0) {
      setRenderTab3(true);
    }

    if (props.hosting.length > 0) {
      setRenderTab4(true);
    }
  }, [props]);

  // set tab classes on tab change
  function handleClick(tab) {
    if (tab === 1) {
      setOpenTab(1);
      setTab1Class("tab tab-active");
      setTab2Class("tab");
      setTab3Class("tab");
      setTab4Class("tab");
    } else if (tab === 2) {
      setOpenTab(2);
      setTab1Class("tab");
      setTab2Class("tab tab-active");
      setTab3Class("tab");
      setTab4Class("tab");
    } else if (tab === 3) {
      setOpenTab(3);
      setTab1Class("tab");
      setTab2Class("tab");
      setTab3Class("tab tab-active");
      setTab4Class("tab");
    } else {
      setOpenTab(4);
      setTab1Class("tab");
      setTab2Class("tab");
      setTab3Class("tab");
      setTab4Class("tab tab-active");
    }
  }

  return (
    <div className="mb-5">
      <div className="tabs bg-base-100">
        <a className={tab1Class} onClick={() => handleClick(1)}>
          Upcoming Events
        </a>
        {renderTab2 && (
          <a className={tab2Class} onClick={() => handleClick(2)}>
            My Events
          </a>
        )}
        {renderTab3 && (
          <a className={tab3Class} onClick={() => handleClick(3)}>
            Volunteering
          </a>
        )}
        {renderTab4 && (
          <a className={tab4Class} onClick={() => handleClick(4)}>
            Hosting
          </a>
        )}
      </div>
      <div className={openTab === 1 ? "block" : "hidden"}>
        <div className="divider">Upcoming Events</div>
        {props.events.length > 0 ? (
          <div className="px-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {props.events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        ) : (
          <div className="px-8">There are currently no upcoming events.</div>
        )}
      </div>
      <div className={openTab === 2 ? "block" : "hidden"}>
        <div className="divider">My Events</div>
        {props.registrations.length > 0 ? (
          <div className="flex flex-col gap-4 px-8">
            {props.registrations.map((reg) => (
              <LargeEventCard
                event={reg.event}
                registration_status={
                  reg.waitlist ? "Waitlisted" : "Succesfully Registered!"
                }
                key={reg.event.slug}
                type="my-events"
              />
            ))}
          </div>
        ) : (
          <div className="px-8">
            You are not currently registered for any events.
          </div>
        )}
      </div>
      <div className={openTab === 3 ? "block" : "hidden"}>
        <div className="divider">Volunteering</div>
        {props.volunteering.length > 0 ? (
          <div className="flex flex-col gap-4 px-8">
            {props.events
              .filter((event) => props.volunteering.includes(event.id))
              .map((event) => (
                <LargeEventCard
                  event={event}
                  key={event.slug}
                  type="volunteering"
                />
              ))}
          </div>
        ) : (
          <div className="px-8">You are not volunteering for any events.</div>
        )}
      </div>
      <div className={openTab === 4 ? "block" : "hidden"}>
        <div className="divider">Hosting</div>
        {props.hosting.length > 0 ? (
          <div className="flex flex-col gap-4 px-8">
            {props.events
              .filter((event) => props.hosting.includes(event.id))
              .map((event) => (
                <LargeEventCard event={event} key={event.slug} type="hosting" />
              ))}
          </div>
        ) : (
          <div className="px-8">You are not hosting any events.</div>
        )}
      </div>
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps(ctx) {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: `http://${ctx.req.headers.host}/account`,
        permanent: false,
      },
    };

  const events = await getEvents(supabase);
  const registrations = await getRegistrations(supabase, session.user.id);
  const volunteering = await getVolunteerStatus(supabase, session.user.id);
  const hosting = await getHostedEvents(supabase, session.user.id, events);

  let props: Props = { events, hosting, registrations, volunteering };

  return { props }; // will be passed to the page component as props
}

export default Events;
