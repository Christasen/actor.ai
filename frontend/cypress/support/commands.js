import 'cypress-file-upload';

Cypress.Commands.add('login', (username = 'admin', password = 'password') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/auth/login`,
    body: { username, password }
  }).then((response) => {
    localStorage.setItem('token', response.body.token);
    localStorage.setItem('isAdmin', response.body.isAdmin);
  });
});

Cypress.Commands.add('createActor', (actorData) => {
  const token = localStorage.getItem('token');
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/admin/actors`,
    headers: { Authorization: `Bearer ${token}` },
    body: actorData
  });
}); 