const CustomRenderer = require("../markdown-renderer");

describe("code", () => {
  let renderer;
  beforeEach(() => {
    renderer = new CustomRenderer();
  });

  it("highlights code when a language is specified", () => {
    const js = "console.log('hello');";
    expect(renderer.code(js, "js")).toBe(
      '<pre><code class="hljs js"><span class="hljs-built_in">console</span>.log(<span class="hljs-string">\'hello\'</span>);</code></pre>'
    );
  });

  it("escapes HTML characters even when language is not specified", () => {
    const xss = "</code></pre><a onclick=\"alert('hello')\">click me</a>";
    expect(renderer.code(xss)).not.toContain("<a ");
    expect(renderer.code(xss)).toBe(
      '<pre><code class="hljs ">&lt;/code&gt;&lt;/pre&gt;&lt;a onclick=&quot;alert(&#39;hello&#39;)&quot;&gt;click me&lt;/a&gt;</code></pre>'
    );
  });
});

describe("image", () => {
  let renderer;
  beforeEach(() => {
    renderer = new CustomRenderer({ localImagePrefix: "/images/" });
  });

  it("renders image with title", () => {
    expect(
      renderer.image("/images/foo.png", "title of foo", "alt of foo")
    ).toBe('<img src="/images/foo.png" alt="alt of foo" title="title of foo">');
  });

  it("renders image without title", () => {
    expect(renderer.image("/images/foo.png", undefined, "alt of foo")).toBe(
      '<img src="/images/foo.png" alt="alt of foo">'
    );
  });

  it("renders image when image size is not found in the map", () => {
    renderer.setImageSizes(
      new Map([["something-else.png", { width: 100, height: 33 }]])
    );

    expect(
      renderer.image("/images/foo.png", "title of foo", "alt of foo")
    ).toBe('<img src="/images/foo.png" alt="alt of foo" title="title of foo">');
  });

  it("renders responsive placeholder from local image size", () => {
    renderer.setImageSizes(new Map([["foo.png", { width: 100, height: 33 }]]));

    expect(renderer.image("/images/foo.png", undefined, "alt of foo")).toBe(
      '<span class="responsive-image-wrapper"><span class="responsive-image-outer" style="max-width: 100px;"><span class="responsive-image-inner" style="padding-top: 33%;"><img class="responsive-image" src="/images/foo.png" alt="alt of foo"></span></span></span>'
    );
  });

  it("renders responsive placeholder from image size in title", () => {
    expect(
      renderer.image("/images/foo.png", "title of foo =200x89", "alt of foo")
    ).toBe(
      '<span class="responsive-image-wrapper"><span class="responsive-image-outer" style="max-width: 200px;"><span class="responsive-image-inner" style="padding-top: 44.5%;"><img class="responsive-image" src="/images/foo.png" alt="alt of foo" title="title of foo"></span></span></span>'
    );
  });
});
