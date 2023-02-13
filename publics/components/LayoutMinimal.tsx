import Footer from "./Footer"
import Seo from "./Seo"
import React, { useEffect } from "react"
import { themeChange } from "theme-change"

export default function Layout(children: { children: React.ReactNode }) {
  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
  }, [])
  return (
    <>
      <Seo />
      <div className="flex flex-col justify-between">
        <main className="min-h-screen">{children.children}</main>
        <Footer />
      </div>
    </>
  )
}
