import { account } from "./.auth/account"
import { test as setup, expect } from "@playwright/test"

const authFile = "tests/.auth/user.json"

setup("authenticate", async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto("http://localhost:3000/")
  await page.getByText("Sign in with your Rice ID").click()
  // should redirect to google login, expect url to be google
  // await page.waitForLoadState('networkidle');
  // await expect(page.url()).toContain('https://accounts.google.com/ServiceLogin?')
  await page.waitForLoadState("networkidle")
  await expect(page.url()).toContain(
    "https://accounts.google.com/o/oauth2/auth/identifier?"
  )
  // expect rgdrbnbynqacsbkzofyf.supabase.co button to be present
  const supabase_text = await page.getByText("rgdrbnbynqacsbkzofyf.supabase.co")
  await expect(supabase_text !== undefined).toBeTruthy()
  // find the email input and fill it in
  await page.getByLabel("Email or phone").fill(account.email)
  // find the next button and click it
  await page.getByRole("button", { name: "Next" }).click()
  // expect redirect to idp.rice.edu
  await page.waitForTimeout(1000) // 1 second
  await page.waitForLoadState("domcontentloaded")
  await expect(page.url()).toContain(
    "https://idp.rice.edu/idp/profile/SAML2/Redirect/SSO?"
  )
  // find netid input and fill it in
  await page.getByLabel("NetID").fill(account.netid)
  // find password input and fill it in
  await page.getByLabel("Password").fill(account.password)
  // find the login button and click it
  await page.getByRole("button", { name: "Login" }).click()
  // expect redirect to duo
  await expect(page.url()).toContain("https://duo.rice.edu/frame/web/v1/auth?")
  // wait for autosend push
  await page.waitForTimeout(15000) // 15 seconds
  // after 15 seconds, expect redirect to publics
  await expect(page.url()).toContain("http://localhost:3000/")
  // End of authentication steps.

  await page.context().storageState({ path: authFile })
})
