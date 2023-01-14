<<<<<<< HEAD
<<<<<<< HEAD
import { supabase } from "../../../utils/db";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ResponsiveLine } from '@nivo/line';
<<<<<<< HEAD

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

        if (
          !data ||
          !eventData ||
          !volunteer ||
          !volunteers ||
          volunteer.event.slug !== query.slug
        ) {
          window.location.href = "/events/";
          return;
        }

        const countsData = data.group(data.eventData.id)
        .map((data) => {
          return {
            id: data.eventData.id,
            color: "hsl(220, 70%, 50%)",
            data: {
              x: data.created_at.getHours(),
              // Need to filter by event and hour, sum total for that event's hour save as a data entry
              y: data.filter((count) => count.eventData.id === data.eventData.id && count.created_at.getHours() === data.created_at.getHours())
            }
          };
        });

        return (
          countsData
        );
    }

    // Filters data into the format required by the library
    /*
    {
      "id": "##:00", // Hour in military time
      "color": "hsl(220, 70%, 50%)",
      "data": [
        {
          "x": "##:00",
          "y": #
        },
        {...}
      ]
    }
     */

    // For reference: https://nivo.rocks/line/
const countsLineGraph = ({ countsData }) => (
  <ResponsiveLine
      data={countsData}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: true,
          reverse: false
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
          orient: 'bottom',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'time',
          legendOffset: 36,
          legendPosition: 'middle'
      }}
      axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'count',
          legendOffset: -40,
          legendPosition: 'middle'
      }}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
          {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                  {
                      on: 'hover',
                      style: {
                          itemBackground: 'rgba(0, 0, 0, .03)',
                          itemOpacity: 1
                      }
                  }
              ]
          }
      ]}
  />
)

return (
  <div>
      {countsLineGraph}
  </div>
);
=======
=======
import { supabase } from "../../../utils/db";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
>>>>>>> 35dda4f (Developing analytics page)
=======
>>>>>>> 0288b80 (Setting up counts graph)

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

        if (
          !data ||
          !eventData ||
          !volunteer ||
          !volunteers ||
          volunteer.event.slug !== query.slug
        ) {
          window.location.href = "/events/";
          return;
        }

        const countsData = data.map((data) => {
          return {
            id: data.eventData.id,
            color: "hsl(220, 70%, 50%)",
            data:
              data.filter(
                (count) => count.volunteer.id === volunteer.id && count.inout
              ).length -
              data.filter(
                (count) => count.volunteer.id === volunteer.id && !count.inout
              ).length,
          };
        });
    }

<<<<<<< HEAD
<<<<<<< HEAD
  return (
    <div></div>
  );
>>>>>>> d170e47 (Made a file for the analytics page)
=======
=======
    // Filters data into the format required by the library
    /*
    {
      "id": "##:00", // Hour in military time
      "color": "hsl(220, 70%, 50%)",
      "data": [
        {
          "x": "##:00",
          "y": #
        },
        {...}
      ]
    }
     */
>>>>>>> c7e5cdc (Filtering data for graph)
    const countsData = fetchPosts;

    // For reference: https://nivo.rocks/line/
const countsLineGraph = ({ countsData }) => (
  <ResponsiveLine
      data={countsData}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: true,
          reverse: false
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
          orient: 'bottom',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'time',
          legendOffset: 36,
          legendPosition: 'middle'
      }}
      axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'count',
          legendOffset: -40,
          legendPosition: 'middle'
      }}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
          {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                  {
                      on: 'hover',
                      style: {
                          itemBackground: 'rgba(0, 0, 0, .03)',
                          itemOpacity: 1
                      }
                  }
              ]
          }
      ]}
  />
)

return (
  <div>
      {countsLineGraph}
  </div>
);
>>>>>>> 0288b80 (Setting up counts graph)
}