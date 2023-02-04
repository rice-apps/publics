import Image from "next/image"
import Link from "next/link"

export default function Error404() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md flex flex-col items-center">
          <Image
            src="/owl_error.png"
            width={250}
            height={342}
            alt="Error Owl"
          />
          <h1 className="text-5xl font-bold">Party&apos;s over :(</h1>
          <p className="py-6">Error 404.</p>
          <Link href="/">
            <button className="btn btn-primary">Return Home.</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
