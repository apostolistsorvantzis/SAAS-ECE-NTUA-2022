Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('Setup a test user', () => {
  it('registers a new user', () => {
    cy.visit('/');
    cy.get('.register-login-link').click();
    cy.get('#email').type('testuser@minitsios.com');
    cy.get('#password').type('123456');
    cy.get('#register-button').click();
    // Expect to be redirected to the profile page
    cy.url().should('include', '/me');
    // Expect to find an h2 with class profile-message that contains the text "no active subscription"
    cy.get('.profile-message').should('contain', 'no active subscription');
  });
  
  // SUBSCRIBE
  it('subscribes the new user with credit card info', () => {
    cy.get('#subscribe-button').click();
    // Expect to find an h2 element with the text "Welcome"
    cy.get('h2').should('contain', 'Welcome');
  });
});

describe('Test Graphs - Generic', () => {
  it('should have 3 graphs on page', () => {
    cy.get('#home-link').click();
    cy.get('body').find('canvas').should('have.length', 3);
  });

  it('should have 7 chart-controls on page', () => {
    cy.get('body').find('.line-chart-control').should('have.length', 7);
  });

  it('should have 3 chart headings on page', () => {
    cy.get('body').find('h2').should('have.length', 3);
  });
});

describe('Test Graphs - ATL', () => {
  it('should have the default filters enabled', () => {
    cy.get('#atl-container .line-chart-messages').first().should('contain', 'AL, GR, IT')
  });

  it('should update graph when Albania is removed from filters', () => {
    cy.get("#atl-container li.select2-selection__choice[title='Albania'] span").click();
    cy.get('#atl-container .line-chart-messages').first().click();
    cy.get('#atl-container .line-chart-messages').first().should('not.contain', 'AL,');
  });
});

describe('Test Graphs - CBF', () => {
  it('should have the default filters enabled', () => {
    cy.get('#cbf-container .line-chart-messages').first().should('contain', 'AL, IT to GR')
  });

  it('should update graph when Albania is removed from filters', () => {
    cy.get("#cbf-container li.select2-selection__choice[title='Albania'] span").click();
    cy.get('#cbf-container .line-chart-messages').first().click();
    cy.get('#cbf-container .line-chart-messages').first().should('not.contain', 'AL,');
  });

  it('should update graph when Greece is swapped with France', () => {
    cy.get("#cbf-container .select2-selection--single").click();
    cy.get('.select2-container--open input.select2-search__field').type('France{enter}');
    cy.get('#cbf-container .line-chart-messages').first().click();
    cy.get('#cbf-container .line-chart-messages').first().should('contain', 'IT to FR');
  });
});

describe('Test Graphs - GPT', () => {
  it('should have the default filters enabled', () => {
    cy.get('#gpt-container .line-chart-messages').first().should('contain', 'Solar, Wind Onshore for GR')
  });

  it('should update graph when Wind Onshore is removed from filters', () => {
    cy.get("#gpt-container li.select2-selection__choice[title='Wind Onshore'] span").click();
    cy.get('#gpt-container .line-chart-messages').first().click();
    cy.get('#gpt-container .line-chart-messages').first().should('not.contain', 'Wind Onshore');
  });

  it('should update graph when Greece is swapped with Germany', () => {
    cy.get("#gpt-container .select2-selection--single").click();
    cy.get('.select2-container--open input.select2-search__field').type('Germany{enter}');
    cy.get('#gpt-container .line-chart-messages').first().click();
    cy.get('#gpt-container .line-chart-messages').first().should('contain', 'Solar for DE');
  });

});



describe('Cleanup user', () => {
  it('deletes the test user', () => {
    cy.get('#settings-link').click();
    cy.get('#delete-account').click();
    // Expect to be redirected to the login page
    cy.url().should('include', '/login');
  });
});