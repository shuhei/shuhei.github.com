const { insertWbr } = require("../wbr");

describe("insertWbr", () => {
  it("leaves regular words", () => {
    expect(insertWbr("Hello world")).toBe("Hello world");
  });

  it("leaves hyphenated word", () => {
    expect(insertWbr("hello-world-hi")).toBe("hello-world-hi");
  });

  it("leaves short lowerCamelCase", () => {
    expect(insertWbr("heWoHi")).toBe("heWoHi");
  });

  it("inserts <wbr> before punctuations in a word", () => {
    expect(insertWbr("hello.world!hi")).toBe("hello<wbr>.world<wbr>!hi");
  });

  it("inserts <wbr> before each word in a lowerCamelCase", () => {
    expect(insertWbr("helloWorldHi")).toBe("hello<wbr>World<wbr>Hi");
  });

  it("inserts <wbr> before each word in a UpperCamelCase", () => {
    expect(insertWbr("HelloWorldHi")).toBe("Hello<wbr>World<wbr>Hi");
  });

  it("inserts <wbr> before each word in a lowerCamelCase with numbers", () => {
    expect(insertWbr("helloWorld123Hi")).toBe("hello<wbr>World<wbr>123<wbr>Hi");
  });

  it("inserts <wbr> in a combination of punctuation and camelCase", () => {
    expect(insertWbr("wow So much server.keepAliveTimeout")).toBe(
      "wow So much server<wbr>.keep<wbr>Alive<wbr>Timeout"
    );
  });
});
