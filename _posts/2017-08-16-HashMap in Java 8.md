---
layout:      post
title:       "HashMap in Java 8"
date:        2017-08-16 21:00:00 -0500
tags:        java
description: "Analyzing the source code of HashMap in JDK 1.8, and comparing it with the previous implementation."
---

## Overview
Today when I was viewing the Java source code, I found that the implementation of `HashMap` is somewhat different from my memory. Then I referred to some materials and figured out that It was optimized in `JDK 1.8`, adding some new data structures to improve the performance, but the overall design idea is still the same. First, we start with `hash`.

## Hash
Say we have a large amount of data pairs, such as a phone book:

> Hao Cui: 1234567890
> Yang Pan: 9876543210
> Mo Tang: 233332333

With what data structure can we get the fastest `access speed`?

The simplest thought is to store sequentially, and for instance, using a `linked list`. What we do is to maintain the head and tail node, so the time complexity of read is `O(1)`. However, if we want to get a phone number by name, a head-to-tail traverse is not avoidable, which has a time complexity of `O(n)`. When the data grows larger, this can be extremely inefficient.

A improvement is to use a `search tree` instead. Now the access time is `O(logn)`, which sounds gread, but can we do even better?

As we know, we can access any item in an array by index within `O(1)` time, so naturally we try to store data pairs into an array, but since the key of our data is `string`, how to map it to a `index`? That's where hash works.

The essence of hash is a `mapping function`, compressing inputs into fixed-length outputs, which is popular in crytology. In our cases, we `hash` keys to indices of an array, so we can accessing values with constant time complexity.

## The Implementation of Hash
There are three typical implementations of hash, including `static hash`, `extendable hash` and `liner hash`. To have a better understanding of HashMap, we use examples in `DBMS` to introduce the first two.

### Static Hash
This is the simplest hash. Suppose we have N buckets, and for any input, we use hash function `h` to calculate its index, and then insert it to that bucket. If that bucket is full, we use `overflow chains`:

![](/assets/images/0910/0-0.png)

### Extendable Hash
Searching in a overflow chain has linear time complexity. To avoid this, we can duplicate the number of buckets before a chain is created, and redistribute all data items. However, the cost is high to access all data, so extendable hash maintains a `catagory` of all bucktes. When inserting data to a full bucket, the original bucket splits, and the catagory duplicates (Here is only a simple example, not including the concepts of `global depth` and `local depth`. If you are interested please refer to related articles):

1. The original data:
![](/assets/images/0910/1-0.png)

2. Insert `9`. The catagory will be duplicated.
![](/assets/images/0910/1-1.png)

## hashCode() and equals()
By here, everyone should know that if the hash values of two data items are the same, their real values can be different. As we know, there are two methods, `hashCode()` and `equals()`, defined in class `Object`. In fact, HashMap use them to judge whether a key exists in the map, and which `bucket` should it be put into: Java invokes `hashCode()` first to get the hash value of an object, and then find the target bucket, invoking `equals()` of every data item inside the bucket to find the real data item.

You should realize that, we can override these two methods to implement our own concept of `equality`. For example, for class `Person`:

``` java
public class Person {

    private String name;
    
    private String ssd;
    
    
    Person(String n, String s) {
        name = n;
        ssd = s;
    }

}
```

we define: `Two people` can be reagarded identical if their `ssd`s are the same. So we override `hashCode()` and `equals()`:

``` java
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

``` java
Map<Person, String> contact = new HashMap<>();

Person p1 = new Person("Hao", "2333");
Person p2 = new Person("Cui", "2333");

contact.put(p1, "1234567890");
contact.put(p2, "2333332333");

System.out.println(contact.size());     // 1
```

## HashMap in Java
The implementation of HashMap in Java is similar to `the combination of static hash and extendable hash`. Before JDK 1.8, HashMap was stored by `array + linked list`, Keys were mapped to indices of an array, and a doubly linked list was used to implement every bucket. When searching, JDK first found the bucket by hash value, and then traversed the list to get the target data item.

The results of a hash function may collide, which means two different data items could be mapped to the same bucket. It is easy to conclude that if we don;t take `data skews` into consideration, for a certain amount of data, the probability of collisions depends on the performance of the hash function as well as the number of buckets. Java has done well in the `degree of hash`, so how to possiby avoid collisions without wasting spaces? The answer is to use `dynamic exdentable data structure`. The initial number of buckets is small, but as we add more data items, the array will be extended after reaching a threshold.

In JDK 1.8, an important optimization is, if there are too many data items inside a bucket, it (that exact bucket) will use a `red-black tree` instead, to improve the access speed. In this blog, we focus on hash, so the red-black tree will not be discussed.

Therefore, the HashMap in Java 8 is implemented by `array + linkedlist + red-black tree`.

### Important members
Some important members in class HashMap:

``` java
transient Node<K,V>[] table;
transient int size;
int threshold;
final float loadFactor;
static final int TREEIFY_THRESHOLD = 8;
```

*Attention: the keyword `transient` is for Java `serialization`, which indicates that these fields are ignored in serializaiton.

`table` is the array that stores buckets. Every bucket is a linked list (or a red-black tree). `Node` simply implements the interface `Map.Entry`, storing key-value maps.

`size` is the actual size of the map.

`threshold` and `loadFactor` are used together. `threshold = table.length * loadFactor`. When the number of items in the map reaches this threshold, the array will be extended.

`TREEIFY_THRESHOLD` is for red-black tree. When the number of items inside a bucket reaches it, the data structure of this bucket will change to red-black tree.

We should mention that the number of buckets in HashMap is always `a powerof 2`. We will discuss the convience brought by this later.

### Method hash()
``` java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

A classical way to do hash is to calculate `key % number of buckets` and the result is the index of the bucket. When the input data is even, the distrubution of data among buckets is also even. The design of `hashCode()` in class `Object` ensures the evenness to some extent (we will not go further on this topic), so we can make use of it.

An interesting point is that, `hash()` first do an `xor` operation between the higher-16 bits and lower-16 bits of the input. According to the comments, this is to always take the higher bits into consideration. Due to the mod operation, if the size of the array is small, higher bits will never participant in the calculation. To achieve a evener data distribution, it just move the impact of the higher bits downwards, so they are also considered when the array size is small.

You may notice that there is no `mod operation` in this function, but before JDK 1.8, here existed such a function:

``` java
static int indexFor(int h, int length) {  
    return h & (length-1);
}
```

We know that the efficiency of mod operation is low, while `bitwise operation` is efficient. Due to the size of buckets, which is alway `a power of 2`, we can simply do an `bitwise AND` operation between the input and `the number of buckets minus one`. The result is the same as a mod operation, but the speed is faster. In JDK 1.8, this function is deleted, and instead the line of code will be executed whenever an index is needed.

## Method put()
``` java
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

It looks a little bit complicate, with so many `if` statements, but it's not difficult at all. Let's start from the first `if ` in `putVal()`.

``` java
if ((tab = table) == null || (n = tab.length) == 0)
```

This line is simple. Just create a new array when it is `null`.

``` java
if ((p = tab[i = (n - 1) & hash]) == null)
```

As we mentioned before, to calculate the index according to the hash value and find the target bucket. If the bucket is `null`, create a new Node; otherwise:

``` java
if (p.hash == hash && 
    ((k = p.key) == key || (key != null && key.equals(k))))
```

If the value of first Node of the bucket is the same as the input, update the Node.

``` java
else if (p instanceof TreeNode)
```

If this bucket uses a red-black-tree, do tree searching and inserting (will not be discussed here); otherwise:

``` java
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

Traverse the linked list. If the key does not exist in this bucket, create a new Node at the end of the bucket, and judge whether the new size reaches the `Treeify Threshold`. If so, transform it to a tree. If the key is found in this bucket, update the value.

``` java
if (e != null) { // existing mapping for key
    V oldValue = e.value;
    if (!onlyIfAbsent || oldValue == null)
        e.value = value;
    afterNodeAccess(e);
    return oldValue;
}
```

If it is an updation, return the original value.

``` java
++modCount;
if (++size > threshold)
    resize();
afterNodeInsertion(evict);
return null;
```

Finally, if the new size of the map exceeds the `threshold`, expand the array.

Please pay attention to these two invocations:

``` java
afterNodeAccess(e);
afterNodeInsertion(evict);
```

They are not used in HashMap, but will be implemented in `LinkedHashMap`

### Method resize()
``` java
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

``` java
if (oldCap >= MAXIMUM_CAPACITY)
    // ...
else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
    oldCap >= DEFAULT_INITIAL_CAPACITY)
    // ...
```

The array will not be expanded any more; otherwise the new size is two times of the original size.

The key process is to traverse every bucket in the original array and expand:

``` java
if (e.next == null)
    newTab[e.hash & (newCap - 1)] = e;
else if (e instanceof TreeNode)
    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
```

If there is only one Node in a bucket, find its new index and copy; if this bucket uses a red-black tree, do related operations (will not be discussed here).

``` java
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

After the split, data in the original bucket will be transfered to two differnt buckets. Here four variables are used to store the head and tail of the two lists, to ensure the order of the Nodes in the new list is the same as the previous one.

When judging which bucket a Node belongs to, the code adopts a trick. As we mentioned before, we can calculate the index by `hash % size of the array`. Since the size is always `a power of two`, the `last n bits` of the hash value decides its index. For example, say we have two Nodes a, b:

![](/assets/images/0910/2-1.png)

Now the size of the expanded array is `2 ^ (n +1)`. The last `n` bits of all nodes in this array are the same, so the `n + 1`th Node counting from the back will decide its new index, whether to move to another bucket, or remain in the same one. Therefore, we can directly do an bitwise AND operation on the hash value and the the original size of the array, that is, `2 ^ n`. If the result is not `0`, we know that this Node should be moved to a new bucket.

![](/assets/images/0910/2-2.png)

After spliting the list, one of them will be linked to a new bucket:

``` java
if (loTail != null) {
    loTail.next = null;
    newTab[j] = loHead;
}
if (hiTail != null) {
    hiTail.next = null;
    newTab[j + oldCap] = hiHead;
}
```

Since the size of the array is two times as the original one, the new index can be determined by `old position + oldCap`:

![](/assets/images/0910/2-3.png)

In JDK 1.7, the index for every node will be recalculated after expansion. JDK 1.8 made some optimizations to increase the efficiency.

### Method get()
After all the analysis above, the implementation of `get()` can be easy to understand, so I will not introduce it, and only give the source code:

``` java
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
Hash is a very important function, which is widely used in the field of computerWe always use `HashMap`, but if we can know the underlying principles of its implementation, we will make better use of it. Besides, reading the source code is a interesting process.

---

今天翻起 Java 源码，偶然发现 `HashMap` 的源码似乎和我印象中的有一些不一样。查了资料我才意识到，JDK 1.8 对 HashMap 进行了一些优化，使其性能得到提升，但整体思想是没有变的，只是增加了一些新的数据结构。为了更好地理解 HashMap，我们先从 `hash` 讲起。

## Hash 介绍
假设我们有一组十分庞大的数据对，如一个电话本：

```
Hao Cui: 1234567890
Yang Pan: 9876543210
Mo Tang: 233332333
```

如何存储才能得到最快的 `存取速度` 呢？

最简单的想法是顺序存储，如果采用 `链表`，只要维护头尾节点，写的时间复杂度为 O(1)，而如果想要根据姓名查找其中一个人的电话号码，需要从头遍历链表，时间复杂度为 O(n)，这是难以忍受的。

一个改进办法是使用 `搜索树` 存储，这样存储、查找速度都可以优化到 O(logn)，听起来似乎不错，但是有更好的办法吗？

我们知道，对于一个数组，使用下标访问的速度是 O(1)，于是很自然地想到将数据存储到数组中。但是，我们数据的键为 `字符串`，如何将其映射为一个 `下标`？这就是 `hash` 的作用了。

Hash 本质上是一个映射函数，在密码学领域应用十分广，可以将输入压缩为一个固定长度的输出。在我们的例子里，将数据键映射为一个数组的下标，用来访问其值，以达到常数存取速度。

## Hash 实现
Hash 有3种典型的实现，分别为 `静态哈希`，`可扩展哈希`，以及 `线性哈希`，为了方便后面讨论 Java 中 HashMap 的实现，下面使用数据库书中的例子介绍前两种。

### 静态哈希
这是最简单的哈希，假设有 N 个桶，对于给定输入，由哈希函数 h 确定其所在桶的编号，然后直接插入该桶。如果桶已经满了，使用链式溢出页存储：

![](/assets/images/0910/0-0.png)

### 可扩展哈希
由于在溢出页内的搜索是线性时间复杂度，为了避免使用溢出页，我们可以在即将产生溢出页的时候将桶数翻倍，并重新分配数据项。但是这样做需要访问所有数据，代价太高，于是可扩展哈希维护一个桶的目录，在向已满的桶里加入数据的时候，将原桶分裂，目录翻倍（这里只是简单示例，隐去 `全局深度` 与 `局部深度` 的概念，有兴趣的读者请自行查找相关文章）：

1. 原数据：
![](/assets/images/0910/1-0.png)

2. 插入9，桶加倍:
![](/assets/images/0910/1-1.png)

## HashCode() 函数与 equals()
读到这里，大家应该明白的一件事是，如果两个数据的 hash 值相同，它们的实际值可能不相等。我们知道，Java Object 类中定义了方法 hashCode() 与 equals()，实际上，HashMap 正是使用这两个函数来判断一个 key 是否已存在，以及该放到哪个 `桶` 里：Java 先调用对象的 hashCode() 方法获取其 hash 值，找到对应的桶，再对桶中的数据逐一调用（Java 1.8 以前） equals() 方法找到真正的数据项。

你应该意识到，我们可以重写这两个函数来实现我们自己的 `相等` 概念。比如，对于一个 Person 类：

``` java
public class Person {

	private String name;
	
	private String ssd;
	
	
	Person(String n, String s) {
		name = n;
		ssd = s;
	}

}
```

假如我们定义：如果 `两个人` 的 `ssd` 相等那么他们被看作是同一个人。因此我们可以重写 hashcode() 与 equals() 方法：

``` java
@Override
public int hashCode() {
	return ssd.hashCode();
}

@Override
public boolean equals(Object obj) {
	return ssd.equals(((Person) obj).ssd);
}
```

这样两个相同 `ssd` 的 Person 对象将被视作同一个人：

``` java
Map<Person, String> contact = new HashMap<>();

Person p1 = new Person("Hao", "2333");
Person p2 = new Person("Cui", "2333");

contact.put(p1, "1234567890");
contact.put(p2, "2333332333");

System.out.println(contact.size());     // 1
```

## Java 中的 HashMap
### 总览
JDK 中 HashMap 的实现类似于 `静态哈希与可扩展哈希的结合`。在 JDK 1.8 以前，使用 `数组 + 链表` 存储，将数据的 key 映射成数组下标，使用双向链表实现每个数组项。在查找时，现根据哈希值找到数组项，再遍历链表找到对应的数据。

Hash 函数的结果可能会出现碰撞，即两个不同的数据映射到同一个桶，而在一个桶内线性搜索的效率是十分低下的。不难发现，在不考虑数据倾斜的情况下，对于固定的数据量，碰撞的概率与哈希函数的性能以及桶的多少有关。Java 在哈希函数的散列程度上已经做得足够好，那么怎样能在不使用过多空间的情况下尽量避免碰撞呢？答案是使用动态可扩展的数据结构。初始桶数量较少，在不断添加数据后，达到某个阀值时，桶的数目被扩展，同时更新阀值。

在JDK 1.8 中，一个十分重要的优化为，如果某个桶内数据过多，将改为使用 `红黑树` 存储，以优化访问速度（本文关注 hash 实现，不讨论红黑树）。

因此 Java 中 HashMap 是使用 `数组 + 链表 + 红黑树` 实现的。

### 关键成员
类 HashMap 中一些关键成员变量如下：

``` java
transient Node<K,V>[] table;
transient int size;
int threshold;
final float loadFactor;
static final int TREEIFY_THRESHOLD = 8;
```

*注意：这里的关键字 `transient` 用于 Java 对象的序列化，表示在序列化过程中忽略这些字段。

`table` 即存储桶的数组，每个桶是一个链表（或红黑树），Node 只是简单地实现了 `Map.Entry` 接口，存储键值对，这里不展开介绍了。

`size` 很好理解，即 Map 的实际大小。

`threshold` 和 `loadFactor` 结合使用，`threshold = table.length * loadFactor`，当桶中数据量达到这个阀值时，将引发桶的扩充。

`TREEIFY_THRESHOLD` 用于红黑树。当一个桶中的节点数超过这个阀值时，将这个桶改为红黑树结构。

需要提到的是，HashMap 中桶的数量始终为 `2的n次方`，这主要是为了后面的取模操作以及扩容的方便性考虑。

### hash() 方法
``` java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

一个经典的 hash 做法是，将输入 `对桶的数量取模`，可以直接获得相应桶的下标，同时当输入数据均匀时，数据在桶内的分步也是均匀的。Object 类中已经定义了 hashCode() 方法，在一定程度上可以保证结果分布均匀（这里不展开讨论），因此直接调用它作为输入。

有趣的一点是， hash() 方法将先输入数据的高16位与低16位进行异或操作，因为在数组较小的时候，由于取模操作，输入数据的高位始终不会参与运算，因此为了获得更均匀的数据分布，将高位的影响下移，使得在数组较小的情况下也考虑高位的影响。

你可能已经注意到，这个函数里并没有进行取模操作。在 JDK 1.8 以前，存在这样一个方法：

``` java
static int indexFor(int h, int length) {  
    return h & (length-1);
}
```

我们知道，取模操作效率较低，而按位运算效率高。由于桶的数目始终是2的倍数，这里直接将输入数据与 `桶的数量减一` 进行按位与操作一样可以获得取模的结果，但效率更高。JDK 1.8中 没有定义这个方法，改为直接在需要获取下标的时候执行这行代码。

### put() 方法

``` java
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

代码看起来有些复杂，有很多条件语句，但其实并不难懂。让我们从 putVal() 的第一个 `if` 语句开始分析。

``` java
if ((tab = table) == null || (n = tab.length) == 0)
```

这句很简单，当数组为空的时候新建一个数组。

``` java
if ((p = tab[i = (n - 1) & hash]) == null)
```

前面提到的，根据 hash 确定数组下标，找到目标桶。如果该桶为空，直接新建一个 `Node`；否则：

``` java
if (p.hash == hash && 
    ((k = p.key) == key || (key != null && key.equals(k))))
```

如果该桶的第一个节点的 key 值与要插入的 key 值相同，直接更新其 value 值；

``` java
else if (p instanceof TreeNode)
```

如果该桶使用红黑树存储，进行树搜索、插入（不展开讨论）；否则：

``` java
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

遍历线性链表，如果该 key 不存在于这个桶，在链表最后添加一个节点，并判断添加后桶内节点数是否达到 `建树阀值`，进行相关建树操作；如果在桶中找到了该 key 值，直接更新其 value 值。

``` java
if (e != null) { // existing mapping for key
    V oldValue = e.value;
    if (!onlyIfAbsent || oldValue == null)
        e.value = value;
    afterNodeAccess(e);
    return oldValue;
}
```

如果是更新操作，返回原值。

``` java
++modCount;
if (++size > threshold)
    resize();
afterNodeInsertion(evict);
return null;
```

最后，如果新的数组大小超过阀值，扩充数组。

注意，其中有两个调用：

``` java
afterNodeAccess(e);
afterNodeInsertion(evict);
```

在 HashMap 中不使用，函数体为空，主要用于 LinkedHashMap。

### resize()
``` java
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

代码更长了，一眼看过去有写头晕，但其实也不难理解。前面几行主要是在确定新的阀值，如果这个值超过了最大数组长度：

``` java
if (oldCap >= MAXIMUM_CAPACITY)
    // ...
else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
    oldCap >= DEFAULT_INITIAL_CAPACITY)
    // ...
```

如果已经超过了最大数组容量，不再扩充；否则扩充为原来的两倍容量。

下面几行代码都是在计算阀值，不再介绍。关键在于下面遍历原数组中每个桶并进行扩充的过程：

``` java
if (e.next == null)
    newTab[e.hash & (newCap - 1)] = e;
else if (e instanceof TreeNode)
    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
```

如果桶中只有一个节点，找到其在新数组中的下标并复制；如果是存储的是红黑树，进行相关操作（不展开讨论）；

``` java
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

原桶分裂后会分别存储到两个桶中，这里使用4个变量分别保存分别后链表的头尾，以保证新的链表维持节点在原链表的顺序。

在判断元素属于哪个新链表时，这里使用了一个十分巧妙的办法。前面提过，通过将 hash 值对数组大小取模确定下标值，由于数组大小始终是 `2的n次方`，也就意味着每个 hash 值的最后 n 位将决定其下标。例如有两个节点 a、b：

![](/assets/images/0910/2-1.png)

现在数组扩充，大小变为 `2的n + 1次方`，桶中节点的后 n 位是相同的，所以每个节点的倒数第 n + 1 位将决定其在新数组中的下标，是不变还是到一个新的位。因此我们可以直接将 key 值与原数组大小，即 `2 ^ n` 进行按位与，根据结果是否为0来判断新下标：

![](/assets/images/0910/2-2.png)

分成两个链表之后，将链接到新的数组中：

``` java
if (loTail != null) {
    loTail.next = null;
    newTab[j] = loHead;
}
if (hiTail != null) {
    hiTail.next = null;
    newTab[j + oldCap] = hiHead;
}
```

由于数组大小变成原来的两倍，可以直接确定分裂出去的链表的下标为 `原位置 + oldCap`:

![](/assets/images/0910/2-3.png)

在 JDK 1.7 中，扩充后需要对每个节点重新计算下标值，JDK 1.8 添加了这些快速计算的优化，提升了运行效率。

### get()
get() 方法的实现就比较简单，本文不打算过多介绍，直接贴出源码：

``` java
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

## 总结
Hash 是个十分重要的函数，在计算机领域应用十分广泛。平时总是使用 Java 中的 Hash Map，如果能知道它的底层实现原理，将有助于我们更好地使用它。除此之外，阅读源码的过程可以学习大神们优雅的实现方式，也是个很有趣的过程。
