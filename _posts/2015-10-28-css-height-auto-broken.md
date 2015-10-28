---
title: Oddities of animating auto values in CSS
layout: post
style: maxheight.css
---

CSS is broken. It's not possible to animate, in any way, an `auto` value.
Attempting to animate to or from `height: auto` or `width: auto` will yield
naught but disappointment, distress and questions: how do I fix it? Why doesn't
this work? What's going wrong here?

While the CSS specs seem to be mostly ambiguous about this issue, web
developers and designers aren't: this should be working. Bug reports have been
issued for both [Firefox][ff bug] and [WebKit][wk bug] and there are plenty of
Stack Overflow questions on the topic. But it seems that the way that some
rendering part of CSS is implemented prevents this from working.  I don't
intend to go into the technicalities of why it doesn't work. I prefer to go
into what does work.

The most common answers on Stack Overflow are to use Javascript (which I
usually see as the cop-out answer to these kinds of questions), or to animate
`max-height` instead.  Sadly, using Javascript is the only proper option here.
Animating `max-height` simply doesn't work well enough. I'll go over both
options and hopefully explain my reasoning here.

## Maximum height

Using the maximum height of the element instead of the height works by setting
the `max-height` property so high that the content of the element will
certainly fit. This way, the _calculated_ height of the element is the same as
it would have been if set to `auto`. See the figure 1.

<figure>
    <div class="maxheight-vs-heightauto">
        <div class="example max-height">
            <div class="box">
                <div class="img"></div>
            </div>

            <small class="marker">
                real height: 200px
            </small>
        </div>

        <div class="example height-auto">
            <div class="box">
                <div class="img"></div>
            </div>
        </div>
    </div>

    <figcaption>
        Figure 1: The difference between <code>height: auto</code> and
        <code>max-height</code>.
    </figcaption>
</figure>

In figure 1 the left div has its max-height property set to 200px, while the
one on the right instead has height set to auto. Both boxes adapt their height
to their content (the image). When you hover over the figure the content
resizes, showing that for this to always work you'd need to set your
`max-height` property very high so anything fits in.

This mostly works fine as long as you're not trying to animate the height of
the element, but when you're not trying to animate it using `height: auto` is
the better option anyway - you'll never ever have non-fitting content and it
just makes more sense.

Now if you do try to animate, an issue arrises. Since you're animating the
`max-height` property to something very high, it'll continue increasing the
value of `max-height` until it reaches its target. If, before it does, the
content has already reached its maximum height, the `max-height` won't stop
increasing but the actual content height will. This in itself is not a problem,
except that you're giving the animation a certain duration and it will complete
the animation of the `max-height` within that duration, so the content may
reach its maximum height before the animation finishes.

<figure>
    <div class="maxheight-animated">
        <div class="example max-height">
            <div class="box">
                <div class="img"></div>
            </div>

            <div class="timer">
                <div class="done">Done</div>
            </div>
        </div>
        <div class="example max-height-ghost">
            <small>max-height value</small>
        </div>

        <div class="example height-auto">
            <div class="box">
                <div class="img"></div>
            </div>

            <div class="timer">
                <div class="done">Done</div>
            </div>
        </div>
    </div>

    <figcaption>
        Figure 2: visualising animation issues.
    </figcaption>
</figure>

In the left box in figure 2 we transition from `max-height: 50px` to
`max-height: 300px`, while the content height is 150px. The right box animates
the height from 50px to 150px. Both happen in 5 seconds.  The "done" flag at
the timer in the bottom points to the moment when the _visible animation_ of
the box height is done.

Note that the max-height value and the box on the right finish animating at the
same time while the real boxes themselves finish at completely different
times: the transition duration is no longer reliable with a `max-height`
animation. On the way back you can also see that there's a delay before the
value starts animating. If you pay attention, you can see the same effects in
figure 1.

This may not seem like too much of a problem at first, but keep in mind that in
my example there were two things very different from a real world situation.
First of all, the transition duration is set to five seconds which is very long
for your average CSS transition. Secondly, the `max-height` value used is
fairly low. Remember that we'd have to use an absurdly high value for it to
always work, and if our `max-height` value is very high but the actual content
height is relatively low, the visible animation is going to happen too fast to
see.

Because of this unreliable timing behaviour, animating `max-height` is not a
truly viable option. There may be situations where you don't want to change the
height with Javascript and you don't care much for the duration of your
transitions. The effect can be limited if, for example, the elements are all
guaranteed to be smaller than a certain height. I'm a perfectionist, so I'm
gonna continue using the Javascript method.

## Javascript height

There are several ways to fix the animation issue with Javascript. The most
obvious method probably is using JQuery's [`slideUp`][jQ slideUp] and
[`slideDown`][jQ slideDown] methods or similar functions from some other
animation library. The downside to that is you're losing the handy GPU
acceleration that comes with CSS transitions. It's also not as "pure" as using
CSS transitions.

The optimal, and prettiest, method is to calculate the height of the element
with Javascript, set it in the element's style and let the preconfigured CSS
transitions do the rest of the work. Stack Overflow has plenty of scripts to do
this, here's an adaptation of [Oleg Vaskevich's script][oleg]:

```javascript
function open(el) {
    var height = 0;
    var nodes = el.childNodes;
    for(i = 0; i < nodes.length; i++) {
        height += nodes[i].offsetHeight + (nodes[i] instanceof Element &&
            parseInt(window.getComputedStyle(nodes[i])['margin-top']) +
            parseInt(window.getComputedStyle(nodes[i])['margin-bottom']))
            || 0;
    }
    el.className = el.className.replace('hidden', '').trim();
    el.style.height = height + 'px';
}
function close(el) {
    el.className = el.className + ' hidden';
    el.style.height = '0px';
}


// Here's some example usage:
var div = document.getElementById('javascript-example');
var ex = document.getElementById('javascript-example-inner');
div.addEventListener('mouseenter', () => close(ex));
div.addEventListener('mouseleave', () => open(ex));
open(ex);
```

```css
#javascript-example-inner {
    transition: height 200ms ease, padding 200ms ease;
    overflow: hidden;
    height: auto;
}
#javascript-example-inner.hidden {
    padding: 0;
}
```

<figure>
    <div class="javascript">
        <div class="example" id="javascript-example">
            <div class="box" id="javascript-example-inner">
                <div class="img"></div>
                <span>Some text</span>
            </div>
        </div>
    </div>

    <figcaption>Figure 3: Javascript-based toggling.</figcaption>
</figure>
<script>
function open(el) {
    var height = 0;
    var nodes = el.childNodes;
    for(i = 0; i < nodes.length; i++) {
        height += nodes[i].offsetHeight + (nodes[i] instanceof Element &&
            parseInt(window.getComputedStyle(nodes[i])['margin-top']) +
            parseInt(window.getComputedStyle(nodes[i])['margin-bottom']))
            || 0;
    }
    el.className = el.className.replace('hidden', '').trim();
    el.style.height = height + 'px';
}
function close(el) {
    el.className = el.className + ' hidden';
    el.style.height = '0px';
}

var div = document.getElementById('javascript-example');
var ex = document.getElementById('javascript-example-inner');
div.addEventListener('mouseenter', () => close(ex));
div.addEventListener('mouseleave', () => open(ex));
open(ex);
</script>

It works by calculating the height of all the element's child nodes, adding
them up and setting that as the height. A bunch of other methods exist and if
you prefer you could for example calculate and store the element's height
before hiding it, or possibly even use the `scrollHeight` property of an
element.

All in all, there seems to be no proper, clean way to animate or transition the
height of an HTML element with variable or dymanic content. Personally, I think
this is a serious issue with the browsers, if not with the CSS spec itself.
Showing and hiding elements on mouse over or on the click of a button is a
fairly common UX pattern and it should be something done through CSS,
especially now that we have animations and transitions.


[ff bug]: https://bugzilla.mozilla.org/show_bug.cgi?id=571344
[wk bug]: https://bugs.webkit.org/show_bug.cgi?id=16020
[jQ slideUp]: http://api.jquery.com/slideup/
[jQ slideDown]: http://api.jquery.com/slidedown/
[oleg]: http://stackoverflow.com/a/26476282/238310
