---
layout: post
title: "Writing an Interpreter and a Compiler in Rust"
date: 2019-05-01 00:14
comments: true
categories: [Rust]
---

I have been reading [Writing an Interpreter in Go](https://compilerbook.com/) and [Writing a Compiler in Go](https://interpreterbook.com/) by [Thorsten Ball](https://thorstenball.com/) and [implementing the Monkey programming language in Rust](https://github.com/shuhei/cymbal).

The first book is about writing a parser and an interpreter for a programming language called Monkey. Monkey's feature set is pretty limited, but it has some interesting features that modern programming languages have, such as function as a first-class citizen, closures, etc.

TODO: Show a code snippet!

The second book taught me to write a compiler and a virtual machine to execute instructions that the compiler generates.

Even before starting the project, I had some vague ideas about parser, interpreter and compiler thanks to my prior projects. I had followed [Write Yourself a Scheme in 48 Hours](https://en.wikibooks.org/wiki/Write_Yourself_a_Scheme_in_48_Hours), had tried to write a GLSL parser for Elm, and had learned a bit about assembly to understand V8 stacktraces. But I hadn't had concrete ideas about compilers, especially about how to translate high-level code like function calls and closures into low-level instructions. After the project, now I can confidently say what is on the stack and what is on the heap.

Also, this knowledge about compiler and virtual machine was useful to understand some of the concepts of Rust itself. Rust needs to know about the sizes of types because it needs to allocate values of the types on the stack. ------------TODO: More examples.

## How I started

Before starting this project, I had written two simple command line tools with Rust, but they were too small to learn different aspects of Rust. I wanted to learn Rust by implementing something not too trivial.

I had bought "Writing an Interpreter in Go" more than a year ago, but had left it in my bookshelf. Recently I wanted to re-learn Go a bit for work. I took the book from my bookshelf and started following the code in the book with Go. I did ??? chapters and new Go syntax stopped appearing. The initial purpose of re-learning Go was achieved. Then Rust came to my mind.

## How it was like

So I rewrote what I wrote in Go with Rust. Rust implementation was less redundant than Go. Also, it was more type-safe mostly because of enums and Result. Especially enums are perfect for ASTs and evaluated objects!

However, harder parts came later... Especially when the compiler and VM grew complex.

To implement nested scopes, the Compiler Book uses self-recursive struct for nested symbol tables. I was struggling with its ownership. I tried Rc and RefCell, but still was not able to get through them. Then, I went to a local Rust meetup and asked how to learn and get over ownership rules. One person (sorry, I didn't ask his name!) recommended a book [Learn Rust With Entirely Too Many Linked Lists
](https://rust-unofficial.github.io/too-many-lists/). The book introduces many versions of linked list implementations in Rust while its precaution is not to implement linked lists in Rust. It had some techniques that I had recently learned, and much more. And I realized that what I was trying to implement was actually a linked list! Then I changed the self-recursive struct to a Vec. And it solved most of the headaches that I had at the time. So, the book's precaution was right!

TODO: Code example!

TODO: Box, Rc/RefCell (Are they already covered by the section above?)

TODO: Ownership of objects and garbage collection. I `clone()`d a lot.

TODO: What's next? The project didn't involve stuff... Also, I want to change the syntax and make it my own language :D
