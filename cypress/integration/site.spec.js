/// <reference types="Cypress" />
/* global Cypress, cy */

const host = Cypress.config("baseUrl");

describe("shuheikagawa.com", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("navigates to older and newer posts", () => {
    cy.get("h1").should("have.length", 4);

    cy.contains("Older posts").click();
    cy.url().should("eq", `${host}/blog/pages/2/`);
    cy.get("h1").should("have.length", 4);

    cy.contains("Older posts").click();
    cy.url().should("eq", `${host}/blog/pages/3/`);
    cy.get("h1").should("have.length", 4);

    cy.contains("Newer posts").click();
    cy.contains("Newer posts").click();
    cy.url().should("eq", `${host}/`);
    cy.get("h1").should("have.length", 4);
  });

  it("opens about page", () => {
    cy.contains("About").click();

    cy.url().should("eq", `${host}/about/`);

    cy.contains("GitHub").should(
      "have.prop",
      "href",
      "https://github.com/shuhei"
    );
    cy.contains("Twitter").should(
      "have.prop",
      "href",
      "https://twitter.com/shuheikagawa"
    );

    cy.contains("Talks").should("be.visible");
    cy.contains("Side projects").should("be.visible");
  });

  it("redirects works page to the top page", () => {
    cy.visit("/works");

    cy.url().should("eq", `${host}/`);
  });

  it("opens all posts page", () => {
    cy.contains("All posts").click();

    cy.url().should("eq", `${host}/blog/archives/`);

    cy.get(".post-list-item__title a")
      .eq(0)
      .then($postItem => {
        const href = $postItem.prop("href");
        const title = $postItem.text();

        cy.get($postItem).click();

        // Check the linked individual page.
        cy.url().should("eq", href);
        cy.get("h1")
          .eq(1)
          .invoke("text")
          .should("contain", title);
      });
  });
});
