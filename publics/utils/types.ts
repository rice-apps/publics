export type ListEvent = {
    id: string
    name: string
    description: string
    slug: string
    event_datetime: string
    organization: Organization
    registration: boolean
    registration_datetime: string
}

type Organization = {
    id: string
    photo: string
    name: string
}

export type MemberAbout = {
    image_url: string
    name: string
    title: string
    college: string
}