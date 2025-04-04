import { test, expect } from '../shared-context'
import { config } from '../config'

test.use({ baseURL: config.url });

const validateWithoutErrorMessage = async (page) => {
    await expect(page.locator('#innerLoadingMaster div')).toBeVisible();
    await expect(page.getByText('Error requesting data')).not.toBeVisible();
}

const menuItems = [
    {
        name: 'Expand "Users"',
        items: [
            '#menuItem-quseradminusers',
            '#menuItem-quseradmindepartments',
            '#menuItem-quseradminroles',
            '#menuItem-quseradmindirectory'
        ]
    },
    {
        name: 'Expand "Notifications"',
        items: [
            '#menuItem-notificationadminnotification',
            '#menuItem-notificationadminproviders'
        ]
    },
    {
        name: 'Expand "Site"',
        items: [
            '#menuItem-qsiteadmincatgeoriesindex',
            '#menuItem-qsiteadminayoutsindex'
        ]
    },
    {
        name: 'Expand "Flights"',
        items: [
            '#menuItem-qflyadminaircraftType',
            '#menuItem-qflyadminairline',
            '#menuItem-qflyadminairport',
            '#menuItem-qflyadminflightStatus'
        ]
    },
    {
        name: 'Expand "Ramp"',
        items: [
            '#menuItem-qrampadminworkOrders',
            '#menuItem-qrampadminpassengerOperationTypes'
        ]
    },
    {
        name: 'Expand "Passenger"',
        items: [
            '#menuItem-qrampadminpassenger',
            '#menuItem-qrampadminoperationTypesPassenger',
            '#menuItem-qrampadminfueling'
        ]
    },
    {
        name: 'Expand "Labor"',
        items: [
            '#menuItem-qrampadminlabor'
        ]
    },
    {
        name: 'Expand "Security"',
        items: [
            '#menuItem-qrampadminsecurity',
            '#menuItem-qrampadminsecurityOperationTypes'
        ]
    },
    {
        name: 'Expand "Setup"',
        items: [
            '#menuItem-qsetupagioneadminareas',
            '#menuItem-qrampadminattributes',
            '#menuItem-qsetupagioneadminbuildings',
            '#menuItem-qsetupagioneadmincompanies',
            '#menuItem-qsetupagioneadmincontracts',
            '#menuItem-qsetupagioneadmincostCenters',
            '#menuItem-qsetupagioneadmincustomers',
            '#menuItem-qsetupagioneadmingates',
            '#menuItem-qsetupagioneadminpassengerCarrierStations',
            '#menuItem-qrampadminpassengerContractRules',
            '#menuItem-qsetupagioneadmincontract-rules',
            '#menuItem-qrampadmincategories',
            '#menuItem-qrampadminproducts',
            '#menuItem-qsetupagioneadminstations',
            '#menuItem-qrampadminworkOrderStatuses'
        ]
    },
    {
        name: 'Expand "DHL"',
        items: [
            '#menuItem-qdh-lagioneadminscoreCards',
            '#menuItem-qdhl-agioneadminstaffs'
        ]
    },
    {
        name: 'Expand "Reports"',
        items: [
            '#menuItem-qreportsadminfolders',
            '#menuItem-qreportsadminreportCreate',
            '#menuItem-gamificationadmincategories',
            '#menuItem-qpageadminpages',
            '#menuItem-qsiteadminorganizationsindex-all',
            '#menuItem-qsiteadminorganizationsindex'
        ]
    },
]

test('Verify that there are no error messages in the CRUD operations', async ({ page }) => {
    for (let i = 0; i < menuItems.length; i++) {
        await page.getByLabel(menuItems[i].name).click();
        for (let l = 0; l < menuItems[i].items.length; l++) {
            await page.locator(menuItems[i].items[l]).click();
            await validateWithoutErrorMessage(page);
        }
    }
})