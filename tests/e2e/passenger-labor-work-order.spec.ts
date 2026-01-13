import { test, expect } from '../shared-context'
import { config } from '../config'

const PATH = '/ramp/labor/index'

test.use({ baseURL: `${config.url}${PATH}` });

test.describe.serial('CRUD', () => {
    test('Testing to create a "Work Order" in labor', async ({ page }) => {
        await page.getByRole('button', { name: 'New' }).click();
        await expect(page.getByText('New Work Order')).toBeVisible();
        await expect(page.getByRole('combobox', { name: '*Customer' })).toBeVisible();
        await expect(page.getByLabel('*Flight number')).toBeVisible();
        await expect(page.getByText('Enter the fight number and')).toBeVisible();
        await expect(page.getByLabel('*Station')).toBeVisible();
        await expect(page.getByLabel('Assigned to')).toBeVisible();
        await expect(page.getByText('If you left this field empty')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    
        await page.getByLabel('*Customer').click();
        await page.getByLabel('*Customer').fill('AARK');
        await page.getByRole('option', { name: 'AARK (Ad Hoc)' }).click();
        await page.locator('#formRampComponent div').filter({ hasText: 'New Work Order' }).first().click();
    
        await page.getByLabel('*Flight number').click();
        await page.getByLabel('*Flight number').fill('TEST-00');
        await page.getByLabel('*Station').click();
        await page.getByLabel('*Station').fill('Austin');
        await page.getByRole('option', { name: 'Austin, TX (AUS)' }).click();
        await page.getByLabel('Assigned to').click();
        await page.getByLabel('Assigned to').fill('ima');
        await page.getByRole('option', { name: 'Imagina Colombia' }).click();
        await page.getByRole('button', { name: 'Save' }).click();
    
        await expect(page.getByText('Error when looking for the')).not.toBeVisible();
    
        await expect(page.getByText('Flight number', { exact: true })).toBeVisible();
        await expect(page.getByText('Are you sure TEST-00 is a')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
    
        await page.getByRole('button', { name: 'Yes' }).click();

        await page.waitForLoadState('networkidle');
    
        await expect(page.getByText('What do you want to do?')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go out to the list' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Continue editing' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Create a new one' })).toBeVisible();
    
        await page.getByRole('button', { name: 'Go out to the list' }).click();
    })
})
