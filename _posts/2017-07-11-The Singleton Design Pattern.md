---
layout:      post
title:       "The Singleton Design Pattern"
date:        2017-07-11 23:00:00 -0500
tags:        design-pattern
description: "Different methods of creating a singleton pattern class, and ways to create a thread-safe one with high performance."
---

## Definition
In some cases, we want a certain class to have only one instance, such as the `Printer` class and the `ThreadPool` class in Java. This design pattern is called the `Singleton Pattern`:

> To restrict the instantiation of a class to one object, and provide a global access point.

## The simplest singleton pattern
Let's answer an interesting question first: can a `constructor` be decorated as `private` in Java?

```java
public class Test {

    private Test() { }

}
```

In fact, this code can be compiled, but what's the meaning of this? How to instantiate this class? We know that private methods can only be invoked inside the class, and since the only constructor is private, how to get into this class without an instance?

The answer is obvious: we can create a `public static` method to invoke the constructor:

```java
public class Test {

    public static void create() {
        new Test();
    }

    private Test() {

    }

}
```

This example gives us one way to implement the simplest sigleton pattern, that we can control the instantiation with a pulbic static method and a private constructor. Actually, if we choose to create a class with sigleton pattern in `Intellij`, we will get the following template:

```java
public class SimpleSingleton {
    
    private static SimpleSingleton ourInstance = new SimpleSingleton();

    public static SimpleSingleton getInstance() {
        return ourInstance;
    }

    private SimpleSingleton() { }
    
}
```

It seems that we have perfectly addressed the problem! However, if you are familiar with the `class loading mechanism` in Java, you'll know that `class-level static statements` are executed once the class is loaded. If, unfortunately, the initialization process is time-consuming, and the instance of this class is never used after creation, this will be very wasteful.

## Eager loading & Lazy loading
The method above is called the `Eager Loading`:

> Whenever and whether the instance is used, always eargely create it during class loading.

In contrast to this, we have another implementation:

```java
public class SimpleSingleton {

    private static SimpleSingleton ourInstance = null;

    public static SimpleSingleton getInstance() {
        if (ourInstance == null)                   // a
            ourInstance = new SimpleSingleton();   // b

        return ourInstance;
    }

    private SimpleSingleton() { }

}
```

This is the `Lazy Loading`:

> Create the instance at the first request, and directly return it when being requested again.

## Thread-safe considerations
Although the lazing loading looks good, it has a fatal problem: it is not thread-safe. If we have the following invocation sequence, two different instances will be created:

1. `Thread #1` enters method `getInstance()`, and passes the `if` judgement at [a], but its time slice ends before executing `[b]`.
2. `Thread #2` enters method `getInstance()`, when `ourInstance` is still `null`, so it passes the judgement and executes `[b]`. Finally a new `SimpleSigleton` instance is created and returned.
3. `Thread #1` executes `[b]`, and creates a new `SimpleSigleton` instance, which overrides the instance created by `Thread #2`. This new instance is returned.

To address this problem, using Java's `synchronization (locking) mechanism` can be a good method:

```java
public static synchronized  SimpleSingleton getInstance() {
    if (ourInstance == null) ourInstance = new SimpleSingleton();

    return ourInstance;
}
```

`Synchronized` methods can only be accessed by one thread at the same time, which fulfills the thread-safe requirement. However, it brings the `performance` issue: Java performs `locking` and `unlocking` operations when handling synchronized codes, and they may take some time.

In fact, after analyzing this code, we will find that synchronization is only necessary at the first invocation, when the instance is not yet created. If we need to access this method many times, all synchronizations are meaningless except the the first one.

## Double-checked locking
To achieve thread-safe, and in the meantime address the performance issue, some people suggested a more complicated solution:

```java
public static synchronized  SimpleSingleton getInstance() {
    if (ourInstance == null) {
        synchronized (SimpleSingleton.class) {
            if (ourInstance == null) {
                ourInstance = new SimpleSingleton();
            }
        }
    }

    return ourInstance;
}
```

Since only the instance creation statement needs to be locked, we use a `synchronized block` instead of synchronized method. Also, to avoid the problem we met in lazing loading, `ourInstance` is checked a second time inside the synchronized block before we really create a instance. As only one thread can access the synchronized block at the same time, only one instance will be created.

## The problem brought by the JVM
The double-checked locking seems to be perfect, but regrettably, it will not work in some cases. The problem is that the JVM allows the compiler to `reorder instructions`, which cannot guarantee the `orderliness`. This may involve deeper analysis, and I don't want to discuss further in this blog, so I just give the conclusion:

> Before the `new` operation finishes, the compiler may change the reference on the left of the `=` operator to `not-null` in advance. In multi-thread cases, a `not fully initialized object` will be returned.

This sounds ridiculous, but it happens. Luckily, Java provides a mechanism to avoid this problem: the keyword `volative`:

```java
public class SimpleSingleton {

    private static volatile SimpleSingleton ourInstance = null;  // a

    public static synchronized  SimpleSingleton getInstance() {
        if (ourInstance == null) {
            synchronized (SimpleSingleton.class) {
                if (ourInstance == null) {
                    ourInstance = new SimpleSingleton();
                }
            }
        }

        return ourInstance;
    }

    private SimpleSingleton() { }

}
```

Note that at `[a]`, a `volatile` keyword is added to `ourInstance`. What we need to know here is that `volatile` prevents JVM from `reordering instructions`.

Finally, we have developed a thread-safe singleton pattern class with high performance.
