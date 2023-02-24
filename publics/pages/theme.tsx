import ThemeChange from "../components/ThemeChange"

export default function ThemePage() {
  return (
    <div className="p-4">
      <h1>Theme Page</h1>
      <div className="my-2">
        <ThemeChange />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button className="btn">Default</button>
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
        <button className="btn btn-accent">Accent</button>
        <button className="btn btn-info">Info</button>
        <button className="btn btn-success">Success</button>
        <button className="btn btn-warning">Warning</button>
        <button className="btn btn-error">Error</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        <progress value="20" max="100" className="progress">
          Default
        </progress>
        <progress value="25" max="100" className="progress progress-primary">
          Primary
        </progress>
        <progress value="30" max="100" className="progress progress-secondary">
          Secondary
        </progress>
        <progress value="40" max="100" className="progress progress-accent">
          Accent
        </progress>
        <progress value="45" max="100" className="progress progress-info">
          Info
        </progress>
        <progress value="55" max="100" className="progress progress-success">
          Success
        </progress>
        <progress value="70" max="100" className="progress progress-warning">
          Warning
        </progress>
        <progress value="90" max="100" className="progress progress-error">
          Error
        </progress>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        <div className="flex gap-2">
          <input type="checkbox" className="checkbox" />
          <input type="range" min="0" max="100" className="range max-w-xs" />
          <input type="checkbox" className="toggle" />
        </div>
        <div className="flex gap-2">
          <input type="checkbox" className="checkbox checkbox-primary" />
          <input
            type="range"
            min="0"
            max="100"
            className="range range-primary max-w-xs"
          />
          <input type="checkbox" className="toggle toggle-primary" />
        </div>
        <div className="flex gap-2">
          <input type="checkbox" className="checkbox checkbox-secondary" />
          <input
            type="range"
            min="0"
            max="100"
            className="range range-secondary max-w-xs"
          />
          <input type="checkbox" className="toggle toggle-secondary" />
        </div>
        <div className="flex gap-2">
          <input type="checkbox" className="checkbox checkbox-accent" />
          <input
            type="range"
            min="0"
            max="100"
            className="range range-accent max-w-xs"
          />
          <input type="checkbox" className="toggle toggle-accent" />
        </div>
        <div className="flex gap-2">
          <input type="checkbox" className="checkbox checkbox-info" />
          <input
            type="range"
            min="0"
            max="100"
            className="range range-info max-w-xs"
          />
          <input type="checkbox" className="toggle toggle-info" />
        </div>
        <div className="flex gap-2">
          <input type="checkbox" className="checkbox checkbox-success" />
          <input
            type="range"
            min="0"
            max="100"
            className="range range-success max-w-xs"
          />
          <input type="checkbox" className="toggle toggle-success" />
        </div>
        <div className="flex gap-2">
          <input type="checkbox" className="checkbox checkbox-warning" />
          <input
            type="range"
            min="0"
            max="100"
            className="range range-warning max-w-xs"
          />
          <input type="checkbox" className="toggle toggle-warning" />
        </div>
        <div className="flex gap-2">
          <input type="checkbox" className="checkbox checkbox-error" />
          <input
            type="range"
            min="0"
            max="100"
            className="range range-error max-w-xs"
          />
          <input type="checkbox" className="toggle toggle-error" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs"
        />
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered input-primary w-full max-w-xs"
        />
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered input-secondary w-full max-w-xs"
        />
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered input-accent w-full max-w-xs"
        />
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered input-info w-full max-w-xs"
        />
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered input-success w-full max-w-xs"
        />
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered input-warning w-full max-w-xs"
        />
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered input-error w-full max-w-xs"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        <div className="alert shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current flex-shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>12 unread messages. Tap to see.</span>
          </div>
        </div>
        <div className="alert border-primary border-2 shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-primary flex-shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>11 unread messages. Tap to see.</span>
          </div>
        </div>
        <div className="alert border-secondary border-2 shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-secondary flex-shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>10 unread messages. Tap to see.</span>
          </div>
        </div>
        <div className="alert border-accent border-2 shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-accent flex-shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>9 unread messages. Tap to see.</span>
          </div>
        </div>
        <div className="alert alert-info shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current flex-shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>New software update available.</span>
          </div>
        </div>
        <div className="alert alert-success shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Your purchase has been confirmed!</span>
          </div>
        </div>
        <div className="alert alert-warning shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Warning: Invalid email address!</span>
          </div>
        </div>
        <div className="alert alert-error shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Error! Task failed successfully.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
