Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Validate Registration Form', () => {
  it('tries to register with empty form fields', () => {
    cy.visit('/');
    cy.get('.register-login-link').click();
    cy.get('#register-button').click();
    cy.get('.message').should('contain', 'email should not be empty');
    cy.get('.message').should('contain', 'email must be an email');
    cy.get('.message').should('contain', 'password should not be empty');
  });

  it('tries to register with an empty password', () => {
    cy.get('#email').clear().type('testuser@minitsios.com');
    cy.get('#register-button').click();
    cy.get('.message').should('contain', 'password should not be empty');
  });

  it('registers successfully so that we can test the other forms too', () => {
    cy.get('#email').clear().type('testuser@minitsios.com');
    cy.get('#password').clear().type('123456');
    cy.get('#register-button').click();
    // Expect to be redirected to the profile page
    cy.url().should('include', '/me');
    // Expect to find an h2 with class profile-message that contains the text "no active subscription"
    cy.get('.profile-message').should('contain', 'no active subscription');
  });

  it('logs out the user so that we can test the login form', () => {
    cy.get('#logout-link').click();
    // Expect to be redirected to the login page
    cy.url().should('include', '/login');
  });
});

describe('Validate Login Form', () => {
  // We are already in the proper page (due to our previous step)
  it('tries to login with empty inputs', () => {
    cy.get('#login-button').click();
    cy.get('.message').should('contain', 'email should not be empty');
    cy.get('.message').should('contain', 'email must be an email');
    cy.get('.message').should('contain', 'password should not be empty');
  });

  it('tries to login with an empty password', () => {
    cy.get('#email').clear().type('testuser@minitsios.com');
    cy.get('#login-button').click();
    cy.get('.message').should('contain', 'password should not be empty');
  });

  it('tries to login with email that does not exist', () => {
    cy.get('#email').clear().type('foo@bar.com');
    cy.get('#password').clear().type('123456');
    cy.get('#login-button').click();
    cy.get('.message').should('contain', 'Invalid credentials');
  });

  it('tries to login with the wrong password', () => {
    cy.get('#email').clear().type('testuser@minitsios.com');
    cy.get('#password').clear().type('foobar123456789');
    cy.get('#login-button').click();
    cy.get('.message').should('contain', 'Invalid credentials');
  });

  // Finally login with the correct credentials so that we can test the subscription form
  it('logins with the proper credentials', () => {
    cy.get('#email').clear().type('testuser@minitsios.com');
    cy.get('#password').clear().type('123456');
    cy.get('#login-button').click();
  });

  describe('Validate Subscription Form', () => {
    it('tries to subscribe with empty fields', () => {
      cy.get('#name').clear();
      cy.get('#email').clear();
      cy.get('#card-number').clear();
      cy.get('#card-expiry').clear();
      cy.get('#card-cvc').clear();
      cy.get('#subscribe-button').click();
      cy.get('.message').should('contain', 'name should not be empty');
      cy.get('.message').should('contain', 'email should not be empty');
      cy.get('.message').should('contain', 'cardNumber should not be empty');
      cy.get('.message').should('contain', 'cardExpiry should not be empty');
      cy.get('.message').should('contain', 'cardCvc should not be empty');
    });

    it('tries to subscribe with a different email than the one used in registration', () => {
      cy.get('#name').clear().type('Test User');
      cy.get('#email').clear().type('anotheruser@minitsios.com');
      cy.get('#card-number').clear().type('4242424242424242');
      cy.get('#card-expiry').clear().type('12/28');
      cy.get('#card-cvc').clear().type('123');
      cy.get('#subscribe-button').click();
      cy.get('.message').should('contain', 'Bad jwt or db error!');
    });

    // Finally subscribes properly so that we can delete the user and reset the system to its original state
    it('subscribes properly', () => {
      cy.get('#name').clear().type('Test User');
      cy.get('#email').clear().type('testuser@minitsios.com');
      cy.get('#card-number').clear().type('4242424242424242');
      cy.get('#card-expiry').clear().type('12/28');
      cy.get('#card-cvc').clear().type('123');
      cy.get('#subscribe-button').click();
      // Expect to find an h2 element with the text "Welcome"
      cy.get('h2').should('contain', 'Welcome');
    });

    it('deletes the new user', () => {
      cy.get('#settings-link').click();
      cy.get('#delete-account').click();
      // Expect to be redirected to the login page
      cy.url().should('include', '/login');
    });
  });
});