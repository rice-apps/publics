import type { ListEvent } from "./types"

export function registrationOpen(event: ListEvent) {
    return event.registration && new Date(event.event_datetime) > new Date() && new Date(event.registration_datetime) <= new Date()
}

export const getPagination = (page, size) => {
    const limit = size ? +size : 3
    const from = page ? page * limit : 0
    const to = page ? from + size - 1 : size - 1
  
    return { from, to }
  }