import { useEffect } from 'react'
import { themeChange } from 'theme-change'
import Link from 'next/link'

export default function Navbar() {
    useEffect(() => {
        themeChange(false)
    }, [])
    const themes: string[] = ["publics", "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"];

    const navbar_content = (<><li><Link href="/events">Events</Link></li>
    <li><Link href="mailto:awj3@rice.edu">Contact</Link></li>
        <li tabIndex={0}>
            <a className="justify-between">
                Parent
                <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" /></svg>
            </a>
            <ul className="p-2">
                <li><a>Submenu 1</a></li>
                <li><a>Submenu 2</a></li>
            </ul>
        </li>
        <li><a>Item 3</a></li></>)

    return (
        <div className="navbar bg-base-100 min-h-fit">
            <div className="navbar-start">
                <div className="dropdown">
                    <label tabIndex={0} className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    </label>
                    <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                        {navbar_content}
                    </ul>
                </div>
                <span className="btn btn-ghost normal-case text-xl">
                    <Link href="/">Publics</Link>
                </span>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal p-0">
                    {navbar_content}
                </ul>
            </div>
            <div className="navbar-end">
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="m-1">
                        <div className="avatar hover:scale-110 hover:drop-shadow-lg transition-all">
                            <div className="w-16 rounded-full mr-2">
                                <img src="https://placeimg.com/192/192/animals" />
                            </div>
                        </div>
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 border border-secondary">
                        <select data-choose-theme className="select select-bordered max-w-xs mr-2">
                            {themes.map((theme) => (
                                <option value={theme} key={theme}>{theme.toLocaleUpperCase()}</option>
                            ))}
                        </select>
                        <li><Link href="/account">Account</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}