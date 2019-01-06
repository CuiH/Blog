---
layout:      post
title:       "HashMap in Java 8"
date:        2018-11-03 21:00:00 -0700
tags:        java
description: "Analyzing the source code of HashMap in JDK 1.8, and comparing it with the previous version."
---

## Overview

In `JDK 1.8`, the `HashMap` was optimized and implemented differently from the previous version. Some new data structures are added to improve the performance, but the overall design idea is still the same.

## Hash

First, we start with `hash`. Say we have a large amount of data pairs, such as a phone book:

```
Hao Cui: 1234567890
Yang Pan: 9876543210
Mo Tang: 233332333
```

With what data structure can we get the fastest `access speed`?

The simplest thought is to store sequentially. For instance, use a `linked list`. What we do is to maintain the head and tail node, so the time complexity of read is `O(1)`. However, if we want to get a phone number by name, a head-to-tail traverse is not avoidable, which has a time complexity of `O(n)`. When the data grows larger, this can be extremely inefficient.

A improvement is to use a `search tree` instead. Now the access time is `O(logn)`, which sounds great, but can it be even better?

As we know, we can access any item from an array by index within `O(1)` time, so we may try to store data pairs in an array, but since the key of our data is `string`, how to map it to a `index`? That's where hash works.

The essence of hash is a `mapping function`, compressing inputs into fixed-length outputs, which is popular in cryptology. In our case, we `hash` keys to array indices, so we can access values within constant time.

## The implementation of hash

There are three typical implementations of hash, including `static hash`, `extendable hash` and `linear hash`. To have a better understanding of HashMap, I will use examples in `DBMS` to introduce the first two.

### Static hash

This is the simplest hash. Suppose we have N buckets, and for any input, we use hash function `h` to calculate its index, and then insert it to that bucket. If that bucket is full, we use `overflow chains`:

![](/assets/images/181103/0-0.png)

### Extendable hash

Searching in a overflow chain has linear time complexity. To avoid this, we can duplicate the number of buckets before a chain is created, and redistribute all data items. However, the cost is high to access all data, so extendable hash maintains a `category` of all bucktes. When inserting data to a full bucket, the original bucket splits, and the category duplicates (this is only a simple example, not including the concepts of `global depth` and `local depth`):

1. The original data:

![](/assets/images/181103/1-0.png)

2. Insert `9`. The category will be duplicated.

![](/assets/images/181103/1-1.png)

## hashCode() and equals()

By here, everyone should know that if the hash values of two data items are the same, their actual values can be different. As we know, there are two methods, `hashCode()` and `equals()`, defined in class `Object`. HashMap use them to judge whether a key exists in the map, and which `bucket` should it be put into: when searching for a value, Java invokes `hashCode()` first to get the hash value of the key, and then finds the target bucket, invoking `equals()` of every data item inside the bucket to find the target data item.

Note that we can override these two methods to implement our own concept of `equality`. For example, for class `Person`:

```java
public class Person {

    private String name;
    
    private String ssd;
    
    
    Person(String n, String s) {
        name = n;
        ssd = s;
    }

}
```

We define: `two people` can be reagarded as identical if their `ssd`s are the same. So we override the `hashCode()` and `equals()`:

```java
@Override
public int hashCode() {
    return ssd.hashCode();
}

@Override
public boolean equals(Object obj) {
    return ssd.equals(((Person) obj).ssd);
}
```

Now `two people` with the same ssd is seen as `one`:

```java
Map<Person, String> contact = new HashMap<>();

Person p1 = new Person("Hao", "2333");
Person p2 = new Person("Cui", "2333");

contact.put(p1, "1234567890");
contact.put(p2, "2333332333");

System.out.println(contact.size());     // 1
```

## HashMap in Java

The implementation of HashMap in Java is similar to `the combination of static hash and extendable hash`. Before JDK 1.8, HashMap was stored by `array + linked list`, Keys were mapped to indices of an array, and a doubly linked list was used to implement every bucket. When searching, JDK first found the bucket by hash value, and then traversed the list to get the target data item.

The results of a hash function may collide, which means two different data items could be mapped to the same bucket. It is easy to conclude that if we don't take `data skews` into consideration, for a certain amount of data, the probability of collision depends on the performance of the hash function as well as the number of buckets. Java has done well in the `degree of hash`, so how to possibly avoid collisions without wasting spaces? The answer is to use a `dynamic exdentable data structure`. The initial number of buckets is small, but as we add more data items, the array will be extended after reaching a threshold.

In JDK 1.8, an important optimization is, if there are too many data items inside a bucket, that bucket will change its structure to a `red-black tree` to improve the access speed. In this blog, we focus on hash, so the red-black tree will not be discussed.

To sum up, the HashMap in Java 8 is implemented by `array + linkedlist + red-black tree`.

### Important members

Some important members in class HashMap:

```java
transient Node<K,V>[] table;
transient int size;
int threshold;
final float loadFactor;
static final int TREEIFY_THRESHOLD = 8;
```

*Attention: the keyword `transient` is for Java `serialization`, which indicates that these fields will be ignored in serializaiton.

`table` is the array that stores buckets. Every bucket is a linked list (or a red-black tree). `Node` simply implements the interface `Map.Entry`, storing key-value maps.

`size` is the actual size of the map.

`threshold` and `loadFactor` are used together. `threshold = table.length * loadFactor`. When the number of items in the map reaches this threshold, the array will be extended.

`TREEIFY_THRESHOLD` is for red-black tree. When the number of items inside a bucket reaches this threshold, the data structure of this bucket will change to red-black tree.

Note that the number of buckets in HashMap is always `a power of 2`. You will see the convenience brought by this later.

### Method hash()

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

A classical way of hash is to calculate `key % number of buckets` and the result is the index of the bucket. When the input data is even, the distrubution of data among buckets is also even. The design of `hashCode()` in class `Object` ensures the evenness to some extent (we will not go further on this topic), so HashMap makes use of it.

An interesting point is that, `hash()` first do an `xor` operation on the higher-16 bits and lower-16 bits of the input. According to the comments, this is to always take the higher bits into consideration. Due to the mod operation, if the size of the array is small, higher bits will never participant in the calculation. To achieve a evener data distribution, it just move the impact of the higher bits downwards, so they are also considered when the array size is small.

You may notice that there is no `mod operation` in this function, but before JDK 1.8, here existed such a function:

```java
static int indexFor(int h, int length) {  
    return h & (length-1);
}
```

We know that the efficiency of mod operation is low, while `bitwise operation` is much more efficient. Due to the size of buckets, which is alway `a power of 2`, we can simply do a `bitwise AND` operation between the input and `the number of buckets minus one`. The result is the same as a mod operation, but it runs faster. In JDK 1.8, this function is deleted, and instead this line of code will be executed whenever an index is needed.

### Method put()

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
               boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    else {
        Node<K,V> e; K k;
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            e = p;
        else if (p instanceof TreeNode)
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        else {
            for (int binCount = 0; ; ++binCount) {
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    break;
                }
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        if (e != null) { // existing mapping for key
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    ++modCount;
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

It seems to be a little bit complicate. There are so many `if` statements, but it's not difficult at all. Let's start from the first `if ` in `putVal()`.

```java
if ((tab = table) == null || (n = tab.length) == 0)
```

This line is simple. Just create a new array when it is `null`.

```java
if ((p = tab[i = (n - 1) & hash]) == null)
```

As I mentioned before, to calculate the index according to the hash value and find the target bucket. If the bucket is `null`, create a new Node; otherwise:

```java
if (p.hash == hash && 
    ((k = p.key) == key || (key != null && key.equals(k))))
```

If the value of first Node in the bucket is the same as the input, update that Node.

```java
else if (p instanceof TreeNode)
```

If this bucket is a red-black-tree, do tree searching and inserting (will not be discussed here); otherwise:

```java
for (int binCount = 0; ; ++binCount) {
    if ((e = p.next) == null) {
        p.next = newNode(hash, key, value, null);
        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
            treeifyBin(tab, hash);
        break;
    }
    if (e.hash == hash &&
        ((k = e.key) == key || (key != null && key.equals(k))))
        break;
    p = e;
}
```

Traverse the linked list. If the key does not exist in this bucket, create a new Node at the end of the list, and judge whether the new size reaches the `Treeify Threshold`. If so, transform this bucket to a tree. If the key is found in this bucket, update the value.

```java
if (e != null) { // existing mapping for key
    V oldValue = e.value;
    if (!onlyIfAbsent || oldValue == null)
        e.value = value;
    afterNodeAccess(e);
    return oldValue;
}
```

If it is an update, return the original value.

```java
++modCount;
if (++size > threshold)
    resize();
afterNodeInsertion(evict);
return null;
```

Finally, if the new size of the map exceeds the `threshold`, expand the array.

Pay attention to these two invocations:

```java
afterNodeAccess(e);
afterNodeInsertion(evict);
```

They are not used in HashMap, but will be implemented in `LinkedHashMap`.

### Method resize()

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    if (oldCap > 0) {
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        newCap = oldThr;
    else {               // zero initial threshold signifies using defaults
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    @SuppressWarnings({"rawtypes","unchecked"})
        Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    if (oldTab != null) {
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                else { // preserve order
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    do {
                        next = e.next;
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```

There code is even longer, but it's still easy to understand. The first few rows are calculating the new threshold, and if it exceeds the max acceptable capacity of the array:

```java
if (oldCap >= MAXIMUM_CAPACITY)
    // ...
else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
    oldCap >= DEFAULT_INITIAL_CAPACITY)
    // ...
```

The array will not be expanded any more; otherwise the new size is two times of the original size.

The key process is to traverse every bucket in the original array and expand:

```java
if (e.next == null)
    newTab[e.hash & (newCap - 1)] = e;
else if (e instanceof TreeNode)
    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
```

If there is only one Node inside a bucket, find its new index and copy; if this bucket uses a red-black tree, do related operations (will not be discussed here).

```java
Node<K,V> loHead = null, loTail = null;
Node<K,V> hiHead = null, hiTail = null;
Node<K,V> next;
do {
    next = e.next;
    if ((e.hash & oldCap) == 0) {
        if (loTail == null)
            loHead = e;
        else
            loTail.next = e;
        loTail = e;
    }
    else {
        if (hiTail == null)
            hiHead = e;
        else
            hiTail.next = e;
        hiTail = e;
    }
} while ((e = next) != null);
```

After the split, data in the original bucket will be splited into two different buckets. Here four variables are used to store the head and tail of the two lists, which ensure that the order of Nodes in the new list is the same as previous.

When judging which bucket a Node belongs to, there's a trick. As we mentioned before, we can calculate the index by `hash % size of the array`. Since the size is always `a power of two`, the `last n bits` of the hash value decide its index. For example, say we have two Nodes a, b:

![](/assets/images/181103/2-1.png)

Now the size of the expanded array is `2 ^ (n +1)`. The last `n` bits of all nodes in this array are the same, so the `n + 1`th Node counting from the back will decide its new index, whether to move to another bucket, or remain in the previous one. Therefore, we can simply do an bitwise AND operation on the hash value and the the original size of the array, that is, `2 ^ n`. If the result is not `0`, we know that this Node should be moved to a new bucket.

![](/assets/images/181103/2-2.png)

After spliting the list, one of them will be linked to a new bucket:

```java
if (loTail != null) {
    loTail.next = null;
    newTab[j] = loHead;
}
if (hiTail != null) {
    hiTail.next = null;
    newTab[j + oldCap] = hiHead;
}
```

Since the size of the array is two times as the original one, the new index can be decided by `old position + oldCap`:

![](/assets/images/181103/2-3.png)

In JDK 1.7, the index for every node will be recalculated after expansion. JDK 1.8 made some optimizations to increase the efficiency.

### Method get()

After all the analysis above, the implementation of `get()` can be easy to understand, so I will not introduce it. Here's the source code:

```java
public V get(Object key) {
    Node<K,V> e;
    return (e = getNode(hash(key), key)) == null ? null : e.value;
}

final Node<K,V> getNode(int hash, Object key) {
    Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (first = tab[(n - 1) & hash]) != null) {
        if (first.hash == hash && // always check first node
            ((k = first.key) == key || (key != null && key.equals(k))))
            return first;
        if ((e = first.next) != null) {
            if (first instanceof TreeNode)
                return ((TreeNode<K,V>)first).getTreeNode(hash, key);
            do {
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
            } while ((e = e.next) != null);
        }
    }
    return null;
}
```

## Summary

Hash is a very important function, which is widely applied in the field of Computer Science. We always use `HashMap`, but if we understand the underlying principles of its implementation, we can make better use of it. Besides, reading the source code is always an interesting process.
