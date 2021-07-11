---
title: "DockerCon Review: Smaller, Secure Surfaces"
date: 2021-06-06 01:14:07
image: '/assets/'
excerpt: Containerization isn't a fix-all for security. The software supply chain must be transparent, robust and continuously maintained. The attack surface should be kept as small and inaccessible as possible.
tags: Docker security
categories: medium
---


Your product's *Software Supply Chain* is everything that your code rests on; the dependencies, the dependencies of dependencies, the different pipeline tools you use. Much like a physical supply chain, you want to be very aware of this, because any weakness or failure in your supply chain will cause a failure in your application. A lot of websites include Fastly in their supply chain as the CDN - so when Fastly went down earlier this month, it took half the internet with it.

Another way to view this is as the *Attack Surface*. This concept came up a lot, as different talks covered how every single thing in your Docker image is a possible vulnerability. I like this term, because you intuitively realize that you want this *surface* to be as small and unexposed as possible. 

This year, I had the pleasure of attending DockerCon 2021. I was particularly excited - I work for a FinTech startup, Staple and all our workloads are containerized, so this is a useful conference to ensure we're up to speed with best practices, particularly around security.

Many of the talks used the frameworks of supply chain and attack surface to approach the problem of minimizing vulnerability while using Docker. The software supply chain must be *transparent, robust* and *continuously maintained*. The attack surface should be kept as *small* and *inaccessible* as possible.

These overarching principles dictate several concrete best practices to be incorporate at each stage in your development flow:

1. Minimal Base Images
2. Minimize Dependencies
3. Multi-stage Builds
4. Image Insights
5. Constant Maintenance

Let's go over each of these and understand what they mean, and how Staple implements them in practice.



**Minimal Base Images**

Each application pulls from a base OS image to build on. These range from completely minimal, with barely a package manager installed, to comprehensive systems including every library you'll ever need. It's very tempting to always opt for the latter - it saves time and effort building your own Dockerfile, and means  you're never caught out by a missing library (for me, it's always `curl` that's never installed when I'm trying to debug).

However, that base image makes up the *majority* of your attack surface. Starting out with everything preinstalled is easy, but risky. You don't even know all the libraries, let alone all the security risks associated with them. This is a simple way to unknowingly introduce massive vulnerabilities. Large base images hide the details of your supply chain and expand your attack surface massively.



**Minimize Dependencies**

Dependencies, I learned from DockerCon, are to be viewed with mistrustful loathing. They are bloated, unknown blobs of risky code that's probably never seen a security review in their lifetime. No matter that this or that library is used by a million other companies, including FAANG - if you didn't review the library yourself, why would you expect that anyone else has? Not to mention, it's out of your control - do you want to repeat the [leftpad crisis](https://qz.com/646467/how-one-programmer-broke-the-internet-by-deleting-a-tiny-piece-of-code/)? Maliciousness isn't required when incompetence and haste will do the trick. A sprawling dependency tree complicates your supply chain and expands your attack surface.

Writing everything yourself might be safer, but it's on the wrong side of feasability. The best option is to just ensure you're not using a single package more than necessary. At the start of this year, Staple went through all of our codebases and trimmed the dependency fat. We combed through our code to consolidate into fewer libraries where possible, and standardized our library usage across all services, so our product's total attack surface is smaller. Maintaining this is now part of our ongoing processes.



**Multistage Builds**

In a rare marriage of speed and security, multistage builds finish more quickly and better conceals your information. By putting the majority of installs and structure into one build, then pulling from that for the final Docker image, you can remove the middle state information from the final product. You also protect more of your attack surface, since interrogating the final image doesn't reveal much.

While Staple did not previously use multistage builds, DockerCon sold them well enough that it is a main feature card in our current sprint. 



**Image Insights**

Good tools can make a world of difference in clarity. For Docker, there's two main categories: *linting* and *scanning*. A linter goes through your Dockerfile and suggests improvements and best practices. Scanning tools go through your application and raise any known vulnerabilities it finds, particularly around (you guessed it) dependencies. These give you information about your supply chain, and recommendations on how to restructure to make it better.

Staple uses Whitesource Bolt to perform ongoing code-level vulnerability scans, which have seen us update a major part of the dependency tree. The last year has also seen the image scanning tool Snyk partner with Docker, so a full image scan can be performed easily from the command line with `docker scan`. Since we were in the market for a good linter, I asked around at DockerCon and got several strong recommendations for [hadolint](https://github.com/hadolint/hadolint).



**Constant Maintenance**

Security requires constant vigilance. It's not enough to do everything once, then forget about it when the sprint is over. Everything you build can introduce new issues. Even if you never write another line of code again, new vulnerabilities will be discovered and subsequently patched in your existing libraries. All the above processes must be stuck to, and continuously updated.

At Staple, security is part of the development process. As we build new code, we maintain an awareness of each new library we're importing and surface we're exposing. A feature is only considered complete when everything has been locked down, only moved to production after all the open dev vectors have been snipped. Vulnerability scanning is part of our CI/CD process, and those tickets are always prioritized.