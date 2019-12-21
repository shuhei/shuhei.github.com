/* global cy */
describe("shuheikagawa.com", () => {
  it("opens top page", () => {
    cy.visit("http://localhost:4000/");
  });

  it("opens about page", () => {
    cy.contains("About").click();
    cy.url().should("include", "/about/");
  });

  it("opens works page", () => {
    cy.contains("Works").click();
    cy.url().should("include", "/works/");
  });

  it("opens archives page", () => {
    cy.contains("Archives").click();
    cy.url().should("include", "/archives/");
  });
});
