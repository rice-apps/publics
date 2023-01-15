import Navbar from './Navbar';
import Footer from './Footer';
import React from 'react';


export default function Layout(children: {children: React.ReactNode}) {
    return (
        <div className="flex flex-col justify-between">
            <Navbar />
            <main className="mb-auto bg-base-200 min-h-screen">{children.children}</main>
            <Footer />
        </div>
    )
}