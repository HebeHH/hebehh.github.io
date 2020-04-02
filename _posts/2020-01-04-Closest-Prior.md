---
title: "Getting the Closest Prior from a list"
date: 2020-01-04 09:40:07
image: '/assets/'
excerpt: "Sometimes I'll spend half an hour coming up with a complex, elegant solution to a problem, then instantly be hit by a simple fix that makes all that work worthless."
tags: lists javascript
categories: snippets
twitter_text:
---

So recently Hrishi came up to me and asked how I'd write a sort function that would, given a number `x`, sort a list such that the first item would be the one closest to, but smaller than, `x`. He wanted to use this in a function to get the closest prior from a list. Basically:

~~~javascript
var ls = [3,6,2,1,7,3,5,9]
get_closest_prior(8, ls)
>> 7
get_closest_prior(5, ls)
>> 5
~~~

The conversation went something like this.



**Me:** Why don't you just iterate?

**Him:**  I don't want to iterate, sorting's generally faster with less comparisons. Because inbuilt functions.

**Me:** Fair, but how are you sorting?

**Him:** That's what I'm asking you.

**Me:** Uhhh... give me a sec.



So in my mind there's two parts to this. You want all numbers greater than `x` to be at the end of the list. Then, at the front of the list, you want all numbers smaller than `x` to be sorted in reverse order. Basically, given a sorted list with `x` in the middle:

<div style="height:1.5em;width:100%"> 
  <div style="height:1.5em;width:40%;margin-left:10%;float:left">&larr; smallest</div>
  <div style="height:1.5em;width:0.8em;float:left;text-align:center"><strong>x</strong></div>
  <div style="height:1.5em;width:40%;float:left;text-align:right">biggest &rarr;</div>
</div> 
<div style="height:1.5em;width:100%"> 
  <div style="background:linear-gradient(to right, #24C6DC, #4788bc); height:1.5em;width:40%;margin-left:10%;float:left"></div>
  <div style="height:1.5em;width:0.8em;float:left;text-align:center
"><sup>^</sup></div>
  <div style="background:linear-gradient(to right, #4788bc, #514A9D); height:1.5em;width:40%;float:left"></div>
</div> 

You want to sort the list something like this:

<div style="height:1.5em;width:100%"> 
  <div style="background:linear-gradient(to right, #4788bc, #24C6DC); height:1.5em;width:40%;margin-left:10%;float:left"></div><div style="height:1.5em;width:0.8em;float:left;text-align:center"></div>
  <div style="background:linear-gradient(to right, #4788bc, #514A9D); height:1.5em;width:40%;float:left"></div>
</div> 

I gave him this sorting function, with an appropriate try/catch block to handle divide by zero errors. Using try/catch means that the additional comparisons (ie whether a or b is equal to x) are only performed when necessary, instead of every time.

~~~javascript
function sort_closest_prior(x, a, b) {
  if (1/(a-x) > 1/(b-x)) {
        return 1
    } else {
   			return -1
    }
}
~~~

This sort function is basically normal sort, on a transformed array. Each array element `e` is transformed by $$\frac{1}{e-x}$$. Subtracting `x` recenters the array so that `x` = zero,

<div style="height:1.5em;width:100%"> 
  <div style="height:1.5em;width:40%;margin-left:10%;float:left">&larr; negative</div>
  <div style="height:1.5em;width:0.8em;float:left;text-align:center"><strong>0</strong></div>
  <div style="height:1.5em;width:40%;float:left;text-align:right">positive &rarr;</div>
</div> 
<div style="height:1.5em;width:100%"> 
  <div style="background:linear-gradient(to right, #24C6DC, #4788bc); height:1.5em;width:40%;margin-left:10%;float:left"></div>
  <div style="height:1.5em;width:0.8em;float:left;text-align:center
"><sup>^</sup></div>
  <div style="background:linear-gradient(to right, #4788bc, #514A9D); height:1.5em;width:40%;float:left"></div>
</div> 

and then dividing by that inverts the magnitude of each number, to leave the closest prior as the smallest item in the transformed array.

<div style="height:1.5em;width:100%"> 
  <div style="height:1.5em;width:40%;margin-left:10%;float:left">&larr; negative</div>
  <div style="height:1.5em;width:0.8em;float:left;text-align:center"><strong>0</strong></div>
  <div style="height:1.5em;width:40%;float:left;text-align:right">positive &rarr;</div>
</div> 
<div style="height:1.5em;width:100%"> 
  <div style="background:linear-gradient(to right, #4788bc, #24C6DC); height:1.5em;width:40%;margin-left:10%;float:left"></div>
  <div style="height:1.5em;width:0.8em;float:left;text-align:center
"><sup>^</sup></div>
  <div style="background:linear-gradient(to right, #514A9D, #4788bc); height:1.5em;width:40%;float:left"></div>
</div> 



**Me:** Here you are!

**Him:** Ahhh. I guess I'll just iterate over it.

**Me:** Huh? You wanted a sort function and this works.

**Him:** It's got a divide.

**Me:** Yes it does.

**Him:** I don't like floating points. They're unpredictable and make debugging painful, I was hoping there'd be a way using just subtraction and `abs`.

**Me:** Like `abs(e-x)`?

**Him:** Yup, but that gives just the closest number to `x`, not the closest number *less than* `x`.

**Me:** What's your plan if `x` is smaller than every element in the array?

**Him:** Just return `None`.

**Me:** ...why not just `filter` out all elements greater than `x`, then sort descending?



And that's one story of how easy it is to complicate something far beyond necessity.

































































