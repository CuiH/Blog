---
layout:      post
title:       "A Bug Caused by MySQL Triggers"
date:        2018-07-18 22:28:22 -0500
tags:        web mysql
description: "Something you may not know about the MySQL syntax."
---

## Background
Last month, I joined [IoTeX](https://iotex.io) as a software engineering intern. The technology stack they are using is React + Koa, which I am very familiar with, so they assigned me a big task -- implementing the point system, just after I joined.

Due to the confidentiality agreements, I can't disclose too many details, but I still want to give a brief introduction to this system.

## Point system
Every IoTeX user in our system has an account, which stores his basic information like ETH address. Now, we want to add a new `point` attribute to each user's account, with which we'll be able to give some rewards to them in future event. On one hand, these points can be redeemed to IoTeX tokens, and currently IoTeX token is available in many online exchanges, which means we'll attract more users to participate in our events and thus our community will become more active. On the other hand, we must be careful with the design of this point system, since it involves real money.

Transferring tokens to user's ETH address is another team's task. For our web team, we'll first verify the user has enough points when he makes a redemption request, and then forward this request to the API provided by the other team. At the same time, we'll decrease the corresponding points from the user's account.

Actually, what we do is decreasing the points right after we receive and verify the request. Users can check the status of each of his redemption, and the status of a new request is `redeeming`. After the user receives his IoTeX tokens, we'll then update the status to `finished`; if it fails, the points will be given back to the user, and the status of this redemption becomes `failed`.

## Accident
In the first week after this system is launched, everything works fine, and we found no security threat. However, this Tuesday, I got a message from my mentor at midnight:

> Our system is hacked.

I was really scared when I went to work in the next morning. Mentor told me that he found some user accounts tried to redeem a large number of tokens, but when he looked up their point records, they didn't have adequate points, so he disabled this feature temporarily and tried to figure out what went wrong. Nevertheless, he didn't find the issue. 

## Analyses
First, we thought this could be a `SQL injection` attack, but according to my previous experience, the DB connector we are using will escape reserved words if we use placeholder `?` in SQL statements. We did some experiments and it turned out that this possibility should be ruled out.

Then we doubted whether he hacked into our database directlt and inserted those redemption records. If so, this could be very serious, but we immediately realized that this is not possible, since there's a unique key restriction in our database that one user can only make one redemption every day, and this attacker didn't bypass this rule. After looking up the logs, we found this user created many accounts in a short time, and each account only submitted one successful redemption request. Actually, this was why he caught our eyes: in our system if someone tries to redeem a large number of tokens, admins must agree manually first. This attacker might feel too troublesome to create so many accounts, so he redeemed a large number of tokens in one single redemption, and finally got caught. If he was not that greedy and only redeem small amounts occasionally, maybe he'll never be found. His greediness led to his failure.

Of course, I have no sympathy for him, but we still want to thank him, for letting us find this bug in the early stage, so we may avoid bigger future losses.

Back to the debugging. If it was not injection and he didn't hack into our database, how did he make it?

## Discovery
We thought maybe our checking logics in the code went wrong, but after all team members went through the whole flow, we found nothing.

The security of our system relies on MySQL triggers, and here I need to point out that we are not storing a specific number indicating the points a user owns. Instead, we store point records and sum up all the records if we want to know how many points a user has.

We were helpless and suddenly the manager asked: what will happen if a user tries to redeem when he has no point records?

I didn't realize the uniqueness of this action, but when I made a trial, something amazing happened: a user can redeem any number of tokens if he has no history point records!

Finally, we found the bug, but why? The problem lies on these statements in the MySQL trigger:

``` sql
SET @v = (SELECT SUM(amount) FROM points WHERE user_id = xx);
IF @v < NEW.redeem_amount THEN
    # error handling
```

For security, I am not posting the real code. 

Here we first query all point records of the user to get his total points, and then check whether he has enough points to redeem. If not, we will reject this request.

## NULL
Before giving the answer, I'd like to show some more examples: what are the results of the following expressions in MySQL?

``` sql
NULL < 5
NULL > 5
NULL = 5
```

The answers are all `NULL`. If we compare `NULL` with and any other values, the result is always `NULL`. Even:

``` sql
NULL + 5 < 5
```

This also gives you `NULL`. If there's a `NULL` in the expression, the result will always be `NULL`.

Let's go back to the triggers in our database. If a new user, who has no point records, tries to make a redemption, we'll get a `NULL` as his total points, and in the next `IF` statement, the result is `NULL` since there's a `NULL` in the expression. `IF NULL` is equal to `IF false`, so it bypasses the validation and this request will not be rejected.

## Reflection
We all felt relieved. At the same time, we are aware of the importance of security, especially for handling `corner cases`. Attackers are always there, trying to find bugs from your product.

All in all, there will never have a application with no bug. Before a product is released, we must make thorough testing, and after the release, we must have some ways to detect unusual behaviors. If this time the attacker is not that greedy, we may have greater losses.
