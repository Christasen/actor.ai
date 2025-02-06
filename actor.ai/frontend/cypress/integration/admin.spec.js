describe('Admin Flow', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/admin');
  });

  it('creates a new actor manually', () => {
    const actorData = {
      name: 'Test Actor',
      birthplace: 'Test City',
      birthday: '1990-01-01',
      bio: 'Test biography'
    };

    // Fill in the form
    cy.get('input[name="name"]').type(actorData.name);
    cy.get('input[name="birthplace"]').type(actorData.birthplace);
    cy.get('input[name="birthday"]').type(actorData.birthday);
    cy.get('textarea[name="bio"]').type(actorData.bio);

    cy.get('button[type="submit"]').click();

    // Verify success message
    cy.contains('Actor added successfully').should('be.visible');

    // Verify actor appears in search
    cy.visit('/');
    cy.get('input[name="name"]').type(actorData.name);
    cy.get('button[type="submit"]').click();
    cy.contains(actorData.name).should('be.visible');
  });

  it('uploads and processes PDF', () => {
    cy.get('[data-testid="pdf-upload-tab"]').click();
    cy.get('input[type="file"]').attachFile('test-actor.pdf');
    cy.get('button[type="submit"]').click();

    cy.contains('PDF processed successfully').should('be.visible');
  });

  it('manages actor photos', () => {
    // Create test actor first
    const actorData = {
      name: 'Photo Test Actor',
      birthplace: 'Test City'
    };
    cy.createActor(actorData).then((response) => {
      const actorId = response.body.id;
      
      // Go to photo management
      cy.get('[data-testid="photo-management-tab"]').click();
      cy.get('select').select(actorId.toString());

      // Upload photo
      cy.get('input[type="file"]').attachFile('test-photo.jpg');
      cy.get('.photo-grid').should('contain', 'test-photo.jpg');

      // Delete photo
      cy.get('[data-testid="delete-photo"]').click();
      cy.get('.photo-grid').should('be.empty');
    });
  });
}); 