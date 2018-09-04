---
layout:      post
title:       "Reverse a Singly Linked List"
date:        2018-03-17 23:30:00 -0700
tags:        algorithm
description: "Four ways to reverse a singly linked list."
---

## Overview
There are four common ways to reverse a singly linked list. I will introduce them one by one. The class `Node` is defined as follows:

```java
public class Node {

    int val;
    Node next;
    
    Node(int v) {
        val = v;
    }

}
```

## With the help of an array
If we traverse the linked list and store every node in a `ramdomly accessible` data structure, such as an `array`, we can then traverse the array reversely and construct the reversed linked list. Here's the code:

```java
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

Obviously, the biggest problem of this solution is that it consumes too much `space`, because we need to construct a data structure with the same length as the original linked list.

## Continuously moving nodes from the original list to the head of the new list
This is another easy solution. What we should do is to move every node from the original list to the head of the new list. Let's see the example of `1 -> 2 -> 3 -> 4 -> 5 -> null`:

1. Initialization: `newHead` points to `null`, `head` points to the head of the original list.
![](/assets/images/180317/3-0.png)

2. Enter the loop: `temp` points to the next node of `head`; set `head.next` to `newHead`.
![](/assets/images/180317/3-1.png)

3. Move forward: `newHead` points to `head`; `head` points to `temp`.
![](/assets/images/180317/3-2.png)

4. Begin the next loop.
![](/assets/images/180317/3-3.png)

5. Loop until `head` points to `null`. Now `newHead` points to the head of the reversed list.
![](/assets/images/180317/3-4.png)

The code is here:

```java
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

## Continuously inserting the next node of the head of the original list after the head of the new list
We need to construct a `helper node` in this case, and link it to the head of the original list. Then we keep inserting the `next node of the original list` after the `helper node`, until the next node of the original list is `null`. Now the `next node of the helper node` is the head of the reversed list. The algorithm is like:

1. Initialization: construct the helper node `newHead`, and link it to the head of the original list.
![](/assets/images/180317/4-0.png)

2. Enter the loop: `temp` points to the next node of `head`.
![](/assets/images/180317/4-1.png)

3. Insertion: set `head.next` to the next node of `temp`; set `temp.next` to the next node of `newHead`; set `newHead.next` to `temp`. Now we have inserted the next node of `head` to the position right after the `newHead`.
![](/assets/images/180317/4-2.png)

4. Begin the next loop, and handle like process #2 and process #3.
![](/assets/images/180317/4-3.png)

5. Loop until the next node of `head` is `null`. Now the next node of `newHead` is the head of the reversed list.
![](/assets/images/180317/4-4.png)

The key point of this algorithm is: `newHead` and `head` always point to the same node, and move the node after the `head` to the next position of `newHead`. The code is as follows:

```java
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
We can also reverse a linked list with recursion, the advantage of which is the short code, but maybe it's not that simple to understand.

The thinking is:

1. As for list `1 -> 2 -> 3 -> 4 -> 5 -> null`, we reverse `2 -> 3 -> 4 -> 5 -> null` first, and then add `1` to the tail of the reversed list.
2. As for list `2 -> 3 -> 4 -> 5 -> null`, we reverse `3 -> 4 -> 5 -> null` first, and then add `2` to the tail of the reversed list.
3. Recur until only one node left, `5`, and return this node directly.

We should be aware that the recrusive method finally returns the tail of the reversed list. To obtain its head, we may need a member variable. The code is as follows:

```java
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
There are many peoblems regarding linked lists on `Leetcode`. Here I choose the `#25 Reverse Nodes in k-Group`:

> Given a linked list, reverse the nodes of a linked list k at a time and return its modified list.
>
> k is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of k then left-out nodes in the end should remain as it is.
>
> You may not alter the values in the nodes, only nodes itself may be changed.
> Only constant memory is allowed.
>
> For example, given this linked list: 1->2->3->4->5
>
> For k = 2, you should return: 2->1->4->3->5
>
> For k = 3, you should return: 3->2->1->4->5

This problem requires the given list to be reversed in groups of k nodes, and if the number of the remaining nodes is less than k, we should just keep the original order. Here I use the third method to handle it, that is, continuously inserting the next node of the original list after the head of the new list. The difference is that we need to judge before reversing, to check whether we have enough nodes left, and to record the beginning node of the next group as a stop signal. The code is as follows:

```java
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
