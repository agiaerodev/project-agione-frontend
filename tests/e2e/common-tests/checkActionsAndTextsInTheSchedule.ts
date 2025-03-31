export const checkActionsAndTextsInTheSchedule = async (page, expect) => {
    await expect(page.getByPlaceholder('Search')).toBeVisible();
    await expect(page.locator('.actions-content > div > .q-btn').first()).toBeVisible();
    await expect(page.locator('div:nth-child(3) > .q-btn').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Scheduler' })).toBeVisible();
    await expect(page.locator('#filter-button-crud')).toBeVisible();
    await expect(page.locator('div:nth-child(6) > .q-btn').first()).toBeVisible();

    await page.locator('#pageActionscomponent').getByLabel('Expand').click();
    await expect(page.getByText('Refresh', { exact: true })).toBeVisible();
    await expect(page.getByText('Refresh every 1 minutes')).toBeVisible();
    await expect(page.getByText('Refresh every 5 minutes')).toBeVisible();
    await expect(page.getByText('Refresh every 10 minutes')).toBeVisible();
    await expect(page.getByText('Refresh every 15 minutes')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Week' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Schedule' })).toBeVisible();
}