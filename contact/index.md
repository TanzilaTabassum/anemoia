---
layout: page
title: Contact
eyebrow: Say hello
description: Placeholder contact page — swap in your real details in _data/social.yml.
styles: [writing]
---

I read everything, and answer most things — slowly.

{% for s in site.data.social %}
- **[{{ s.label }}]({{ s.url }})**{% if s.note %} — {{ s.note }}{% endif %}
{%- endfor %}

*These links come from `_data/social.yml`. Edit that one file and the footer updates too.*
