---
layout:      post
title:       "SSL/TLS and Secure Transmission"
date:        2017-11-12 22:14:22 -0500
tags:        web
description: "How to send messages securely under an insecure network."
---

## Overview
If you are familiar with the Internet, you'll know that the underlying `TCP/IP` protocol stack is not a secure one. We need to do something on top of it to ensure secure transmission, and `SSL/TLS` is a common but powerful solution.

## Encryption and PKI
Before we really get into the implementation, I'd like to introduce some basic knowledge.

Secure transmission is always about encryption. There are two different encryption methods, the `symmetric encryption` and the `asymmetric encryption`.

### Symmetric encryption
A symmetric encryption uses exactly `one` key to encrypt and decrypt the message, so this key should be always kept secret.

![](/assets/images/1112/1.png)

### Asymmetric encryption
In contrast to the symmetric encryption, an asymmetric encryption has `two` different keys. Messages are encrypted by one key and decrypted with another. In most cases, one of the keys is released to the public, called the `public key`, while the other one is the `secret key`. Such a system is known as the `public-key cryptography`.

![](/assets/images/1112/2.png)

### Public key infrastructure
Based on asymmetric encryption, we can build a `public key infrastructure` (PKI), which may involve many roles and polices. The purpose of a PKI is to facilitate the secure electronic transmission. I will discuss it later in this blog.

## Secure transmission
Let's try to build a secure communication system. Say our old friends, Alice and Bob, are sending messages to each other.

### Integrity
First, we need to consider the `integrity`, which means the message is complete and not modified by a man-in-the-middle.

Here we make use of the public-key cryptography. A `digest` of the message is calculated on the sender side, and Bob encrypts it with his `secret key`. The encrypted digest is also called the `digital signature`.

> A digital signature is a mathematical scheme for demonstrating the authenticity of digital messages or documents.

Since the secret key is only known to Bob, only he can make this encrypted digest. This "signature" can prove his identity and it is undeniable. 

After that, Bob sends both the message and the encrypted digest. Alice again calculates the digest using the same algorithm, and decrypts the encrypted digest with Bob’s `public key`. If the two digests are the same, Alice will know that the message is complete.

![](/assets/images/1112/3.png)

### Privacy
Alice and Bod do not want their messages to be read by others. Note that messages are sent from both sides, and there is always a public key in the public-key cryptosystem. A possible solution is to use two sets of keys, so there are two public keys and two secret keys, which may be somewhat inconvenient. 

In this case, we can use the symmetric encryption instead. Another reason is that asymmetric encryption is time-consuming, so if we want to encrypt the whole message, the symmetric one is a more efficient choice.

![](/assets/images/1112/4.png)

The `session key` in this picture should be kept secret, so how can the sever and the client generate the same key respectively and, at the same time, secretly? You'll see that later.

### Unforgeability
In a public-key cryptosystem, where does the public key come from? What if someone else, such as Tom, tells Alice that he is Bob, and gives Alice his own public key, he can then deceive Alice in the name of Bob.

We need a third-party authority here, called the `certificate authority` (CA). Bob first registers himself to the CA with his public key, and he will receive a `digital certificate`. When Alice asks for Bob's public key, Bob gives her the certificate. Alice validates it and gets the real public key.

So, how can Alice validate the digital certificate? Again, the public-key cryptography.

![](/assets/images/1112/5.png)

Now, with the public-key encryption algorithm and the CA, we have built a draft `public key infrastructure`.

### Session key
There is still one problem left. In the "privacy" section, a symmetric session key is used to encrypt the message. Where is it from?

With current structure, we can easily generate it. After retrieving Bob’s public key, Alice can safely communicate with Bob, and during the first several conversations, they discuss a session key for all subsequent communications. After that every message is encrypted by the session key so no one else can eavesdrop on or tamper with it.

![](/assets/images/1112/6.png)

## SSL/TLS
Where is SSL/TLS? In fact, we have just discussed the three main characteristics of it. The SSL/TLS ensures:

* Integrity
* Privacy
* Unforgeability

The picture in the "session key" section is the `handshaking phase` of SSL/TLS, where Bob is the server, and Alice is the client. 

In some cases, the server may also request client certificate to verify its identity, such as in a bank system.

Now that we know how SSL/TLS works, let's look back at the description.

> `SSL` is the abbreviation of `Secure Socket Layer`. It's a cryptographic protocol that provides communications security over a computer network, and after standardization, it has a new name -- `SSL`, which means `Transport Layer Security`.

## Summary
We always need secure transmission, but the underlying Internet is not secure. Luckily, we have SSL/TLS. It protects messages from being forged, eavesdroped on, or tampered with. 

First, the sender cannot deny his signature after encrypting the message with his own secret key `(undeniability)`. Second, the receiver can verify the signature with the sender’s public key. Since no one else knows the secret key, digital signature cannot be forged `(authenticity)`, and at the same time, messages cannot be eavesdroped on `(privacy)` or tampered with `(integrity)`.
