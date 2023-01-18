import Link from "next/link"
import { useRouter } from "next/router"
import AddShiftModal from "./AddShiftModal"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

export default function ShiftCard({ start, end, id, count, total }) {
  const supabase = useSupabaseClient()
  let border = ""
  // get the current url
  const router = useRouter()
  const url = router.asPath + "/" + id
  // give the card this style only if the current time is between start and end times (border-2 border-primary)
  const now = new Date()
  const start_time = new Date(start)
  const end_time = new Date(end)
  //add 6 hours to now to account for time zone difference
  if (now >= start_time && now <= end_time) {
    border = "border-2 border-primary"
  }

  const formattedStart = new Date(start).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
  const formattedEnd = new Date(end).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  async function deleteShift() {
    const res = await supabase.from("shifts").delete().eq("id", id)
    if (res.error) {
      alert("Cannot delete shift with volunteers assigned")
    } else {
      router.reload()
    }
  }

  return (
    <div className={`card bg-base-100 max-w-md shadow-xl ${border}`}>
      <div className="card-body">
        <div className="flex flex-row justify-between">
          <h2 className="card-title">
            {formattedStart} - {formattedEnd}
          </h2>
          <div className="justify-end">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => deleteShift()}
            >
              <svg
                width="15"
                height="18"
                viewBox="0 0 20 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.00008 21.3333C2.00008 22.8 3.20008 24 4.66675 24H15.3334C16.8001 24 18.0001 22.8 18.0001 21.3333V5.33333H2.00008V21.3333ZM4.66675 8H15.3334V21.3333H4.66675V8ZM14.6667 1.33333L13.3334 0H6.66675L5.33341 1.33333H0.666748V4H19.3334V1.33333H14.6667Z"
                  fill="black"
                />
              </svg>
            </button>
          </div>
        </div>
        <p>
          {now >= start_time && now <= end_time
            ? `${count}/${total} checked in`
            : `${total} volunteers`}
        </p>
        <div className="card-actions justify-end">
          <Link className="text" href={url} passHref>
            <button className="btn btn-primary">View Shift</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
