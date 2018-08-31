---
layout:      post
title:       "Java Memory Model"
date:        2018-01-28 23:00:00 -0500
tags:        java
description: "The stack memory and heap memory in JVM."
---

## What is Java Virtual Machine (JVM)?
One of the most important characteristics of Java is that it is `platform-independent`, which is fulfilled by the `JVM`. JVM has its own instruction sets and registers, so java codes can ignore the implementation of the underlying operating system, and only need to generate bytecodes that JVM can read. When running, JVM will first convert the bytecode to native machine code of the host platform and then execute.

## The structure of JVM
The memory of JVM consists mainly of the following areas:

* Method area: storing information of the loaded classes, along with those `static` variables. It is the `permanent generation` in `garbage collection (GC)`, and is `thread-sharing`.
* Constant pool: storing `final` variables, class names, method names and values that can be determined at compile time.
* Program counter register: `thread-independent`, stroing the memory address of the instrucion that is currently being executed.
* Native method stack: serving `native` methods.
* Stack: each thread has its own `stack`, and each method has its own `thread frame`, storing `variables of basic data types` (such as int, boolean), and `references (addresses in heap) to instances of non-basic data typess`, as well as information of the return values. The top of the stack points to the current active stack (method) frame.
* Heap: the largest area that JVM memory controls, 'thread-sharing'. All memory of objects that are created by `new` operations are allocated here (including instances of objects and arrays). It is the main active area of `GC`.

## The memory allocation in Java
In general, Java treats basic data types and objects differently in memory allocation:

* Basic data types: including byte, short, int, long, float, double, boolean, char. When declaring these variables in methods, JVM will directly allocate spaces for them in `thread stack`. If a variable is beyond its scope, it space will be released.
* Objects created by `new` operations (including arrays): Their spaces will be allocated in `heap`,  and a `reference to the address` will be created in stack if needed. If an object is not referenced by any variable, its space won't be realeased immediately, but will be collected by GC at a `certain` time (decided by many factors).

## Stack memory, heap memory and parameter passing
Different from C++, there's no `pointer` in Java. Objecets are created in heap, while programs are executed in stack, so we are operating the `reference to object` all the time. For example, let's see the following code:

```java
class A {
    int value;
}

public class Test {

    public static void main(String[] args) {
        A a1 = new A();
        a1.value = 5;

        System.out.println(a1.value);  // 5

        update(a1);

        System.out.println(a1.value);  // 8
    }

    private static void update(A a2) {
        a2.value = 8;
    }

}
```

The parameter `a2` in method `update()` receives a reference. When executing, JVM finds this object in heap by the address, and then modifies its member variable `value`. Since the heap is shared, this modification is visible immediately to another reference `a1` in method `main()`, so the two outputs are different.

However, if we change the type `A` to a basic data type, such as `int`, the result will be different:

```java
public class Test {

    public static void main(String[] args) {
        int a1 = 5;

        System.out.println(a1);  // 5

        update(a1);

        System.out.println(a1);  // 5
    }

    private static void update(int a2) {
        a2 = 5;
    }

}
```

In JVM, stack can be read or written much faster than heap, so for basic data types, whose life cycle and size are known at compile time, their spaces are allocated directly in stack.

*Attention: If you use Java's `wrapper class` such as `Integer`, or arrays of basic data types such as `int[]`, the result will be the same as the first example. You may find the main difference is: whether it is created by a `new` operation.

## A special data type: String
You should notice that the eight basic data types mentioned above do not include `String`, but you don't need to `new` a String, why? Let's see an example:

```java
String a = "test";
String b = "test";

System.out.println(a == b);   // true
```

It seems that String behaves just like basic data types. This is due to the fact that JVM treats String specially. The `constant pool` in the JVM memory includes a `string constant pool`, which will be searched first if we create a String. If there's a String with the same `literal value`, JVM will return its reference directly; otherwise, JVM creates a new String constant.

What about this classical question:

```java
String a = new String("test");
```

How many objects are created in this code? The answer is `two`. First, a String `constant` is created in the `string constant pool` values `test`, and since there's a `new` operation, JVM creates a new String `object` in heap.

If you understand all contents above, the result of the following code will be obvious:

```java
String a = new String("test");
String b = new String("test");

System.out.println(a == b);   // false
```

Here we digress a little. The `==` operator in Java compares the references to objects (that is, the addresses). Therefore, we can't use `==` to compare the literal values of two Strings, but we can use method 'equals()' instead:

```java
String a = new String("test");
String b = new String("test");

System.out.println(a.equals(b));   // true
```

In addition, Java recommends creating String with string constant pool rather than `new` operator.

Finally, let's see an interesting feature of the compiler. Look at this example:

```java
String a = "aaabbb";
String b = "aaa" + "bbb";

System.out.println(a == b);   // true
```

The compiler seems to be so `smart` that it makes some optimizations at compile time. However, the compiler is not that `smart`:

```java
String a = "aaa";
String b = "bbb";

String m = "aaabbb";
String n = a + b;

System.out.println(m == n);   // false
```

If there is non-constant value at either side (or both) of the `+` operator, a new String object will always be created, even if the concatenated String exists in the string constant pool.
