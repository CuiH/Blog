---
layout:      post
title:       "Sorting Algorithms"
date:        2017-09-05 23:00:00 -0500
tags:        algorithm
description: "Introducing the principles and implementations of seven commonly seen sorting algorithms."
---

## Overview
When processing data, sorting algorithms are always used. Although most languages encapsulate those algorithms as libraries that can be easily invoked, understanding the principles of such algorithms can help us make better use of them.

If there's no special statement, in this blog we sort data in ascending order, and the initial data set is:

> 5 8 1 5 2 4 7 9 8

## Bubble sort
This is usually the first sorting algorithm for new programmers:

1. In each round, keep comparing every two neighbouring elements, and if the first one is greater, `swap` the two elements.
2. After one round, the last element in the array is the greatest one among the unsorted sequence.
3. Narrow down the unsorted sequence to exclude the last element (because it is at the right position).
4. Repeat process #1 to #3, until there's only one element in the unsorted sequence.

If you understand the principle of this algorithm, you'll know why it is called the `Bubble Sort`: after each round, the bigger elements `sink down` to the end of the array, and smaller ones `bubble up` to the front, until all elements are at their right positions. The code is as follows:

```java
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

The reason why it is regarded as an entry-level algorithm is that it is very simple, and at the same time, this algorithm is not efficient. Obviously, due to the `double loop`, the average time complexity of Bubble Sort is `O(n ^ 2)`. If the data set is extremely large, the speed of this algorithm is unacceptable. However, on the other hand, this algorithm has two advantages: it can be done within the original array, so the space complexity is `O(1)`, and it is a `stable` algorithm, which means:

> The order of the equal elements in the original array remains the same after the sort.

## Select sort
Also a entry-level sorting algorithm. The thinking is simple: each round find the smallest element in the unsorted sequence, and swap it with the first element in the sequence, and narrow down the unsorted sequence until only one element remains. The code is as follows:

```java
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


Similar to the Bubble Sort, the time complexity of `Select Sort` is `O(n ^ 2)`, and the space complexity is `O(1)`, but it is `unstable`, because each swap will possibly change the order of equal elements.

## Insert sort
As the name suggests, we maintain a sorted sequence, and insert every element from the unsorted sequence to its right position in the sorted sequence. We can do this in-place: when handling the element indexed `i`, the first `i - 1` elements are sorted, so after inserting the `i`th element, move each element behind it by one place. The code is as follows:

```java
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

## Bucket sort
This algorithm is somewhat magical, because its time complexity is `O(n)`! Let's see the implementation first:

```java
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

In fact, it's fairly simple. It just calculates the frequency of every element in the original array and save the results in another array, and then traverse the extra array to get the sorted sequence.

You may realize that though this algorithm has a low time complexity, its space complexity is high, which is `O(K)`. `K` is greatest element in the original array. Therefore, this is a typical `space-for-time` algorithm. If the distribution of data is even, it can be very efficient; but for messy data, the space consumption of this algorithm is horrible. In brief, `Bucket Sort` can only be applied to some special cases.

## Quick sort
If `Bubble Sort`, `Select Sort` and `Insert Sort` belong to the same level, we are moving to another level, starting with `Quick Sort`.

The key point of Quick Sort is `"Divide and Conquer"`, that is, divide big problem into small ones, and when all small problems are handled, the big one is therefore handled. Let's see the description of the algorithm:

1. Select one element from the array as `base element`.
2. Move all elements that are smaller than the base element to its left, and all bigger ones on the right.
3. Repeat process #1 to #3 until there is only one element in the interval.

Generally, we choose the first element of the interval as the base element. Here's an example:

1. The original array:
![](/assets/images/0913/1-0.png)

2. Select the first element as base element. Maintain two pointers `i` and `j`, pointing to the head and tail of the array respectively.
![](/assets/images/0913/1-1.png)

3. Move `j` to the left, to find the `first` element that is `smaller` than the base element. Extract it and fill it to the location that `i` points to.
![](/assets/images/0913/1-2.png)

4. Move `i` to the right, to find the `first` element that is `bigger` than the base element. Extract it and fill it to the location that `j` points to.
![](/assets/images/0913/1-3.png)

5. Repeat process #3 to #4, until `i` meets `j`.
![](/assets/images/0913/1-4.png)

6. Put the base element at the position that `i` (or `j`) points to.
![](/assets/images/0913/1-6.png)

*Attention: in process #3, it must start from the `rightmost` element.

The code is as follows:

```java
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

As for an array with length `n`, suppose every time the base element divides the array into two parts of equal length, then:

![](/assets/images/0913/1-l.png)

All `logn` rounds are needed, and each round the whole array will be accessed, so the average time complexity is `O(nlogn)`. Since the sorting is done in-place, and no extra space is used, the space complexity is `O(1)`. In addition, obviously, due to the swap, Quick Sort is `unstable`.

## Merge Sort
First, if we have two sorted array, how to merge them into one sorted array? I believe you know the answer: keep comparing the first elements of the two array, and each time extract the smaller one to the result array, until one of the array becomes empty. Finally append the not-empty array to the end of the result array:

```java
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

1. Divide the array into two parts, and do Merge Sort on them respectively.
2. Merge the two sorted result array.
3. Repeat process #1 to #3, until there's only one element in the interval.

Improve the above code a little bit, and we have the implementation:

```java
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

Similar to the Quick Sort, the time complexity of Merge Sort is `O(nlongn)`, but in the process of merging, we need at most one auxiliary array with the same lengh as the original array, so the space complexity is `O(n)`. Besides, if we guarantee that every time the head elements of the two array are equal, element from the first array is selected, Merge Sort can be `stable`.

## Heap sort
`Heap Sort` uses a special data structure -- `heap`, and its implementation is somewhat more complicate than the previous algorithms. Let's begin with `Heap`.

### Heap
Since we are sorting in ascending order, I will introduce the `Minimum Heap`:

1. A minimum heap is a `complete binary tree`.
2. The parent node is always smaller than (or equal to) its children.
3. Children are also minimum heaps.

### Storing in an array
As I mentioned above, heap is a `complete binary tree`, so we can use some tricks to store a heap in an array, and easily access nodes by indices. For example, if we have the following heap:

![](/assets/images/0913/2-0.png)

Put every node into an array according to its `level-traversal` order:

![](/assets/images/0913/2-1.png)

You will find that for every node indexed `i`, the index of its left child is `2 * i + 1`, the index of the right child is `2 * i + 2`, and the index of its parent is `(i - 1) / 2`.

### Insertion
As for the heap above, if we want to insert `2` into it:

1. Put the new element at the end of the array.
![](/assets/images/0913/2-2.png)

2. `"Adjust upward"`, that is, compare it with the parent node. If it is smaller than its parent, swap them.
![](/assets/images/0913/2-3.png)

3. Repeat process #2, until current node is bigger than the parent node, or it reaches the root.
![](/assets/images/0913/2-4.png)

The code for `"adjust upward"`:

```java
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
Becuase of the characteristics of the heap, deletion can only be done on the top element. After a deletion, we move the last element of the heap to the top, and `"adjust downward"`. Again the previous example:

1. Extract the top element `1`, and move the last element `8` to the top.
![](/assets/images/0913/2-5.png)

2. `"Adjust downward"`, that is, compare it with all children. If either children is smaller than it, swap them.
![](/assets/images/0913/2-6.png)

3. Repeat process #2, until no child is smaller than current node, or it reaches a leaf.
![](/assets/images/0913/2-7.png)

The code for `"adjust downward"`:

```java
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
For a given array, say our example, `5 8 1 5 2 4 7 9 8`, the processes to transform it into a heap is as follows:

1. The initial data.
![](/assets/images/0913/2-8.png)

2. Start from `the last node other than the leaves`, adjust downward. Since the last two not-leaf nodes are currently minimum heaps, they will not be adjusted.
![](/assets/images/0913/2-9.png)

3. Adjust the subtree rooted by the last but two node, and it triggers one swap.
![](/assets/images/0913/2-10.png)

4. Adjust the subtree rooted by the root (the whole tree), and it triggers two swaps.
![](/assets/images/0913/2-11.png)

The code is as follows:

```java
private void init(int end) {
    for (int i = (end - 1) / 2; i >= 0; i++)
        fixDown(i, end);
}
```

### Heap sort
After introducing the heap, we can finally come to the Heap Sort. Simply, we just `heapify` (initialize) the array, and keep extracting the top element, moving the last element to the top, and `adjusting downward` from the top. The code is as follows:

```java
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
Heap Sort utilizes `complete binary tree`, so no matter what type of data we have, the time complexity of Heap Sort is `O(nlogn)`, and the space complexity is `O(1)`. Besides, due to the swap, Heap sort is `unstable`.

## Summary
There are so many sorting algorithms. Although we seldom have the chance to implement them personally, having a understanding of the their principles is always benefical.
