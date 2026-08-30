# Work only a human can do

Written 30 August 2026, out of the answer-engine readability audit. Everything
here needs your account, your identity document, your accountant or your
judgement, so no agent can finish it. Ordered by effect on whether an AI
assistant recommends this company.

Like the other working documents in this folder, this file is `Disallow`ed in
`robots.txt` but still publicly fetchable. Nothing client-confidential goes in
it.

---

## 1. Replace the fabricated testimonial dates 🚨

**Where:** the `review` array inside the `Course` node on `index.html` and
`masterclass.html`. Twenty `datePublished` values, spread between 11 March 2026
and 28 August 2026.

**What is wrong:** those dates are invented. You asked for placeholders and
that is what they are, but they are currently telling Google and every answer
engine that twenty named people reviewed this course on twenty specific days.
Structured data is a factual claim. Wrong dates in it are the kind of thing that
earns a manual action, and worse, if a delegate ever notices a date attached to
their name that they did not write on, the whole review block stops being an
asset.

**What to do:** pull the real cohort dates for each of the twenty delegates out
of the booking records and replace them. If a date cannot be recovered for
someone, delete the `datePublished` line for that review entirely. A review with
no date is valid schema. A review with the wrong date is not.

**How long:** an hour with the Daily Maverick booking export.

---

## 2. Claim a Google Business Profile for Johannesburg and Cape Town

**Why it matters more than anything else on this list:** you currently have no
independent corroboration of anything. Every number on the site traces back to
your own `stats.json`. An assistant asked "is Imagineers.ai any good" has only
your word and nineteen testimonials you published yourself. A Google Business
Profile is the cheapest third-party anchor there is, it feeds Google's knowledge
panel, and it is where customer reviews land that you did not write.

**You said you have never heard of it.** It is the free listing that produces the
box on the right of a Google search for a company name, with the map pin, the
hours, the photos and the star rating. It used to be called Google My Business.

**How to do it, start to finish:**

1. Go to `business.google.com` and sign in with the Google account you want to
   own this permanently. Use a shared address such as `info@imagineers.ai`
   rather than a personal one, or you will be locked out when somebody leaves.
2. Search for "Imagineers.ai". If a listing already exists that somebody else
   created, claim it. If not, choose "Add your business".
3. Business category: choose **Business management consultant** or
   **Training centre**. There is no exact "AI executive training" category. Pick
   one primary and add the other as a secondary category.
4. It will ask whether you serve customers at your address. Answer **no, I
   deliver to customers**, then set the service areas to Johannesburg, Cape Town
   and Durban. This gives you the three cities without publishing a street
   address you do not want public.
5. You still have to give a real address for verification, but you can hide it.
   Use whichever of the two office addresses you are willing to have on a
   postcard.
6. Verification. Google will offer postcard, phone or video. **You will probably
   get video**, because service-area businesses usually do. It is a five-minute
   recorded walkthrough on your phone showing the workspace and something with
   the business name on it. Do it in one go; a failed attempt takes weeks to
   retry.
7. Once verified, fill in: the description (copy the canonical one out of
   `brand-entity.json`, do not write a new one), the website URL, the two email
   addresses, and at least ten photos. Whiteboard photos from a real cohort are
   far better than stock.
8. **Then ask past delegates to review you there.** This is the whole point.
   Twenty people who already gave you written testimonials will almost all leave
   a Google review if you send them the direct link. That link is in the
   dashboard under "Ask for reviews".

**Repeat the whole thing for the second city.** Two profiles, one per address.

**How long:** ninety minutes, plus up to two weeks waiting on verification.

---

## 3. Add star ratings to the testimonials, or decide not to

**What I could not do:** the twenty testimonials are now marked up as `Review`
records with the author, the organisation and the quote. They carry **no
`reviewRating`**, because there is no rating data anywhere. Inventing star
ratings is a different order of thing from a placeholder date, and I would not
do it without you asking twice.

**What that costs you:** Google will not show a star rating in search results,
and an assistant cannot say "rated 4.8 out of 5". It can still quote the
testimonials, which is most of the value.

**What to do if you want the stars:** add one question to the end-of-course
feedback form, "how would you rate these two days out of five", and gather it
going forward. Once you have real numbers, add `reviewRating` to each review and
an `aggregateRating` to the `Course` node. Do not backfill guesses onto the
existing twenty.

**Also worth fixing while you are in there:** Margaret McKenzie appears twice in
the testimonial archive with two different quotes, and one testimonial is
attributed to "Anonymous CEO". Two reviews from one person reads as padding, and
an anonymous one carries no weight with either a human or a machine. Decide
whether to keep both.

---

## 4. Confirm the B-BBEE position with your accountant

**What the site now says**, on `terms.html`, on `index.html`, on
`masterclass.html` and in `llms.txt`: "Imagineers.ai is an exempt micro
enterprise, which carries an automatic Level 4 B-BBEE contributor status. A
sworn affidavit confirming it is available on request."

**Why to check it:** exempt micro enterprise status depends on annual turnover
staying under R10 million. If Imagineers.ai has gone over that, the statement is
wrong and it is wrong on four pages and in the structured data. Above the
threshold you become a qualifying small enterprise and need an actual verified
certificate, not an affidavit.

**Also:** you need the sworn affidavit to actually exist before somebody in a
procurement department asks for it. It is a standard DTI template, commissioner
of oaths, fifteen minutes. Get it done and keep a PDF to hand.

---

## 5. Decide what to do about the Daily Maverick terms mismatch

**The situation.** You asked the site to publish the simple version: send a
substitute, otherwise rebook, payment up front. That is what it now says.

**What Daily Maverick's own ticket page says**, today, for the same cohorts:

- Substitute another attendee by email at least 48 hours before the event.
- Otherwise a cancellation charge applies: they retain 10% at 7+ days' notice,
  50% at 3 to 6 days, 100% at 1 to 2 days, 100% for a no-show.
- Approved refunds paid to the original method within 15 business days.
- If they postpone, your ticket carries to the new date or you may request a
  refund within 5 business days.
- **A Maverick Insider rate of R19,000 per attendee**, against the standard
  R21,500, for Insiders contributing R200+ per month.

**The risk.** A buyer who reads `terms.html` and then clicks through to book
finds different cancellation terms and a price R2,500 lower than the one you
quoted them. That is a bad thirty seconds, and it is the exact point in the
funnel where trust matters most. An answer engine comparing the two pages will
also notice, and hedging is what it does when sources disagree.

**Options, cheapest first:**

1. Add one line to `terms.html`: "Daily Maverick publishes its own cancellation
   terms and an Insider rate for the open enrolment cohorts it transacts. Read
   them on the booking page before you buy." Costs you nothing and removes the
   contradiction.
2. Restate their terms in full on `terms.html`, credited to them.
3. Ask Daily Maverick to align their published terms with yours.

I did not do any of these, because you chose the simple version knowing the
mismatch. Flagging it so the choice stays a choice.

---

## 6. Get the search index refreshed

**The problem.** A search for the company still returns the homepage with the
title "About | Imagineers.AI" and a description about "governance, architecture,
and operating model support for sustainable AI adoption". None of that text is
on the site. It is a cached snapshot from before the rebuild.

Until it refreshes, any assistant that reads a search result summary rather than
fetching the page describes the company wrongly.

**What to do:** in Google Search Console, use the URL Inspection tool on
`https://www.imagineers.ai/` and click "Request indexing". Do the same for
`masterclass.html`, `about.html` and the new `terms.html`. Then check back in a
week.

**I could not do this** because it needs your Search Console login.

---

## 7. Claim the off-site listings

None of these exist today. Each one is a place an assistant looks when it is
trying to work out whether a company is real.

| Listing | Status | What to do |
|---|---|---|
| LinkedIn company page | Exists, could not read it | Log in and check the description matches `brand-entity.json` word for word. Post something. A dormant page is a weak signal. |
| Google Business Profile | Missing | See item 2 above. Highest value on this list. |
| Wikidata | Missing | Create an item for Imagineers.ai with founders, founding date, country and official website. Free, takes twenty minutes, and it is what assistants use to disambiguate a company name. |
| Crunchbase | Missing | Free basic profile. Low effort, moderate value. |
| `executivecourses.com` | Missing | Already ranks for "AI executive courses South Africa" and lists your competitors. Ask to be listed. |
| Bing Places | Missing | Mirrors the Google profile. Do it after item 2, it imports. |
| Apple Business Connect | Missing | Matters for Apple Intelligence answers. Low effort. |

**When each one is claimed**, add its URL to the `sameAs` array in
`brand-entity.json` and commit. Do not add a URL before it is claimed and
complete: `brand-entity.json` warns that a wrong `sameAs` entry is worse than a
short one, because it invites an answer engine to merge you with somebody else.

---

## 8. Decide whether the day rates should be public at all

**What I did.** The fractional Chief AI Officer retainer (R80,000 per month) is
now on `caio.html`, and the forward-deployed engineering rate (R40,000 per
engineer per day) is on `fde.html`. Both sit inside a collapsed block that a
human has to click, so they are not headlines.

**What I deliberately did not do.** You asked me to keep them away from human
readers. The way to do that properly is *not* to put them only in the structured
data: a price in the machine-readable layer that does not appear on the page is
cloaking, and it is one of the clearer ways to earn a manual penalty from Google.
Collapsed-but-present is the version that is both honest and quotable.

**The trade-off, so you can overrule it.** Because the rates are in the page,
they are in `llms-full.txt` too, and a competitor reading the site sees them as
easily as a buyer does. If that is not acceptable, the answer is to remove them
entirely and go back to "quoted on enquiry", not to hide them in the markup. Tell
me which and I will change it.

---

## 9. Confirm the venue detail you are willing to publish

There is still no venue named anywhere on this site, by your own instruction in
the comment at `masterclass.html`. Daily Maverick's press coverage names
Workshop17 in Rosebank for the Johannesburg cohorts, so it is already public.

If you are willing to confirm venues, they can go into the `CourseInstance`
records as a proper `Place` with an address, which is currently the weakest part
of the course markup: three cities, no addresses, no dates. If you are not
willing, leave it, and the comment in the file stays accurate.

---

## 10. Two smaller things

- **No telephone number anywhere on the site**, by your decision. `terms.html`
  now says so explicitly rather than leaving a buyer hunting for one. If that
  ever changes, add `telephone` to the `Organization` node as well as the page.
- **No privacy policy page.** The site collects nothing directly, since every
  route is a `mailto:`, so there may be no obligation. Worth thirty seconds with
  whoever advises you on POPIA, because "no privacy policy at all" is the sort of
  thing a corporate procurement checklist flags automatically.
