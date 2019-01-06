---
layout:      post
title:       "Design an Online Forum"
date:        2019-01-03 17:16:22 -0700
tags:        design web
description: "Modeling a multi-level online forum."
---

## Introduction

In this article, let's try to model an online forum with the following requirements:

1. There will be sub-forums formed in a tree-like multi-level structure.
2. Each forum will have owner and administrators. Different role have differernt privileges.
3. Under each forum, all threads from that forum as well as all its sub-forums will be displayed.

## The schema design

For `req. #1`, you may first come up with the same idea of storing a tree: each forum will know its direct parent and maybe also its children:

```
+-------------------------+
| id: integer             |
| name: string            |
| parent_id: integer      |
| children_ids: [integer] |
+-------------------------+
```

However, this cannot resolve the `req. #3`. With this structure, finding all threads from all sub-forums of a forum will be really hard. Maybe we can store the parent-child relationships in the cache, but this is way too complex.

Then, inspired by the linux file system, maybe we can add a `path` field to the `forum` schema. Definitely, there must be a `root` forum in this structure, and all other forums will be its children.

Another issue is, what will the path consist of? The names? Please notice that the name of a forum can be changed, so using names in paths will cause great burden when updating the name of a high-level forum. Here we have to use a `global id` for the paths.

The root forum will have path `/`, and its direct children may be `/1/`, `/2/` and so on. If we create a new sub-forum based on a forum with path `/x/`, the path of the new forum will be `/x/id++`:

```
new path = parent_path + '/' + (global_id++) + '/'
```

![](/assets/images/190103/1.png)

Now, if we also add this `path` field to the `thread` schema, retrieving threads from all sub-forums will be as simple as searching by prefix. For instance, in forum `Film`, the query for getting all its threads will be getting threads with prefix `/1/` for the `path` field.

Note that the ending slash `/` in each `path` cannot be omitted. Before reading the next section, please take a moment to think about the reason.

## The ending slash

The ending slash in the `path` is not graceful, but it is important. It protects us from a potential bug.

If we remove the ending slash from the paths, when the number of forums is less than 10, everything will be fine, but the forum with path `/10` will become a nightmare. The query for retrieving threads of forum `/1` will also give us threads from this from `/10`, because `/10` has the prefix `/1`, but it is not a child of forum `/1`!

The ending slash should not be omitted.

## Access control

Now we have addressed the `req. #1` and `req. #3`. How about the access control?

In fact, with the current design, we can easily implement an access control module. For each forum, we maintain the `path` field, which gives us the parent-child relationship of a given forum. We can exploit this to define the accessibility of a user to a forum.

In the `user` schema, an `admined_paths` is added, storing the paths of forums that he is an admin of. Here some obvious facts that could be inferred:

1. The admin of a forum can create new sub-forums; otherwise only the root admin can create new forums.
2. The admin of a forum will have owner access to all sub-forums of that forum.
3. No need to store the `owned_paths` in the `user` schema, because if someone is the owner of a forum, he must be the admin of one of the parent forums of that forum.
4. A user cannot be an admin of a forum if he is the owner/admin of any of its parents.

If we want to know whether someone has admin access to a forum, we can easily go through his `admined_paths` to see whether any of the paths is the same as or is the parent of the path of that forum. Similarly, to see whether he has owner access to a forum, we will give positive answer only when any of his paths is the parent of that forum.

For example, user `A` admins `/1/2/`, he will have admin access to `/1/2/` and `/1/2/4/`, but he will only have owner access to `/1/2/4/`.

Everything works well!

## Revocations

We only discussed the grant of privileges, that is, adding a path to the `admined_paths` of a user. What if we want to revoke one of his paths? That could be a design issue, which has no correct answer. One problem is, if someone created a new sub-forum and he is then removed from the admin list of the parent forum, should he still be able to manage the forum he created? That's beyond the scope of this article so I won't go further with this topic.

## Conclusion

The design of a big system involves many considerations. Today I just gave a brief example of the modeling of an online forum. That's not a complete solution but hope it could help someone to some extend.
