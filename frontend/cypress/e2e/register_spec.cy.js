Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('Register a new user with email and pass', () => {
  // REGISTER
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
    cy.get('#name').clear().type('Test User');
    cy.get('#email').clear().type('testuser@minitsios.com');
    cy.get('#card-number').clear().type('4242424242424242');
    cy.get('#card-expiry').clear().type('12/28');
    cy.get('#card-cvc').clear().type('123');
    cy.get('#subscribe-button').click();
    // Expect to find an h2 element with the text "Welcome"
    cy.get('h2').should('contain', 'Welcome');
  });

  // LOGOUT
  it('logs out the user', () => {
    cy.get('#logout-link').click();
    // Expect to be redirected to the login page
    cy.url().should('include', '/login');
  });

  // LOGIN
  it('logs in the user', () => {
    cy.get('#email').type('testuser@minitsios.com');
    cy.get('#password').type('123456');
    cy.get('#login-button').click();
    // Expect to be redirected to the profile page
    cy.url().should('include', '/me');
    // Expect to find an h2 with the text "Welcome"
    cy.get('h2').should('contain', 'Welcome');
  });

  // DELETE
  it('deletes the new user', () => {
    cy.get('#settings-link').click();
    cy.get('#delete-account').click();
    // Expect to be redirected to the login page
    cy.url().should('include', '/login');
  });

  // TRY TO LOGIN WITH THE DELETED USER
  it('tries to login with the deleted user', () => {
    cy.get('#email').type('testuser@minitsios.com');
    cy.get('#password').type('123456');
    cy.get('#login-button').click();
    // Expect div with class message to have the text "Invalid credentials"
    cy.get('.message').should('contain', 'Invalid credentials');
  });
});

// describe('Register a new user with google auth', () => {
  // REGISTER
  // it('registers a new user with google auth', () => {
  //   cy.visit('/');
  //   cy.get('.register-login-link').click();
  //   cy.get('.g-btn').click();
  // });

  // SUBSCRIBE
  // LOGOUT
  // LOGIN
  // DELETE
// });