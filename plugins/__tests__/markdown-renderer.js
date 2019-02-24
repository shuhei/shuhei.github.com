const renderer = require("../markdown-renderer");

describe("code", () => {
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
