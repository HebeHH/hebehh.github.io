---
title: "HashiCorp's Vault"
date: 2020-08-07 01:14:07
image: '/assets/'
description:
tags: devops KMS
categories: snippets
---

At Staple, we recently realized that we've passed the *make it work* and  *make it work well* stages, and have now reached *make sure it never stops working*. Part of this involves implementing a proper Key Management System, to prevent our various secrets from leaking all over the internet.  We chose Vault.



As a project is built out, it gathers more and more keys and secrets that should really remain as private as possible. The potential consequences of breached confidentiality can vary from unauthorized API calls to a data leak; potentially costly in money and reputation. It's helpful to have some extra encryptions and abstraction to manage access to everything.

Today I made my way through most of the [Getting Started](https://learn.hashicorp.com/collections/vault/getting-started) Docs, which are actually a great guide to get to know the Vault through experience, without throwing you in the deep end. However, it did take me awhile to gain a big-picture understanding of what exactly was going on, so I thought I'd try consolidating my thoughts in a way that might be useful to other people without experience with KVMs.

The Vault is pretty easy to use, and I've liked using it so far. I'd say it has three main aspects:

* Secrets Engines
* Authentication
* Access levels

<hr>

### Secrets Engines

These are the main point of the Vault: how secrets are harboured. A secret engine is basically a way to store a type of secret. The most basic (default) is your typical key-value storage: you store a key and a value. However, there's a lot more possibility here. You can store secrets in other formats, such as dynamic secrets. Here, you can give the secret engine different configs, and it will generate a new secret to the spec each time.

The AWS secret engine is one of the things that drew me to Vault. You link the engine to your AWS account, and you can use it to generate new IAM profiles and access keys for whenever they're needed. For instance, I can tell Vault to save me a user role that will have access to all EC2 abilities. Anytime someone reads from this secret, they'll get a new user with their own access keys and such, which will expire in a set number of hours, that can be deleted anytime I want. I like that power. Which means I probably shouldn't be given it. Oh well.

Each secrets engine is it's own lil thing, and they've got a variety already set up. Not just AWS, but databases, Google Cloud, SSH, RabbitMQ, etcetera. This makes it easy to consolidate all of your secrets into the Vault, instead of needing to manage each tool separately. Data can be segmented further wihin each secret engine, by assigning different paths to different sections. For instance, I can create a KV secret engine at `kv`, then store the important things in `kv/valuable` and the less important things in `kv/nodbodycares`.

### Authentication

A secrets engine isn't that useful if just anyone can access it. Makes the secrets a little less secret. Unless we're going for the whole obscurity = security argument, which fails as soon as you're big enough to actually need the security.

Again, this is also where Vault is quite nice; it comes with a lot of different authentication methods already set up. All you need to do is enable and configure. Authentication can be gained by GitHub tokens, AWS accounts, Kubernetes SATs, etcetera. This makes it easy to control which people and machines have access, and how much access. I can let everyone in our GitHub org authenticate themselves, and then give them access according to which team they're in. This also makes the Vault very much a one-stop solution; all the other devs can get secrets by asking the API with their GitHub credentials, while the AWS EC2 instance can send the same API request with it's metadata as credentials.

Basically: authentication is how Vault knows who is logging in. 

### Access levels (aka Policies)

We have secrets, and we have clients who wish to access those secrets. However, not all clients should be able to access all secrets. Vault resolves this with *policies*. A policy defines opt-in access for the different secrets. One policy can have different rights to different parts of the secrets engines.

For example, I can define a `developer` policy that gives read access to the Google Cloud secrets engine and write access to the `kv/whocares` section of the KV secrets engine. I can create a `devops` policy that has write access to the AWS secrets engine.

To give clients access to different things, we associate authorization paths with policies. The GitHub authorization pathway can be linked to the `developer` policy, so that anyone who logs in with a GitHub token can read from the Google Cloud secrets engine. This could be made more specific - perhaps we only want to give this to people who are part of the organization's backend team (as defined in the GitHub organization). Each authorization pathway can be associated with multiple policies, and each policy can be used for multiple authorization pathways.

Now we have a proper Vault; a repository of secrets, where each authorized person can see only as much as they should.

<hr>

There's a lot more to it, of course - command line syntax, REST API, configuration and initialization, secret expiration and revocation - but I'm not going to get into that here. Honestly, there's no need to, as HashiCorp's Vault documentation is some of the best I've seen. 

Vault in general gets five stars for ease of use. I like their simple and consistent command line syntax, which comes with `help` commands that are actually very helpful. It was easy to spin up and spin down. The various secrets engine and authentication extensions were simple to implement. I haven't fully explored the REST API yet, but the `-output-curl-string` CLI option promises to be very helpful!

Overall: I like it. 10/10.

<hr>

I've done this on a new baby AWS EC2 instance I created just to act as a cute lil playground. Will keep this instance around for when I want to test things with the assurance that it works 1) remotely 2) purely in command line.

Today's silly moment: when I kept googling around to work out how to install the Vault via command line, and kept getting very complicated answers. Then I came back to the docs, and realized that I was on the *Manual* installationtab - they also have instructions for installing it on most major OS via command line. These are definitely some of the better docs I've seen.