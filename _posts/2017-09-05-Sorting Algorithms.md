---
layout:      post
title:       "Sorting Algorithms"
date:        2017-09-05 23:00:00 -0500
tags:        algorithm
description: "Introducing the principles and implementations of seven commonly seen sorting algorithms."
---

## Overview
When processing data, sorting algorithms are always used. Although most languages have related libraries that can be easily invoked, understanding the principles of such algorithms can help us make better use of them.

If there's no special statement, we sort data in ascending order in this blog, and the data set is:

> 5 8 1 5 2 4 7 9 8

## Bubble Sort
This is usually the first sorting algorithm for a new comer to algorithms:

1. In each round, keep comparing every two neighbouring elements, and if the first one is greater, `swap` the two elements.
2. After one round, the last element in the array is the greatest one among the unsorted sequence.
3. Narrow down the unsorted sequence to exclude the last element (because it is at the right location).
4. Repeat process #1 to #3, until there's only one element in the unsorted sequence.

If you understand the principle of this algorithm, you'll know why it is called `Bubble Sort`: after every round, the bigger elements `sink down` to the end of the array, and smaller ones `bubble up` to the front, until all elements are at their right positions. The code is as follows:

``` java
public int[] bubbleSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        for (int j = 0 ; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int t = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = t;
            }
        }
    }

    return arr;
}
```

The reason why it is regarded as a entry-level algorithm is that it is very simple, and at the same time, this algorithm is not efficient at all. Obviously, due to the `double loop`, the average time complexity of Bubble Sort is `O(n ^ 2)`. When the data grows larger, the speed of this algorithm is unacceptable. However, on the other hand, this algorithm has two advantages: it can be finished in the original array, so the space complexity is `O(1)`, and it is a `stable` algorithm, which means:

> The order of the equal elements in the original array remains the same after the sort.

## Select Sort
Also a entry-level sorting algorithm. The thinking is simple: each round find the smallest element in the unsorted sequence, and swap it with the first element in the sequence, and narrow down the sequence until only one element remains. The code is as follows:

``` java
public int[] selectSort(int[] arr) {
    int currMinIndex;
    for (int i = 0; i < arr.length - 1; i++) {
        currMinIndex = i;
        for (int j = i + 1 ; j < arr.length; j++) {
            if (arr[j] < arr[currMinIndex]) currMinIndex = j;
        }

        int t = arr[i];
        arr[i] = arr[currMinIndex];
        arr[currMinIndex] = t;
    }

    return arr;
}
```


Similar to the Bubble Sort, the time complexity of `Select Sort` is `O(n ^ 2)`, and the spacve complexity is `O(1)`, but it is `unstable`, because each swap will possibly change the order of the equal elements.

## Insert Sort
As the name suggests, we maintain a sorted sequence, and insert every element from the unsorted sequence to its right position in the sorted sequence. We can do this in-place: when handling the element indexed `i`, the first `i - 1` elements are sorted, so after inserting the `i`th element, move each element behind it by one place. The code is as follows:

``` java
public int[] insertSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        for (int j = i - 1 ; j >= 0; j--) {
            if (arr[j] <= arr[j + 1]) break;

            int t = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = t;
        }
    }

    return arr;
}
```

The time complexity of `Insert Sort` is still `O(n ^ 2)`, and the space complexity also remains `O(1)`.

## Bucket Sort
This algorithm is somewhat magical, because its time complexity is `O(n)`! Let's see the implementation first:

``` java
public int[] bucketSort(int[] arr) {
    int[] bucket = new int[10];
    for (int num: arr)
        bucket[num]++;

    int index = 0;
    for (int i = 0; i < bucket.length; i++)
        for (int j = 0; j < bucket[i]; j++)
            arr[index++] = i;

    return arr;
}
```

In fact, it's fairly simple. It just calculates the frequency of every element in the original array with an extra array, and traverse the auxiliary to get the sorting result.

You may realize that though this algorithm has a low time complexity, its space complexity is high, which is `O(K)`. `K` is greatest element in the original array. Therefore, this is a typical `space-for-time` algorithm. If the distribution of data is even, it can be very efficient; but for messy data, the space consumption of this algorithm is horrible. In brief, `Bucket Sort` can only be applied to some certain occations.

## Quick Sort
If `Bubble Sort`, `Select Sort` and `Insert Sort` belong to the same level, we are getting to another level, starting with `Quick Sort`.

The key point of Quick Sort is `"Divide and Conquer"`, that is, divide big problem into small ones, and when all small problems are handled, the big one is therefore handled. Let's see the description of the algorithm:

1. Select one element from the array as `base element`
2. Put all elements that are smaller than the base element to its left, and all bigger ones on the right
3. Repeat process #1 to #3 until there is only one element in the interval

Generally, we choose the first element of the interval as the base element. Here's an example:

1. The original array:
![](/assets/images/0913/1-0.png)

2. Select the first element as base element. Maintain two pointers `i` and `j`, pointing to the head and tail of the array respectively.
![](/assets/images/0913/1-1.png)

3. Move `j` to the left, to find the `first` element that is `smaller` than the base element. Extract it and fill it to the location that `i` points to
![](/assets/images/0913/1-2.png)

4. Move `i` to the right, to find the `first` element that is `bigger` than the base element. Extract it and fill it to the location that `j` points to
![](/assets/images/0913/1-3.png)

5. Repeat process #3 to #4, until `i` meets `j`
![](/assets/images/0913/1-4.png)

6. Fill the base element to the position that `i` (or `j`) points to
![](/assets/images/0913/1-6.png)

!Attention: in process #3, it must start from the `rightmost`.

The code is as follows:

``` java
public void quickSort(int[] arr, int start, int end) {
    if (start >= end) return;

    int base = arr[start];

    int i = start;
    int j = end;
    while (i < j) {
        while (i < j && arr[j] >= base) j--;
        if (i < j) arr[i++] = arr[j];

        while (i < j && arr[i] <= base) i++;
        if (i < j) arr[j--] = arr[i];
    }

    arr[i] = base;

    quickSort(arr, start, i - 1);
    quickSort(arr, i + 1, end);
}
```

As for a array of length `n`, suppost every time the base element selected by the Quick Sort divides the array to two parts of equal lengh, then:

![](/assets/images/0913/1-l.png)

All `logn` rounds is needed, and each round the whole array will be accessed, so the average time complexity is `O(nlogn)`. Since the sorting is done in-place, and no extra space is used, the spae complexity is `O(1)`. In addition, obviously, due to the swap, Quick Sort is `unstable`.

## Merge Sort
First, if we have two sorted array, how to merge them into one sorted array? I velieve many people know the answer: keep comparing the first elements of the two array, and each time extract the smaller one to the result array, until one of the array is empty. Finally append the array that is not empty to the end of the result array:

``` java
public int[] merge(int[] arr1, int[] arr2) {
    int[] res = new int[arr1.length + arr2.length];

    int c = 0;

    int i = 0;
    int j = 0;
    while (i < arr1.length && j < arr2.length) {
        if (arr1[i] < arr2[j]) res[c++] = arr1[i++];
        else res[c++] = arr2[j++];
    }

    while (i < arr1.length)
        res[c++] = arr1[i++];

    while (j < arr2.length)
        res[c++] = arr2[j++];

    return res;
}
```

Based on this code, with `"Divide and Conquer"`, we can realize the `Merge Sort`:

1. Divide the array to two parts, and do Merge Sort on them respectively
2. Merge the two sorted result array
3. Repeat process #1 to #3, until there's only one element in the interval

Improve the previous code a little bit, and we have the implementation:

``` java
public void mergeSort(int[] arr, int start, int end) {
    if (start >= end) return;

    int m = (start + end) / 2;
    
    mergeSort(arr, start, m);
    mergeSort(arr, m + 1, end);

    merge(arr, start, m, end);
}

public void merge(int[] arr, int s, int m, int e) {
    int[] res = new int[e - s + 1];

    int c = 0;

    int i = s;
    int j = m + 1;
    while (i <= m && j <= e) {
        if (arr[i] <= arr[j]) res[c++] = arr[i++];
        else res[c++] = arr[j++];
    }

    while (i <= m)
        res[c++] = arr[i++];

    while (j <= e)
        res[c++] = arr[j++];

    for (c = 0; c < res.length; c++)
        arr[s + c] = res[c];
}
```

Similar to the Quick Sort, the time complexity of Merge Sort is `O(nlongn)`, but in the process of merging, we need at most an auxiliary array with the same lengh as the original array, so the space complexity is `O(n)`. Besides, if every time we meet the situation that the head elements of the two array are equal, we guarantee the element from the first array is selected, Merge Sort can be `stable`.

## Heap Sort
`Heap Sort` uses a special data structure -- `heap`, and its implementation is somewhat more complicate than the previous algorithms. We will begin with `Heap` and then come to the actual algorithm.

### Heap
Since we are sorting in ascending order, I will introduce the `Minimum Heap`:

1. A minimum heap is a `complete binary tree`
2. The parent node is always smaller than (or equal to) its children
3. Children are also minimum heap

### Storing in an Array
As we mentioned above, heap is a `complete binary tree`, so we can use some tricks to store it in an array, and easily access nodes by index. For example, if we have the following heap:

![](/assets/images/0913/2-0.png)

Put every node into an array according to its level-traversing order:

![](/assets/images/0913/2-1.png)

You will find that, for every node indexed `i`, the index of its left child is `2 * i + 1`, the index of the right child is `2 * i + 2`, and the index of its parent is `(i - 1) / 2`.

### Insertion
As for the heap above, if we want to insert `2` into it:

1. Put the new element to the end of the array
![](/assets/images/0913/2-2.png)

2. `"Adjust upward"`, that is, compare it with the parent node. If it is smaller than its parent, swap them
![](/assets/images/0913/2-3.png)

3. Repeat process #2, until current node is bigger than the parent node, or it reaches the root.
![](/assets/images/0913/2-4.png)

The code for `"adjust upward"`:

``` java
private void fixUp(int index) {
    int currVal = arr[index];
    int parentIndex = (index - 1) / 2;
    while (parentIndex >= 0 && index != 0 && arr[parentIndex] > currVal) {
        arr[index] = arr[parentIndex];
        index = parentIndex;
        parentIndex = (index - 1) / 2;
    }

    arr[index] = currVal;
}
```

### Deletion
Becuase of the characteristic of the heap, deletion can only be done to the top element. After deletion, we move the last element of the heap to the top, and `"adjust downward"`. Again the previous example:

1. Extract the top element `1`, and move the last element `8` to the top
![](/assets/images/0913/2-5.png)

2. `"Adjust downward"`, that is, compare it with all children. If either children is smaller than it, swap them
![](/assets/images/0913/2-6.png)

3. Repeat process #2, until no child is smaller than current node, or it reaches the leaf
![](/assets/images/0913/2-7.png)

The code for `"adjust downward"`:

``` java
private void fixDown(int index, int end) {
    int currVal = arr[index];
    int minChildIndex = 2 * index + 1;
    while (minChildIndex <= end) {
        if (minChildIndex + 1 <= end && arr[minChildIndex + 1] < arr[minChildIndex]) minChildIndex++;

        if (arr[minChildIndex] >= currVal) break;

        arr[index] = arr[minChildIndex];
        index = minChildIndex;
        minChildIndex = 2 * index + 1;
    }

    arr[index] = currVal;
}
```

### Initialization
For a given array, say our example, `5 8 1 5 2 4 7 9 8`, the processes to transform it to a heap is as follows:

1. The initial data
![](/assets/images/0913/2-8.png)

2. Start from `the last node that is not leaf`, adjust downward. Since the last two not-leaf node are currently minimum heaps, they are not to be adjusted
![](/assets/images/0913/2-9.png)

3. Adjust the subtree rooted by the last but two node, and it triggers one swap
![](/assets/images/0913/2-10.png)

4. Adjust the subtree rooted by the root (the whole tree), and it triggers two swaps
![](/assets/images/0913/2-11.png)

The code is as follows:

``` java
private void init(int end) {
    for (int i = (end - 1) / 2; i >= 0; i++)
        fixDown(i, end);
}
```

### Heap Sort
After introducing all above, we can finally sort with Heap Sort. Simply, we just `heapify` (initialize) the array, and keep extracting the top element and move the last element to the top, and then `adjust downward` form the top. The code is as follows:

``` java
public int[] sort(int len) {
    init(len);

    int[] res = new int[len];
    int c = 0;

    for (int i = len; i > 0; i--) {
        res[c++] = arr[0];

        arr[0] = arr[i - 1];
        fixDown(0, i);
    }

    return res;
}
```

### Analysis
Heap Sort utilizes `complete binary tree`, so no matter what type of data we have, the time complexity of Heap Sort is `O(nlongn)`, and the space complexity is `O(1)`. Besides, due to the swap, Heap sort is `unstable`.

## Summary
There are many sorting algorithms. Although few people implement them personally, have a understanding of their principles is always benefical.

---

## 总览
在处理数据时，排序算法经常被使用。虽然大部分语言都有相关库方便我们调用，了解这些算法的具体实现机制有助于加深我们对算法的理解，以及更好的使用这些算法。

如无特殊声明，本文的排序算法输出均为 `升序`，使用的数据为：

> 5 8 1 5 2 4 7 9 8

## 冒泡排序
这大概是学习算法的人接触到的第一个排序算法：

1. 在每一轮，不断比较每相邻的两个元素，如果第一个元素比第二个大，交换二者位置。
2. 完成一轮后，数组最后的元素是待排序序列中最大的元素。
3. 缩小待比较序列，不再包括上一个序列中最后的元素（已处在合适位置）。
2. 重复上述步骤直到待排序序列只剩下一个元素。

如果理解了这个算法，就能明白它为什么被称作 `冒泡排序`，因为每一轮较大的元素 `沉底`，小元素 `上浮到` 靠前的位置，直到所有元素都处在合适的位置。实现代码如下：

``` java
public int[] bubbleSort(int[] arr) {
	for (int i = 0; i < arr.length - 1; i++) {
		for (int j = 0 ; j < arr.length - 1 - i; j++) {
			if (arr[j] > arr[j + 1]) {
				int t = arr[j];
				arr[j] = arr[j + 1];
				arr[j + 1] = t;
			}
		}
	}

	return arr;
}
```

之所以被称作入门级算法，就是因为它的实现非常简单，但同时，这个算法的效率确是十分低的。很明显，由于使用双重循环，冒泡排序的平均时间复杂度为 `O(n ^ 2)`，在数组较大的情况下速度是无法接受的。不过另一方面，冒泡排序也有一个优点是它可以在原数组内完成，不需要额外的存储空间，空间复杂度为 `O(1)`。另外，冒泡排序是 `稳定的` 排序算法，即

> 原数组中相等元素的先后顺序在排序后的数组里得以维持。

## 选择排序
也算是一个入门级的排序算法。思路十分简单，每一轮找出待排序序列中最小的元素，并将其与该序列中第一个元素交换，直至待排序序列只剩下一个元素。实现代码如下：

``` java
public int[] selectSort(int[] arr) {
	int currMinIndex;
	for (int i = 0; i < arr.length - 1; i++) {
		currMinIndex = i;
		for (int j = i + 1 ; j < arr.length; j++) {
			if (arr[j] < arr[currMinIndex]) currMinIndex = j;
		}

		int t = arr[i];
		arr[i] = arr[currMinIndex];
		arr[currMinIndex] = t;
	}

	return arr;
}
```

与冒泡排序类似，选择排序的时间复杂度为 `O(n ^ 2)`，空间复杂度为 `O(1)`，但是选择排序是 `不稳定的`，因为每次交换的时候会导致相同元素在数组中的次序变化。

## 插入排序
顾名思义，维护一个已排序好的序列，依次将数组中的元素插入到该序列中的合适位置。我们可以直接在原数组中操作，在处理下标为 `i` 的元素时，数组中的前 `i - 1` 个元素已排序好，将下标 `i` 的元素放置到合适位置后，依次后移其之后的元素，以实现插入。实现代码如下：

``` java
public int[] insertSort(int[] arr) {
	for (int i = 1; i < arr.length; i++) {
		for (int j = i - 1 ; j >= 0; j--) {
			if (arr[j] <= arr[j + 1]) break;

			int t = arr[j];
			arr[j] = arr[j + 1];
			arr[j + 1] = t;
		}
	}

	return arr;
}
```

这个算法的时间复杂度是 `O(n ^ 2)`，空间复杂度为 `O(1)`，并且是 `稳定的`。

## 桶排序
这里要介绍一个有些神奇的算法，因为它的时间复杂度可以达到惊人的 `O(n)`！我们先来看它的实现：

``` java
public int[] bucketSort(int[] arr) {
	int[] bucket = new int[10];
	for (int num: arr)
		bucket[num]++;

	int index = 0;
	for (int i = 0; i < bucket.length; i++)
		for (int j = 0; j < bucket[i]; j++)
			arr[index++] = i;

	return arr;
}
```

实际上，这个算法很简单，使用额外的数组统计原数组中每个元素出现的次数，然后遍历这个统计数组得到排序结果。

你应该已经发现了，虽然这个算法时间复杂度很低，但是空间复杂度为 `O(K)`，其中，`K` 为数组中值最大的元素。因此，这是一个典型的 `空间换时间` 的算法。对于分布较为集中的数据，使用这个算法有奇效；但是对于跨度比较大的数据，其空间消耗是我们不能接受的。总之，这个算法适用于一些特定的场合。

## 快速排序
如果 `冒泡排序`，`选择排序`，`插入排序` 为一个档次的算法，那么从快速排序开始，我们进入了另一个档次。

快速排序的关键在于 `分治 + 递归`， 即将大问题化为小问题来解决，这样当所有小问题都解决之后，大问题也就解决了。我们先来看算法描述：

1. 从数组中选出一个数作为 `基准数`
2. 将所有比基准数小的数放在它的左边，比它大的数放在右边
3. 对每一边重复应用步骤1-3，直到该区间只有一个数。

一般来说，选取该区间的第一个数作为基准数，我们来看一个例子：

1. 原数组
![](/assets/images/0913/1-0.png)

2. 取出第一个数作为基准数，维护两个指针 `i` 和 `j` 分别指向数组的头和尾
![](/assets/images/0913/1-1.png)

3. 向左移动 `j`，找到 `第一个` 比基准数 `小` 的数，取出填到 `i` 所在的位置
![](/assets/images/0913/1-2.png)

4. 向右移动 `i`，找到 `第一个` 比基准数 `大` 的数，取出填到 `j` 所在的位置
![](/assets/images/0913/1-3.png)

5. 重复步骤3、4，直到 `i` 与 `j` 相遇
![](/assets/images/0913/1-4.png)

6. 将基准数填入 `i` （或 `j`）所在位置
![](/assets/images/0913/1-5.png)

7. 分别对左区间 `[start, i - 1]`，及右区间 `[i + 1, end]` 执行步骤1-7，直到区间内只有一个数
![](/assets/images/0913/1-6.png)

*注意： `第3步` 中，一定要先从 `最右边` 开始向左找。

实现代码如下：

``` java
public void quickSort(int[] arr, int start, int end) {
	if (start >= end) return;

	int base = arr[start];

	int i = start;
	int j = end;
	while (i < j) {
		while (i < j && arr[j] >= base) j--;
		if (i < j) arr[i++] = arr[j];

		while (i < j && arr[i] <= base) i++;
		if (i < j) arr[j--] = arr[i];
	}

	arr[i] = base;

	quickSort(arr, start, i - 1);
	quickSort(arr, i + 1, end);
}
```

对于长度为 `n` 的数组，假设快速排序每次选取的基准数将数组分为长度相等的两部分，那么：

![](/assets/images/0913/1-l.png)

一共需要进行 `o(logn)` 轮，每轮访问一遍整个数组，所以平均时间复杂度为 `O(nlogn)`。由于在数组内排序，没有使用额外空间，空间复杂度为 `O(1)`。另外，很明显，由于交换操作，快速排序是 `不稳定的`。

## 归并排序
首先，对于两个有序的数组，如何将他们和合并成一个有序数组？我相信这个问题很多人都知道如何解决，只需不断比较两个数组的第一个元素，将较小的取出依次放到结果数组中，直至其中一个数组为空，最后将不为空的数组的剩余元素逐个添加到结果数组中。代码如下：

``` java
public int[] merge(int[] arr1, int[] arr2) {
	int[] res = new int[arr1.length + arr2.length];

	int c = 0;

	int i = 0;
	int j = 0;
	while (i < arr1.length && j < arr2.length) {
		if (arr1[i] < arr2[j]) res[c++] = arr1[i++];
		else res[c++] = arr2[j++];
	}

	while (i < arr1.length)
		res[c++] = arr1[i++];

	while (j < arr2.length)
		res[c++] = arr2[j++];

	return res;
}
```

在这个代码的基础上，利用 `分治 + 递归`，我们就可以实现 `归并排序`：

1. 将数组分为两半，分别进行归并排序
2. 将得到的两个有序数组合并
3. 重复步骤1-3，直至区间中只有一个数

对先前的合并算法稍加改进，实现如下：

``` java
public void mergeSort(int[] arr, int start, int end) {
	if (start >= end) return;

	int m = (start + end) / 2;
	
	mergeSort(arr, start, m);
	mergeSort(arr, m + 1, end);

	merge(arr, start, m, end);
}

public void merge(int[] arr, int s, int m, int e) {
	int[] res = new int[e - s + 1];

	int c = 0;

	int i = s;
	int j = m + 1;
	while (i <= m && j <= e) {
		if (arr[i] <= arr[j]) res[c++] = arr[i++];
		else res[c++] = arr[j++];
	}

	while (i <= m)
		res[c++] = arr[i++];

	while (j <= e)
		res[c++] = arr[j++];

	for (c = 0; c < res.length; c++)
		arr[s + c] = res[c];
}
```

与快速排序类似，归并排序的时间复杂度为 `O(nlogn)`，但是在合并的过程中，最大需要使用到与原数组等长的辅助数组，所以其空间复杂度为 `O(n)`。另外，如果我们在归并的过程中，遇到两个序列的头元素相等的情况时，先将前一个序列的元素放到结果数组中，就可以保证其是 `稳定的`。

## 堆排序
`堆排序` 使用到了特殊的数据结构——`堆`，实现较前面的算法稍为复杂，因此这一部分将先从 `堆` 讲起，最后在讨论排序算法。

### 堆
由于本文始终以升序排序为例，这里介绍一下 `最小二叉堆`：

> 1. 最小二叉堆是一个完全二叉树
> 2. 父节点的值总是小于等于子节点的值
> 3. 子树也是最小二叉堆。

### 使用数组存储
前面提到了，堆是 `完全二叉树`，因此可以使用一些技巧将其存储在数组中，并轻松通过下标访问子节点。如，对于如下二叉堆：

![](/assets/images/0913/2-0.png)

按照层次遍历的顺序放到数组中：

![](/assets/images/0913/2-1.png)

可以发现，对于在数组中序号为 `i` 的节点，其左子树的序号为 `2 * i + 1`，右子树的序号的 `2 * i + 2`，父节点序号为 `(i - 1) / 2`。

### 插入
假设对于上图的堆，如果要想其中插入数据，比如 `2`。

1. 先将新元素放到数组的最后
![](/assets/images/0913/2-2.png)

2. `向上调整`，即与父节点比较，如果小于父节点则与父节点交换
![](/assets/images/0913/2-3.png)

3. 重复步骤2，直至当前节点的值小于父节点的值，或已调整到根节点
![](/assets/images/0913/2-4.png)

`向上调整` 实现代码如下：

``` java
private void fixUp(int index) {
	int currVal = arr[index];
	int parentIndex = (index - 1) / 2;
	while (parentIndex >= 0 && index != 0 && arr[parentIndex] > currVal) {
		arr[index] = arr[parentIndex];
		index = parentIndex;
		parentIndex = (index - 1) / 2;
	}

	arr[index] = currVal;
}
```

### 删除
由于堆的性质，只能删除堆顶元素，然后将堆的最后一个元素放到堆顶，再向下调整。比如对于之前的例子：

1. 取出堆顶元素 `1`，将最后一个元素 `8` 放到堆顶
![](/assets/images/0913/2-5.png)

2. `向下调整`，即与子节点比较，如果有子节点小于它则与最小的子节点交换
![](/assets/images/0913/2-6.png)

3. 重复步骤2，直至没有子节点的值比当前节点的值小，或已到达叶子节点
![](/assets/images/0913/2-7.png)

`向下调整` 实现代码如下：

``` java
private void fixDown(int index, int end) {
	int currVal = arr[index];
	int minChildIndex = 2 * index + 1;
	while (minChildIndex <= end) {
		if (minChildIndex + 1 <= end && arr[minChildIndex + 1] < arr[minChildIndex]) minChildIndex++;

		if (arr[minChildIndex] >= currVal) break;

		arr[index] = arr[minChildIndex];
		index = minChildIndex;
		minChildIndex = 2 * index + 1;
	}

	arr[index] = currVal;
}
```

### 初始化堆
对于一个给定的数组，如我们的例子：`5 8 1 5 2 4 7 9 8`，将其变成一个堆的过程如下：

1. 原始数据
![](/assets/images/0913/2-8.png)

2. 从 `最后一个非叶子节点` 开始，向下调整。以最后两个非叶子节点为根的树都已满足最小堆，无需调整
![](/assets/images/0913/2-9.png)

3. 调整以倒数第三个节点为根的子树，触发一次交换
![](/assets/images/0913/2-10.png)

4. 调整以根节点为根的子树，触发两次交换
![](/assets/images/0913/2-11.png)

实现代码如下：

``` java
private void init(int end) {
	for (int i = (end - 1) / 2; i >= 0; i++)
		fixDown(i, end);
}
```

### 堆排序
介绍了前面这些，我们终于可以运用堆进行排序了。很简单，只需要将输入数据先 `堆化`，再不断取出堆顶元素，将堆中最后一个元素放到堆顶，从堆顶开始执行 `向下调整` 即可。实现代码如下：

``` java
public int[] sort(int len) {
	init(len);

	int[] res = new int[len];
	int c = 0;

	for (int i = len; i > 0; i--) {
		res[c++] = arr[0];

		arr[0] = arr[i - 1];
		fixDown(0, i);
	}

	return res;
}
```

### 分析
堆排序使用 `完全二叉树` 构建，所以无论是怎样的数据，堆排序的时间复杂度都为 `O(nlogn)`，空间复杂度为 `O(1)`。另外，由于交换，堆排序是 `不稳定的`。

## 总结
排序算法有很多，虽然平时很少有人自己实现排序算法，了解一下常见的排序算法的实现原理总是有好处的。
