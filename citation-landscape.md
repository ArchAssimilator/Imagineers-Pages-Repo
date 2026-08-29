# Citation landscape

**Status: empty on purpose. Nothing has been measured yet.**

This file holds the answer to one question: when a South African executive asks
an AI assistant about AI training, which sources does it read before it answers?
That set of domains, not this website, is where most of the influence sits.

Filling it in is item G2 in `aeo-gaps.md` and is the next thing to do.

---

## How to fill this in

1. Take the prompts from `prompts.json`. Start with the four entity prompts
   (`en-01` to `en-04`), because if an engine has the category wrong, nothing
   else is worth measuring yet.
2. Run each prompt against ChatGPT, Claude, Perplexity, Gemini and Google AI
   Overviews.
3. Run each one **three times**. The outputs are stochastic. One run is an
   anecdote, and a change between two single runs is almost always noise rather
   than progress.
4. For each answer record: was Imagineers.ai named, which competitors were
   named, and every domain cited.
5. Classify each cited domain into one of five channels, below.
6. Repeat monthly. Track the trend, not the reading.

Use a fresh session with no memory and no personalisation for every run.
Otherwise you are measuring your own account, not the market.

---

## Channel classification

| Channel | What it means | Can we influence it |
|---|---|---|
| Owned | imagineers.ai and anything else the company publishes | Directly, and it is already done |
| Peer / editorial | Independent publications and industry sites | Slowly, by being worth citing |
| Earned media | Coverage, interviews, podcasts | By pitching |
| UGC | Reddit, Quora, forums, LinkedIn comment threads | Only by genuine participation. Promotional posting gets accounts banned |
| Review platform | Directories, course review sites, marketplaces | By claiming a profile and earning reviews |

Owned citations are the least valuable of the five. An engine quoting a company
about itself is not evidence, and the models weight it accordingly.

---

## Baseline visibility

Percentage of prompts where the brand is named. Fill after the first run.

| Engine | Awareness | Consideration | Decision | Overall |
|---|---|---|---|---|
| ChatGPT | | | | |
| Claude | | | | |
| Perplexity | | | | |
| Gemini | | | | |
| Google AI Overviews | | | | |

Under roughly 20 percent on any stage is a red zone.

---

## The three commercial prompts, tracked separately

These are the ones that convert. Track them on their own line, every run.

| Prompt | ChatGPT | Claude | Perplexity | Gemini | AI Overviews |
|---|---|---|---|---|---|
| Best AI executive training in South Africa (`de-exco-01`) | | | | | |
| What AI training options exist for senior executives in South Africa (`co-exco-01`) | | | | | |
| What does Imagineers.ai do and who is it for (`en-01`) | | | | | |

---

## Competitor visibility, same prompt set

| Competitor | ChatGPT | Claude | Perplexity | Gemini | AI Overviews |
|---|---|---|---|---|---|
| GIBS | | | | | |
| The Knowledge Academy | | | | | |
| College Africa Group | | | | | |
| School of IT | | | | | |
| Prospen Africa | | | | | |
| DB23 | | | | | |

---

## Cited domains, ranked by how often they appear

The output of this table is the target list: the sources that already get cited
for these prompts, where Imagineers.ai is currently absent.

| Domain | Times cited | Channel | Are we on it | Prompt it feeds |
|---|---|---|---|---|
| | | | | |

---

## Verbatim entity answers

Paste the raw answers here, per engine, unedited. Editing them for brevity
destroys the thing being measured, which is exactly how the brand is described
when nobody is watching.

### What does Imagineers.ai do and who is it for?

- **ChatGPT:**
- **Claude:**
- **Perplexity:**
- **Gemini:**

### Is Imagineers.ai an AI training provider? What category does it compete in?

- **ChatGPT:**
- **Claude:**
- **Perplexity:**
- **Gemini:**

### Who are Imagineers.ai's main competitors and how does it differ from them?

- **ChatGPT:**
- **Claude:**
- **Perplexity:**
- **Gemini:**

### Who founded Imagineers.ai and what did they do before?

- **ChatGPT:**
- **Claude:**
- **Perplexity:**
- **Gemini:**

---

## What to look for in those answers

A FAIL is any of these, and each one is more urgent than any content work:

- The category is wrong, for example "consultancy", "software company" or
  "agency" instead of "AI executive training provider".
- The ICP is wrong or missing.
- Fewer than two of the three differentiators appear.
- The four engines disagree with each other about what the company is.
- The founders cannot be named.

If any of those show up, do `aeo-gaps.md` G1 immediately and re-measure in a
month. Nothing else moves the needle until the engines know what this company is.
