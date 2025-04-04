import { test, expect } from '../shared-context'
import moment from 'moment-timezone'
import { deleteWorkOrder } from './common-tests'
import { config } from '../config'

const PATH = '/ramp/work-orders/index'
test.use({ baseURL: `${config.url}${PATH}` });

const openModalFull = async (page) => {
    await page.locator('tbody').locator('.q-tr.tw-bg-white').first().getByRole('button').nth(1).click();
    await page.locator('a').filter({ hasText: 'Edit' }).click();
}

test('Verify the opening and closing of the full modal', async ({ page }) => {
    await openModalFull(page)

    await expect(page.locator('.q-dialog__backdrop')).toBeVisible();
    await expect(page.locator('#formRampComponent div').filter({ hasText: 'Update Work Order' }).first()).toBeVisible();
    await expect(page.locator('#formRampComponent div').filter({ hasText: 'Delete Save to Draft Close' }).first()).toBeVisible();

    await expect(page.getByText('Update Work Order')).toBeVisible();
    await expect(page.getByText('Flight', { exact: true })).toBeVisible();
    await expect(page.getByText('Services')).toBeVisible();
    await expect(page.getByText('Remark')).toBeVisible();
    await expect(page.getByText('Signature')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save to Draft' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(page.locator('.master-dialog__actions > div > button:nth-child(4)')).toBeVisible();
    await page.locator('.master-dialog__header > .q-btn').click();
    await expect(page.locator('#formRampComponent')).toBeHidden();
})

test('Test the integrity of the flight section', async ({ page }) => {
    await openModalFull(page)

    await expect(page.getByRole('combobox', { name: '*Customer' })).toBeVisible();
    await expect(page.getByLabel('*Station')).toBeVisible();
    await expect(page.getByLabel('*A/C Type')).toBeVisible();
    await expect(page.getByLabel('*Operation')).toBeVisible();
    await expect(page.getByLabel('*Carrier')).toBeVisible();
    await expect(page.getByLabel('*Parking Spot')).toBeVisible();
    await expect(page.getByLabel('*Status')).toBeVisible();
    await expect(page.getByLabel('Assigned to')).toBeVisible();
})

test('Test the integrity of the services section', async ({ page }) => {
    await openModalFull(page)

    await page.locator('#stepComponent div').filter({ hasText: 'Services' }).nth(2).click();
    await expect(page.locator('section').getByText('Services')).toBeVisible();
    await expect(page.getByPlaceholder('What are you looking for?')).toBeVisible();

    await expect(page.getByRole('list').getByText('Services')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Equipment')).toBeVisible();
    await expect(page.getByText('Crew')).toBeVisible();
    await expect(page.locator('#stepComponent').getByText('Cargo')).toBeVisible();

    await page.getByRole('list').getByText('Services').click();
    await expect(page.locator('.fa-star').first()).toBeVisible();

    await expect(page.locator('.tw-flex > div:nth-child(3) > .q-btn').first()).toBeVisible();
    await expect(page.locator('.tw-flex > div > .q-btn').first()).toBeVisible();
})

test('Test the integrity of the Remark section', async ({ page }) => {
    await openModalFull(page)

    await page.locator('#stepComponent div').filter({ hasText: 'Remark' }).nth(2).click();

    await expect(page.getByLabel('Remark')).toBeVisible();
    await expect(page.getByLabel('Safety Message')).toBeVisible();
})

test('Test the integrity of the Signature section', async ({ page }) => {
    await openModalFull(page)

    await page.locator('#stepComponent div').filter({ hasText: 'Signature' }).nth(2).click();

    await expect(page.getByText('Customer Representative')).toBeVisible();
    await expect(page.getByText('AGI Representative Signature')).toBeVisible();
    await expect(page.getByTestId('dynamicField-customerName').getByLabel('Print Name')).toBeVisible();
    await expect(page.getByTestId('dynamicField-customerTitle').getByLabel('Title')).toBeVisible();
    await expect(page.getByTestId('dynamicField-representativeName').getByLabel('Print Name')).toBeVisible();
    await expect(page.getByTestId('dynamicField-representativeTitle').getByLabel('Title')).toBeVisible();
})

test('Test the modal for creating Work Orders', async ({ page }) => {
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByText('New Work Order').click();
    await expect(page.getByLabel('*Customer')).toBeVisible();
    await expect(page.getByLabel('*Flight number')).toBeVisible();
    await expect(page.getByLabel('*Station')).toBeVisible();
    await expect(page.getByLabel('Assigned to')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

    await page.getByTestId('dynamicField-customerId').locator('label i').click();
    await expect(page.getByRole('option').first()).toBeVisible();
})

test.describe.serial('Testing work-order CRUD', () => {
    test('Create a Work Order', async ({ page }) => {
        await page.getByRole('button', { name: 'New' }).click();
    
        await page.getByTestId('dynamicField-customerId').locator('label i').click();
        await page.getByRole('option').first().locator('div').nth(1).click();
    
        await page.getByLabel('*Flight number').click();
        await page.getByLabel('*Flight number').fill('TEST-00');
        await page.getByTestId('dynamicField-stationId').locator('div').filter({ hasText: '*Station' }).nth(2).click();
        await page.getByLabel('*Station').fill('atlanta');
        await page.getByRole('option', { name: 'Atlanta (ATL)' }).click();
        await page.getByLabel('Assigned to').click();
        await page.getByLabel('Assigned to').fill('ima');
        await page.getByRole('option', { name: 'Imagina Colombia' }).click();
    
        await page.getByRole('button', { name: 'Save' }).click();
    
        await expect(page.getByText('Error when looking for the')).not.toBeVisible();
    
        await expect(page.getByText('Are you sure TEST-00 is a')).toBeVisible();
        await expect(page.getByText('Flight number', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
        await page.getByRole('button', { name: 'Yes' }).click();
    
        await expect(page.getByRole('button', { name: 'Go out to the list' })).toBeVisible({ timeout: 60000 });
        await expect(page.getByRole('button', { name: 'Continue editing' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Create a new one' })).toBeVisible();
        await page.getByRole('button', { name: 'Go out to the list' }).click();
    })
    
    const autograph = async (page, id) => {
        await page.getByTestId(id).locator('canvas').click({
            position: {
                x: 209,
                y: 45
            }
        });
        await page.getByTestId(id).locator('canvas').click({
            position: {
                x: 259,
                y: 45
            }
        });
        await page.getByTestId(id).locator('canvas').click({
            position: {
                x: 221,
                y: 68
            }
        });
        await page.getByTestId(id).locator('canvas').click({
            position: {
                x: 228,
                y: 74
            }
        });
        await page.getByTestId(id).locator('canvas').click({
            position: {
                x: 239,
                y: 75
            }
        });
        await page.getByTestId(id).locator('canvas').click({
            position: {
                x: 248,
                y: 63
            }
        });
    }
    
    test('Test updating WorkOrder', async ({ page }) => {
        const FORMAT_DATE = 'MM/DD/YYYY HH:mm';
        const today = moment().format(FORMAT_DATE);
        const tomorrow = moment().add(1, 'day').format(FORMAT_DATE);
        const yesterday = moment().subtract(1, 'day').format(FORMAT_DATE);
    
        await openModalFull(page)
    
        await page.getByLabel('*A/C Type').click();
        await page.getByLabel('*A/C Type').fill('a20n');
        await page.getByRole('option', { name: 'A20N' }).click();
    
        await page.locator('#formRampComponent div').filter({ hasText: 'Update Work Order Id:' }).first().click();
    
        await page.getByLabel('*Operation').click();
        await page.getByLabel('*Operation').fill('full_turn');
        await page.getByRole('option', { name: 'Full_turn' }).click();
    
        await page.locator('#formRampComponent div').filter({ hasText: 'Update Work Order Id:' }).first().click();
    
        await page.getByLabel('*Parking Spot').click();
        await page.getByLabel('*Parking Spot').fill('bay-2');
        await page.getByRole('option', { name: 'Bay-2' }).click();
    
        await page.locator('#formRampComponent div').filter({ hasText: 'Update Work Order Id:' }).first().click();
    
        await page.getByLabel('Origin').click();
        await page.getByLabel('Origin').fill('acadiana');
        await page.getByRole('option', { name: 'Acadiana Rgnl (ARA)' }).click();
    
        await page.getByTestId('dynamicField-inboundTailNumber').getByLabel('Tail N°').click();
        await page.getByTestId('dynamicField-inboundTailNumber').getByLabel('Tail N°').fill('789');
    
        await page.getByTestId('dynamicField-inboundScheduledArrival').getByPlaceholder('MM/DD/YYYY HH:mm').click();
        await page.getByTestId('dynamicField-inboundScheduledArrival').getByPlaceholder('MM/DD/YYYY HH:mm').fill(today);
    
        await page.getByTestId('dynamicField-inboundBlockIn').getByPlaceholder('MM/DD/YYYY HH:mm').click();
        await page.getByTestId('dynamicField-inboundBlockIn').getByPlaceholder('MM/DD/YYYY HH:mm').fill(yesterday);
    
        await page.getByLabel('Destination').click();
        await page.getByLabel('Destination').fill('abbot');
        await page.getByRole('option', { name: 'Abbotsford Int\'l (YXX)' }).click();
    
        await page.locator('#formRampComponent div').filter({ hasText: 'Update Work Order Id:' }).first().click();
    
        await page.getByTestId('dynamicField-outboundTailNumber').getByLabel('Tail N°').click();
        await page.getByTestId('dynamicField-outboundTailNumber').getByLabel('Tail N°').fill('789');
    
        await page.getByTestId('dynamicField-outboundScheduledDeparture').getByPlaceholder('MM/DD/YYYY HH:mm').click();
        await page.getByTestId('dynamicField-outboundScheduledDeparture').getByPlaceholder('MM/DD/YYYY HH:mm').fill(tomorrow);
    
        await page.getByTestId('dynamicField-outboundBlockOut').getByPlaceholder('MM/DD/YYYY HH:mm').click();
        await page.getByTestId('dynamicField-outboundBlockOut').getByPlaceholder('MM/DD/YYYY HH:mm').fill(today);
    
        await expect(page.getByText('Difference (hours): 24')).toBeVisible();
    
        await page.locator('#stepComponent div').filter({ hasText: 'Services' }).nth(2).click();
        await page.getByRole('list').locator('div').filter({ hasText: 'Services' }).click();
        await page.locator('.tw-flex > div:nth-child(3) > .q-btn').first().click();
        await expect(page.getByRole('button').filter({ hasText: '1' }).nth(1)).toBeVisible();
    
        await page.locator('#stepComponent div').filter({ hasText: 'Remark' }).nth(2).click();
        await page.getByLabel('Remark', { exact: true }).first().click();
        await page.getByLabel('Remark').fill('Testing remark');
        await page.getByLabel('Safety Message').click();
        await page.getByLabel('Safety Message').fill('Testing remark');
    
        await page.locator('#stepComponent div').filter({ hasText: 'Signature' }).nth(2).click();
    
        await autograph(page, 'dynamicField-customerSignature');
        await autograph(page, 'dynamicField-representativeSignature');
    
        await page.getByTestId('dynamicField-customerName').getByLabel('Print Name').click();
        await page.getByTestId('dynamicField-customerName').getByLabel('Print Name').fill('Test name');
        await page.getByTestId('dynamicField-customerTitle').getByLabel('Title').click();
        await page.getByTestId('dynamicField-customerTitle').getByLabel('Title').fill('Test title');
        await page.getByTestId('dynamicField-representativeName').getByLabel('Print Name').click();
        await page.getByTestId('dynamicField-representativeName').getByLabel('Print Name').fill('Test name');
        await page.getByTestId('dynamicField-representativeTitle').getByLabel('Title').click();
        await page.getByTestId('dynamicField-representativeTitle').getByLabel('Title').fill('Test title');
    
        await page.getByRole('button', { name: 'Close' }).click();
        await expect(page.locator('#formRampComponent')).toBeHidden();
    })

    const goServices = async (page) => {
        await page.locator('#stepComponent div').filter({ hasText: 'Services' }).nth(2).click();
    }

    const goToFlightAndChangeAField = async (page: any, label: string, name: string) => {
        await page.locator('#stepComponent div').filter({ hasText: 'Flight' }).nth(2).click();
        await page.getByLabel(label, { exact: true }).click();
        await page.getByRole('option', { name }).click();
        await goServices(page)
    }

    test('Test favorites feature', async ({ page }) => {
        await openModalFull(page)

        await goServices(page)
        await page.getByRole('list').getByText('Services').click();
        await page.locator('.fa-star').nth(2).click();
        await expect(page.getByText('Favorite created successfully')).toBeVisible();
        await expect(page.locator('#stepComponent button').filter({ hasText: '2' })).toBeVisible();

        const fieldsTest = [
            {
                label: '*Customer',
                value: '21 Air LLC',
                fake: 'Cargo Inc. - Hierarchy (Ad Hoc)'
            },
            {
                label: '*Station',
                value: 'Atlanta (ATL)',
                fake: 'Chicago (ORD)'
            },
            {
                label: '*Operation',
                value: 'Full_turn',
                fake: 'Half_turn_Inbound'
            },
            {
                label: '*Carrier',
                value: 'Lithuanian Airlines',
                fake: 'Lone Star Airlines'
            },
        ]

        for (let i = 0; i < fieldsTest.length; i++) {
            await goToFlightAndChangeAField(page, fieldsTest[i].label, fieldsTest[i].fake)
            await expect(page.getByText('Services/Services 2')).toBeVisible();

            await goToFlightAndChangeAField(page, fieldsTest[i].label, fieldsTest[i].value)
            await expect(page.locator('#stepComponent button').filter({ hasText: '2' })).toBeVisible();
        }
    })
    
    test('Test delete work order', async ({ page }) => {
        const tr = page.locator('tbody').locator('.q-tr.tw-bg-white').first();
        await expect(tr).toBeVisible({ timeout: 60000 });
        const id: any = await tr.locator('td').nth(2).textContent()
    
        await tr.getByRole('button').nth(1).click();
        await deleteWorkOrder(page, expect)
        await expect(page.locator('table').getByText(id)).toBeHidden({ timeout: 60000 });
    })
})
