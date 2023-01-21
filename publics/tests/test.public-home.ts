import { test, expect } from "@playwright/test"

test("should navigate to the home page not logged in", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto("http://localhost:3000/")
  // confirm that the page contains "Streamlining public parties at Rice."
  await expect(page.locator("h1")).toContainText(
    "Streamlining public parties at Rice."
  )
  // confirm that the page contains a button with the text "sign in with your Rice google"
  await expect(page.locator("button")).toContainText(
    "Sign in with your Rice Google"
  )
  // Find an element with the text 'Publics' and click on it
  await page.click("text=Publics")
  // check the same things
  await expect(page.locator("h1")).toContainText(
    "Streamlining public parties at Rice."
  )
  await expect(page.locator("button")).toContainText(
    "Sign in with your Rice Google"
  )
})
