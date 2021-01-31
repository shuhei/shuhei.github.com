---
layout: post
title: "Playing with vanilla WebGL API"
date: 2015-02-15
tags: [JavaScript, WebGL]
---
Started writing in English on a whim.

I've been learning vanilla WebGL with [webgl-workshop](https://github.com/stackgl/webgl-workshop) since the last weekend. It took some time for me to understand concepts like array buffer and element buffer but it was fun to learn the basics that we stand on.

The team behind [webgl-workshop](https://github.com/stackgl/webgl-workshop) creates a set of utility modules called [`stackgl`](http://stack.gl/). It embraces the UNIX philosophy, "Write programs that do one thing and do it well." Even though the workshop doesn't use `stackgl` libraries, I liked the way the exercises were organized as small modules.

Before moving to another workshop module, [shader-school](https://github.com/stackgl/shader-school), I ported my old openFrameworks experiment with vanilla WebGL and Audio User Media in order to check if I could use what I learned so far.

[![Blurred Cube](/images/blurred-cube-webgl.png)](/blurred-cube)

[Blurred Cube](/blurred-cube)

The hardest part was randomly moving the cube's edges. Because I couldn't randomly move vertices on the array buffer, I had to rewrite buffer data frame by frame. It might be inefficient, but it works well on my laptop at least.

## Steps for drawing with WebGL

The exercises on [webgl-workshop](https://github.com/stackgl/webgl-workshop) split steps into two phases, `init` and `draw`, like [Processing](https://processing.org/). Here I leave a note on general steps in them for later use.

### Init

1. Compile shaders and link them into a program. If you have attributes in vertex shader, don't forget to set attribute location before linking. If you have uniforms, get their locations after linking for later use.
2. Create buffers and assign data to them.
3. Create element buffers and assign data to them if necessary.
4. Create textures and assign data to them if necessary. You can use textures in fragment shader via texture unit number as uniform.

### Draw

1. Use program, assign data to uniforms. If they don't change frame by frame, you can do this in the setup phase.
2. Bind buffer. If you have only one buffer, you may have done this in the setup phase.
3. Draw arrays or elements.
