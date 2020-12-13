import { getIframeBody } from '../support/iframe.po';

describe('ngx-diagrams', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getIframeBody().find('h1').should('contain.text', 'Welcome to NGX-Diagrams');
  });
});
