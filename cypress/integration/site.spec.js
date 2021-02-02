/// <reference types="Cypress" />
/* global Cypress, cy */

// Stub Google Analytics
// https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/stubbing-spying__google-analytics
Cypress.on("window:before:load", win => {
  Object.defineProperty(win, "ga", {
    writable: false,
    value: cy.stub().as("ga")
  });
});

const host = Cypress.config("baseUrl");

describe("shuheikagawa.com", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("sends a page view event to Google Analtics", () => {
    cy.get("@ga")
      .should("be.calledWith", "create", "UA-309586-8", "shuheikagawa.com")
      .and("be.calledWith", "send", "pageview");
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

    cy.contains("Social media").should("be.visible");
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
