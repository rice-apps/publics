import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen justify-between">
            <Navbar />
            <main className="mb-auto">{children}</main>
            <Footer />
        </div>
    )
}