export const waitForPageToBeReady = async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('load');
    await page.waitForLoadState('domcontentloaded');
}