import Navbar from './Navbar';
import Footer from './Footer';
import React from 'react';

export default function Layout(passThrough: {session: any, children: React.ReactNode}) {
    return (
        <div className="flex flex-col justify-between">
            <Navbar session={passThrough.session} />
            <main className="mb-auto bg-base-200 min-h-screen">{passThrough.children}</main>
            <Footer />
        </div>
    )
}