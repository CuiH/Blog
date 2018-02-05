---
layout:      post
title:       "Binary Tree Traversals"
date:        2017-08-05 00:30:00 -0500
tags:        algorithm
description: "Various ways to traverse a binary tree."
---

## Overview
The `binary tree` is a very classical data structure, and we have various ways to perform preorder, inorder and postorder traversals on it. The class `TreeNode` used in this blog is defined as follows:

```java
public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) { val = x; }
}
```

If there's no special statement, we'll use this tree in our examples:

![](/assets/images/170805/0-0.png)

## Recursive travesals
This may be the simplest algorithm of traversing, so I just post the code here:

```java
public void preorderWithRecursion(TreeNode root, List<Integer> res) {
    if (root == null) return;

    res.add(root.val);

    preorderWithRecursion(root.left, res);
    preorderWithRecursion(root.right, res);
}

public void inorderWithRecursion(TreeNode root, List<Integer> res) {
    if (root == null) return;

    inorderWithRecursion(root.left, res);

    res.add(root.val);

    inorderWithRecursion(root.right, res);
}

public void postorderWithRecursion(TreeNode root, List<Integer> res) {
    if (root == null) return;

    postorderWithRecursion(root.left, res);
    postorderWithRecursion(root.right, res);

    res.add(root.val);
}
```

## Traversing with a stack
The key point of traversing a binary tree is how to go back to the parent node and traverse another child after we have traversed one child. Here we can use a `stack` to record visited nodes, and its `fitst-in-first-out` feature will perfectly help us go back to the parent after the traversing a subtree.

### Preorder traversal
1. As for the current node, traverse along the `left child`, and keep outputing and pushing to the stack, until current node points to `null`.
2. Pop the top node from the stack, and its `right child` will become the current node.
3. Repeat process #1 and #2, until current node points to `null` and the stack is empty.

The code is as follows:

```java
public List<Integer> preorderWithStack(TreeNode root) {
    List<Integer> res = new LinkedList<>();

    LinkedList<TreeNode> stack = new LinkedList<>();

    while (root != null || !stack.isEmpty()) {
        while (root!= null) {
            res.add(root.val);
            stack.addLast(root);

            root = root.left;
        }

        TreeNode top = stack.removeLast();
        root = top.right;
    }

    return res;
}
```

### Inorder traversal
The thinking is similar to the preorder one, but this time we output at the time of popping (from stack). Here's the code:

```java
public List<Integer> inorderWithStack(TreeNode root) {
    List<Integer> res = new LinkedList<>();

    LinkedList<TreeNode> stack = new LinkedList<>();

    while (root != null || !stack.isEmpty()) {
        while (root!= null) {
            stack.addLast(root);

            root = root.left;
        }

        TreeNode top = stack.removeLast();
        res.add(top.val);

        root = top.right;
    }

    return res;
}
```

### Postorder traversal
This could be a little bit complicate. The point is, we should ensure that the parent node is not outputed until all of his children are traversed. A common method is to remember the last outputed node. Here are three possible ideas.

#### a) Just like the previous solution:

Similar to the preorder and inorder traversal code above. The difference is we record the last outputed node, and before popping the stack, we check whether both children of the top node in the stack have been traversed (or, is `null`), by comparing them with the recorded node:

```java
public List<Integer> postorderWithStack1(TreeNode root) {
    List<Integer> res = new LinkedList<>();

    LinkedList<TreeNode> stack = new LinkedList<>();

    TreeNode prev = null;

    while (root != null || !stack.isEmpty()) {
        while (root != null) {
            stack.addLast(root);

            root = root.left;
        }

        TreeNode top = stack.getLast();
        if (top.right == null || top.right == prev) {
            res.add(top.val);

            stack.removeLast();

            prev = top;
            root = null;
        } else {
            root = top.right;
        }
    }

    return res;
}
```

#### b) Another method:

1. Push the current node (root) into the stack.
2. Get the top node of the stack. If its children are all `null`, or have been traversed (that is, one of them is the last outputed node), pop it and outout it; otherwise push its `right` child into the stack (if it is not `null`), and then its `left` node (if it is not `null`).
3. Repeat process #2, until the stack becomes empty.

The code is as follows:

```java
public List<Integer> postorderWithStack2(TreeNode root) {
    if (root == null) return new ArrayList<>();
 
    List<Integer> res = new LinkedList<>();

    LinkedList<TreeNode> stack = new LinkedList<>();
    stack.addLast(root);

    TreeNode prev = null;

    while (!stack.isEmpty()) {
        TreeNode top = stack.getLast();
        if ((top.left == null && top.right == null) || (top.left == prev || top.right == prev)) {
            stack.removeLast();

            res.add(top.val);

            prev = top;
        } else {
            if (top.right != null) stack.addLast(top.right);
            if (top.left != null) stack.addLast(top.left);
        }
    }

    return res;
}
```

#### c) Using two stacks

This method is somewhat interesting. We know that the sequence of postorder traversal is `left -> right -> mid`. What if we traverse by `mid -> right -> left` and then reverse the result? We can do this with two stacks, traversing with one stack, and outputing the result to another stack, and finally popping nodes from the second stack one by one to get the postorder traversal:

```java
public List<Integer> postorderWithTwoStacks(TreeNode root) {
    if (root == null) return new ArrayList<>();
    
    LinkedList<Integer> resStack = new LinkedList<>();

    LinkedList<TreeNode> stack = new LinkedList<>();
    stack.addLast(root);

    while (!stack.isEmpty()) {
        TreeNode top = stack.removeLast();
        resStack.addLast(top.val);

        if (top.left != null) stack.addLast(top.left);
        if (top.right != null) stack.addLast(top.right);
    }

    List<Integer> res = new LinkedList<>();
    while (!resStack.isEmpty())
        res.add(resStack.removeLast());

    return res;
}
```

## Level Traversal
In some cases, we want to traverse a binary tree level by level. Obviously, using `queue` is a good choice. It's simple so I only post the code here:

```java
public List<Integer> levelTraversal(TreeNode root) {
    if (root == null) return new ArrayList<>();

    List<Integer> res = new LinkedList<>();

    LinkedList<TreeNode> queue = new LinkedList<>();
    queue.addLast(root);

    while (!queue.isEmpty()) {
        TreeNode first = queue.removeFirst();
        res.add(first.val);

        if (first.left != null) queue.addLast(first.left);
        if (first.right != null) queue.addLast(first.right);
    }

    return res;
}
```

## Morris Traversal
The average space complexity of all of the algorithms above, except the recursive ones and the two-stack solution, is `O(logn)`. Is there any binary tree traversal algorithm that consumes only `O(1)` space? The answer is "yes".
Such method is called the `Morris Traversal`. Here is the description of the `inorder` one：

1. If the `left` child of current node is `null`, output it, and then traverse its `right` child.
2. If the `left` child is not `null`, find the inorder `predecessor` in its left subtree. If the `right` child of the predecessor is `null`, point it to the current node, and then traverse the left child of the current node; if the right child of the predecessor is current node, revert it to `null`, and output current node, and then traverse the right node of the current node.
3. Repeat process #1 and #2, until the currrent node points to `null`.

Here it involves a concept, called the `inorder predecessor`:

> Given a node, the node before it in the inorder traversal is its inorder predecessor.

The common way to find it is to continuously go `right` in the `left` subtree of a node, until the right child is `null`.

The ingenuity of this algorithm is that we utilize the empty space `inside` the tree to help us go back to the parent node, without any extra space. When we traverse the left subtree of a node, we first save current node in the right child of its predecessor. After we finish the traversal of the left subtree (and arrive at the predecessor), according to the algorithm we will go to the right child of the last node (because its left child is `null`) and thus successfully come back to the parent! Then, at the parent node, we find the right child of its predecessor is `itselt`, which means the left subtree has been traversed, so we move to the right subtree.

As for our example, a detailed description is:

1. The original tree.
![](/assets/images/170805/T-0.png)

2. Find the predecessor and change its right child, and then traverse the left subtree of current node.
![](/assets/images/170805/T-1.png)

3. The same as above.
![](/assets/images/170805/T-2.png)

4. The left child is `null`, so output current node.
![](/assets/images/170805/T-3.png)

5. Traverse the right subtree, and come back to the parent.
![](/assets/images/170805/T-4.png)

6. The right child of the predecessor is self, so revert it and output current node. Traverse the right subtree.
![](/assets/images/170805/T-5.png)

7. Handle the predecessor, and traverse the left subtree.
![](/assets/images/170805/T-6.png)

8. The left child is null, so output current node. Traverse the right subtree, and come back to the parent.
![](/assets/images/170805/T-7.png)

9. The right child of the predecessor is self, so revert it and output current node. Traverse the right subtree and come back to the parent.
![](/assets/images/170805/T-8.png)

10. The right child of the predecessor is self, so revert it and output current node. Traverse the right subtree.
![](/assets/images/170805/T-9.png)

11. The left child is `null`, so output current node, and traverse the right subtree.
![](/assets/images/170805/T-10.png)

12. The same as above. Finsh the traversal.
![](/assets/images/170805/T-11.png)

Here's the code:

```java
public List<Integer> morrisInorderTraversal(TreeNode root) {
    List<Integer> res = new LinkedList<>();

    while (root != null) {
        if (root.left == null) {
            res.add(root.val);
            root = root.right;
        } else {
            TreeNode predecessor = root.left;
            while (predecessor.right != null && predecessor.right != root)
                predecessor = predecessor.right;

            if (predecessor.right == null) {
                predecessor.right = root;
                root = root.left;
            } else {
                predecessor.right = null;

                res.add(root.val);

                root = root.right;
            }
        }
    }

    return res;
}
```
