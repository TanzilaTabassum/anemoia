---
layout: page
title: Contact
eyebrow: Say hello
description: Say hello — find me elsewhere on the internet.
styles: [writing]
---

I read everything, and answer most things — slowly.

{% assign ct_social = site.data.social | where_exp: "s", "s.url != '' and s.url != nil" %}
{% for s in ct_social %}
- **[{{ s.label }}]({{ s.url }})**{% if s.note %} — {{ s.note }}{% endif %}
{%- endfor %}
