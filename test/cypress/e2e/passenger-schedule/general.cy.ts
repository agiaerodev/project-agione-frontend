import moment from 'moment';

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false previene que Cypress falle el test
  return false;
});

describe('Passenger Schedule', () => {

    beforeEach(() => {
        cy.visit('/passenger/schedule/index');
        cy.login();
    });

    it('Testing the station selection modal in the "schedule"', () => {
        cy.get('#masterModalContent', { timeout: 30000 }).should('be.visible');
        cy.contains('Filter schedule').should('be.visible');
        cy.contains('You must first select a').should('be.visible');
        cy.get('input[aria-label="Station"]').should('be.visible');

        cy.selectStation();

        cy.get('#masterModalContent').should('not.exist');
        cy.contains('Filter schedule').should('not.exist');
    })

    // it('Testing that the modal requesting the station is triggered correctly', () => {
    //     cy.get('button').contains('Scheduler').click({ timeout: 20000, force: true });
    //     cy.get('button').contains('Back to schedule').click();
    //     cy.contains('Filter schedule').should('not.exist');

    //     cy.wait(7000);

    //     cy.visit('/passenger/operation-types/index');
    //     cy.wait(4000);
    //     cy.visit('/passenger/work-orders/index');
    //     cy.wait(4000);
        
    //     cy.visit('/passenger/schedule/index');
    //     cy.wait(4000);
    //     // cy.contains('Filter schedule').should('not.exist');
        
    //     cy.visit('/passenger/operation-types/index');
    //     cy.wait(4000);

    //     cy.visit('/passenger/schedule/index');
    //     cy.wait(4000);
    //     // cy.contains('Filter schedule').should('not.exist');
        
    //     cy.visit('/ramp/schedule/index');
    //     cy.contains('label', 'Station').click();
    //     cy.get('[role="option"]', { timeout: 10000 }).contains('Chicago (ORD)').click();
    //     cy.get('button').contains('filters').click();

    //     cy.visit('/passenger/schedule/index');
    //     cy.contains('Filter schedule').should('be.visible');
    // })

    it('Testing the visibility of actions and titles in the "schedule"', () => {
        cy.calendarTitlesAndActions('btn-dropdown--4');
    })

    it('Testing changes from day to week and from week to day', () => {
        // checkTheSwitchToTheWeeklyView
        cy.get('button').contains('Week').click();
        cy.get('button').contains('Today').should('be.visible');
        // cy.get('button').contains('Week', { timeout: 10000 }).should('not.exist');
        cy.get('.tw-inline-flex').first().should('be.visible');
        cy.get('.tw-flex-1 > div:nth-child(2) > div > div:nth-child(2) > div')
            .should('be.visible');

        // checkTheSwitchToTheDailyView
        cy.get('button').contains('Today').click();
        cy.get('button').contains('Week').should('be.visible');
        cy.get('button').contains('Today').should('be.visible');
        cy.get('.tw-inline-flex').first().should('be.visible');
        cy.get('.tw-flex-1 > div:nth-child(2) > div > div:nth-child(2) > div')
            .should('not.exist');
    })

    it('Testing the modal Quick Close', () => {
        
        function clickUntilDateMatches(retries = 10) {
            cy.get('.agendaResume').then($el => {
            if (!$el.text().includes('August 19, All Day') && retries > 0) {
                cy.get('.actions-bar > :nth-child(1) > :nth-child(4)').click();
                cy.wait(500); // Espera para que el DOM se actualice
                clickUntilDateMatches(retries - 1);
            }
            });
        }
        clickUntilDateMatches();

        cy.get('[data-testid="kanbanDay"]', { timeout: 80000 })
            .find('div')
            .contains('F9685', { timeout: 30000 })
            .parents('[data-testid="kanbanDay"]')
            .find('button')
            .first()
            .click()

        // Validar que el titulo sea "Predicted Services"
        cy.get('.q-stepper__step-inner')
            .find('section')
            .find('section')
            .contains('Predicted Services')

        // Validar que el botón de ayuda este visible
        cy.get('.q-stepper__step-inner')
            .find('section')
            .find('button')
            .first()
            .should('be.visible')

        // Validar que el botón de favoritos este visible
        cy.get('.q-stepper__step-inner')
            .find('section')
            .find('button')
            .eq(1)
            .should('be.visible')

        // Validar que el botón de summary este visible
        cy.get('.q-stepper__step-inner')
            .find('section')
            .find('button')
            .eq(2)
            .should('be.visible')

        // Validar que al menos tenga un servicio
        cy.get('#expansion-container > div')
          .its('length')
          .should('be.gte', 1)
        
        // Validar que el servicio tenga campos
        cy.get('#expansion-container > div')
            .first()
            .find('div')
            .first()
            .find('div')
            .first()
            .find('input')
            .should('be.visible')

        // Validar que el servicio tenga un nombre
        cy.get('#expansion-container > div > div > div > div > div')
            .eq(2)
            .invoke('text')
            .should('match', /\S/) // valida que contenga texto no vacío

        // Seleccionar servicio
        cy.get('#expansion-container > div > div > div > div > div')
            .first()
            .click()

        // Agregar un nuevo servicio
        cy.get('[placeholder="Add another service"]').type('SI')
        cy.get('[role="option"]').first().click();

        // Hacer clic en el botón para pasar al siguiente paso
        cy.get('.dialogServices .q-dialog__inner > div > div')
            .eq(2)
            .find('button')
            .last()
            .click()

        // Validar que el paso actual sea "Outbound Delay"
        cy.get('.q-stepper__step-inner')
            .find('section')
            .find('section')
            .contains('Outbound Delay')

        // Agregar un nuevo delay
        cy.get('.q-stepper__step-inner')
            .find('form')
            .find('button')
            .eq(1)
            .click()

        // Seleccionar el campo "Our delay" y elegir primera opción
        cy.get('.q-stepper__step-inner form > div [role="combobox"][aria-label="*Our delay"]')
          .first()
          .click();
        cy.get('[role="option"]').first().click(); // o .contains('Yes').click();

        cy.get('.q-stepper__step-inner form > div [aria-label="*Time"]')
          .first()
          .type('24')

        // Probar que code sea requerido
        cy.get('.dialogServices .q-dialog__inner > div > div')
            .eq(2)
            .find('button')
            .last()
            .click()
        cy.get('.dialogServices .q-dialog__inner > div > div')
            .eq(2)
            .find('button')
            .first()
            .click()
        cy.contains('Please fill in the delay fields.', { timeout: 20000 }).should('be.visible');

        cy.get('.q-stepper__step-inner form > div [role="combobox"][aria-label="*Code"]')
          .first()
          .type('99')
        cy.get('[role="option"]').contains('99').click();

        // Probar que Delay Comment sea obligatorio cuando el codigo es 99
        cy.get('.dialogServices .q-dialog__inner > div > div')
            .eq(2)
            .find('button')
            .last()
            .click()
        cy.get('.dialogServices .q-dialog__inner > div > div')
            .eq(2)
            .find('button')
            .first()
            .click()
        cy.contains('Please fill in the delay fields.', { timeout: 20000 }).should('be.visible');

        cy.get('.q-stepper__step-inner form > div [aria-label="Delay Comment"]')
            .first()
            .type('Test delay comment')
        
        cy.get('.q-stepper__step-inner form > div [role="combobox"][aria-label="*Flight type"]')
            .first()
            .click()
        cy.get('[role="option"]').eq(1).click();

        // Hacer clic en el botón para pasar al siguiente paso
        cy.get('.dialogServices .q-dialog__inner > div > div')
            .eq(2)
            .find('button')
            .last()
            .click()

        // Validar que el paso actual sea "Extra"
        cy.get('.q-stepper__step-inner')
            .find('section')
            .find('section')
            .contains('Extra')

        cy.get('[role="combobox"][aria-label="*Operation"]').should('be.visible');

        // cy.get('[role="combobox"][aria-label="*Operation"]')
        //     .click({ timeout: 10000 })
        // cy.get('[role="option"]').first().click({ timeout: 10000 });

        // cy.get('[aria-label="*Charter Rate"]', { timeout: 10000 })
        //     .type('8')
            
        // cy.get('[role="combobox"][aria-label="Cancellation type"]')
        //     .click()
        // cy.get('[role="option"]').first().click();
        
        // cy.get('[aria-label="*Cancellation Notice time entered in Hours"]')
        //     .type('24', { timeout: 10000 })

        cy.get('[role="combobox"][aria-label="Pax Operation"]')
            .click()
        cy.get('[role="option"]').first().click();

        // Hacer clic en el botón close para guardar
        cy.get('.dialogServices .q-dialog__inner > div > div')
            .eq(2)
            .find('button')
            .first()
            .click()

        cy.contains('Changes saved successfully', { timeout: 30000 })
            .should('be.visible');

        cy.get('[data-testid="kanbanDay"]')
            .find('div')
            .contains('F9685', { timeout: 30000 })
            .parents('[data-testid="kanbanDay"]')
            .find('button')
            .eq(1)
            .click()

        // Eliminar servicio
        cy.get('.q-stepper__step-inner')
            .find('section')
            .find('button')
            .eq(2)
            .click()
        cy.get('div [role="menu"]').find('i').click()

        cy.wait(1000);

        // Hacer clic en el botón para pasar al siguiente paso
        cy.get('.dialogServices .q-dialog__inner > div > div')
            .eq(2)
            .find('button')
            .last()
            .click()

        // Eliminar el delay
        cy.get('.q-stepper__step-inner form > div > section', { timeout: 10000 })
            .eq(1)
            .find('button')
            .click()

        // Hacer clic en el botón para pasar al siguiente paso
        cy.get('.dialogServices .q-dialog__inner > div > div')
            .eq(2)
            .find('button')
            .last()
            .click()

        // Hacer clic en el botón close para guardar
        cy.get('.dialogServices .q-dialog__inner > div > div')
            .eq(2)
            .find('button')
            .first()
            .click()

        cy.contains('Changes saved successfully', { timeout: 30000 })
            .should('be.visible');
    })
})