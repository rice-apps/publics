import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import AddShiftModal from "./AddShiftModal"
import ShiftCard from "./ShiftCard"

  // TODO: find easier way of formatting
  function format_date(date: string) {
    if (date === null) {
      return "purposely-nonformatted-date"
    }
    let eventDate = new Date(date)
    let tzoffset = new Date().getTimezoneOffset() * 60000
    let localISOTime = new Date(eventDate.getTime() - tzoffset).toISOString()
    return localISOTime.slice(0, localISOTime.indexOf("Z"))
  }

function EditShiftModal(props) {
  console.log(props)


  // const [name, setName] = useState<string>("")
  const [name, setName] = useState<string>(props.name)
  console.log(name)

  const [shiftStartDateTime, setShiftStartDateTime] = useState<string | number>(format_date(props.start))
  console.log(shiftStartDateTime)

  
  const [shiftEndDateTime, setShiftEndDateTime] = useState<string | number>(format_date(props.end))
  console.log(shiftEndDateTime)


  // const [shiftEndDateTime, setShiftEndDateTime] = useState<string | number>("")

  // use supabase field names
  // const [volunteerInstructions, setVolunteerInstructions] = useState<
  //   string | number
  // >("")
  const [volunteerInstructions, setVolunteerInstructions] = useState<
    string | number
  >(props.volunteer_instructions)

  const supabase = useSupabaseClient()

  const editShift = async (e) => {
    e.preventDefault()

    console.log("in editShift")

    console.log(supabase)

    console.log(volunteerInstructions)

    const { data, error } = await supabase
    .from('shifts')
    .update({ 
      name: name, 
      start: new Date(shiftStartDateTime),
      end: new Date(shiftEndDateTime),
      volunteer_instructions: volunteerInstructions
    })
    .eq('id', props.shiftId)
    .select()
    
    if (error) {
      alert(error)
    } else {
      // window.location.reload()
      console.log(data, error)
    }
  }

  return (
    <>
      <label htmlFor="move-modal" className="btn btn-link">
        Edit Shift Details
      </label>
      <input type="checkbox" id="move-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box w-5/6 max-w-3xl">
          <h3 className="font-bold text-lg">Edit shift details</h3>
          <form onSubmit={editShift}>
            <div className="flex flex-row justify-between">
              <div className="form-control max-w-xs">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  required
                  className="select select-bordered max-w-xs"
                  // value={name}
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                >
                  <option disabled selected value="">
                    Type
                  </option>
                  <option>Capacity Counter</option>
                  <option>Server</option>
                  <option>Caregiver</option>
                </select>
              </div>
              <div className="form-control max-w-xs">
                <label className="label">
                  <span className="label-text">Start</span>
                </label>
                <input
                  value={shiftStartDateTime}
                  onChange={(e) => setShiftStartDateTime(e.target.value)}
                  type="datetime-local"
                  required
                  className="input input-bordered"
                />
              </div>
              <div className="form-control max-w-xs">
                <label className="label">
                  <span className="label-text">End</span>
                </label>
                <input
                  value={shiftEndDateTime}
                  onChange={(e) => setShiftEndDateTime(e.target.value)}
                  type="datetime-local"
                  required
                  className="input input-bordered"
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Volunteer Instructions</span>
              </label>
              <textarea
                value={volunteerInstructions}
                onChange={(e) => setVolunteerInstructions(e.target.value)}
                className="textarea textarea-bordered h-24"
                placeholder="Instructions..."
              ></textarea>
            </div>
            <div className="modal-action">
              <label
                className="btn btn-outline btn-primary"
                htmlFor="move-modal"
              >
                Cancel
              </label>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default EditShiftModal
