---
title: Unraveling dependency management in Python
layout: post
---

This article is about two important concepts in Python: `install_requires` in
your `setup.py` file, and the `requirements.txt` or `Pipfile`. It's based on a
short Twitter thread (embedded) that I posted in November. I finally got around
to converting it into a blog post.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I finally understand the difference between setup.py&#39;s install_requires and requirements.txt. It&#39;s all about library vs application… <a href="https://twitter.com/hashtag/Python?src=hash&amp;ref_src=twsrc%5Etfw">#Python</a></p>&mdash; Martijn 🏳️‍🌈 (@TotempaaltJ) <a href="https://twitter.com/TotempaaltJ/status/925825094517182464?ref_src=twsrc%5Etfw">November 1, 2017</a></blockquote>

Every time I write a Python application or library, I get confused by the
differences and similarities between the setup file and the requirements file:
where am I defining my dependencies? What should someone need to install my
library? How do I make sure production uses the same code as my local
environment? Why is this so unclear?

By now, I think I figured out the difference, in the end...  Let's talk about
the end goals: defining dependencies, locking the entire tree, and integration
between those; and the usecases: libraries and applications.

## Locking your dependency tree

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr">requirements.txt (or Pipenv) is about locking dep tree, &amp; used mostly for application installation: deploy with pip install -r requirements</p>&mdash; Martijn 🏳️‍🌈 (@TotempaaltJ) <a href="https://twitter.com/TotempaaltJ/status/925825513385578496?ref_src=twsrc%5Etfw">November 1, 2017</a></blockquote>

Locking a dependency tree has a simple use: making sure that all environments
installed from that locked tree run the same code. This is extremely important
for applications. You don't want to risk your production environment being
different from your local machine, where you ran all your tests. For libraries,
wedon't care so much about this: we defer the responsibility to the application
builder. That also gives them the opportunity to update child dependencies
independently.

Traditionally in Python we lock dependencies with the `requirements.txt` file.
It allows us the possibility to keep a flat list of your entire dependency
tree. Nowadays we have a neat new tool called `Pipfile`. It exists to make sure
you only need to manage your direct dependencies, where in a requirements file,
you had to manage the whole tree yourself. You can even separate your
development-only dependencies from the production ones, to minimalize the size
of your build artifacts. The `Pipfile.lock` takes care of locking the tree.

If you want to lock your dependency tree to protect your production
environment: keep your dependencies in the `Pipfile` or `requirements.txt`.

## Defining your direct dependencies

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr">install_requires is for library direct deps, shouldn&#39;t lock versions or include tree packages: install library thru pip install packname</p>&mdash; Martijn 🏳️‍🌈 (@TotempaaltJ) <a href="https://twitter.com/TotempaaltJ/status/925825852969013248?ref_src=twsrc%5Etfw">November 1, 2017</a></blockquote>

To define our direct dependency, we have two options. This is where the two
problems overlap. You can define these in the `install_requires` option in your
`setup.py` file or alternatively you can track it in the `Pipfile`. Thesse
have different uses.

The `setup.py` file is used to install your package, as a library. Neither the
`Pipfile` nor the `requirements.txt` file are used during that process. In
fact, they shouldn't be used! These files define a dependency _tree_, which is
way too specific for library installation. You want to defer the management of
those dependencies to your library's user, as much as possible.

When you're defining the direct dependencies of your package, use the
`install_requires` parameter in `setup.py`.

## Integrating between the two

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr">Implementing setup.py ↔ req.txt interop (parse_requirements) shouldn&#39;t apply: apps have no install_requires &amp; libs don&#39;t install frozen deps</p>&mdash; Martijn 🏳️‍🌈 (@TotempaaltJ) <a href="https://twitter.com/TotempaaltJ/status/925826494391255040?ref_src=twsrc%5Etfw">November 1, 2017</a></blockquote>

So now you get to the point where you have a `setup.py` for installing your
package and a `requirements.txt` or `Pipfile` for local development. You're
probably mirroring a bunch of libraries between the two, so you might consider
integrating them: maybe the `setup.py` can read from the `requirements.txt`?

What you're actually trying to do here is probably wrong: if you're building an
application, you probably don't actually need `setup.py` and you can stop here.
If you're building a library, you don't have to mirror your dependencies.

## Dependency management in libraries

I love keeping a `Pipfile` in libraries still, because especially with
[pipenv][pipenv] it's super easy to manage your environments and dependencies.
With a `requirements.txt`, the gains are a bit less, but they definitely still
exist! Here's how to integrate with each:

### Pipfile

If you make sure your Pipfile refers to your own package as an editable
dependency, it'll automatically use the `setup.py` to install the dependencies.
This makes sure you're using the same way to install your module as your users
will! No need to lock any versions at all.

```toml
[[source]]
url = "https://pypi.python.org/simple"
verify_ssl = true
name = "pypi"

[packages]
sample = {editable = true, path = "."}

[dev-packages]
"flake8" = "*"

[requires]
python_version = "3.7"
```

Note the `sample` package in there. This should be your only line under
`[packages]` when building a library. Since the package will be installed
through the normal `setup.py install` method, you'll still get the requirements
listed in `install_requires`. You also get the benefits of the `Pipfile`, plus
any development packages in `dev-packages`.

If you prefer (I do), you can let Pipenv add this line for you with `pipenv install -e .`.

Since the lockfile is separate for `Pipfile`s, you don't have to worry about
the lockfile for libraries. You can `.gitignore` it or not, it doesn't make
much of a difference.

### requirements.txt

We'll do the same here as we did with the `Pipfile`, just with a little bit
different syntax:

```
-e .
flake8
```

The `-e .` here is the same as the `sample` package before: it installs the
package in the current directory through `setup.py install`.

When building a library though, be careful to never run the commonly touted
`pip freeze > requirements.txt`, as it means you'll have to manage all
dependencies yourself, or rebuild your `requirements.txt`. Just add any
development dependencies under the `-e .`, and install them with
`pip install -r requirements.txt`. You can lock them to specific versions
still, if you like.

## Dependency management in applications

### Pipfile

This is a lot simpler: install dependencies with `pipenv install` and
development dependencies with `pipenv install --dev`. Be sure to commit your
lockfile into version control, and install on production with
`pipenv install --deploy`.

### requirements.txt

This one is a bit harder, since you'll have to manage the locking yourself. You
can of course use a single file for your direct dependencies
(`requirements.txt`) and a second file for the "lock"
(`requirements-locked.txt`). In this case, you'd generate the second file with
`pip freeze > requirements-locked.txt`. Keep in mind though, that this freezes
all _installed_ packages, not just the ones in `requirements.txt`. If you drop
a dependency, you'll have to make sure to uninstall it and its dependencies
from your environment manually.

### setup.py

Whoa, hold it! Didn't we _just_ say we're not using a `setup.py` for
applications? Well, yes, but of course if you want to, you could. Maybe you
have an application that can also function as a library, or... well, I'm sure
there's other reasons that I haven't found yet.

In this case, you should simply use the library approach and combine it with
the locking mechanisms from the other application approaches. Install on
production with `pipenv install --deploy`, or through fully locked
`pip install -r requirements-locked.txt`.

## Closing remarks

I've long thought the Python packaging setup to be a complete mess. Over the
course of this research I'll admit that it's actually quite nicely designed,
but simply not very intuitively. It's flexible to a point of confusion. Using
these methods of dependency management work nicely for me, but I'm sure they
don't for everyone.

Either way, I hope this helps some people to not have to go through the mess of
dependency management that I've gone through in earlier days.

[pipenv]: https://docs.pipenv.org/

<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
