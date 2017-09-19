---
layout:      post
title:       "Understanding of the Java Memory Model"
date:        2017-06-28 23:00:00 -0500
tags:        java
description: "The stack memory and heap memory in JVM."
---

## What is Java Virtual Machine (JVM)?
One of the most important characteristics of Java is that it is `platform-independent`, which is fulfilled by the `JVM`. JVM has its own instruction sets and registers, so java codes can ignore the implementation of the underlying operating system, and only need to generate bytecodes that JVM can read. When running, JVM will convert the bytecode to native machine code of the host platform and then execute.

## The Structure of JVM
The memory of JVM consists mainly of the following areas:

* Method Area: storing information of the loaded classes, along with those `static` variables. It is the `permanent generation` in `garbage collection (GC)`, and is `thread-sharing`.
* Constant Pool: storing `final` variables, class names, method names and values that can be determined at compile time.
* Program Countre Register: `thread-independent`, stroing the memory address of the instrucion that is currently being executed.
* Native Method Stack: serving `native` methods.
* Stack: each thread has its own `stack`, and each method has its own `thread frame`, storing `variables of basic data types` (such as int, boolean), and `references (addresses in heap) to instances of non-basic data typess`, as well as information of the return values. The top of the stack points to the current active stack (method) frame.
* Heap: the largest area tha JVM memory controls, 'thread-sharing'. All memory of objects that are created by `new` operations are allocated here (including instances of objects and arrays). It is the main active region of `GC`.

## The Memory Allocation in Java
In general, Java treats basic data types and objects differently in memory allocation:

* Basic Date Types: including byte, short, int, long, float, double, boolean, char. When defining these variables in methods, JVM will directly allocate spaces for them in `thread stack`. If a variable is beyond its scope, it space will be released.
* Objects created by `new` operations (including arrays): Their spaces will be allocated in `heap`,  and a `reference to the address` will be created in stack if needed. If an object is not referenced by any variable, its space won't be realeased immediately, but will be collected by GC at a `certain` time (decided by many factors).

## Stack Memory, Heap Memory and Parameter Passing
Different from C++, there's no `pointers` in Java. Objecets are created in heap, and programs are executed in stack, so we are operating the `reference to object` all the time. For example, let's see the following program:

``` java
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

The parameter `a2` of method `update()` receives references to objects. When running, JVM finds this object in heap according to the address, and then modify its member variable `value`. Since the heap is shared, this modification is visible immediately to another reference `a1` in method `main()`, so the two outputs are different.

As for the above example, if we change the type A to a basic data type, such as `int`, the result will be totally different:

``` java
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

In JVM, stack can be read and write much faster than heap, so for basic data types, whose life cycle and size are known at compile time, their spaces are allocated directly in stack.

*Attention: If you use Java's `wrapper class` such as `Integer`, or arrays of basic data types such as `int[]`, the result will be same as the first example. Therefore, the most useful difference is: whether it uses a `new` operator to create.

## A Special Data Type: String
You should notice that the eight basic data types mentioned above do not include `String`, but you don't need to `new` a String, why? Let's see an example:


``` java
String a = "test";
String b = "test";

System.out.println(a == b);   // true
```

It seems that String behaves just like basic data types. This is due to the fact that JVM treats String specially. The `Constant Pool` in the memory of JVM we mentioned includes a `String Constant Pool`, which will be searched first if we create a String. If there's a String with the same `literal value`JVM will return its reference directly; if not, JVM creates a new String constant.

What about this classical question:

``` java
String a = new String("test");
```

How many objects are created in the code? The answer is `two`. First, a String `constant` is created in the String Constant Pool values `test`, and then since there's a `new` operation, JVM creates a new String `object` in heap.

If you have understood all contents above, the results of the following code will be obvious:

``` java
String a = new String("test");
String b = new String("test");

System.out.println(a == b);   // false
```

Here we digress a little. the `==` operator in Java compares the references to objects (that is, the addresses). Therefore, we can't directly use `==` to compare the literal values of two Strings, but we can use method 'equals()' instead:

``` java
String a = new String("test");
String b = new String("test");

System.out.println(a.equals(b));   // true
```

In addition, Java recommends creating String with String Constant Pool rather than `new` operator.

Finally, let's discuss an interesting point of the compiler. Look at this example:

``` java
String a = "aaabbb";
String b = "aaa" + "bbb";

System.out.println(a == b);   // true
```

The compiler seems to be so `smart` that it makes some optimizations at compile time. However, the compiler is not that `smart`:

``` java
String a = "aaa";
String b = "bbb";

String m = "aaabbb";
String n = a + b;

System.out.println(m == n);   // false
```

if there is non-constant value at either side (or both) of the `+` operator, a new String object will always be created, even if the concatenated String exists in the String Constant Pool.

---

## 什么是JVM
Java 一个很重要的特性是与平台无关性，而这正是靠 JVM 来实现的。JVM 用有自己的指令集、寄存器等，屏蔽了底层操作系统的相关信息。Java 程序在编译时只需生成 JVM 能读懂的字节码，运行时 JVM 根据不同操作系统生成相应的机器指令执行。

## JVM的结构
JVM 在执行 Java 程序的时候，其内存主要分为如下几个区域：

* 方法区 Method Area：存储加载的类信息，以及类中 static 变量等，是 GC 中的持久代区，同时是 `线程共享` 的。
* 常量池 Constant Pool：存储类中的 final 常量，类名、方法名等，是编译期就已经确定的。
* 程序计数器 Program Counter Register：每个 `线程独立` 拥有，存储当前执行的指令的内存地址。
* 本地方法栈 Native Method Stack：为 native 方法服务。
* 栈 Stack：每个线程拥有自己的栈，每个方法拥有自己的栈帧，其中存储一些 `基本数据类型变量` （如int，boolean），`非基本类型变量在堆中的地址引用`，以及返回值信息等。栈顶指向当前活动的栈帧（即方法帧）。
* 堆 Heap：JVM 管理的内存中最大的一块区域，`线程共享`，所有由 `new` 操作创建的对象的内存在此分配（包括对象实例、数组等）。是 `GC` 的主要活动区域。

## Java 的内存分配
总的来说，Java 对于基本数据类型以及对象的内存分配的处理是不同的：

* 基本数据类型：包括 byte, short, int, long, float, double, boolean, char。当在方法中定义这些变量时，JVM 会在线程栈中为它们直接分配存储空间。当变量超过其作用域时，空间被释放。
* 由 `new` 创建的对象以及数组：在堆中分配存储空间，而在方法中产生的对这些 `对象的引用` 存储在栈中。如果一个对象没有任何引用指向它，它所占的空间不会立即被释放，而是等待某个特定的时间由 GC 进行释放。

## Java 的栈内存、堆内存与参数传递
不同于 C++，Java 中没有指针这一概念，对象在堆中创建，程序在栈中执行，因此操作的始终是 `对象的引用`，比如，下面这段程序：

``` java
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

`update()` 函数的参数 `a2` 接收了对象的引用，运行时 JVM 根据引用的地址在堆中找到这个对象，并对其 `value` 成员变量进行修改。由于堆内存是全局共享的，这个修改对 `main()` 函数中对象的另一个引用 `a1` 立即可见，因此两次输出的结果不同。

对于上面的例子，如果我们将 A 换为一个基本数据类型，如 int，则结果完全不同。

``` java
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

JVM 中的栈相对于堆存取速度更快，所以对于生存期已知、大小已知的基本数据类型，直接在栈中为其分配空间。

*注意： 如果使用了 Java 的包装类 `Integer`，或者是基本类型的数组如 `int[]`，则结果与第一个例子相同，因此主要的区分方法是：是否使用 `new` 操作符进行创建。

## 特殊的数据类型：String
你应该注意到，前面提到的 Java 中八种基本数据类型没有包括 String，但是请看下面的例子：

``` java
String a = "test";
String b = "test";

System.out.println(a == b);   // true
```

似乎 Stirng 表现出与基本数据类型的一样的特性，这是因为 JVM 对 String 进行了特殊的处理。前面提到的 JVM 内存区域中的 `常量池` 中有一部分为 `字符串常量池` ，在创建字符串时，JVM 首先在这个池中寻找是否存在同字面的字符串，如果存在，返回这个对象的引用，若不存在，则创建新的字符串常量。

再来回答一个十分经典的问题：

``` java
String a = new String("test");
```

这行代码创建了几个对象？答案是两个，首先在字符创常量池中创建 `"test"`,由于使用了 `new` 操作符，再在堆中创建新的 `String` 对象。

如果你理解了前面的内容，下面语句的结果就显而易见了：

``` java
String a = new String("test");
String b = new String("test");

System.out.println(a == b);   // false
```

这里引申一句题外话，Java 中的 `==` 操作符比较的是变量引用的地址，因此对于对象不能直接使用 `==` 进行比较。如果只是比较 String 的字面值，可以使用其自带的 `equals()` 函数：

``` java
String a = new String("test");
String b = new String("test");

System.out.println(a.equals(b));   // true
```

另外，Java 更推荐直接使用字符串常量池创建字符串，而不是通过 `new` 操作符。

最后，我们来探讨一下编译器的有趣之处，看下面的例子：

``` java
String a = "aaabbb";
String b = "aaa" + "bbb";

System.out.println(a == b);   // true
```

编译器似乎十分“聪明”，在编译期对我们的语句进行了一些优化。不过，编译器也没有那么“聪明”：

``` java
String a = "aaa";
String b = "bbb";

String m = "aaabbb";
String n = a + b;

System.out.println(m == n);   // false
```

如果在 `+` 操作符的两边存在非常量，即使连接后的字符串存在于常量池中，依旧会创建新的对象。