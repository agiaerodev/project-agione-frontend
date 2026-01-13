import { expect } from '@playwright/test'
import { acquireAccount } from './auth'

export const login = async (page) => {
    await acquireAccount(page)
    await page.reload()

    await page.waitForLoadState('networkidle')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForLoadState('load')

    await expect(page.locator('#titleCrudTable')).toBeVisible({ timeout: 25000 });
}