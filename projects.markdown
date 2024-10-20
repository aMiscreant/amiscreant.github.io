---
layout: page
title: Projects
permalink: /projects/
---

<h2>My Projects</h2>

<ul>
  {% for project in site.projects %}
    <li>
      <a href="{{ project.url }}">{{ project.title }}</a>: {{ project.description }}
    </li>
  {% endfor %}
</ul>

