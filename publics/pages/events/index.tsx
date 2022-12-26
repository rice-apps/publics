import { useEffect, useState } from "react";
import EventCard from "../../components/eventCards/EventCard";
import { supabase } from "../../utils/db";
import type { ListEvent } from "../../utils/types";
import { User } from "@supabase/supabase-js";
import LargeEventCard from "../../components/eventCards/LargeEventCard";

type Props = {
  eventList: ListEvent[];
};

interface Registration {
  event: ListEvent;
  waitlist: boolean;
}

function Events(props) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [volunteering, setVolunteering] = useState<string[]>([]);
  const [hosting, setHosting] = useState<string[]>([]);

  const [openTab, setOpenTab] = useState(1);
  const [tab1Class, setTab1Class] = useState("tab tab-active");
  const [tab2Class, setTab2Class] = useState("tab");
  const [tab3Class, setTab3Class] = useState("tab");

  useEffect(() => {
    if (!props.user) return;
    getRegistrations();
    getVolunteerStatus();
    getHostedEvents();
  }, [props]);

  const getRegistrations = async () => {
    const { data, count, error } = await supabase
      .from("registrations")
      .select(
        `person!inner(id), event(*, organization (name, photo, id)), waitlist`
      )
      .eq("person.id", props.user.id);

    if (error) {
      throw error;
    }

    let reg: Registration[] = data.map((reg) => {
      return {
        event: reg.event,
        waitlist: reg.waitlist,
      };
    });

    setRegistrations(reg);
  };

  const getVolunteerStatus = async () => {
    const { data, error } = await supabase
      .from("volunteers")
      .select(`profile!inner(id), event(id)`)
      .eq("profile.id", props.user.id);
    if (error) {
      throw error;
    }

    setVolunteering(data.map((v) => v.event!.id));
  };

  const getHostedEvents = async () => {
    const { data, error } = await supabase
      .from("organizations_admins")
      .select(`organization(id), profile!inner(id)`)
      .eq("profile.id", props.user.id);
    if (error) {
      throw error;
    }

    // get events with oragnization id from data
    const hostedEvents = props.eventList.filter((event) =>
      data.map((org) => org.organization!.id).includes(event.organization!.id)
    );
    setHosting(hostedEvents.map((event) => event.id));
  };

  function handleClick(tab) {
    if (tab === 1) {
      setOpenTab(1);
      setTab1Class("tab tab-active");
      setTab2Class("tab");
      setTab3Class("tab");
    } else if (tab === 2) {
      setOpenTab(2);
      setTab1Class("tab");
      setTab2Class("tab tab-active");
      setTab3Class("tab");
    } else {
      setOpenTab(3);
      setTab1Class("tab");
      setTab2Class("tab");
      setTab3Class("tab tab-active");
    }
  }

  return (
    <div className="mb-5">
      <div className="tabs tabs-boxed">
        <a className={tab1Class} onClick={() => handleClick(1)}>
          My Events
        </a>
        <a className={tab2Class} onClick={() => handleClick(2)}>
          Volunteering
        </a>
        <a className={tab3Class} onClick={() => handleClick(3)}>
          Hosting
        </a>
      </div>
      <div className={openTab === 1 ? "block" : "hidden"}>
        <div className="divider">My Events</div>
        {registrations.length > 0 ? (
          <div className="flex flex-col gap-4 px-8">
            {registrations.map((reg) => (
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
      <div className={openTab === 2 ? "block" : "hidden"}>
        <div className="divider">Volunteering</div>
        {volunteering.length > 0 ? (
          <div className="flex flex-col gap-4 px-8">
            {props.eventList
              .filter((event) => volunteering.includes(event.id))
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
      <div className={openTab === 3 ? "block" : "hidden"}>
        <div className="divider">Hosting</div>
        {hosting.length > 0 ? (
          <div className="flex flex-col gap-4 px-8">
            {props.eventList
              .filter((event) => hosting.includes(event.id))
              .map((event) => (
                <LargeEventCard event={event} key={event.slug} type="hosting" />
              ))}
          </div>
        ) : (
          <div className="px-8">You are not hosting any events.</div>
        )}
      </div>

      <div className="divider">Upcoming Events</div>
      <div className="px-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {props.eventList.map((event) => (
          <EventCard key={event.slug} event={event} />
        ))}
      </div>
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps() {
  const { data, error } = await supabase
    .from("events")
    .select(`*, organization (name, photo, id)`);
  // .gt('event_datetime', new Date().toISOString())
  if (error) {
    throw error;
  }

  let props: Props = { eventList: data };

  return { props }; // will be passed to the page component as props
}

export default Events;
