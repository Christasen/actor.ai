describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('logs in successfully with correct credentials', () => {
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/admin');
    cy.contains('Admin Dashboard').should('be.visible');
  });

  it('shows error with incorrect credentials', () => {
    cy.get('input[name="username"]').type('wrong');
    cy.get('input[name="password"]').type('wrong');
    cy.get('button[type="submit"]').click();

    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('protects admin routes', () => {
    cy.visit('/admin');
    cy.url().should('include', '/login');
  });

  it('logs out successfully', () => {
    cy.login();
    cy.visit('/admin');
    cy.get('[data-testid="logout-button"]').click();
    
    cy.url().should('include', '/login');
    cy.visit('/admin');
    cy.url().should('include', '/login');
  });
}); 