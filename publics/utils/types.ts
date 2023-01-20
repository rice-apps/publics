export type ListEvent = {
  id: string
  name: string
  description: string
  slug: string
  event_datetime: string
  organization: Organization
  registration: boolean
  registration_datetime: string
  college_registration_datetime: string
  registration_closed: boolean
  img_url: string
}

type Organization = {
  id: string
  photo: string
  name: string
}
