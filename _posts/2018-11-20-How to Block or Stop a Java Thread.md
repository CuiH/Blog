---
layout:      post
title:       "How to Block/Stop a Thread in Java"
date:        2018-11-20 23:18:21 -0700
tags:        java
description: "Several ways to affect the execution of a Java thread."
---

## Thread states

The `state transition` of threads in Java is the fundamental of today's topic. Basically, there are six possible states:

* NEW: a thread is created, but not started.
* RUNNABLE: a thread that is eligible to run. There may be many `RUNNABLE` threads, but only one of them can occupy the CPU at a given time.
* BLOCKED: a thread that is blocked and waiting for a monitor lock to enter a synchronized block/method.
* WAITING: a thread that is waiting for another thread to perform a particular action.
* TIMED_WAITING: similar to the `WAITING` state. A `TIMED_WAITING` thread waits for another thread with a specified waiting time.
* TERMINATED: a thread that has completed execution.

## sleep()

A simple way to affect the execution of a thread is to invoke the `Thread.sleep()`. This is a `static` method that sleeps the `currently running` thread. This method can be called when a thread runs too fast or the program wants other threads to have the chance to execute. There are some facts:

* The parameter `millis` of `Thread.sleep()`` only guarantees the minimum sleeping time.
* When a thread wakes up from sleeping, its state changes from `TIMED_WAITING` to `RUNNABLE`. Then, it waits for the scheduling of the scheduler.
* When a thread is sleeping, it will not release any lock that it holds.

As for the last point, let's see an example.

``` java
class Resource { }

public class SleepTest {

    public static void main(String[] args) {
        Resource resource = new Resource();

        Thread t1 = new Thread(() -> {
            System.out.println(new Date().toString() + ": start of t1");

            synchronized (resource) {
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

            System.out.println(new Date().toString() + ": end of t1");
        });

        Thread t2 = new Thread(() -> {
            System.out.println(new Date().toString() + ": start of t2");

            // make sure t1 acquires the lock first
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            synchronized (resource) { }

            System.out.println(new Date().toString() + ": end of t2");
        });

        t1.start();
        t2.start();
    }

}

/*
Outputs:
Tue Dec 19 00:47:46 CST 2017: start of t1
Tue Dec 19 00:47:46 CST 2017: start of t2
Tue Dec 19 00:47:49 CST 2017: end of t2
Tue Dec 19 00:47:49 CST 2017: end of t1
*/
```

When `t1` is sleeping, it does not release the `resource`, so `t2` will not finish until `t1` wakes up and releases the `resource`.

## yield()

If a thread has finished all works in one round, the program can give a hint to the scheduler that other threads can occupy the CPU. `Thread.yield()` is a `static` method that `suggests` the scheduler other threads with the `same priority` can now be executed. Note that for `Thread.yield()`,

* It is only a suggestion, that it will not guarantee the yield of a thread.
* It will not change the status of a thread.
* It does not have any synchronization semantic, which means it will not release any lock that it holds.

## join()

`join()` is a non-static method in class Thread that `appends` current thread to the end of another thread. When a thread invokes `t.join()` on another thread `t`, the first thread will be `suspended` until the second thread completes. Let's see an example:

``` java
public class JoinTest {

    public static void main(String[] args) {

        Thread t1 = new Thread(() -> {
            System.out.println(new Date().toString() + ": start of t1");

            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            System.out.println(new Date().toString() + ": end of t1");
        });

        Thread t2 = new Thread(() -> {
            System.out.println(new Date().toString() + ": start of t2");

            try {
                t1.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            System.out.println(new Date().toString() + ": end of t2");
        });

        t1.start();
        t2.start();
    }

}

/*
Outputs:
Tue Dec 19 15:38:07 CST 2017: start of t2
Tue Dec 19 15:38:07 CST 2017: start of t1
Tue Dec 19 15:38:10 CST 2017: end of t1
Tue Dec 19 15:38:10 CST 2017: end of t2
*/
```

`t2` joins `t1` so `t2` will not complete until `t1` completes. Note that:

* An overloaded version of `join()` accepts a `maximum waiting time`, so a waiting thread will also be awakened when the waiting time exceeds the limit.
* The call of `join()` will not cause the release of any lock.
* After Java SE5, there's a better choice -- `CyclicBarrier`, which is a substitute for `join()`.

## wait() and notify()

There's another mechanism that supports multi-thread interactions. `wait()` enables a thread to wait for the change of a certain condition. When `wait()` is called on an `"resource"`, the current thread will be suspended until the method `notify()` is called on the same `"resource"`. `wait()` and `notify()` are methods declared in class `Object`, which enables a thread to wait for any `"resource"`. Note that:

* An overloaded version of `wait()` accepts a `maximum waiting time`, so a waiting thread will also be awakened when the waiting time exceeds the limit.
* If more than one thread is waiting for a `"resource"`, that `"resource"` can invoke the method `notifyAll()` to notify all waiting threads.
* `wait()` and `notify()` can only be invoked inside a synchronized block/method.
* `wait()` and `notify()` can only be invoked on an object if current thread holds the lock of that object.
* After the invocation of `wait()`, the status of current thread becomes `WAITING` and that exact object lock will be `released` (current thread may still hold locks from other objcets).

The last three points are of the most importance. Different from `Thread.sleep()` and `Thread.yield()`, `wait()` will release the objcet lock, but this makes sense. The invocation of `wait()` on an object means current thread has finished its work with this object and it's now waiting for something to happen on that object, so current thread needs to release this object lock to enable other threads to interact with this object. Let's see an example:

``` java
class Resource { }

public class WaitTest {

    public static void main(String[] args) {

        Resource resource = new Resource();

        Thread t1 = new Thread(() -> {
            System.out.println(new Date().toString() + ": start of t1");

            synchronized (resource) {
                try {
                    resource.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

            System.out.println(new Date().toString() + ": end of t1");
        });

        Thread t2 = new Thread(() -> {
            System.out.println(new Date().toString() + ": start of t2");

            // make sure t1 acquires the lock first
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            synchronized (resource) {
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

                resource.notify();
            }

            System.out.println(new Date().toString() + ": end of t2");
        });

        t1.start();
        t2.start();
    }

}

/*
Outputs:
Tue Dec 19 17:58:14 CST 2017: start of t1
Tue Dec 19 17:58:14 CST 2017: start of t2
Tue Dec 19 17:58:17 CST 2017: end of t1
Tue Dec 19 17:58:17 CST 2017: end of t2
*/
```

`t1` waits for `t2` to finish its part with the `resource`.

When `notify()` or `notifyAll()` is called, the status of the threads that are waiting on this object will change from `WAITING` to `BLOCKED`, and they will then compete for the object lock. If one thread reacquires the lock after the notifying thread releases the lock, its status will become `RUNNABLE`. Therefore, `notify()` or `notifyAll()` will `not` cause the release of the lock. 

## suspend() and resume() (deprecated)

Sometimes we may want to stop a thread for a while. Previously, there are a pair of methods `suspend() and resume()` declared in class `Thread`, but as explained in the `Javadoc`, they are `inherently deadlock-prone` and thus `deprecated`:

> If the target thread holds a lock on the monitor protecting a critical system resource when it is suspended, no thread can access this resource until the target thread is resumed. If the thread that would resume the target thread attempts to lock this monitor prior to calling `resume`, deadlock results.

A suspended thread will `not` release any lock it holds, so the above words are easy to understand.

## stop() (deprecated)

`stop()` is also `deprecated` due to `inherently unsafe`:

> Stopping a thread with Thread.stop() causes it to unlock all of the monitors that it has locked (as a natural consequence of the unchecked `ThreadDeath` exception propagating up the stack). If any of the objects previously protected by these monitors were in an inconsistent state, the damaged objects become visible to other threads, potentially resulting in arbitrary behavior.

This may not be easy to understand. Let's see an example:

``` java
public class StopTest {

    public static void main(String[] args) {
        Thread t = new Thread(new Runnable() {
            private Vector<Integer> vector = new Vector<>();

            @Override
            public void run() {
                while (true) {
                    int num = new Random().nextInt(100);
                    vector.add(num);
                }
            }
        });

        t.start();

        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        t.stop();
    }

}
```

The `Vector` here is a `thread-safe` container in Java, which means this container is always in a consistent status. In fact, `Vector` is protected by `synchronization`:

``` java
public synchronized boolean add(E e) {
        modCount++;
        ensureCapacityHelper(elementCount + 1);
        elementData[elementCount++] = e;
        return true;
    }
```

Now if we `stop` a thread that is interacting with a vector, the target thread will immediately release the lock that protects this vector, and thus other threads can read from or write to this vector `inconsistently`. For instance, if the `elementCount` has been increased by one and the thread is stopped before the actual data is witten to the array, another thread that tries to read the last element may acquire the vector lock and get a non-existent value. 

## Status flag

How to stop a thread then? A simple way is to use a boolean variable as a flag:

``` java
public class FlagTest extends Thread {

    private volatile boolean canceled = false;


    public void cancel() {
        canceled = true;
    }

    @Override
    public void run() {
        System.out.println(new Date().toString() + ": start");

        while (!canceled) {
            // do something
            System.out.println(new Date().toString() + ": running");

            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println(new Date().toString() + ": end");
    }

    public static void main(String[] args) throws InterruptedException {
        FlagTest f = new FlagTest();

        f.start();
        Thread.sleep(5000);
        f.cancel();
    }

}

/*
Outputs:
Tue Dec 19 22:34:03 CST 2017: start
Tue Dec 19 22:34:03 CST 2017: running
Tue Dec 19 22:34:04 CST 2017: running
Tue Dec 19 22:34:05 CST 2017: running
Tue Dec 19 22:34:06 CST 2017: running
Tue Dec 19 22:34:07 CST 2017: running
Tue Dec 19 22:34:08 CST 2017: end
*/
```

Every round, the thread will check the boolean flag `canceled` to decide whether to break the cycle or not. Note that `canceled` is a `volatile` variable, which ensures that operations on this variable are thread-safe in this case.

## interrupt()

The above method can stop a thread at the beginning of a certain round of cycle, but we may also want to stop a `WAITING` or `BLOCKED` thread. In previous examples, methods like `Thread.sleep()` and `Object.wait()` may throw exceptions called `InterruptedException`. This can help us stop such threads.

As you can imagine, interrupting a `WAITING` or `BLOCKED` thread is more complicate than stopping a thread after it finishes one round of cycle. You'll need to deal with the `aftermaths` such as `tidying up` the resources, which is similar to handling an exception in a `try-catch` block.

The method `interrupt()` in class `Thread` enables us to stop a thread by setting an interrupt flag, while another static method `Thread.interrupted()` resets the flag. If an interrupt happens on a `WAITING` or `BLOCKED` thread, an `InterruptedException` will be thrown, and at the same time, the interrupt flag will be reset. Let's see an example:

``` java
public class InterruptTest {
    
    public static void main(String[] args) {
        Thread t = new Thread(() -> {
            System.out.println(new Date().toString() + ": start");

            while (!Thread.interrupted()) {
                // do something
                System.out.println(new Date().toString() + ": running");

                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    System.out.println(new Date().toString() + ": interrupted when sleeping");

                    Thread.currentThread().interrupt();
                }
            }

            System.out.println(new Date().toString() + ": end");
        });

        t.start();

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        t.interrupt();
    }

}

/*
Outputs:
Tue Dec 19 23:56:54 CST 2017: start
Tue Dec 19 23:56:54 CST 2017: running
Tue Dec 19 23:56:55 CST 2017: running
Tue Dec 19 23:56:56 CST 2017: running
Tue Dec 19 23:56:57 CST 2017: running
Tue Dec 19 23:56:58 CST 2017: running
Tue Dec 19 23:56:59 CST 2017: interrupted when sleeping
Tue Dec 19 23:56:59 CST 2017: end
*/
```

We can now call the `Thread.interrupted()` method to check whether current thread has been interrupted. Note that when an `InterruptedException` is thrown, the interrupt flag will be reset, so we need to set the flag again to break the cycle in the `catch` block.

## Summary

The `concurrent programming` in Java is a very complex and important topic. Today I only introduced the tip of the iceberg, but if you want to be a proficient java programmer, you must familiar youself with the concurrent programming.
