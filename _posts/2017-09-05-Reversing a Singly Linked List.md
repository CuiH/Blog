---
layout: post
title:  "Reversing a Singly Linked List"
date:   2017-09-05 23:30:00 -0500
tags:   algorithm
description: Summing up five ways to reverse a singly linked list, and analyzing related problems on Leetcode.
---

## Overview
There are five common ways to reverse a singly linked list. I will introduce them one by one. The class `Node` is defined as follows:

``` java
public class Node {

    int val;
    Node next;
    
    Node(int v) {
        val = v;
    }

}
```

## With the Help of an Array
If we traverse the linked list and store every node inside a `ramdomly accessible` data structure, such as an array, we can then traverse the array reversely, constructing a new linked list. Since this is the simplest solution, I'm not gonna talk more about it, so here's the code:

``` java
public Node reverseSinglyLinkedList1(Node head) {
    if (head == null || head.next == null) return head;

    List<Node> arr = new ArrayList<>();
    while (head != null) {
        arr.add(head);
        head = head.next;
    }

    Node curr = null;
    for (int i = arr.size() - 1; i >= 0; i--) {
        if (curr == null) {
            curr = arr.get(i);
        } else {
            curr.next = arr.get(i);
            curr = curr.next;
        }
    }

    curr.next = null;

    return arr.get(arr.size() - 1);
}
```

Obviously, the biggest problem of this solution is that it costs too much `space`, because we need o construct a data structure with the same length as the original linked list.

## Continuously Reversing the Pointer Between Every Two Nodes
If we keep reversing every pointer between every two nodes, we'll finally get a reversed linked list. The algorithm description is:

* Define variables `currHead`, `next`, pointing to the head of current list, and the next node of current head; define variable `temp` for storing temporary nodes.
* First, set `currHead.next` to null.
* Enter the loop.
* `temp` points to the next node of `next`.
* Set `next.next` to `currHead`.
* Move forward. `currHead` points to next; `next` points to `temp`
* Loop until `next` points to null.
* `currHead` is the head of the reversed list.

Perhaps an example can help you understand this algorithm. Say we have a linked list `1 -> 2-> 3 -> 4 -> 5 -> null`:

1. The original list
![](/assets/images/0905/2-0.png)

2. Initialization
![](/assets/images/0905/2-1.png)

3. Enter the loop
![](/assets/images/0905/2-2.png)

4. Reverse the pointer between the first two nodes
![](/assets/images/0905/2-3.png)

5. Move forward
![](/assets/images/0905/2-4.png)

6. Begin the second loop
![](/assets/images/0905/2-5.png)

7. Loop until `next` points to `null`
![](/assets/images/0905/2-6.png)

The code is as follows:

``` java
public Node reverseSinglyLinkedList2(Node head) {
    if (head == null || head.next == null) return head;

    Node temp = null;
    Node currHead = head;
    Node next = currHead.next;

    currHead.next = null;

    while (next != null) {
        temp = next.next;

        next.next = currHead;

        currHead = next;
        next = temp;
    }

    return currHead;
}
```

## Continuously Moving Nodes From the Original List to the Head of the New List
This is another easy solution. What we should do is to add every node from the original list to the head of the new list. Also the example of `1 -> 2 -> 3 -> 4 -> 5 -> null`:

1. Initialization: `newHead` points to `null`, `head` points to the head of the original list
![](/assets/images/0905/3-0.png)

2. Enter the loop: `temp` points to the next node of `head`; set `head.next` to `newHead`
![](/assets/images/0905/3-1.png)

3. Move forward: `newHead` points to `head`; `head` points to `temp`
![](/assets/images/0905/3-2.png)

4. Begin the next loop
![](/assets/images/0905/3-3.png)

5. Loop until `head` points to `null`. Now `newHead` points to the head of the reversed list
![](/assets/images/0905/3-4.png)

The code is here:

``` java
public Node reverseSinglyLinkedList3(Node head) {
    if (head == null || head.next == null) return head;

    Node temp = null;
    Node newHead = null;

    while (head != null) {
        temp = head.next;

        head.next = newHead;

        newHead = head;
        head = temp;
    }

    return newHead;
}
```

## Continuously Inserting the Next Node of the Head of Original List After the Head of the New List
We need to construct a `helper node` in this case, and link it to the head of the original list. Then we keep inserting the `next node of the original list` after the `helper node`, until the next node of the original list is `null`. Now the `next node of the helper node` is the head of the reversed list. The algorithm is like:

1. Initialization: Construct the helper node `newHead`, and link it to the head of the original list
![](/assets/images/0905/4-0.png)

2. Enter the loop: `temp` points to the next node of `head`
![](/assets/images/0905/4-1.png)

3. Insertion: set `head.next` to the next node of `temp`; set `temp.next` to the next node of `newHead`; set `newHead.next` to `temp`. Now we have inserted the next node of `head` to the position right after the `newHead`
![](/assets/images/0905/4-2.png)

4. Begin the next loop, and operate like process #2 and process #3
![](/assets/images/0905/4-3.png)

5. Loop until the next node of `head` is `null`. Now the next node of `newHead` is the head of the reversed list
![](/assets/images/0905/4-4.png)

The key point of the algorithm is that, `newHead` and `head` always point to the same nodes, and what do is to move the node after the `head` to the next position of `newHead`. The code is as follows:

``` java
public Node reverseSinglyLinkedList4(Node head) {
    if (head == null|head.next == null) return head;

    Node newHead = new Node(0);
    newHead.next = head;

    Node temp = null;

    while (head.next != null) {
        temp = head.next;

        head.next = temp.next;
        temp.next = newHead.next;
        newHead.next = temp;
    }

    return newHead.next;
}
```

## Recursion
In fact, we can also reverse a linked list with recursion, the advantage of which is short code, but maybe it's not that simple to understand.

The thinking is:

1. As for list `1 -> 2 -> 3 -> 4 -> 5 -> null`, we reverse `2 -> 3 -> 4 -> 5 -> null` first, and then add `1` to the tail of the new list.
2. As for list `2 -> 3 -> 4 -> 5 -> null`, we reverse `3 -> 4 -> 5 -> null` first, and then add `2` to the tail of the new list.
3. Recur until only one node left, `5`, and directly return this node.

We should be aware that the recrusive method finally returns the tail of the reversed list, so to obtain its head, we may need a member variable. The code is as follows:

``` java
private Node newHead;

public Node reverseSinglyLinkedList5(Node head) {
    if (head == null || head.next == null) return head;

    reverseRecursively(head);

    return newHead;
}

private Node reverseRecursively(Node head) {
    if (head.next == null) {
        newHead = head;

        return head;
    }

    Node tail  = reverseRecursively(head.next);
    tail.next = head;
    head.next = null;

    return head;
}
```

## An example on Leetcode
There are many peoblems regarding linked lists. Here I choose the `#25 Reverse Nodes in k-Group`, with the description:

> Given a linked list, reverse the nodes of a linked list k at a time and return its modified list.
>
> k is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of k then left-out nodes in the end should remain as it is.
>
> You may not alter the values in the nodes, only nodes itself may be changed.
> Only constant memory is allowed.
>
> For example,
> Given this linked list: 1->2->3->4->5
> For k = 2, you should return: 2->1->4->3->5
> For k = 3, you should return: 3->2->1->4->5

This problem requires the given list to be reversed in groups of k nodes, and if the number of the remaining nodes is less than k, we should just keep the original order. Here I use the fourth method to handle it, that is, continuously inserting the next node of the original list after the head of the new list. The difference is that we need to judge before reversing, to check whether we have enough nodes left, and to record the beginning node of the next group as a stop signal. The code is as follows:

``` java
public ListNode reverseKGroup(ListNode head, int k) {
    if (k == 0) return head;

    ListNode newHead = new ListNode(0);
    newHead.next = head;

    ListNode currHead = newHead;    // the head of curr group & the tail of prev group
    ListNode nextHead = head;       // the real head of next group
    ListNode temp;                  // stores the next node of currHead

    while (true) {
        int count = 0;                     // to find nextHead
        while (count++ < k) {
            if (nextHead == null) return newHead.next;   // no enough nodes left

            nextHead = nextHead.next;
        }

        head = currHead.next;              // the real head of current group

        while (head.next != nextHead) {
            temp = head.next;
            head.next = temp.next;
            temp.next = currHead.next;
            currHead.next = temp;
        }

        currHead = head;
    }
}
```

---

## 总览
常见的对单链表进行翻转有5种方法，下面将分别介绍。其中，类 `Node` 的定义如下：

``` java
public class Node {

	int val;
	Node next;
	
	Node(int v) {
		val = v;
	}

}
```

## 使用数组存储
遍历单链表，并将其存储在可 `随机访问` 的数据结构（如数组）中，随后反向遍历该数据结构，构建新的链表。由于最简单，不多做介绍，直接给出代码：

``` java
public Node reverseSinglyLinkedList1(Node head) {
	if (head == null || head.next == null) return head;

	List<Node> arr = new ArrayList<>();
	while (head != null) {
		arr.add(head);
		head = head.next;
	}

	Node curr = null;
	for (int i = arr.size() - 1; i >= 0; i--) {
		if (curr == null) {
			curr = arr.get(i);
		} else {
			curr.next = arr.get(i);
			curr = curr.next;
		}
	}

	curr.next = null;

	return arr.get(arr.size() - 1);
}
```

很明显，这个代码最大的问题就是空间代价太大，需要建立一个与链表等长的数据结构。

## 不断翻转每两个节点之间的指向
如果把相邻两个节点的指向逐一翻转，最终将实现对整个链表的翻转，描述如下：

* 定义 `currHead`，`next` 两个变量，分别指向当前链表的头以及头的下一个节点；额外定义变量 `temp` 用于临时储存节点。
* 首先将 `currHead` （省略“指向的”，下同）节点的下一个节点指向 `null`。
* 进入循环。
* 将 `temp` 指向 `next` 节点的下一个节点。
* 将 `next` 节点的下一个节点指向 `currHead` 节点。
* 将 `currHead` 指向 `next` 节点；将 `next` 指向 `temp` 节点。
* 循环直至 `next` 节点 为 `null`。
* `currHead` 节点即为翻转后链表的头。

用具体的例子可能更方便理解。假设有链表 `1 -> 2-> 3 -> 4 -> 5 -> null`，翻转过程如下：

1. 初始链表
![](/assets/images/0905/2-0.png)

2. 初始化
![](/assets/images/0905/2-1.png)

3. 进入循环
![](/assets/images/0905/2-2.png)

4. 翻转前两个节点的指向
![](/assets/images/0905/2-3.png)

5. 向前移动
![](/assets/images/0905/2-4.png)

6. 开始第二次循环
![](/assets/images/0905/2-5.png)

7. 继续循环直至 `next` 指向 `null`，此时 `currHead` 指向翻转后的节点头
![](/assets/images/0905/2-6.png)

代码如下：

``` java
public Node reverseSinglyLinkedList2(Node head) {
	if (head == null || head.next == null) return head;

	Node temp = null;
	Node currHead = head;
	Node next = currHead.next;

	currHead.next = null;

	while (next != null) {
		temp = next.next;

		next.next = currHead;

		currHead = next;
		next = temp;
	}

	return currHead;
}
```

## 不断将原链表的节点放到新链表的头部
这种方法思路和实现都不难，只需将原链表的节点逐一添加到新链表的头部即可。还是 `1 -> 2 -> 3 -> 4 -> 5 -> null` 的例子，翻转过程的描述和示例一起展示如下：

1. 初始化：`newHead` 指向 `null`，`head` 指向原链表的头
![](/assets/images/0905/3-0.png)

2. 进入循环：将 `temp` 指向 `head` 节点的下一个节点；将 `head` 节点的下一个节点指向 `newHead` 节点
![](/assets/images/0905/3-1.png)

3. 向前移动：将 `newHead` 指向 `head` 节点；将 `head` 指向 `temp` 节点
![](/assets/images/0905/3-2.png)

4. 进入下一次循环
![](/assets/images/0905/3-3.png)

5. 循环直至 `head` 指向 `null`，此时 `newHead` 指向翻转后的链表头
![](/assets/images/0905/3-4.png)

实现代码如下：

``` java
public Node reverseSinglyLinkedList3(Node head) {
	if (head == null || head.next == null) return head;

	Node temp = null;
	Node newHead = null;

	while (head != null) {
		temp = head.next;

		head.next = newHead;

		newHead = head;
		head = temp;
	}

	return newHead;
}
```

## 不断将原链表头的下一个节点插入新链表头之后
使用这个方法需要构造一个辅助节点，链接到原链表头之前，随后不断将原链表头的 `下一个节点` 插入到辅助节点之后，直至原链表头的下一个节点为 `null`，此时辅助节点的下一个节点即为翻转后链表的头。算法描述及示例如下：

1. 初始化：构造辅助节点 `newHead`，链接到原链表头
![](/assets/images/0905/4-0.png)

2. 进入循环：将 `temp` 指向 `head` 节点的下一个节点
![](/assets/images/0905/4-1.png)

3. 插入：将 `head` 节点的下一个节点指向 `temp` 节点的下一个节点；将 `temp` 节点的下一个节点指向 `newHead` 节点的下一个节点；将 `newHead` 节点的下一个节点指向 `temp` 节点。这样就将 `head` 节点的下一个节点插入到新链表头之后
![](/assets/images/0905/4-2.png)

4. 进入下一轮循环，操作同步骤2、3
![](/assets/images/0905/4-3.png)

5. 循环直至 `head` 节点的下一个节点为 `null`，此时 `newHead` 节点的下一个节点为翻转后链表的头
![](/assets/images/0905/4-4.png)

这个算法的关键在于，`newHead` 和 `head` 所指向的节点是不变的，只是不断将 `head` 节点之后的节点移到 `newHead` 节点之后。实现代码如下：

``` java
public Node reverseSinglyLinkedList4(Node head) {
	if (head == null|head.next == null) return head;

	Node newHead = new Node(0);
	newHead.next = head;

	Node temp = null;

	while (head.next != null) {
		temp = head.next;

		head.next = temp.next;
		temp.next = newHead.next;
		newHead.next = temp;
	}

	return newHead.next;
}
```

## 递归实现
事实上也可以用递归来实现链表的翻转，优势是代码短，但可能没有那么容易理解。

使用递归的思路是：

1. 对与链表 `1 -> 2 -> 3 -> 4 -> 5 -> null`，先翻转 `2 -> 3 -> 4 -> 5 -> null`，再需将 `1` 添加到新链表的尾。
2. 对于链表 `2 -> 3 -> 4 -> 5 -> null`，先翻转 `3 -> 4 -> 5 -> null`，再将 `2` 添加到新链表的尾。
3. 递归直至只剩下一个节点 `5`，直接返回该节点。

需要注意的是，递归函数最终返回的是翻转后链表的尾，为了获取新链表的头，可以使用一个类成员变量保存。

代码如下：

``` java
private Node newHead;

public Node reverseSinglyLinkedList5(Node head) {
	if (head == null || head.next == null) return head;

	reverseRecursively(head);

	return newHead;
}

private Node reverseRecursively(Node head) {
	if (head.next == null) {
		newHead = head;

		return head;
	}

	Node tail  = reverseRecursively(head.next);
	tail.next = head;
	head.next = null;

	return head;
}
```

## Leetcode 上的例子
Leetcode 上有很多关于链表的题目，这里选取 `#25 Reverse Nodes in k-Group`，题目描述如下：

> Given a linked list, reverse the nodes of a linked list k at a time and return its modified list.
>
> k is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of k then left-out nodes in the end should remain as it is.
>
> You may not alter the values in the nodes, only nodes itself may be changed.
> Only constant memory is allowed.
>
> For example,
> Given this linked list: 1->2->3->4->5
> For k = 2, you should return: 2->1->4->3->5
> For k = 3, you should return: 3->2->1->4->5

题目要求将链表每 k 个一组进行翻转，如果剩余不足 k 个则剩余部分维持原样。这里使用前面提到的第四种方法（不断将原链表头的下一个节点插入新链表头之后），只是需要在翻转前先判断剩余节点数，以及记录下下一组的起始节点作为停止条件。代码如下：

``` java
public ListNode reverseKGroup(ListNode head, int k) {
	if (k == 0) return head;

	ListNode newHead = new ListNode(0);
	newHead.next = head;

	ListNode currHead = newHead;    // the head of curr group & the tail of prev group
	ListNode nextHead = head;       // the real head of next group
	ListNode temp;                  // stores the next node of currHead

	while (true) {
		int count = 0;			           // to find nextHead
		while (count++ < k) {
			if (nextHead == null) return newHead.next;   // no enough nodes left

			nextHead = nextHead.next;
		}

		head = currHead.next;              // the real head of current group

		while (head.next != nextHead) {
			temp = head.next;
			head.next = temp.next;
			temp.next = currHead.next;
			currHead.next = temp;
		}

		currHead = head;
	}
}
```
