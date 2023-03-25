import { useSupabaseClient } from "@supabase/auth-helpers-react"

export default function Delete(props) {
  //make sure to delete event if deleted
  //else close modal
  return (
    <div className={props.modalOpen? "block":"hidden"}>
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Congratulations random Internet user!
          </h3>
          <p className="py-4">
            You've been selected for a chance to get one year of subscription to
            use Wikipedia for free!
          </p>
          <div className="modal-action">
            <label className="btn" onProgressCapture={props.modalOpen(false)}>Cancel</label>
            <label className="btn-error" onClick={props.modalOpen}>Delete</label>
          </div>
        </div>
    </div>
    </div>
  )
}
