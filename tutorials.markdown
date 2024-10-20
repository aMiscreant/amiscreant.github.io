---
layout: page
title: Tutorials
permalink: /tutorials/
---

<h2>My Tutorials</h2>

<ul>
  {% for tutorial in site.tutorials %}
    <li>
      <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: <b>{{ tutorial.description }}</b>
    </li>
  {% endfor %}
</ul>

<style>
  footer {
    display: none;
  }
</style>
