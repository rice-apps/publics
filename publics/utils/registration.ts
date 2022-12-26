import type { ListEvent } from "./types"

export function registrationOpen(event: ListEvent) {
    return event.registration && new Date(event.event_datetime) > new Date() && new Date(event.registration_datetime) <= new Date()
}