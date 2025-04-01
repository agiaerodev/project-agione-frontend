export const checkTheSwitchToTheDailyView = async (page, expect) => {
    await page.getByRole('button', { name: 'Today' }).click();
    await expect(page.getByRole('button', { name: 'Week' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible();
    await expect(page.locator('.tw-inline-flex').first()).toBeVisible();
    await expect(page.locator('.tw-flex-1 > div:nth-child(2) > div > div:nth-child(2) > div')).toBeHidden();
}