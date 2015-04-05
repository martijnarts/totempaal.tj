---
title: Pure and pretty CSS underline effect
---

<small>disclaimer: that's a near-clickbait title... it's SCSS and the _code_
isn't pretty...</small>

There's a thing about the "regular" CSS `text-decoration: underline`
property that's been bugging me. It's a feature nobody seems to like using
nowadays. The things it creates out are lacking, to say the least. It's just
not pretty enough!

The `text-decoration` property is well known, but little used. For
demonstrative purposes, let's show off what it looks like: <span
style="text-decoration: underline">just a quest for putting out great yummy
descenders.</span> Obviously I purposefully tried to form a sentence which had
the best parts of the Latin alphabet. The q, g, j, y and p are what we call
descenders: they descend below the baseline. These are great for showing off
what's so bad about the underline feature.

The classic CSS `underline` property doesn't make for a very pretty underline:
it ignores and crashes straight through all those precious descenders. This
isn't too wonderful for readability and it just doesn't look too good. It's
also not very customizable - in fact, it's not customizable at all. There has
to be a better way, right?

Actually, there's one that I found that inspired me:
[underline.js](http://wentin.github.io/underlineJS/) is a wonderful little
Javascript library that makes some beautiful looking underlines. Alas, it's
Javascript and I don't like using Javascript for styling my webpages. So I went
looking for an even better way. This is what I made:

<h3><span data-content="We are just on a quest for putting out great yummy
descenders!" class="underline">We are just on a quest for putting out great
yummy descenders!</span></h3>

And here's the code:

{% highlight html %}
<h3>
  <span
   data-content="We are just on a quest for putting out great yummy descenders!"
   class="underline">
    We are just on a quest for putting out great yummy descenders!
  </span>
</h3>
{% endhighlight %}

It's obviously not perfect, but it's a CSS hack so what can you do? I'll dump
the SCSS mixin I made at the bottom, but I'm gonne note the imperfections of
this approach first:

1. You need to list the text you're trying to underline twice.
2. There is no way to change the distance between the text and the underline.
3. Because we're putting a block level element in an inline level element
   (which you're not supposed to do!) we need to manually define a `width`.
4. It may not work at all.

How it actually works is fairly simple: it uses the real element as a dummy
text, to display the underline. This text is invisible. Then it overlays that
line with an `::after` pseudo-element, which has a bunch of `text-shadow`s all
around it to create a text outline effect. The `text-shadow`s are created in a
full matrix to create a proper outline, no missing spots. It _should_ work in
any font, at any size, in any website. However, it _will_ need customization
for your particular use. Your mileage may vary.

As I've outlined (underlined?), it's definitely not perfect. Any kind of
improvements are of course always welcome (send me a [message on
reddit](http://reddit.com/u/TotempaaltJ), maybe?). I hope this turns into
something better. For me it has mostly been a fun exercise in (S)CSS knowledge
and trickery.  Here's the mixin I use on here for my post titles:

```scss
@mixin underoutline($out-width, $out-color, $under-width, $under-color) {
    $shadows: ();
    @for $x from 1 through $out-width {
        @for $y from 1 through $out-width {
            $shadows: append($shadows, $out-color $x*1px $y*1px, comma);
        }
    }
    @for $x from 1 through $out-width {
        @for $y from 1 through $out-width {
            $shadows: append($shadows, $out-color $x*-1px $y*1px, comma);
        }
    }
    @for $x from 1 through $out-width {
        @for $y from 1 through $out-width {
            $shadows: append($shadows, $out-color $x*1px $y*-1px, comma);
        }
    }
    @for $x from 1 through $out-width {
        @for $y from 1 through $out-width {
            $shadows: append($shadows, $out-color $x*-1px $y*-1px, comma);
        }
    }

    position: relative;
    display: inline;
    color: transparent;
    z-index: 0;
    border-bottom: $under-width solid $under-color;
    width: auto;

    &:after {
        content: attr(data-content);
        display: block;
        width: 620px;
        position: absolute;
        top: 0; left: 0;
        z-index: 1;
        color: #000;
        text-shadow: $shadows;
        cursor: text;
    }
}
```
