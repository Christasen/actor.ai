describe('Search Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('searches for actors by name', () => {
    // Type in search field
    cy.get('input[name="name"]').type('John');
    cy.get('button[type="submit"]').click();

    // Check results
    cy.get('.actor-card').should('have.length.at.least', 1);
    cy.contains('John').should('be.visible');
  });

  it('shows no results message when no matches found', () => {
    cy.get('input[name="name"]').type('NonexistentActor123');
    cy.get('button[type="submit"]').click();

    cy.contains('No results found').should('be.visible');
  });

  it('filters by multiple criteria', () => {
    cy.get('input[name="name"]').type('John');
    cy.get('input[name="birthplace"]').type('New York');
    cy.get('input[name="movie"]').type('Test Movie');
    cy.get('button[type="submit"]').click();

    cy.get('.actor-card').should('have.length.at.least', 1);
  });
}); 