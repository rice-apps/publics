import { useEffect, useState } from "react";
import { themeChange } from "theme-change";
import Link from "next/link";
import {
  SupabaseClient,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";

export default function Navbar() {
  useEffect(() => {
    themeChange(false);
  }, []);
  const themes: string[] = [
    "publics",
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
  ];
  const [accountContent, setAccountContent] = useState(
    <li>
      <Link href="/account">Login</Link>
    </li>
  );

  const [accountSpan, setAccountSpan] = useState(
    <svg
      width="50px"
      height="50px"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="#000000"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <path
          d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0"
          fill="#fafafa"
        ></path>{" "}
      </g>
    </svg>
  );

  const navbar_content = (
    <>
      <li>
        <Link href="/events">Events</Link>
      </li>
      <li>
        <Link href="mailto:awj3@rice.edu">Contact</Link>
      </li>
    </>
  );

  const supabase = useSupabaseClient();

  const session = getSession(supabase).then((session) => {
    if (session) {
      console.log(session);
      let initials = session.user.user_metadata.full_name
        .split(" ")
        .map((name) => name[0])
        .join("");
      setAccountContent(
        <li>
          <Link href="/account">Account</Link>
        </li>
      );
      setAccountSpan(
        <span className="text-xl text-primary-content">{initials}</span>
      );
    } else {
      setAccountContent(
        <li>
          <Link href="/account">Login</Link>
        </li>
      );
      setAccountSpan(
        <svg
          width="50px"
          height="50px"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          fill="#000000"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0"
              fill="#fafafa"
            ></path>{" "}
          </g>
        </svg>
      );
    }
  });

  return (
    <div className="navbar bg-base-100 min-h-fit">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            {navbar_content}
          </ul>
        </div>
        <span className="btn btn-ghost normal-case text-xl">
          <Link href="/">Publics</Link>
        </span>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal p-0">{navbar_content}</ul>
      </div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="m-1">
            <div className="avatar placeholder hover:scale-110 hover:drop-shadow-lg transition-all">
              <div className="w-16 bg-primary rounded-full mr-2">
                {accountSpan}
              </div>
            </div>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 border border-secondary"
          >
            <select
              data-choose-theme
              className="select select-bordered max-w-xs mr-2"
            >
              {themes.map((theme) => (
                <option value={theme} key={theme}>
                  {theme.toLocaleUpperCase()}
                </option>
              ))}
            </select>
            {accountContent}
          </ul>
        </div>
      </div>
    </div>
  );
}

export async function getSession(supabase: SupabaseClient) {
  const session = await supabase.auth.getSession();
  return session?.data?.session;
}
