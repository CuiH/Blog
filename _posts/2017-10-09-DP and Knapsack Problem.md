---
layout:      post
title:       "DP and Knapsack Problem"
date:        2017-10-09 23:30:00 -0500
tags:        algorithm
description: "The introduction to DP and three types of knapsack problems."
---

## Overview
DP stands for `dynamic programming`, which is very common in sloving problems. Many people tend to think that it is difficult, but actually, if you understand the principles, it can be easy to use. In this blog, I will give a brief introduction to DP and analyze with maybe the most typical DP problem, the `knapsack problem`.

## An example
Let's see a problem on leetcode first, `#322 Coin Change`:

> You are given coins of different denominations and a total amount of money amount. Write a function to compute the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.
> 
> Example:
> coins = [1, 2, 5], amount = 11
> return 3 (11 = 5 + 5 + 1)
>
> Note:
> You may assume that you have an infinite number of each kind of coin.

At the first sight, a brute-force solution is quite straight-forward, that is, try every possible combinations and find the optimal one. So why don't we start from that?

### The Easiest Recursion Solution
It sounds good to use a recursion to handle this problem, and the code is rather simple:

```java
public int coinChangeWithRecursion(int[] coins, int amount) {
    if (amount == 0) return 0;

    int minCount = Integer.MAX_VALUE;
    for (int coin: coins) {
        if (coin <= amount) {
            int rest = coinChangeWithRecursion(coins, amount - coin);
            if (rest != -1) minCount = Math.min(minCount, rest + 1);
        }
    }

    return minCount == Integer.MAX_VALUE ? -1 : minCount;
}
```

However, obviously, the result is TLE, because the code will do many duplicate works. For example, if we have coins `[1, 2, 3]`, and the target amount is `20`. When we reach current amount of `1 + 2 + 2 (= 5)` and `2 + 3 (= 5)`, the rest of the code will do the same job, that try to find the minimum coins to make up `(20 - 5 =) 15`. As the target amount becomes larger, there will be exponentially more duplicate calculations. So, how to improve?

### Recursion With Memorization
As we have analyzed the drawback of the recurssive solution, an intuitive improvement is to memorize every minCount(amount) we have already calculated, and return it when needed:

```java
private Map<Integer, Integer> memo = new HashMap<>();

public int coinChangeWithRecursionAndMemorization(int[] coins, int amount) {
    if (memo.containsKey(amount)) return memo.get(amount);

    if (amount == 0) return 0;

    int minCount = Integer.MAX_VALUE;
    for (int coin: coins) {
        if (coin <= amount) {
            int rest = coinChangeWithRecursionAndMemorization(coins, amount - coin);
            if (rest != -1) minCount = Math.min(minCount, rest + 1);
        }
    }

    if (minCount == Integer.MAX_VALUE) {
        memo.put(amount, -1);

        return -1;
    } else {
        memo.put(amount, minCount);

        return minCount;
    }
}
```

This solution can pass the online judge, but we still need to call the method to check whether we have memorized a result, which may cause a stackoverflow problem if the `amount` is extremely large. What about using an array?

### A Better Solution -- DP

Since we'll always calculate from big `amount` to small `amount`, why don't we start from small `amount` and remember the results, and thus big `amount` can directly use them to calculate its own result:

```java

public int coinChangeWithDP(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    
    for (int i = 1; i <= amount; i++) {
        int min = amount + 1;
        for (int j = 0; j < coins.length; j++)
            if (i >= coins[j]) min = Math.min(min, dp[i - coins[j]] + 1);
        
        dp[i] = min;
    }
    
    if (dp[amount] == amount + 1) return -1;
    else return dp[amount];
}
```

This is what we call `DP`.

## The Simplest Knapsack Problem
Now that we have learnt what `DP` is, we can move to perhaps the most typical DP problem, the `knapsack problem`. Actually, there are many variations of this problem, so we will begin with the simplest one, the `0/1 knapsack problem`.

> Suppose there are many objects with different weights and values, and you have a knapsack of limited capacity, how to fill in the knapsack to achieve the highest total value?

It is called the `0/1 knapsack` because for each item, you can either pick it or not. If you are sensitive, you'll realize that this problem is just like the previous `coin change` problem! The only difference is that we want to find the maximum total value rather than the minimum coin count.

For a DP problem, the most important task is to find the `state transition equation`. Following the principle in the coin problem, we start from small problems, and use an array to remember calculated results, i.e., `dp[n][c]`, where `n` is the number of items, and `c` is the capacity of the knapsack. For each state, we can find the maximum value by trying all two possibiities, that is, to `include` that item or `not`. The equation is:

```
dp[i][j] = max(dp[i - 1][j - weight[i]] + value[i], dp[i - 1][j])
```

The pseudocode is as follows:

```
for i = [1 ... n]
    for j = [weight[i] ... capacity]
        dp[i][j] = max(dp[i - 1][j - weight[i]] + value[i], dp[i - 1][j])
```

Attention that `j` starts from `weight[i]` since an item won't be considered if its weight is greater than the capacity of the knapsack.

The final result is in `dp[n][c]`.

This code can still be optimized. You may find the first dimension of the array is somewhat redundant because we only use the previous `one` round results. Therefore, we can adopt a `rolling array` to save space.

Actually, the only reason why we use a two-dimension array is to avoid putting in one item multiple times, but if we start from the `back`, one dimension is enougth, since we only use the results of smaller capacities (j - weight[i]):

```
for i = [0 ... n)
    for j = [capacity ... weight[i]]
        dp[j] = max(dp[j - weight[i]] + value[i], dp[j])
```

## The Complete Knapsack Problem
It is similar to the 0/1 knapsack, but this time, we can use an item multiple times. It's simple! As we have just discussed, to avoid counting one item more than once, we start from the back, so for a `complete knapsack`, we just simply start from the beginning:

```
for i = [0 ... n)
    for j = [weight[i] ... capacity]
        dp[j] = max(dp[j - weight[i]] + value[i], dp[j])
```

## The Multidimensional Knapsack Problem
There is an example on LeetCode, `#474 Ones and Zeroes`:

> In the computer world, use restricted resource you have to generate maximum benefit is what we always want to pursue.
>
> For now, suppose you are a dominator of m 0s and n 1s respectively. On the other hand, there is an array with strings consisting of only 0s and 1s.
>
> Now your task is to find the maximum number of strings that you can form with given m 0s and n 1s. Each 0 and 1 can be used at most once.
>
> Example:
> Input: Array = {"10", "0001", "111001", "1", "0"}, m = 5, n = 3
> Output: 4
> Explanation: This are totally 4 strings can be formed by the using of 5 0s and 3 1s, which are “10,”0001”,”1”,”0”

The major difference is that now the `knapsack` has two restrictions, i.e., `1`s and `0`s, but the principle never changes. Similar to the rolling array 0/1 knapsack solution, we use a two-dimension array to remember the states, and try to include every string, from the back to front (to avoid using one string more than once):

```java
public int findMaxForm(String[] strs, int m, int n) {
    int[][] c = new int[strs.length][2];
    for (int i = 0; i < strs.length; i++) {
        for (char ch: strs[i].toCharArray()) {
            if (ch == '0') c[i][0]++;
            else c[i][1]++;
        }
    }

    int[][] dp = new int[m + 1][n + 1];
    for (int t = 0; t < strs.length; t++)
        for (int i = m; i >= c[t][0]; i--)
            for (int j = n; j >= c[t][1]; j--)
                dp[i][j] = Math.max(dp[i][j], dp[i - c[t][0]][j - c[t][1]] + 1);
    
    return dp[m][n];
}
```

## Summary
The DP is a very powerful tool, but to know whether a problem can be solved with DP, and how to derive the state transition equation, it requires many exercises.
