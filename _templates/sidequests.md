---
title: QUEST TITLE
date: YYYY-MM-DD                     # the start date
end_date: YYYY-MM-DD                 # optional; leave out for "ongoing"
status: in-progress                  # in-progress | completed | failed | abandoned | paused
description: One sentence — what was the quest?
featured: false
tags: [learning, making]

# Put the images in  assets/images/sidequests/FILE-NAME-OF-THIS-PAGE/
cover_image: cover.jpg
cover_alt: Describe the cover image.

# Optional "quest log" panel — any label/value pairs you like
log:
  - label: Goal
    value: What I wanted to do
  - label: Budget
    value: Optional

# Optional end-of-journal blocks
result: What happened in the end.
lessons:
  - First lesson.
  - Second lesson.

# related:
#   - _art/some-piece.md
---
## Chapter one

Write like a diary. Every `##` heading becomes a numbered chapter.

{% include figure.html src="image.jpg" alt="Describe it." caption="Optional." align="right" %}

> A progress update.
{: .callout .update}

> Something went wrong.
{: .callout .fail}

> I found something out.
{: .callout .find}

> What I'd tell my past self.
{: .callout .lesson}

{% include figure.html src="plan.jpg" alt="A scanned page." caption="A scan." kind="scan" %}

## Chapter two

Keep going.
