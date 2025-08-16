import moment from 'moment';

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false previene que Cypress falle el test
  return false;
});

describe('Ramp Work Order', () => {
    beforeEach(() => {
        cy.visit('/ramp/work-orders/index');
        cy.wait(10000);
        cy.get('body').then(($body) => {
            if ($body.find('.q-form > :nth-child(1)').length > 0) {
                cy.get('.q-form > :nth-child(1)').type('soporte@imaginacolombia.com')
                cy.get('.q-form > :nth-child(2)').type('ZAQxsw123@');          
                cy.get('.q-btn').click();
            }
        });
    });

    const runFlightSectionIntegrityTest = () => {
        cy.get('input[aria-label="*Customer"]').should('be.visible');
        cy.get('input[aria-label="*Station"]').should('be.visible');
        cy.get('input[aria-label="*A/C Type"]').should('be.visible');
        cy.get('input[aria-label="*Operation"]').should('be.visible');
        cy.get('input[aria-label="*Carrier"]').should('be.visible');
        cy.get('input[aria-label="*Parking Spot"]').should('be.visible');
        cy.get('input[aria-label="*Status"]').should('be.visible');
        cy.get('input[aria-label="Assigned to"]').should('be.visible');
    }

    const runServicesSectionIntegrityTest = () => {
        cy.get('#stepComponent').contains('Services').click();
        cy.get('section').contains('Services').should('be.visible');
        cy.get('input[placeholder="What are you looking for?"]').should('be.visible');

        cy.get('ul, ol').contains('Services').should('be.visible'); // Ajusta si no es ul/ol
        cy.contains('Equipment').should('be.visible');
        cy.contains('Crew').should('be.visible');
        cy.get('#stepComponent').contains('Cargo').scrollIntoView().should('be.visible');

        cy.get('ul, ol').contains('Services').click(); // Ajusta si no es ul/ol
        cy.get('.fa-star').first().should('be.visible');

        cy.get('.tw-flex > div:nth-child(3) > .q-btn').first().should('be.visible');
        cy.get('.tw-flex > div > .q-btn').first().should('be.visible');
    }

    const runRemarkSectionIntegrityTest = () => {
        cy.get('#stepComponent').contains('Remark').click();

        cy.get('textarea[aria-label="Remark"]').first().should('be.visible');
        cy.get('textarea[aria-label="Safety Message"]').should('be.visible');
    }

    const runSignatureSectionIntegrityTest = () => {
        cy.get('#stepComponent').contains('Signature').click();

        cy.contains('Customer Representative').should('be.visible');
        cy.contains('AGI Representative Signature').should('be.visible');
        cy.get('[data-testid="dynamicField-customerName"]')
            .find('input[aria-label="Print Name"]').should('be.visible');
        cy.get('[data-testid="dynamicField-customerTitle"]')
            .find('input[aria-label="Title"]').should('be.visible');
        cy.get('[data-testid="dynamicField-representativeName"]')
            .find('input[aria-label="Print Name"]').should('be.visible');
        cy.get('[data-testid="dynamicField-representativeTitle"]')
            .find('input[aria-label="Title"]').should('be.visible');
    }

    it('Testing the integrity of the edit modal', () => {
        cy.openFullModal();

        cy.contains('Update Work Order').should('be.visible');
        cy.get('.q-stepper__title', { timeout: 10000 })
            .contains('Flight', { timeout: 10000 })
            .should('be.visible');
        cy.get('.q-stepper__title', { timeout: 10000 })
            .contains('Services', { timeout: 10000 })
            .should('be.visible');
        cy.get('.q-stepper__title', { timeout: 10000 })
            .contains('Remark', { timeout: 10000 })
            .should('be.visible');
        cy.get('.q-stepper__title', { timeout: 10000 })
            .contains('Signature', { timeout: 10000 })
            .should('be.visible');

        cy.get('button').contains('Delete').should('be.visible');
        cy.get('button').contains('Save to Draft').should('be.visible');
        cy.get('button').contains('Close').should('be.visible');

        runFlightSectionIntegrityTest();
        runServicesSectionIntegrityTest();
        runRemarkSectionIntegrityTest();
        runSignatureSectionIntegrityTest();

        cy.get('.master-dialog__actions > div > button:nth-child(4)').should('be.visible');
        cy.get('.master-dialog__header > .q-btn').click();
        cy.get('#formRampComponent').should('not.exist');
    })

    it('Testing to create a "Work Order" in Ramp', () => {
        cy.contains('button', 'New').click();

        cy.contains('*Customer').should('be.visible');
        cy.contains('*Flight number').should('be.visible');
        cy.contains('*Station').should('be.visible');
        cy.contains('Assigned to').should('be.visible');
        cy.contains('button', 'Save').should('be.visible');                                     
    
        cy.get('[data-testid="dynamicField-customerId"]').click();
        cy.get('[role="option"]').first().click();
    
        cy.get('[aria-label="*Flight number"]').clear().type('TEST-00');
        cy.get('[data-testid="dynamicField-stationId"] div').filter(':contains("*Station")').eq(2).click();
        cy.get('[role="option"]').first().click();
        cy.get('[aria-label="Assigned to"]').type('ima');
        cy.contains('[role="option"]', 'Imagina Colombia', { timeout: 10000 }).click();
    
        cy.contains('button', 'Save').click();
    
        cy.contains('Error when looking for the').should('not.exist');
    
        cy.contains('Are you sure TEST-00 is a').should('be.visible');
        cy.contains('.q-toolbar__title', 'Flight number').should('be.visible');
        cy.contains('button', 'Cancel').should('be.visible');
        cy.contains('button', 'Yes').should('be.visible');
        cy.contains('button', 'Yes').click();
    
        cy.contains('button', 'Go out to the list', { timeout: 60000 }).should('be.visible');
        cy.contains('button', 'Continue editing').should('be.visible');
        cy.contains('button', 'Create a new one').should('be.visible');
        cy.contains('button', 'Go out to the list').click();
    })

    const autograph = (id) => {
        cy.get(`[data-testid="${id}"] canvas`).click(209, 45);
        cy.get(`[data-testid="${id}"] canvas`).click(259, 45);
        cy.get(`[data-testid="${id}"] canvas`).click(221, 68);
        cy.get(`[data-testid="${id}"] canvas`).click(228, 74);
        cy.get(`[data-testid="${id}"] canvas`).click(239, 75);
        cy.get(`[data-testid="${id}"] canvas`).click(248, 63);
    };

    it('Testing updating a "Work Order" in Ramp', () => {
        const FORMAT_DATE = 'MM/DD/YYYY HH:mm';
        const today = moment().format(FORMAT_DATE);
        const tomorrow = moment().add(1, 'day').format(FORMAT_DATE);
        const yesterday = moment().subtract(1, 'day').format(FORMAT_DATE);

        // Abrir modal
        cy.get('tbody').find('.q-tr.tw-bg-white').first().find('button').eq(1).click();
        cy.get('a').filter(':contains("Edit")').click();

        cy.get('[aria-label="*Customer"]').click({ timeout: 10000 });
        cy.get('[role="option"]').first().click();

        cy.get('[aria-label="*Parking Spot"]').click();
        cy.get('[role="option"]').first().click();

        cy.get('[aria-label="*A/C Type"]').click();
        cy.get('[role="option"]', { timeout: 10000 })
            .first()
            .click({ timeout: 10000 });

        cy.get('[aria-label="*Operation"]').click();
        cy.contains('[role="option"]', 'Full_turn').click({ timeout: 10000 });

        cy.get('input[aria-label="Origin"]').click({ force: true });
        cy.get('[role="option"]').eq(2).click();

        cy.get('[data-testid="dynamicField-inboundTailNumber"] [aria-label="Tail N°"]').clear().type('789');

        cy.get('[data-testid="dynamicField-inboundScheduledArrival"] input[placeholder="MM/DD/YYYY HH:mm"]').click().clear().type(today);

        cy.get('[data-testid="dynamicField-inboundBlockIn"] input[placeholder="MM/DD/YYYY HH:mm"]').click().clear().type(yesterday);

        cy.get('[aria-label="Destination"]').click();
        cy.get('[role="option"]').eq(2).click();

        cy.get('#formRampComponent div').contains('Update Work Order Id:').first().click();

        cy.get('[data-testid="dynamicField-outboundTailNumber"] [aria-label="Tail N°"]').clear().type('789');

        cy.get('[data-testid="dynamicField-outboundScheduledDeparture"] input[placeholder="MM/DD/YYYY HH:mm"]').clear().type(tomorrow);

        cy.get('[data-testid="dynamicField-outboundBlockOut"] input[placeholder="MM/DD/YYYY HH:mm"]').clear().type(today);

        cy.contains('Difference (hours): 24').should('be.visible');

        cy.get('#stepComponent').contains('Services').click();
        cy.get('li').contains('Services').click();
        cy.get('.tw-flex > div:nth-child(3) > .q-btn').first().click();
        cy.get('.q-px-sm > .fa-star').first().click();
        cy.get('div:nth-child(2) > .color-bg-blue-gray-custom > div > .q-px-sm > .fa-star').click();
        
        cy.get('body', { timeout: 10000 }).should(($body) => {
            const hasCreation = $body.text().includes('Favorite created successfully');
            const hasElimination = $body.text().includes('Favorite deleted successfully');
            expect(hasCreation || hasElimination).to.be.true;
        });

        cy.get('#stepComponent').contains('Remark').click();
        cy.get('[aria-label="Remark"]').first().clear().type('Testing remark');
        cy.get('[aria-label="Safety Message"]').clear().type('Testing remark');

        cy.get('#stepComponent').contains('Signature').click();

        autograph('dynamicField-customerSignature');
        autograph('dynamicField-representativeSignature');

        cy.get('[data-testid="dynamicField-customerName"] [aria-label="Print Name"]').clear().type('Test name');
        cy.get('[data-testid="dynamicField-customerTitle"] [aria-label="Title"]').clear().type('Test title');
        cy.get('[data-testid="dynamicField-representativeName"] [aria-label="Print Name"]').clear().type('Test name');
        cy.get('[data-testid="dynamicField-representativeTitle"] [aria-label="Title"]').clear().type('Test title');

        cy.contains('button', 'Close').click();

        cy.get('#formRampComponent', { timeout: 20000 }).should('not.exist');
    })

    // it('Testing the service date range rule', () => {
                
    //     // Abrir modal
    //     cy.get('tbody').find('.q-tr.tw-bg-white').first().find('button').eq(1).click();
    //     cy.get('a').filter(':contains("Edit")').click();
        
    //     // Go to Services step
    //     cy.get('#stepComponent').contains('Services').click();

    //     const formTitle = cy.contains('Update Work Order Id:').first();

    //     cy.get('li').contains('Services').click();

    //     cy.get('input[aria-label="Start"]')
    //         .first()
    //         .type(moment().add(6, 'year').format('MM/DD/YYYY HH:mm'));
    //     cy.contains('button', 'Save').click();
    //     cy.contains('There are missing fields to complete, check the form').should('be.visible');
    //     formTitle.should('be.visible');

    //     cy.get('input[aria-label="End"]')
    //         .first()
    //         .type(moment().subtract(6, 'year').format('MM/DD/YYYY HH:mm'));
    //     cy.contains('button', 'Save').click();
    //     cy.contains('There are missing fields to complete, check the form').should('be.visible');
    //     formTitle.should('be.visible');
    // })

    it('Testing delete a "Work Order" in Ramp', () => {
        cy.get('tbody').find('.q-tr.tw-bg-white').first().as('row');
        cy.get('@row').should('be.visible');

        cy.get('@row').find('td').eq(2).invoke('text').then((id) => {
            // Click on the second button in the row
            cy.get('@row').find('button').eq(1).click();

            cy.deleteWorkOrder();

            cy.get('table', { timeout: 60000 }).should('not.contain', id.trim());
        });
    })
})