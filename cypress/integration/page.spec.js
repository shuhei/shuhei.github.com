/* global cy */
describe("shuheikagawa.com", () => {
  it("opens top page", () => {
    cy.visit("https://shuheikagawa.com/");
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
