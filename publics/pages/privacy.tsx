import Image from "next/image"

export default function Privacy() {
  return (
    <article className="px-8">
      <h1>
        Privacy Policy for Party Owl{" "}
        <Image
          src="/owl.png"
          width={30}
          height={45}
          alt="Logo"
          className="inline"
        ></Image>
        , created by RiceApps
      </h1>

      <section className="text-lg font-semibold">
        At Party Owl, we understand the importance of privacy and are committed
        to protecting the personal information of our users. This privacy policy
        outlines the types of personal information we collect, how we use it,
        and how we protect it.
      </section>

      <h3>Information we collect:</h3>
      <section>
        <ul className="list-disc px-4">
          <li>
            Information from Rice Google accounts, including email address and
            profile image
          </li>
          <li>
            Publicly available Rice student information, including full name,
            netid, and residential college
          </li>
          <li>
            Information about the user&apos;s interactions with the site,
            including last login and events registered for using the site
          </li>
        </ul>
      </section>
      <h3>Use of Information:</h3>
      <section>
        We use the collected information to:
        <ul className="list-disc px-4">
          <li>Create and manage user accounts</li>
          <li>Make registering for publics easier</li>
          <li>Make volunteering easier</li>
          <li>
            Allow event planners to more quickly and accurately verify
            identities
          </li>
        </ul>
      </section>
      <h3>Data sharing:</h3>
      <section>
        We do not share any personal information with third parties outside of
        Rice.
      </section>
      <h3>Data security:</h3>
      <section>
        We take data security very seriously and employ technical and
        organizational measures to protect the personal information we collect.
        All data is stored on secured databases operated by Supabase and Amazon
        Web Services.
      </section>
      <h3>Changes to the Privacy Policy:</h3>
      <section>
        We reserve the right to update and revise this privacy policy at any
        time without notice. Users are encouraged to review this privacy policy
        periodically to stay informed about how we are protecting their personal
        information.
      </section>
      <h3>Contact Us:</h3>
      <section>
        If you have any questions or concerns about this privacy policy, please
        contact us at awj3@rice.edu.
      </section>
    </article>
  )
}
