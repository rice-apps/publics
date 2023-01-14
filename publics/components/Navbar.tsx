import { useEffect } from 'react'
import Link from 'next/link'

export default function Navbar({ session }) {
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
                    <Link href="/account" className='btn btn-outline hover:scale-110 hover:drop-shadow-lg transition-all'>
                        {
                            session && session.user && session.user.user_metadata.picture ? (
                                <div className="avatar">
                                    <div className="w-8 rounded">
                                        <img src={session.user.user_metadata.picture} alt="Google profile avatar" className='w-fit' />
                                    </div>
                                </div>
                            ) : (
                                <span>Login or Signup</span>
                            )
                        }

                    </Link>
                </div>
            </div>
        </div>
    )
}