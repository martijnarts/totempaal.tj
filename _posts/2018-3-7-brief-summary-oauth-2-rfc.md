---
title: A brief summary of the OAuth 2.0 RFC
layout: post
shouldExcerpt: true
excerpt:
    <p>This is the briefest useful summary I could come up with for OAuth 2.0, after reading the original RFC.</p>
---

This is the briefest useful[^lol-useful] summary[^lol-summary] I could come up
with for OAuth 2.0, after reading[^lol-reading] the [original
RFC][rfc6749].


[^lol-useful]:
    We define "useful" here as meaning "completely useless for any practical
    purposes that aren't 'diving deaper into OAuth 2.0'", so take that as you
    will.

[^lol-summary]:
    While this does _summarize_ the OAuth protocol, it leaves out a ton of
    actually vital information.

[^lol-reading]:
    Yes, I did read all 76 pages of the original RFC. I like reading
    jargon-filled specs--that's how I learnt most about CompSci, and I can't
    imagine anyone else does as well.  That's why I wrote this!

## Quick definitions

- **Resource Owner:** entity that can grant access, eg. end-user.
- **Resource Server:** host of protected resources.
- **Client:** Application requesting protected resources on behalf of Resource
  Owner.
- **Authorization Server:** issues tokens to client after getting authorization
  from Resource Owner.


## Protocol flow

This is essentially how the flow works (with time moving from left to
right)[^text-graphs]:


```
              Client: ------------------------------------------------->
                       \     / \             / \                     /
                        1   2   3           /   5                   /
                         \ /     \         /     \                 /
      Resource Owner: ------------\-------/-------\---------------/---->
                                   \     /         \             /
                                    \   4           \           /
                                     \ /             \         /
Authorization Server: --------------------------------\-------/-------->
                                                       \     /
                                                        \   6
                                                         \ /
     Resource Server: ------------------------------------------------->
```

1. Request authorization from Resource Owner, preferably (but
   optionally[^optional]) through Authorization Server.
2. Client receives Authorization Grant.
3. Request Access Token with Authorization Grant.
4. Authorization Server validates Grant & issues Access Token.
5. Request protected resource with Access Token.
6. Validate Access Token and serve request.

[^text-graphs]:
    I might replace these with pretty graphics later, but I guess this works
    for now, right?

[^optional]:
    An Authorization Grant could be username & password, which would
    come directly from the Resource Owner.

## What are…

### Authorization Grants?

This is a method the Client can use to get an Access Token from the
Authorization Server, it can be one of four types[^more-types]:

- **Authorization Code**
  - Can obtain both Access & Refresh Tokens.
  - Sends Resource Owner through the Authorization Server.
  - For confidential clients.
  - Your typical Google login flow, described in [4.1][rfc6749-4.1].
- **Implicit Grant**
  - Can only obtain Access Tokens.
  - Sends Resource Owner through the Authorization Server.
  - For public clients.
  - Very similar to Authorization Code, but without Client authentication, see
    [4.2][rfc6749-4.2].
- **Resource Owner password credentials**
  - Rare usecase, only when Resource Owner trusts Client (fe. an OS).
  - Does not send Resource Owner through the Authorization Server.
  - Uses username/password to get Access & Refresh Tokens.
- **Client credentials**
  - When Client accessess its own resources or when authorization has been
    pre-arranged on Authorization Server.
  - Does not send Resource Owner through the Authorization Server.


[^more-types]:
    As with a lot of things, the RFC is broad enough that this actually
    includes all possible extensions--there are four types defined in this RFC.

### Access Tokens?

An Access Token is a time-limited token giving access to certain scopes. A
Resource Server should be able to verify an Access Token without querying the
Authorization Server. It could for example[^rfc-scope] be a JWT[^more-rfcs]
with the scopes in the claims part.

[^rfc-scope]:
    Exactly _how_ a lot of tokens should work is (sadly?) outside the scope of
    our lovely RFC[^trigger-happy]. Authorization Codes, Access Tokens, Refresh
    Tokens, and more are essentially free to implement however you prefer,
    except that they have to fulfill certain requirements.

[^trigger-happy]:
    And the RFC authors are very happy to tell you that!

[^more-rfcs]:
    See also the [JWT profile for OAuth 2.0][rfc7523].

### Refresh Tokens?

Since Access Tokens time-out at some point, the Client needs a way to get a new
one when that happens. This forces the Client to "recheck" with the
Authorization Server every now and then, to see if they're still authorized to
access the protected resource.

So essentially, Refresh Tokens exist to allow you to revoke authorizations, or
have sessions time out.

```
              Client: ------------------------------------------------->
                       \             / \     / \     / \             /
                        1           /   4   5   6   7   8           /
                         \         /     \ /     \ /     \         /
     Resource Server: ----\-------/-----------------------\-------/---->
                           \     /                         \     /
                            \   2                           \   9
                             \ /                             \ /
Authorization Server: ------------------------------------------------->
```

1. Client sends Authorization Grant to Authorization Server.
2. Authorization Server sends back Access Token and Refresh Token.
3. Client uses Access Token to request protected resource from Resource Server.
4. Resource Server returns protected resource to Client[^they-did-it-first].
5. Client uses expired Access Token to request (another) protected resource
   from Resource Server.
6. Resource Server returns an Invalid Token Error.
7. Client sends Refresh Token to Authorization Server[^revoke].
8. Authorization Server sends back Access Token and optional Refresh Token.


[^they-did-it-first]:
    Yes, this is the normal flow where everything goes according to plan. I
    copied this from the RFC, and they include a non-expired Access Token flow
    before showing the flow for the expired Token. Probably to show a more
    realistic scenario?

    These still wouldn't happen right after each other though!

[^revoke]:
    This is where the Authorization Server can return an error when the
    Resource Owner's authorization has been revoked.

### Clients?

Clients are usually registered on Authorization Server. There are two types of
clients:

- confidential: can maintain confidentiality of resources (fe: servers, OS)
- public: cannot maintain confidentiality of resources (fe: app, SPA)

Clients have a **client identifier**: a non-confidential string differing per
Client. It's defined/registered by Client on Authorization Server. These
strings are unique per Authorization Server.

## Endpoints on Authorization Server

Note that the RFC does not define the URI path for these endpoints.

1. Authorization
    1. used to obtain Authorization Grant.
    2. MUST verify Resource Owner identity.
    3. MAY get a URL-encoded query paramater, which MUST be retained[^idk].
    4. MUST NOT include fragment component (e.g. `#home`).
    5. MUST use TLS.
    6. MUST support `GET`, MAY also support `POST`.
    7. MUST accept a `response_type` parameter (one of `code`, `token`).
    8. MUST accept `redirect_uri` request parameter.
    9. accepts scope token through `scope` parameter which is a space-separated
       list of scopes.
   10. MAY fully or partially ignore scope, but MUST sent `scope` response
       parameter if it does.
   {:class="roman"}

2. Token
   1. used to obtain Access Token (and optional Refresh Token).
   2. MUST accept only `POST`.
   3. Client must authenticate itself.
   4. see Aiii.
   5. see Aiv.
   6. see Aix.
   7. see Ax.
   {:class="roman"}
{:class="upper-alpha"}


[^idk]:
    I honestly don't know what this means at this point. If anyone knows, send
    me a tweet--please!

## Ending remarks

While I make a lot of jokes about the protocol and its definition, I actually
love the OAuth 2.0 spec: it's pretty clear and well-defined. The scope is super
tight and some things are a bit confusing until you get a more complete
overview, but it's incredibly useful and helpful.

In the interest of making this an overview document and keeping it summarized,
you'll probably have noticed by now that I make extensive use of
footnotes[^milenotes]. A lot of important information is there, so if you
haven't yet, I'd recommend you take the time to read them.

Also: I consider this a "living document," and I very much welcome corrections
or additions. You can find my contact details on my personal website. If you
wanna help me out, consider sharing this on the relevant social medias.


[^milenotes]:
    These footnotes are quickly growing to be longer than the document itself.


[rfc6749]: https://tools.ietf.org/html/rfc6749 "The Oauth 2.0 Authorization Framework"
[rfc6749-4.1]: https://tools.ietf.org/html/rfc6749#section-4.1 "Authorization Code Grant"
[rfc6749-4.2]: https://tools.ietf.org/html/rfc6749#section-4.2 "Implicit Grant"
[rfc7523]: https://tools.ietf.org/html/rfc7523 "JSON Web Token (JWT) Profile for OAuth 2.0 Client Authentication and Authorization Grants"
