import { test as setup, expect } from '@playwright/test'
import { createSession  } from '../auth'

const URL = 'http://localhost:8080/#/ramp/work-orders/index'

setup('authenticate', async ({ page }) => {
    await page.goto(URL);
    await createSession(page)
    await page.reload()

    await page.waitForLoadState('networkidle')
    await page.waitForLoadState('load')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('#titleCrudTable')).toBeVisible({ timeout: 15000 });
})