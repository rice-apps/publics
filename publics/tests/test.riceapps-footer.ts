import { test, expect } from "@playwright/test"

test("there should be an image with the riceapps logo in the footer", async ({
  page,
}) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto("http://localhost:3000/")
  // confirm that the page contains an image with the riceapps logo
  expect(page.getByAltText("RiceApps Logo"))
})
