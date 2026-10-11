---
title: TITLE
subtitle: A short deck under the title
date: YYYY-MM-DD
# updated: YYYY-MM-DD               # optional
type: essay                          # essay | life | review  (see _data/writing_types.yml)
description: One or two sentences for the index, cards and search.
featured: false
tags: [essay, everyday-life]

# Optional
# cover_image: cover.jpg             # in assets/images/writing/FILE-NAME-OF-THIS-PAGE/
# cover_alt: Describe the image.
# cover_caption: Optional caption.
# reading_time: 8                    # otherwise calculated automatically
# dropcap: false                     # turn the drop cap off
# subject: dhaka                     # which tag drives "More from…" (defaults to the first tag)
# related:
#   - _art/some-piece.md
---
Start with a normal paragraph (the drop cap applies to it).

## A heading

Normal text, **bold**, *italic*, <mark>highlighted</mark>, and a [link](https://example.com).

> A normal block quote.

> A pull quote that stands out.
{: .pullquote}

A footnote[^1].

{% include figure.html src="image.jpg" alt="Describe it." caption="Optional caption." %}

{% include link.html to="_art/some-piece.md" %}

{% include ref.html to="_photography/some-series.md" %}

{% include youtube.html id="VIDEO_ID" title="What the video shows" %}

<details markdown="1">
<summary>Click to expand</summary>

Hidden content, in Markdown.

</details>

[^1]: The footnote text.
