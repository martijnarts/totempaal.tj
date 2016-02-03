---
title: "Commenting: documentation and justification"
layout: post
---

Commenting is a somewhat controversial topic, with opinions spread out over
mainly a single axis from those against and those in favour of commenting. The
one extreme says one shouldn't have to comment at all since your code should be
readable enough to explain itself (I think of this as the arrogant approach),
while the other extreme claims that reading code is always bothersome and some
things will never be easily understandable so there should be plenty of
comments to explain it (in my mind, the hand-holding approach). I'd like to
propose a somewhat formal definition of the already existing middle ground: the
Documentation-Justification Method of Commenting Code.

The way I see it, there are two distinct commenting styles: describing the
usage of your code, which I'll refer to as _documentation_, and elaborating on
your implementation, which I call _justification_. I'll use these terms in my
explanation and reasoning below, but they can also be directly linked to more
practical conventions, which I'll also expand on.

_Documentation_ describes the usage of your code and should be very obvious to
any developer. Documentation tells the reader what they can expect from a
class, function or otherwise. It can define what something should be used as or
used for. It can also (and this may seem like a bit of a gray area here) expand
on the structure of your code: why did you create x as a class, why is this a
separate function. This is because it's very important to understand the
structure of the project to fully understand the usage.

_Justification_ tells the reader why you chose to implement something the way
you did. While your code should be readable enough to describe exactly what it
does step-by-step with a single read-through, it will never be able to explain
your reasons for choosing a certain implementation. There are many obvious
things choices that don't need justification, and you shouldn't justify those.
The usual example is `x++;  // increment x by one`, but there's a lot more
complex code that doesn't need commenting. It is of course up to the writer to
decide what code does and doesn't need justification.

Justification is actually a little broader than that though: it may also be
used to explain a certain way to do something that is specific to your
framework that may not be obvious to the reader at first (but don't repeat the
justification every time you use it). This one is a little further away from
the exact meaning of "justification", but it should still be considered the
same commenting style since they are very closely related: they both comment on
a certain bit of code, instead of the structure. The term justification also
seems more appropriate and immediately clear about its primary purpose.

Most programming languages will offer you (at least) two methods to comment
your code: block comments, often `/* like so */`, and line comments
`// like this` or `# this`. Now that we have defined two separate commenting
styles, we can directly link them to comment methods. Block comments should be
used for _documentation_, whereas _justification_ should use line comments.
This also more clearly links them to their meaning as described here:
documentation describe "building blocks" of your code and justification is more
closely related to the actual lines of code.

The DJ method and more importantly this write-down comes from my own struggle
with commenting methods, and my inability to pick what I should do. With a
somewhat formal definition, I can enforce (or at least encourage) a certain
commenting method in my own projects and those I set up in the workplace.
Separating commenting into two hopefully clear styles should make the method
simple enough to understand, and maybe simple enough for others to consider
using.

Thanks for reading. If after reading it turns out you hate me and you want to
yell at me, I recommend sending me [a tweet](http://twitter.com/TotempaaltJ).
