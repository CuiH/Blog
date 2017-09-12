---
layout: post
title:  "Traversing a Binary Tree"
date:   2017-09-07 00:30:00 -0500
tags:   algorithm
description: Introducing various ways to traverse a binary tree.
---

## Overview
The `binary tree` is a very classical data structure, and we have various ways to perform preorder, inorder and postorder traversal on it. The class `TreeNode` used in this blog is defined as follows:

``` java
public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) { val = x; }
}
```

If there's no special statement, we use this tree in our examples:

![](/assets/images/0907/0-0.png)

## Traversing Recursively
This may be the simplest algorithm of traversing, so I just post the code here:

``` java
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

## Using a Stack
The key point of traversing a binary tree is how to go back to the parent and traverse another child after we have traversed one child. Here we can use a `stack` to record visited nodes, and its `fitst-in-first-out` feature will perfectly help us go back to the parent after the traversal of a subtree.

### Preorder Traversal
1. As for the current node, traverse along the `left child`, and keep outputing and pushing to the stack, until current node points to `null`
2. Pop the top node of the stack, whose `right child` will become the current node
3. Repeat process #1 and #2, until current node points to `null` and the stack is empty

The code is as follows:

``` java
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

### Inorder Traversal
The thinking is similar to the preorder one, but this time we output at the time of popping (from stack). No need to describe the algorithm and here's the code:

``` java
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

### Postorder Traversal
This could be a little more complicate. The point is, we should ensure that the parent node is not outputed until all of his children are traversed. A common method is to remember the last node we have outputed, which can act as a indicator for us to judge whether both the left child and the right child have been traversed at a given node. Here I provide three ideas.

a) just like the previous solution:

Similar to the preorder and inorder traversal code above. The difference is we record the last outputed node, and before popping the stack, we check whether both children of the top node in the stack have been traversed (or, is `null`), by comparing them with the recorded node:

``` java
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

b) another method:

1. The root is the current node, and push it to the stack
2. Get the top node of the stack. If its children are all `null`, or have been traversed (that is, one of them is the last outputed node), pop it and outout it; otherwise push its `right` child into the stack (if is not `null`), and then its `left` node (if is not `null`)
3. Repeat process #2, until the stack becomes empty

The code is as follows:

``` java
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

c) using two stacks
This method is somewhat magical. We know that the sequence of postorder traversal is `left -> right -> mid`. What if we traverse with `mid -> right -> left` and then reverse the result? We can do this using two stacks, traversing with one stack, and outputing the result to another stack, and finally popping nodes from the second stack one by one to get the postorder traversal:

``` java
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
In some cases, we may need to traverse a binary tree level by level. Obviously, using `queue` is a good choice. Since it's simple, only the code:

``` java
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
The average space complexity of all of the algorithms above, except the recursive ones and the two-stack solution, is `O(logn)`. Is there any binary tree traversal algorithm with `O(1)` space complexity? The answer is "yes".
Such method is called the `Morris Traversal`. Here is the description of the `inorder` one：

1. If the `left` child of current node is `null`, output it, and then traverse its `right` child
2. If the `left` child is not `null`, find the inorder `predecessor` in its left subtree. If the `right` child of the predecessor is `null`, make it point to the current node, and then traverse the left child of the current node; if the right child of the predecessor is current node, revert it to `null`, and output current node, and then traverse the right node of the current node
3. Repeat process #1 and #2, until the currrent node points to `null`

Here we involve a concept, the `inorder predecessor`:

> Given a node, the node before it in the inorder traversal is its inorder predecessor.

The common way to find it is to continuously traverse `right` in the `left` subtree of a node, until the right child is `null`.

The ingenuity of this algorithm is that, we utilize the empty space `inside` the tree to help us go back to the parent node, without any extra sapce. When we traverse the left subtree of a node, we first save current node to the right child of the predecessor of it. After we finish the traversal of the left subtree (and arrive at the predecessor), according to the algorithm we will go to the right child of the last node (because its left child is `null`) and thus successfully come back to the parent! Then, at the parent node, we find the right child of its predecessor is `itselt`, which means the left subtree has been traversed, so we move to the right subtree.

As for our example, a detailed description is:

1. The original tree
![](/assets/images/0907/T-0.png)

2. Find the predecessor and change its right child, and then traverse the left subtree of current node
![](/assets/images/0907/T-1.png)

3. The same as above
![](/assets/images/0907/T-2.png)

4. The left child is `null`, so output current node
![](/assets/images/0907/T-3.png)

5. Traverse the right subtree, and come back to the parent
![](/assets/images/0907/T-4.png)

6. The right child of the predecessor is self, so revert it and output current node. Traverse the right subtree
![](/assets/images/0907/T-5.png)

7. Handle the predecessor, and traverse the left subtree
![](/assets/images/0907/T-6.png)

8. The left child is null, so output current node. Traverse the right subtree, and come back to the parent
![](/assets/images/0907/T-7.png)

9. The right child of the predecessor is self, so revert it and output current node. Traverse the right subtree and come back to the parent
![](/assets/images/0907/T-8.png)

10. The right child of the predecessor is self, so revert it and output current node. Traverse the right subtree
![](/assets/images/0907/T-9.png)

11. The left child is `null`, so output current node, and traverse the right subtree
![](/assets/images/0907/T-10.png)

12. The same as above. Finsh the traversal
![](/assets/images/0907/T-11.png)

Here's the code:

``` java
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

---

## 总览
二叉树是一个十分经典的数据结构，可以对其进行前序、中序，以及后续遍历（这里不再介绍这三者的定义）。本文关注遍历二叉树的多种算法，并结合 Leetcode 题目具体分析。其中，树节点的定义如下：

``` java
public class TreeNode {
	int val;
	TreeNode left;
	TreeNode right;

	TreeNode(int x) { val = x; }
}
```

如无特殊声明，本文使用的例子为如下二叉树：

![](/assets/images/0907/0-0.png)

## 递归遍历
这是最简单、最容易写的遍历算法，因此直接给出代码：

``` java
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

## 使用栈遍历
遍历一棵二叉树，沿着一条路径遍历下去后，关键在于如何回到已遍历过的节点继续沿另一条路径遍历，我们可以使用 `栈` 这个数据结构来存储访问过的节点。栈的 `后入先出` 特性可以帮助我们在便利完一棵子树后回到其父节点。

### 先序遍历
1. 对于当前节点，沿左子树遍历，并不断输出、入栈，直至当前节点为空
2. 弹出栈顶节点，将其右子树设为当前节点
3. 重复步骤1-2，直至当前节点为空且栈为空

实现代码如下：

``` java
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

### 中序遍历
与前序遍历思路类似，只是输出时机改在出栈操作的时候进行，故不再进行算法描述，直接给出代码：

``` java
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

### 后序遍历
稍微复杂一些，算法的关键在于，要保证父节点在左右子树都被遍历后才输出。常规的做法是，记录下最后一次输出的节点，帮助判断当前节点的左右子树是否都已被遍历。下面提供三种思路。

a) 延续之前的思路：

与前面先序、中序的代码类似，只是需要记录上一次输出的节点，并在出栈操作之前判断栈顶节点是否满足输出要求，即左右子树为空，或已被遍历过，实现代码如下：

``` java
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

b) 另一种思路：

1. 将根节点设为当前节点，并入栈
2. 获取栈顶节点，若果该节点的左右子树均为空，或都已遍历过（即左右子树之一为上一次输出的节点），则将该节点出栈并输出；否则先将其右子树入栈（如果非空），再将左子树入栈（如果非空）
3. 重复步骤2，直至栈为空

实现代码如下：

``` java
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

c) 使用双栈

这个算法的思路有些神奇，我们知道后序遍历的顺序是 `左 -> 右 -> 中`，那么如果我们先按照 `中 -> 右 -> 左` 的顺序遍历，将结果输出到另外一个栈中，最后再按顺序弹出第二个栈的元素，就可以得到原始树的后序遍历结果了。实现代码如下：

``` java
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

## 层次遍历
即一层一层遍历树，在某些情况下适用。很显然，使用 `队列` 可以较为简单实现，不多介绍，直接给出代码：

``` java
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

## Morris 遍历
前面提到的各种算法，除了递归和双栈外，平均空间复杂度都为 `O(logn)`，那么有没有空间复杂度为 `O(1)` 的遍历算法呢？答案是有的，这个算法被称作 `Morris Traversal`， 下面先给出中序遍历的算法描述：

1. 如果当前节点左子树为空，则输出当前节点，并继续遍历右子树
2. 如果左子树非空，则在左子树中找出中序遍历下的 `前驱结点`，如果该节点的右子树为空，则将当前节点设为其右子树，继续遍历当前节点的左子树；如果该节点的右子树为当前节点，则恢复其为空，输出当前节点，继续遍历当前节点的右子树
3. 重复步骤1-2，直至当前节点为空

这里涉及到一个概念，即中序遍历的 `前驱结点`：

> 对于给定节点，其在中序遍历下的输出中的前一个节点被称作前驱结点。

一般的寻找方法为，在左子树中一直向右前进，直至右子树为空。

这个算法的巧妙之处在于，利用树中节点的空余空间来帮助我们回到父节点，无需额外的存储空间。当遍历一个节点的左子树时，先将该节点链接到其前驱结点的右子树中，这样当遍历完左子树时（即到达前驱结点），根据算法会最后一个节点的右子树设为当前节点（成功回到父节点）。然后在处理父节点时，发现其前驱结点的右子树为自己，说明该左子树已完成遍历，应输出本身并继续遍历右子树。

对于我们的例子，分步描述如下：

1. 原始树
![](/assets/images/0907/T-0.png)

2. 找到前驱结点设置其右子树，并遍历左子树
![](/assets/images/0907/T-1.png)

3. 同上
![](/assets/images/0907/T-2.png)

4. 左子树为空，输出
![](/assets/images/0907/T-3.png)

5. 遍历右子树，回到父节点
![](/assets/images/0907/T-4.png)

6. 发现前驱结点的右子树为自己，删除该右子树，输出当前节点，遍历右子树
![](/assets/images/0907/T-5.png)

7. 处理前驱结点，遍历左子树
![](/assets/images/0907/T-6.png)

8. 左子树为空，输出，遍历右子树，回到父节点
![](/assets/images/0907/T-7.png)

9. 发现前驱结点的右子树为自己，删除该右子树，输出当前节点，遍历右子树，回到父节点
![](/assets/images/0907/T-8.png)

10. 发现前驱结点的右子树为自己，删除该右子树，输出当前节点，遍历右子树
![](/assets/images/0907/T-9.png)

11. 发现左子树为空，输出当前节点，遍历右节点
![](/assets/images/0907/T-10.png)

12. 同上，完成遍历
![](/assets/images/0907/T-11.png)

实现代码如下：

``` java
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
