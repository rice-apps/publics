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
<<<<<<< HEAD
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
=======
  id: string
  photo: string
  name: string
}
>>>>>>> main
