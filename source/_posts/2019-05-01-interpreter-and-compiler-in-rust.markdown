---
layout: post
title: "Writing an Interpreter and a Compiler in Rust"
date: 2019-05-01 00:14
comments: true
categories: [Rust]
draft: true
---

I have been reading [Writing an Interpreter in Go](https://compilerbook.com/) and [Writing a Compiler in Go](https://interpreterbook.com/) by [Thorsten Ball](https://thorstenball.com/) and [implementing the Monkey programming language in Rust](https://github.com/shuhei/cymbal). And I implemented an interpreter and a compiler from the books in Rust.

The first book *Writing an Interpreter in Go* is about writing a parser and an interpreter for a programming language called Monkey. Monkey's feature set is limited, but it has some interesting features that modern programming languages have—such as function as a first-class citizen and closures.

```js
let fibonacci = fn(x) {
    if (x == 0) {
        0
    } else {
        if (x == 1) {
            1
        } else {
            fibonacci(x - 1) + fibonacci(x - 2)
        }
    }
};
fibonacci(15);
```

TODO: Show REPL.

The second book *Writing a Compiler in Go* taught me to write a simple compiler and a simple virtual machine. The compiler compiles Monkey scripts into instructions in byte codes, and the virtual machine executes the instructions.

TODO: An example of code and instructions.

## How I started

Before starting this project, I had written two simple command line tools with Rust, but they were too small to learn different aspects of Rust. I wanted to learn Rust by implementing something not trivial.

I had bought *Writing an Interpreter in Go* more than a year ago, but had left it in my bookshelf. Recently I wanted to relearn a little Go for work. I took the book from my bookshelf and started following the book—typing the code in Go. I did two chapters, and new Go syntax stopped appearing. I achieved my initial purpose—relearning Go—earlier than I thought because the book used a limited set of Go's language features. Then Rust came to my mind.

## Good things about Rust

First, I rewrote what I had written in Go with Rust and continued the rest of the book. The implementation in Rust was less redundant than the one in Go. Also, it was more type-safe thanks to `enum`s and `Result`. Especially `enum`s were perfect for ASTs and evaluated objects.

TODO: Examples

Harder parts came later—especially when the compiler and the virtual machine grew complex.

## Nested symbol tables were a linked list

To implement nested scopes, the Compiler Book uses self-recursive `struct`s for nested symbol tables. I was struggling with their ownership. I tried `Rc` and `RefCell`, but still was not able to get through them.

Then, I went to Rust Hack and Learn—a local meetup at Mozilla Berlin office—and asked how to get over ownership rules. One person (sorry, I didn't ask his name!) recommended me a book [Learn Rust With Entirely Too Many Linked Lists ](https://rust-unofficial.github.io/too-many-lists/).

The book introduces several versions of linked list implementations in Rust even though its precaution is not to implement linked lists in Rust. It had some techniques that I had recently learned, and much more. After a while, I realized that I had been trying to implement a linked list. Then I changed the self-recursive `struct` to a `Vec`, and it solved most of my headaches. So, the book's precaution was right. Don't implement a liked list.

TODO: Add some methods to illustrate compiler errors?

```rs
// Before
struct SymbolTable {
  store: HashMap<String, Symbol>,

  // This is a linked list!
  outer: Option<SymbolTable>;
}

// After
struct SymbolStore {
  store: HashMap<String, Symbol>,
}

struct SymbolTable {
  current: SymbolLayer;
  outers: Vec<SymbolStore>;
}
```

TODO: Box, Rc/RefCell (Are they already covered by the section above?)

## Ownership of objects and garbage collection

TODO: Ownership of objects and garbage collection. I `clone()`d a lot.

Objects form a graph instead of a tree. And they are mutable because of the semantics of Monkey language. I used `Rc` for reference counting and `RefCell` for mutability...?

## I learned basics of how programs work at low-level

Even before starting the project, I had some vague ideas about parser, interpreter and compiler thanks to my prior projects. I had followed [Write Yourself a Scheme in 48 Hours](https://en.wikibooks.org/wiki/Write_Yourself_a_Scheme_in_48_Hours), had tried to write a GLSL parser for Elm, and had learned a bit about assembly to understand V8 stacktraces. But I hadn't had concrete ideas about compilers, especially about how to translate high-level code like function calls and closures into low-level instructions. After the project, now I can confidently say what is on the stack and what is on the heap.

Also, the knowledge about stack was useful to understand some of the concepts of Rust itself. Rust needs to know the sizes of types because it needs to allocate values of the types on the stack.

------------TODO: More examples.

TODO: function call convention

TODO: How neat a stack machine is!

TODO: Nested scopes

## What's next?

TODO: What's next? The project didn't involve stuff... Also, I want to change the syntax and make it my own language :D Or maybe implement JavaScript, which I write everyday.
