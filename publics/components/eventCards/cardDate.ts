export function getOrdinal(n: string) {
    let ord = ["st", "nd", "rd"]
    let exceptions = [11, 12, 13]
    let newNum = Number(n.replace(/\s/g, ''))
    let nth = ord[(newNum % 10) - 1] == undefined || exceptions.includes(newNum % 100) ? "th" : ord[(newNum % 10) - 1]
    return newNum.toString() + nth
}

export function eventCardDate(datetime: string, registration: boolean) {
    const dt: Date = new Date(datetime)

    const date = dt.toLocaleDateString('en-us', { weekday: "long", month: "long", day: "numeric" });
    const time = dt.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    //console.log(date.slice(date.length-2, date.length-1))
    const ordinalday = getOrdinal(date.slice(date.length - 2))

    if (registration) {
        return `${date.slice(0, date.length - 2)} ${ordinalday} @ ${time}`
    }
    else {
        return `${date.slice(0, date.length - 2)} ${ordinalday}`
    }
}
