export const checkTheExportActionInTheSchedule = async (page, expect) => {
    await page.locator('div:nth-child(6) > .q-btn').first().click();
    await page.locator('#innerLoadingMaster').waitFor({ state: 'hidden' });
    await expect(page.getByText('New Report')).toBeVisible({ timeout: 40000 });
    await expect(page.getByText('Export Schedule with current')).toBeVisible();
    await expect(page.getByLabel('Format')).toBeVisible();
    await expect(page.getByText('Export | Schedule')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
    await expect(page.getByText('Last Report (csv)')).toBeVisible();
    await expect(page.getByText('Date:')).toBeVisible();
    await expect(page.getByText('Size:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download' })).toBeVisible();
    await page.locator('#masterModalContent').getByRole('button').first().click();

    await expect(page.locator('#masterModalContent')).toBeHidden();
}