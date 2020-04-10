---
title: "Brittle File I/O"
date: 2020-11-04 09:40:07
image: '/assets/'
excerpt: "Today I spent about two minutes writing a little python batch processor, and then another ten wondering why it suddenly stopped working. It was a good reminder that platform-independence is hard to come by, no matter how high-level and abstract the language."
tags: python bash portability
categories: snippets
twitter_text:
---


Today I spent about two minutes writing a little python batch processor, and then another ten wondering why it suddenly stopped working. It was a good reminder that platform-independence is hard to come by, no matter how high-level and abstract the language.

<hr>

I have a folder of Lift programs to parse and compile. The compiler is working (at long last), so all that's left is to write a nice batch processor:

~~~python
from os import listdir, path.isfile, path.join

folder_name = 'highlevel/'
files = [f for f in listdir(folder_name) if isfile(join(folder_name, f))]

for file in files:
  my_compiler(file)
~~~

I run this. It works. I export the IPython notebook to plain `.py` and run it in the command line. It works.

Good grief, but it is taking forever, and I want to go to bed.  I could leave it overnight, but my laptop suffers from narcolepsy. This is what my Digital Ocean droplet is for.

I quickly `ssh` in and `git clone` the repository, before running it again.

It doesn't work.

What?

~~~bash
>>> no such file or directory: 'highlevel/' 
~~~

But. But. But.

That doesn't make sense.

This is an *exact clone* of my local repository. 

<hr>

Let me double-check that, just in case I forgot a `commit` or `push` somewhere in there.

~~~bash
ls -d */
>>> curr/			highLevel/
~~~

Oh. It's a straightforward bug: I didn't spell *highLevel* correctly. That makes sense, I've made similar mistakes before. Of course it throws an error. But I'm still  confused.

Why did it work originally?

<hr>

See, my personal computer is a Macbook. My droplet, however, runs Linux. I didn't think this would be an issue, though - all my code is in Python3. That's a high enough language to be completely portable, right?

Wrong. Especially when you start using libraries. Especially when you start using I/O libraries. I/O is typically the greatest threat to cross-platform-ness, and this is no exception.

According to [the docs](https://docs.python.org/3/library/os.html), the `os` module "provides a portable way of using operating system dependent functionality." This second part of this sentence is perhaps more relevant than the first. While the module provides standardized hooks into OS services, the behaviour of the OS services can vary. I didn't expect this to happen between MacOS and Linux since they're both POSIX compliant, so `os` uses the same system calls. Unfortunately, there's room for heterogeneity between POSIX systems.

<hr>

**In short:** Linux shell is case-sensitive by default. MacOS is not. 

This affects the command line, but also any other program that resolves into system calls.

<hr>

Before anyone mentions it - yes, I did write a compiler in Python3, and yes, it was indeed an utterly terrible idea. More on that later.