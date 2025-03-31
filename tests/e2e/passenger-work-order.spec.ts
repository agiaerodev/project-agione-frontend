import { test, expect } from '../shared-context'
import moment from 'moment-timezone';
import { deleteWorkOrder } from './common-tests'

const URL = 'http://localhost:8080/#/passenger/work-orders/index'

const openModalFull = async (page) => {
    await page.locator('.crudIndexActionsColumn').first().click();
    await page.locator('a').filter({ hasText: 'Edit' }).click();
}

const deleteWO = async (page) => {
    const tr = await page.locator('tbody').locator('.q-tr.tw-bg-white').first();
    await expect(tr).toBeVisible({ timeout: 60000 });
    const id: any = await tr.locator('td').nth(2).textContent()
    await tr.getByRole('button').nth(1).click();

    await deleteWorkOrder(page, expect);
    
    await expect(page.locator('table').getByText(id)).toBeHidden({ timeout: 60000 });
};

test.use({ baseURL: URL });

test('Verify the display of actions and filter fields in the passenger section', async ({ page }) => {
    await page.locator('#innerLoadingMaster').waitFor({ state: 'hidden' });
    await expect(page.getByLabel('Expand "New"')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('div:nth-child(4) > .q-btn')).toBeVisible();
    await expect(page.locator('div:nth-child(5) > .q-btn')).toBeVisible();
    await expect(page.locator('#filter-button-crud')).toBeVisible();
    await expect(page.locator('#refresh-button-crud')).toBeVisible();
    await expect(page.getByLabel('Customer')).toBeVisible();
    await expect(page.getByLabel('Contract')).toBeVisible();
    await expect(page.getByLabel('Status')).toBeVisible();
    await expect(page.getByLabel('Ad Hoc')).toBeVisible();
    await expect(page.locator('#crudIndexViewAction')).toBeVisible();
    await expect(page.getByPlaceholder('Search')).toBeVisible({ timeout: 10000 });
})

test('Verify section titles', async ({ page }) => {
    await openModalFull(page);
    
    await expect(page.getByText('Flight', { exact: true })).toBeVisible();
    await expect(page.getByText('Services')).toBeVisible();
    await expect(page.getByText('Delay')).toBeVisible();
    await expect(page.getByText('Remark')).toBeVisible();
});

test.describe.serial('Test flight CRUD', () => {
    test('Verify fields in the creation modal and create a work order', async ({ page }) => {
        await page.getByLabel('Expand "New"').click();
        await page.getByText('Create Flight').click();
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
    
        await expect(page.getByText('What do you want to do?')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go out to the list' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Continue editing' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Create a new one' })).toBeVisible();
    
        await page.getByRole('button', { name: 'Go out to the list' }).click();
    })

    test('Check dynamic fields', async ({ page }) => {
        await openModalFull(page);

        await page.getByLabel('*Operation').click();
        await page.getByLabel('*Operation').fill('Charter.ORG');
        await page.getByRole('option', { name: 'Charter.ORG' }).click();
        await expect(page.getByLabel('*Charter Rate')).toBeVisible();
        await expect(page.getByLabel('Cancellation type')).toBeVisible();

        await page.getByLabel('*Operation').click();
        await page.getByLabel('*Operation').fill('Charter.Unscheduled');
        await page.getByRole('option', { name: 'Charter.Unscheduled' }).click();
        await expect(page.getByLabel('*Charter Rate')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Expand', exact: true })).toBeVisible();
        await expect(page.getByLabel('Collapse', { exact: true })).toBeVisible();

        await page.getByLabel('*Operation').click();
        await page.getByLabel('*Operation').fill('Charter.TURN');
        await page.getByRole('option', { name: 'Charter.TURN' }).click();
        await expect(page.getByRole('button', { name: 'Expand', exact: true })).toBeVisible();
        await expect(page.getByLabel('Collapse', { exact: true })).toBeVisible();
    })
    
    test('Update a work order', async ({ page }) => {
        await openModalFull(page);
        const FORMAT_DATE = 'MM/DD/YYYY HH:mm';
        const today = moment().format(FORMAT_DATE);
        const tomorrow = moment().add(1, 'day').format(FORMAT_DATE);
        const yesterday = moment().subtract(1, 'day').format(FORMAT_DATE);

        await expect(page.getByLabel('*Customer', { exact: true })).toBeVisible();
        await expect(page.getByLabel('*Station')).toBeVisible();
        await expect(page.getByLabel('*Carrier')).toBeVisible();
        await expect(page.getByLabel('*Status')).toBeVisible();

        
        await expect(page.getByLabel('*A/C Type')).toBeVisible();
        await page.getByLabel('*A/C Type').click();
        await page.getByLabel('*A/C Type').fill('A124');
        await page.getByRole('option', { name: 'A124' }).click();
        await page.locator('#formRampComponent div').filter({ hasText: 'Update Work Order Id:' }).first().click();
        
        await expect(page.getByLabel('*Operation')).toBeVisible();
        await page.getByLabel('*Operation').click();
        await page.getByLabel('*Operation').fill('Ferry RON');
        await page.getByRole('option', { name: 'Ferry RON' }).click();
        await page.locator('#formRampComponent div').filter({ hasText: 'Update Work Order Id:' }).first().click();
        
        await expect(page.getByLabel('Cancellation type')).toBeVisible();
        await page.getByLabel('Cancellation type').click();
        await page.getByRole('option', { name: 'Cancelled Flight', exact: true }).click();
        await page.locator('#formRampComponent div').filter({ hasText: 'Update Work Order Id:' }).first().click();
        
        await expect(page.getByLabel('Pax Operation')).toBeVisible();
        await page.getByLabel('Pax Operation').fill('Flight TURN');
        await page.getByRole('option', { name: 'Flight TURN-PAX.Delay' }).click();
        await page.locator('#formRampComponent div').filter({ hasText: 'Update Work Order Id:' }).first().click();
        
        await page.getByLabel('Cancellation Notice time').click();
        await page.getByLabel('Cancellation Notice time').fill('24');
    
        await page.getByLabel('Origin').click();
        await page.getByLabel('Origin').fill('Abile');
        await page.getByRole('option', { name: 'Abilene Rgnl (ABI)' }).click();
        await page.locator('#formRampComponent div').filter({ hasText: 'Update Work Order Id:' }).first().click();
    
        await page.getByTestId('dynamicField-inboundTailNumber').getByLabel('Tail N°').click();
        await page.getByTestId('dynamicField-inboundTailNumber').getByLabel('Tail N°').fill('78');
    
        await page.getByTestId('dynamicField-inboundScheduledArrival').getByPlaceholder('MM/DD/YYYY HH:mm').click();
        await page.getByTestId('dynamicField-inboundScheduledArrival').getByPlaceholder('MM/DD/YYYY HH:mm').fill(tomorrow);
    
        await page.getByLabel('Destination').click();
        await page.getByLabel('Destination').fill('Acadiana');
        await page.getByRole('option', { name: 'Acadiana Rgnl (ARA)' }).click();
        await page.locator('#formRampComponent div').filter({ hasText: 'Update Work Order Id:' }).first().click();
    
        await page.getByTestId('dynamicField-outboundTailNumber').getByLabel('Tail N°').click();
        await page.getByTestId('dynamicField-outboundTailNumber').getByLabel('Tail N°').fill('45');
    
        await page.getByTestId('dynamicField-outboundScheduledDeparture').getByPlaceholder('MM/DD/YYYY HH:mm').click();
        await page.getByTestId('dynamicField-outboundScheduledDeparture').getByPlaceholder('MM/DD/YYYY HH:mm').fill(today);
    
        await page.getByLabel('Inbound Gate Arrival').click();
        await page.getByLabel('Inbound Gate Arrival').fill('002');
        await page.getByLabel('Outbound Gate Departure').click();
        await page.getByLabel('Outbound Gate Departure').fill('004');
    
        await page.getByTestId('dynamicField-inboundBlockIn').getByPlaceholder('MM/DD/YYYY HH:mm').click();
        await page.getByTestId('dynamicField-inboundBlockIn').getByPlaceholder('MM/DD/YYYY HH:mm').fill(yesterday);
        await page.getByTestId('dynamicField-outboundBlockOut').getByPlaceholder('MM/DD/YYYY HH:mm').click();
        await page.getByTestId('dynamicField-outboundBlockOut').getByPlaceholder('MM/DD/YYYY HH:mm').fill(today);
    
        await expect(page.getByText('Difference (hours):')).toBeVisible();
    
        await page.locator('#stepComponent div').filter({ hasText: 'Services' }).nth(2).click();
        await page.getByText('Cargo Man Power').click();
        await page.locator('.tw-flex > div:nth-child(3) > .q-btn').first().click();
        await page.locator('div:nth-child(2) > div > div > #dynamicFieldComponent > div > .tw-flex > div:nth-child(3) > .q-btn').first().click();
        await page.locator('div:nth-child(2) > .tw-w-3\\/5 > div > div > div > #dynamicFieldComponent > div > .tw-flex > div:nth-child(3) > .q-btn').first().click();
        await page.locator('div:nth-child(2) > .tw-w-3\\/5 > div:nth-child(2) > div > div > #dynamicFieldComponent > div > .tw-flex > div:nth-child(3) > .q-btn').click();
        
        await expect(page.locator('button').filter({ hasText: '1' }).nth(1)).toBeVisible();
        await expect(page.locator('#stepComponent button').filter({ hasText: '2' })).toBeVisible();
    
        await page.locator('#stepComponent div').filter({ hasText: 'Delay' }).nth(2).click();
        await page.getByLabel('Our delay').click();
        await page.getByRole('option', { name: 'Yes' }).locator('div').nth(1).click();
        await page.getByLabel('Delay Comment').click();
        await page.getByLabel('Delay Comment').fill('Delay comment');
        await page.getByLabel('Code').click();
        await page.getByLabel('Code').fill('AIRLINE INTERNAL');
        await page.getByRole('option', { name: '-05 AIRLINE INTERNAL CODES' }).click();
        await page.getByLabel('Time').click();
        await page.getByLabel('Time').fill('24');
    
        await page.locator('#stepComponent div').filter({ hasText: 'Remark' }).nth(2).click();
        await page.getByLabel('Remark').click();
        await page.getByLabel('Remark').fill('Testing');
        await page.getByLabel('Safety Message').click();
        await page.getByLabel('Safety Message').fill('Testing');
    
        await page.getByRole('button', { name: 'Close' }).click();
    
        await expect(page.locator('#formRampComponent')).toBeHidden();
        await expect(page.getByText('Record updated')).toBeVisible();
    })
    
    test('Test delete work order', async ({ page }) => { 
        await deleteWO(page)
    })
})

test.describe('Testing feature non-flight work order', () => {
    test('Test the flight search modal and the search results table', async ({ page }) => {
        await page.getByLabel('Expand "New"').click();
        await expect(page.getByText('Create Non Flight')).toBeVisible();
        await page.getByText('Create Non Flight').click();
        await expect(page.getByText('Create non-flight')).toBeVisible();
        
        await expect(page.getByRole('button', { name: 'Additional Flight Services' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Non Flight Services' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Additional Flight Services' }).getByRole('button')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Non Flight Services' }).getByRole('button')).toBeVisible();
        await expect(page.getByLabel('*Flight number')).toBeVisible();
        await expect(page.getByText('Enter the fight number and')).toBeVisible();
        await page.getByLabel('*Flight number').click();
        await page.getByLabel('*Flight number').fill('nk1278');
        await page.getByLabel('*Flight number').press('Enter');
        await expect(page.locator('#flight-results-table')).toBeVisible({ timeout: 20000 });
 
        await expect(page.locator('#flight-results-table').getByRole('cell', { name: 'Inbound Flight Number' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Inbound Scheduled Arrival' })).toBeVisible();
        await expect(page.locator('#flight-results-table').getByRole('cell', { name: 'Outbound Flight Number' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Outbound Scheduled Departure' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Service Date Created' })).toBeVisible();

        await expect(page.getByLabel('Search...')).toBeVisible();
        await expect(page.getByRole('button', { name: 'cancel' })).toBeVisible();
    });

    test.describe.serial('Test non-flight CRUD', () => {
        test('Test saving a non-flight work order', async ({ page }) => {
            await page.getByLabel('Expand "New"').click();
            await page.getByText('Create Non Flight').click();
            await page.getByRole('button', { name: 'Non Flight Services' }).click();
            await expect(page.getByLabel('*Customer/Contract')).toBeVisible();
            await expect(page.locator('.absolute-right > .q-btn')).toBeVisible();
            await expect(page.getByLabel('Flight Number')).toBeVisible();
            await expect(page.getByLabel('*Station')).toBeVisible();
            await expect(page.getByPlaceholder('MM/DD/YYYY HH:mm')).toBeVisible();
            await expect(page.getByLabel('Assigned to')).toBeVisible();
            await expect(page.getByText('If you left this field empty')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
            await page.getByLabel('*Customer/Contract').click();
            await page.getByLabel('*Customer/Contract').fill('ABX AIR (Ad Hoc');
            await page.getByRole('option', { name: 'ABX AIR (Ad Hoc)' }).locator('div').nth(1).click();
            await page.getByLabel('Flight Number').click();
            await page.getByLabel('Flight Number').fill('TEST-01');
            await page.getByLabel('Assigned to').click();
            await page.getByLabel('Assigned to').fill('imagina');
            await page.getByRole('option', { name: 'Imagina Colombia' }).locator('div').nth(1).click({ timeout: 10000 });
            await page.getByRole('button', { name: 'Save' }).click();
            await expect(page.getByText('Update Work Order Id:')).toBeVisible({ timeout: 6000 });
            await expect(page.getByText('Non-flight', { exact: true })).toBeVisible();
        });
    
        test('Verificar non-flight modal', async ({ page }) => {
            await openModalFull(page);
        
            await expect(page.getByRole('combobox', { name: '*Customer' })).toBeVisible();
            await expect(page.getByLabel('*Station')).toBeVisible();
            await expect(page.getByLabel('*A/C Type')).toBeVisible();
            await expect(page.getByLabel('*Operation')).toBeVisible();
            await expect(page.getByLabel('*Carrier')).toBeVisible();
            await expect(page.getByLabel('*Status')).toBeVisible();
            await expect(page.getByTestId('dynamicField-scheduleDate').locator('div').filter({ hasText: '*Date Entered' }).nth(1)).toBeVisible();
            await expect(page.getByPlaceholder('MM/DD/YYYY HH:mm')).toBeVisible();
            await expect(page.getByLabel('Flight Number')).toBeVisible();
        })

        test('Test delete work order non-flight', async ({ page }) => {
            await deleteWO(page)
        })
    });

});
