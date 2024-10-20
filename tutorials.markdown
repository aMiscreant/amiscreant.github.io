---
layout: page
title: Tutorials
permalink: /tutorials/
---

<h2>My Tutorials</h2>

<ul>
  {% for tutorial in site.tutorials %}
    <li>
      <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: {{ tutorial.description }}
    </li>
  {% endfor %}
</ul>


