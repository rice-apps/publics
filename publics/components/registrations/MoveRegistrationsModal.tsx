import { useSupabaseClient } from "@supabase/auth-helpers-react"

const MoveRegistrationsModal = (props) => {
  const supabase = useSupabaseClient()

  const updateRegistrations = async (eventId: string) => {
    // check if registration is closed
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("registration_closed")
      .eq("id", eventId)
      .single()
    if (eventError) {
      throw eventError
    }
    if (event.registration_closed) {
      const modal = document.getElementById("add-modal") as HTMLInputElement
      modal.checked = false
      alert("Registration is already closed")
      return
    }
    // move registrations
    const { data: _, error } = await supabase.rpc("update_registrations", {
      event_id: eventId,
    })
    if (error) {
      alert("Error moving registrations")
      const modal = document.getElementById("add-modal") as HTMLInputElement
      modal.checked = false
      return
    }

    // close registration in event table
    const { data, error: closeError } = await supabase
      .from("events")
      .update({ registration_closed: true })
      .eq("id", eventId)
    if (closeError) {
      alert("Waitlist updated but registration not closed")
    }

    const modal = document.getElementById("add-modal") as HTMLInputElement
    modal.checked = false
  }
  return (
    <>
      <label htmlFor="add-modal" className="btn btn-primary">
        Move Registrations
      </label>
      <input type="checkbox" id="add-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{`This action will move the first ${props.capacity} registrants from the waitlist and close registration. Proceed?`}</h3>

          <div className="modal-action">
            <label htmlFor="add-modal" className="btn btn-outline btn-primary">
              Cancel
            </label>
            <button
              className="btn btn-primary"
              onClick={() => {
                updateRegistrations(props.eventId)
              }}
            >
              Move
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MoveRegistrationsModal
