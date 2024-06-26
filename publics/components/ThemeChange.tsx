import Link from "next/link"
import { useEffect } from "react"
import { themeChange } from "theme-change"

export default function ThemeChange() {
  useEffect(() => {
    themeChange(false)
  }, [])
  const themes: string[] = [
    "party",
    "nocturnal party owl",
    "acid",
    "aqua",
    "aura",
    "autumn",
    "black",
    "bumblebee",
    "business",
    "butter",
    "cmyk",
    "coffee",
    "corporate",
    "cupcake",
    "cyberpunk",
    "dracula",
    "emerald",
    "fantasy",
    "forest",
    "garden",
    "halloween",
    "lemonade",
    "lofi",
    "luxury",
    "night",
    "pastel",
    "retro",
    "synthwave",
    "tokyo-night",
    "valentine",
    "winter",
    "wireframe",
  ]
  return (
    <select data-choose-theme className="select select-bordered max-w-xs mr-2">
      {themes.map((theme) => (
        <option value={theme} key={theme}>
          {theme.toLocaleUpperCase()}
        </option>
      ))}
    </select>
  )
}
