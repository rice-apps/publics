import { useState, useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

function AddShiftModal(props) {
  const [name, setName] = useState()
  const [shiftStartDateTime, setShiftStartDateTime] = useState()
  const [shiftEndDateTime, setShiftEndDateTime] = useState()
  const [volunteerInstructions, setVolunteerInstructions] = useState()

  const supabase = useSupabaseClient()

  const createShift = async (e) => {
    e.preventDefault()

    const { data, error } = await supabase
        .from("shifts")
        .insert([
            {
                name: name,
                start: new Date(shiftStartDateTime),
                end: new Date(shiftEndDateTime),
                volunteer_instructions: volunteerInstructions,
                event: props.eventId
            }
        ])
    if (error) {
        alert(error)
    } else {
        document.getElementById("add-modal").checked = false
        window.location.reload()
    }
  }

  return (
    <>
      <label htmlFor="add-modal" className="btn btn-primary">
        Add Shift
      </label>
      <input type="checkbox" id="add-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box w-5/6 max-w-3xl">
          <h3 className="font-bold text-lg">Add Shift</h3>
          <form onSubmit={createShift}>
            <div className="flex flex-row justify-between">
              <div className="form-control max-w-xs">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  required
                  className="select select-bordered max-w-xs"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                >
                  <option disabled selected value="">
                    Type
                  </option>
                  <option>Capacity Counter</option>
                  <option>Security</option>
                  <option>Caregiver</option>
                </select>
              </div>
              <div className="form-control max-w-xs">
                <label className="label">
                  <span className="label-text">Start</span>
                </label>
                <input
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
              <label className="btn btn-outline btn-primary" htmlFor="add-modal">Cancel</label>
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default AddShiftModal
