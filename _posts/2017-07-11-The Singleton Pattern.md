---
layout:      post
title:       "The Singleton Pattern"
date:        2017-07-11 23:00:00 -0500
tags:        design-pattern
description: "Different methods of creating a singleton pattern class, and how to create a thread-safe one with high performance."
---

## Definition
In some cases, our program requires that a certain class should have only one instance, such as the `Printer` class and `ThreadPool` class in Java. This design pattern is called `Singleton Pattern`:

> To restrict the instantiation of a class to one object, and provide a global access point.

## The Simplest Singleton Pattern
Let's answer an interesting question first: Can the `constructor` be decorated as`private` in Java?

```java
public class Test {

    private Test() { }

}
```

In fact, this code can be compiled, but what's the meaning of this? How can we instantiate this class? We know that private methods can only be invoked inside the class, and since the only constructor is private, how to get into this class without an instance?

The answer is obvious now: we can create a `public static method` to invoke the constructor:

```java
public class Test {

    public static void create() {
        new Test();
    }

    private Test() {

    }

}
```

This exercise gives us a method to implement the simplest sigleton pattern, that is, we can control the instantiation through a global static method and a private constructor. Actually, if we choose to create a class with sigleton pattern in `Intellij`, we will get the following template:

```java
public class SimpleSingleton {
    
    private static SimpleSingleton ourInstance = new SimpleSingleton();

    public static SimpleSingleton getInstance() {
        return ourInstance;
    }

    private SimpleSingleton() { }
    
}
```

It seems that we have perfectly addressed the problem! However, if you are familiar with the `class loading mechanism in Java`, you'll know that `class-level static statements` are executed once the class is loaded. If unfortunately, the initialization process is time-consuming, and the instance of this class is never used after creation, this will be very wasteful.

## Eager Loading & Lazy Loading
The method above is called `Eager Loading`, that is:

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

> Create the instance at the first request, and directly return it when requested again.

## Thread-safe Considerations
Althought the lazing loading achieves the delayed loading, it has a fatal problem: it is not thread-safe. If we use the following invokation sequence, two different instances will be created:

1. `Thread #1` enters method `getInstance()`, and passes the `if` judgement at [a], but its time slice ends before executing `[b]`.
2. `Thread #2` enters method `getInstance()`, when `ourInstance` is still `null`, so it passes the judgement and executes `[b]`. Finally it creates a new `SimpleSigleton` instance and returns it.
3. `Thread #1` executes `[b]`, and creates a new `SimpleSigleton` instance, which overrides the instance created by `Thread #2`, and returns the new instance.

To address this problem, using Java's `synchronization (locking) mechanism` can be a good method:

```java
public static synchronized  SimpleSingleton getInstance() {
    if (ourInstance == null) ourInstance = new SimpleSingleton();

    return ourInstance;
}
```

`Synchronized methods` can only be accessed by one thread at one time, which fulfills the thread-safe requirement. However, it brings the `performance` issue: Java performs `locking` and `unlocking` operations when handling synchronized codes, and they may take some time.

In fact, after analyzing this code, we will find that synchronization is only indispensable at the first invocation, when the instance is not yet created. If we need to access this method many times, all synchronizations are meaningless except the the first time.

## Double-checked Locking
To achieve thread-safe, and at the same time address the performance issue, some people suggested a more complicated solution:

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

Since only the instance creation statement requires to be locked, we use a `synchronized block` instead of synchronized method. Also, to avoid the problem we met in lazing loading, `ourInstance` is checked a second time inside the synchronization block before we really create a instance. As only one thread can access the synchronized block at one time, only one instance will be created.

## The Problem Brought by the JVM
The double-checked locking seems to be perfect, but regrettably, it will not work in some cases. The problem is that the JVM allows the compiler to `reorder instructions`, which cannot guarantee the `orderliness (not sure)`. This may involve deeper analysis, and I don't want to have further discussion concerning this topic in this blog, so I just give a conclusion:

> Before the `new` operation finishes, the compiler may change the reference on the left of the `=` operator to `non-null` in advance. In multi-thread cases, a `not fully initialized object` will be returned.

This sounds ridiculous, but it happens. However, luckily Java provides a mechanism to avoid this problem: the keyword `volative`:

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

Pay attention to the statement at `[a]`, where we add a `volatile` to `ourInstance`. As for its specific function, I will discuss in another blog (maybe). What we need to know here is that the keyword `volatile` prohibits JVM from doing `instructions reordering`.

Therefore, finally, we have developed a thread-safe singleton pattern class with high-performance.
