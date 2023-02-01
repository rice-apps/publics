import Image from "next/image"

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
        <p>Copyright© Party Owl 2023 - All right reserved</p>
      </div>
    </footer>
  )
}
