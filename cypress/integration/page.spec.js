/* global Cypress, cy */

// Stub Google Analytics
// https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/stubbing-spying__google-analytics
Cypress.on("window:before:load", win => {
  Object.defineProperty(win, "ga", {
    writable: false,
    value: cy.stub().as("ga")
  });
});

const host = "http://localhost:4000";

describe("shuheikagawa.com", () => {
  beforeEach(() => {
    cy.visit(`${host}/`);
  });

  it("sends a page view event to Google Analtics", () => {
    cy.get("@ga")
      .should("be.calledWith", "create", "UA-309586-8", "shuheikagawa.com")
      .and("be.calledWith", "send", "pageview");
  });

  it("navigates to older and newer posts", () => {
    cy.get("h1").should("have.length", 4);

    cy.contains("Older Posts").click();
    cy.url().should("eq", `${host}/blog/pages/2/`);
    cy.get("h1").should("have.length", 4);

    cy.contains("Older Posts").click();
    cy.url().should("eq", `${host}/blog/pages/3/`);
    cy.get("h1").should("have.length", 4);

    cy.contains("Newer Posts").click();
    cy.contains("Newer Posts").click();
    cy.url().should("eq", `${host}/`);
    cy.get("h1").should("have.length", 4);
  });

  it("opens about page", () => {
    cy.contains("About").click();

    cy.url().should("eq", `${host}/about/`);

    cy.contains("Accounts").should("be.visible");
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
  });

  it("opens works page", () => {
    cy.contains("Works").click();

    cy.url().should("eq", `${host}/works/`);

    cy.contains("Code").should("be.visible");
    cy.contains("GitHub").should(
      "have.prop",
      "href",
      "https://github.com/shuhei"
    );
    cy.contains("npm").should(
      "have.prop",
      "href",
      "https://www.npmjs.com/~shuhei"
    );

    cy.contains("Visible Things").should("be.visible");
    cy.contains("Pixelm").should("have.prop", "href", `${host}/pixelm/`);
    cy.contains("Compare").should(
      "have.prop",
      "href",
      `https://github.com/shuhei/Compare`
    );
  });

  it("opens archives page", () => {
    cy.contains("Archives").click();

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
