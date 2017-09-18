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

``` java
public class Test {

    private Test() { }

}
```

In fact, this code can be compiled, but what's the meaning of this? How can we instantiate this class? We know that private methods can only be invoked inside the class, and since the only constructor is private, how to get into this class without an instance?

The answer is obvious now: we can create a `public static method` to invoke the constructor:

``` java
public class Test {

    public static void create() {
        new Test();
    }

    private Test() {

    }

}
```

This exercise gives us a method to implement the simplest sigleton pattern, that is, we can control the instantiation through a global static method and a private constructor. Actually, if we choose to create a class with sigleton pattern in `Intellij`, we will get the following template:

``` java
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

``` java
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

``` java
public static synchronized  SimpleSingleton getInstance() {
    if (ourInstance == null) ourInstance = new SimpleSingleton();

    return ourInstance;
}
```

`Synchronized methods` can only be accessed by one thread at one time, which fulfills the thread-safe requirement. However, it brings the `performance` issue: Java performs `locking` and `unlocking` operations when handling synchronized codes, and they may take some time.

In fact, after analyzing this code, we will find that synchronization is only indispensable at the first invocation, when the instance is not yet created. If we need to access this method many times, all synchronizations are meaningless except the the first time.

## Double-checked Locking
To achieve thread-safe, and at the same time address the performance issue, some people suggested a more complicated solution:

``` java
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

``` java
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

---

## 定义
在一些情况下，我们的程序需要保证某个类只有一个实例存在，比如 Java 中的 `打印机` 类，`线程池` 类。这种设计在设计模式中被称作单例模式，定义如下：

> 确保一个类只有一个实例，并提供一个全局访问点。

这听起来似乎很好实现，但在实际应用的时候，还有很多需要考虑的因素。

## 最简单的单例模式
先来回答一个有趣的问题，Java 的构造方法可以修饰为 `private` 吗？

``` java
public class Test {

	private Test() { }

}
```

事实上，这是可以编译通过的，那么这样做有什么意义呢？如何实例化这个类？我们知道，私有方法只能在类内调用，既然构造方法是私有的，在没有实例的情况下如何进入这个类的内部呢？

答案已经显而易见了，我们可以创建一个公有静态方法来调用：

``` java
public class Test {

	public static void create() {
		new Test();
	}

	private Test() {

	}

}
```

这为我们实现简单的单例模式提供了思路，可以通过全局的静态方法控制实例的数量。如果在 `Intellij` 中选择创建一个单例模式的类，会得到如下模板：

``` java
public class SimpleSingleton {
	
	private static SimpleSingleton ourInstance = new SimpleSingleton();

	public static SimpleSingleton getInstance() {
		return ourInstance;
	}

	private SimpleSingleton() { }
	
}
```

似乎已经完美解决了问题！但是，如果你对 `Java类加载机制` 有一定了解，就会知道 static 代码在类加载的时候就会被执行，如果不巧初始化过程十分耗费时间，而这个实例被创建后又始终未使用，将形成浪费。

## 懒汉模式与饿汉模式
前面提到的方法被称作 `饿汉模式`，即：

> 无论实例何时使用以及是否被使用，总是急切的在类加载时就创建实例。

与之相对，还有另外一种实现方法：

``` java
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

这被称作 `懒汉模式`：

> 只在第一次请求实例的时候进行创建，之后直接返回已创建的实例。

## 线程安全
懒汉模式虽然实现了延迟加载，但却有一个致命的问题：它是线程不安全的。对于上面的代码，如果有如下的调用顺序，将产生两个不同的实例：

1. 线程1进入 getInstance() 方法，通过 [a] 处的 if 判断，在执行 [b] 处之前，时间片结束。
2. 线程2进入 getInstance() 方法，此时 ourInstance 仍旧为 null，线程2通过 if 判断，执行 [b] 处代码，创建新的 SimpleSigleton 实例，并返回。
3. 线程1执行 [b] 处代码，创建新的 SimpleSingleton 实例，这将覆盖线程2创建的实例，并返回新的实例。

为了解决这个问题，可以使用 Java 的 `同步（加锁）` 机制：

``` java
public static synchronized  SimpleSingleton getInstance() {
	if (ourInstance == null) ourInstance = new SimpleSingleton();

	return ourInstance;
}
```

被 `synchronized` 修饰的方法可以保证在同一时间只有一个线程能访问这个方法，这实现了线程安全，但却带来了 `性能` 上的问题：Java 在处理同步方法时需要进行加锁、解锁操作，这将耗费一定资源以及时间。

事实上，分析这段代码可以发现，只有在第一次创建实例的时候需要同步，之后直接返回已经创建的实例就可以了。如果在实际应用时需要多次访问这个函数，除了第一次访问之外的同步操作都是无意义的。

## 双重检查锁定
为了实现线程安全，同时解决效率问题，有人提出了更复杂的解决方案，即使用双重检查锁定：

``` java
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

因为只有创建实例这一条语句需要锁定，改为采用同步代码块而不是同步整个方法，这样只有未被实例化的情况下访问才进行同步操作，提高了性能。

同时为了避免懒汉模式中遇到的问题，在同步操作后再次检查 ourInstance 是否已被实例化。由于同一时间只有一个线程可以进入同步代码块，这保证了只有一个实例被创建。

*注意：由于是静态方法，同步块锁定的是整个类。

## JVM 带来的问题
双重检查锁定看似已经很完美了，但很遗憾，实际使用时依然会出现问题。这是因为 JVM 允许编译器对指令进行 `重排序`，将无法保证 `有序性`。这里涉及到更深入的分析，我不打算在这篇文章继续讨论，因此只给出一个结论：

> 在 `new` 操作完成之前，编译器可能提前将等号左端的引用变为 `非空`。在多线程环境下，这将返回一个 `未完全初始化` 的对象。

这看起来很荒唐，但却是真实存在的。幸运的是，Java 也提供了一种机制来解决这个问题：`volatile` 关键字。

``` java
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

注意 [a] 处，我们为 ourInstance 加上了 `volatile` 关键字，关于它的具体作用，我（应该）会在另一篇文章讨论，这里只需要知道，volatile `禁止 Java 进行指令重排序`，这样，就可以实现一个线程安全的单例模式。
