import { themeChange } from 'theme-change'
import { useEffect } from 'react'
import Link from 'next/link'

export default function ThemeChange() {
    useEffect(() => {
        themeChange(false)
    }, [])
    const themes: string[] = ["publics", "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"];
    return (
        <select data-choose-theme className="select select-bordered max-w-xs mr-2">
            {themes.map((theme) => (
                <option value={theme} key={theme}>{theme.toLocaleUpperCase()}</option>
            ))}
        </select>
    )
}