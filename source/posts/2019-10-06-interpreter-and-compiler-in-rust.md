---
title: "Writing an interpreter and a compiler in Rust"
tags: [Rust]
---

In the spring of this year, I read [Writing an Interpreter in Go](https://interpreterbook.com/) and [Writing a Compiler in Go](https://compilerbook.com/) by [Thorsten Ball](https://thorstenball.com/), and implemented [an interpreter and a compiler](https://github.com/shuhei/cymbal) from the books in Rust. (I started writing this post in April but left unfinished for six months. Now I'm finishing it.)

The first book [Writing an Interpreter in Go](https://interpreterbook.com/) is about writing a parser and an interpreter for a programming language called Monkey. Monkey's feature set is limited, but it has some interesting features that modern programming languages have—such as function as a first-class citizen and closures.

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

The second book [Writing a Compiler in Go](https://compilerbook.com/) taught me to write a simple compiler and a simple virtual machine. The compiler compiles Monkey scripts into instructions (and constants), and the virtual machine executes the instructions. For example, an expression `1 + 2` is compiled into:

```rs
// Constants
vec![
    Object::Integer(1),
    Object::Integer(2),
]

// Instructions
vec![
    make_u16(OpCode::Constant, 0),
    make_u16(OpCode::Constant, 1),
    make(OpCode::Add),
    make(OpCode::Pop),
]
```

## How I started

I had bought _Writing an Interpreter in Go_ more in 2017, but it had been sleeping in my bookshelf ([Tsundoku](https://en.wikipedia.org/wiki/Tsundoku)). Recently, I wanted to relearn a little Go for work. I took the book from my bookshelf and started following the book—typing the code in Go. I did two chapters, and new Go syntaxes stopped appearing. I achieved my initial purpose—relearning Go—earlier than I thought because the book used a limited set of Go's language features. Then Rust came to my mind.

Before starting this project, I had written two simple command-line tools with Rust ([colortty](https://github.com/shuhei/colortty) and [ynan26](https://github.com/shuhei/ynan26)), but they were too small to learn different aspects of Rust. I wanted to learn more by implementing something not trivial.

## Good things about Rust

First, I rewrote what I had written in Go with Rust and continued the rest of the book. The implementation in Rust was less redundant than the one in Go. Also, it was more type-safe thanks to `enum`s and `Result`. Especially `enum`s were perfect for AST (Abstract Syntax Tree) and evaluated objects.

```rs
// An example of AST
#[derive(Debug, PartialEq, Clone, Hash, Eq)]
pub enum Expression {
    Identifier(String),
    IntegerLiteral(i64),
    StringLiteral(String),
    Boolean(bool),
    Array(Vec<Expression>),
    Hash(HashLiteral),
    Index(Box<Expression>, Box<Expression>),
    Prefix(Prefix, Box<Expression>),
    Infix(Infix, Box<Expression>, Box<Expression>),
    If(Box<Expression>, BlockStatement, Option<BlockStatement>),
    FunctionLiteral(Vec<String>, BlockStatement),
    Call(Box<Expression>, Vec<Expression>),
}
```

However, harder parts came later when the compiler and the virtual machine grew complex.

## Nested symbol tables were a linked list

To implement nested scopes, the Compiler Book uses self-recursive `struct`s for nested symbol tables. I was struggling with their ownership. I tried `Rc` and `RefCell`, but still was not able to get through them.

Then, I went to Rust Hack and Learn—a local meetup at Mozilla Berlin office—and asked how to get over ownership rules. One person (sorry, I didn't ask his name!) recommended me a book [Learn Rust With Entirely Too Many Linked Lists ](https://rust-unofficial.github.io/too-many-lists/).

The book introduces several versions of linked list implementations in Rust even though its precaution is not to implement linked lists in Rust. It had some techniques that I had recently learned, and much more. After a while, I realized that I had been trying to implement a linked list. Then I changed the self-recursive `struct` to a `Vec`, and it solved most of my headaches. So, the book's precaution was right. Don't implement a liked list.

```rs
// Before
struct SymbolTable {
  store: HashMap<String, Symbol>,

  // This is a linked list!
  outer: Option<SymbolTable>;
}

// After
struct SymbolLayer {
  store: HashMap<String, Symbol>,
}

struct SymbolTable {
  current: SymbolLayer;
  outers: Vec<SymbolLayer>;
}
```

## I learned basics of how programs work at low-level

Even before starting the project, I had some vague ideas about parser, interpreter and compiler thanks to my previous projects. But I hadn't had concrete ideas about compilers, especially about how to translate high-level code like function calls and closures into low-level instructions. After the project, now I can confidently say what is on the stack and what is on the heap.

Also, the knowledge about stack was useful to understand some of the concepts of Rust itself. Rust's compiler to know the sizes of types because it needs to generate machine code that allocates values of the types on the stack.

## Conclusion

It was a fun project. I learned something, but there is much more to learn in Rust. Also, now I can admire modern interpreters and compilers like V8 more than before.

[Writing an Interpreter in Go](https://interpreterbook.com/) and [Writing a Compiler in Go](https://compilerbook.com/) are great. I liked their hands-on approach with many unit tests.
