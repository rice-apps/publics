import LoginButton from "./LoginButton"

export default function Auth() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img
          src="/martelpic.jpg"
          className="ml-2 max-w-sm rounded-lg shadow-2xl"
        />
        <div className="lg:max-w-2/5 md:max-w-2/3">
          <h1 className="text-4xl font-bold">
            Streamlining public parties at Rice.
          </h1>
          <p className="py-6 text-xl">
            <span className="text-primary">Attendees</span> can register for
            events in-app and access important event information.
          </p>
          <p className="py-6 text-xl">
            <span className="text-primary">Volunteers</span> can seamlessly
            check in and out of their shift and track event capacity.
          </p>
          <p className="py-6 text-xl">
            <span className="text-primary">Socials</span> can create events,
            manage attendees and volunteers, and view event analytics.
          </p>
          <LoginButton />
        </div>
      </div>
    </div>
  )
}
