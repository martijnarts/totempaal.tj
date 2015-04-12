---
title: Pure and pretty CSS underline effect
---

There's a thing about the "regular" CSS `text-decoration: underline` property
that's been bugging me. I could go into detail, but I'll summarize: it's just
not pretty enough! For demonstrative purposes, let's show off what it looks
like: <span style="text-decoration: underline">just a quest for putting out
great yummy descenders.</span> Weird sentence maybe, but it has a q, g, j, y
and p: descenders. They descend below the baseline, which proves that underline
sucks.

The classic CSS `underline` property doesn't make for a very pretty underline:
it ignores and crashes straight through all those precious descenders. This
isn't too wonderful for readability and it just doesn't look too good. It's
also not very customizable - in fact, it's not customizable at all. There has
to be a better way, right? There's
[underline.js](http://wentin.github.io/underlineJS/), a wonderful little
Javascript library that makes some beautiful looking underlines. But, since I
much prefer using CSS for styling over Javascript I went looking for an even
better way. This is what I made:

<h3><span data-content="We are just on a quest for putting out great yummy
descenders!" class="underline">We are just on a quest for putting out great
yummy descenders!</span></h3>

Here's the HTML:

{% highlight html %}
<h3>
  <span
   data-content="We are just on a quest for putting out great yummy descenders!"
   class="underline">
    We are just on a quest for putting out great yummy descenders!
  </span>
</h3>
{% endhighlight %}

The basic principle is a very simple `text-shadow` based outline. The principle
is very simple, put a shadow with the same color as your background on each
side of the text. This gives you a single pixel, invisible outline. We want
this on the `::after` element, because we want the underline to be below it. To
put the pseudo-element's content at the exact same place as the real element,
we simple position it right:

```css
.underline {
    position: relative;
    color: transparent;
    z-index: 0;
}
.underline::after {
    content: attr(data-content);

    /* Position the text right. */
    position: absolute;
    top: 10px; left: 0;
    z-index: 1;

    /* Overwrite the color (remember we set it to transparent!) */
    color: black;
    /* Fake it being selectable - user can select the real text. */
    cursor: text;

    /* Small outline of shadows. */
    text-shadow: #fff -1px -1px,
                 #fff -1px 0px,
                 #fff 0px -1px,
                 #fff 0px 1px,
                 #fff 1px 0px,
                 #fff 1px 1px;
}
```

That's just the basics though. Next you need to is add a little `border-bottom`
to the `.underline` element and if you want to, make the outline fatter simply
by appending more shadows around it, with larger distances. There's also a
small bug (at least, it looks like a bug) with the rendering of inline elements
with `position: absolute` which requires us, sadly, to give the `::after`
pseudo-element a fixed width. This is why I'm not using it for every underline
on my page.

As I've outlined (underlined?), it's definitely not perfect. On most elements
where I use it I need to change some minor thing to make it work. Any kind of
improvements are of course always welcome (send me a [message on
reddit](http://reddit.com/u/TotempaaltJ), maybe?). For me it has mostly been a
fun exercise in (S)CSS knowledge and trickery.

<small>Thanks to [my brother](http://github.com/HugoArts) for pointing out some
improvements.</small>

---

Here's the SCSS mixin I use on here for my post titles:

```scss
@mixin underoutline($out-width, $out-color, $under-width, $under-color, $width) {
    $shadows: ();

    // We need to put a bunch of shadows around the text within a matrix,
    // every option from -n<x<n by -n<y<n (where n is the width of the outline)
    // needs to have a shadow. These loops create that list.
    @each $xm in (-1, 1) {
        @each $ym in (-1, 1) {
            @for $x from 1 through $out-width {
                @for $y from 1 through $out-width {
                    $shadows: append($shadows, $out-color $x*$xm*1px $y*ym*1px, comma);
                }
            }
        }
    }

    display: inline;

    position: relative;
    z-index: 0;

    color: transparent;
    border-bottom: $under-width solid $under-color;

    &:after {
        content: attr(data-content);

        // Sadly, we require a fixed width. Need to fix that.
        width: $width;

        position: absolute;
        top: 0; left: 0;
        z-index: 1;

        color: #000;
        cursor: text;

        text-shadow: $shadows;
    }
}
```
