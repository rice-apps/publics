import { supabase } from "../../../utils/db";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

//create a type for allVolunteers
interface Volunteer {
  name: string;
  id: string;
  count: number;
};

const Counter = (props) => {
  const { session } = props;
  const router = useRouter() || { query: { slug: "" } };
  const query = router.query;
  const [count, setCount] = useState(0);
  const [myCount, setMyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState("");
  const [volunteer, setVolunteer] = useState("");
  const [allVolunteers, setAllVolunteers] = useState<Volunteer[]>([]);
  useEffect(() => {
    fetchPosts();
  }, [query]);
  useEffect(() => {
    supabase
      .channel(`count:${query.slug}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "counts" },
        (payload: any) => {
          //set count and my count
          setCount((count) => count + (payload.new.inout ? 1 : -1));
          //update count in allVolunteers
          setAllVolunteers((volunteers) => {
            return volunteers.map((volunteer) => {
              if (volunteer.id === payload.new.volunteer) {
                return {
                  ...volunteer,
                  count: volunteer.count + (payload.new.inout ? 1 : -1),
                };
              }
              return volunteer;
            });
          });
        }
      )
      .subscribe();
  }, []);
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
      .select("id, profile(first_name), event!inner(*)")
      .eq("event.slug", query.slug);

    if (
      !data ||
      !eventData ||
      !volunteer ||
      !volunteers
    ) {
      router.push("/404");
      return;
    }

    const volunteerCountArray = volunteers.map((volunteer) => {
      return {
        name: volunteer.profile!["first_name"],
        id: volunteer.id,
        count:
          data.filter(
            (count) => count.volunteer.id === volunteer.id && count.inout
          ).length -
          data.filter(
            (count) => count.volunteer.id === volunteer.id && !count.inout
          ).length,
      };
    });
    setVolunteer(volunteer.id);
    setAllVolunteers(volunteerCountArray);
    setEvent(eventData.id);
    if (data.length > 0) {
      setCount(
        data.filter((row) => row.inout).length -
          data.filter((row) => !row.inout).length
      );
      setMyCount(
        data.filter((row) => row.volunteer.id === volunteer?.id && row.inout)
          .length -
          data.filter((row) => row.volunteer.id === volunteer?.id && !row.inout)
            .length
      );
    }

    setLoading(false);
  };

  const updateCount = async (inout) => {
    await supabase.from("counts").insert([
      {
        inout: inout,
        volunteer: volunteer,
        event: event,
      },
    ]);
    setMyCount((count) => count + (inout ? 1 : -1));
  };
  if (loading) return <div className="flex flex-col h-screen">Loading ...</div>;
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-row justify-center">
        <h1>{myCount}</h1>
        <h1 className="text-primary">/{count}</h1>
      </div>
      <p className="text-sm grid place-items-center">total count</p>
      <div className="grid grid-cols-3 gap-4 place-items-center mt-8">
        {allVolunteers?.map((v) => {
          return (
            <div
              key={v.id}
              className="flex flex-col justify-center items-center"
            >
              <div className="badge badge-lg">{v.count}</div>
              <h4>{v.name}</h4>
            </div>
          );
        })}
      </div>
      <div className="flex flex-grow justify-center space-x-10 items-center">
        <button
          className="btn btn-circle h-24 w-24"
          onClick={() => {
            updateCount(false);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 12H6"
            />
          </svg>
        </button>
        <button
          className="btn btn-circle h-24 w-24"
          onClick={() => {
            updateCount(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
export default Counter;
