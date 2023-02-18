import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="footer items-center p-4 bg-base-300">
      <div className="items-center grid-flow-col">
        <Image
          width={36}
          height={36}
          src="/owl.svg"
          className="sm:max-w-sm rounded-lg shadow-2xl"
          alt="RiceApps Logo"
        />
        <p>
          Copyright© Party Owl 2023 - All right reserved
          <Link href="/about" className="mx-3 underline">
            About
          </Link>
          <Link href="/privacy" className="mx-3 underline">
            Privacy
          </Link>
        </p>
      </div>
    </footer>
  )
}
