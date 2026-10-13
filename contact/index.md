---
layout: page
title: Contact
eyebrow: Say hello
description: Say hello — find me elsewhere on the internet.
styles: [writing]
---

I read everything, and answer most things — slowly.

{% for s in site.data.social %}
{%- if s.url and s.url != "" %}
- **[{{ s.label }}]({{ s.url }})**{% if s.note %} — {{ s.note }}{% endif %}
{%- endif %}
{%- endfor %}
