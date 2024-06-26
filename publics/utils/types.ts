export type ListEvent = {
  id: string
  name: string
  description: string
  slug: string
  event_datetime: string
  organization: Organization
  location: string
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

export type MemberAbout = {
  image_url: string
  name: string
  title: string
  college: string
}
