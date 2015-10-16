---
layout: post
title:  "CHEF send Slack notifications"
date:   2015-10-16 10:55:00
categories: chef slack  

---

# Event Handlers

Occasionally in your automation infrastructure, you want an event to trigger a notification. For example, everytime a chef run fails, send an alert. Or everytime a webserver reboots, send an email. 

Chef handles this beautifuly with [event handlers](https://docs.chef.io/handlers.html). 

Basically an event handler is a ruby script that chef calls on a defined trigger. 

# Slack

In my infrastructure, we are adopting slack for both communication and notificaitons. Slack is simple, beautiful and powerful. 

There is a community of chef handlers for [many external services](https://docs.chef.io/handlers.html#community-handlers) such as: 

- IRC
- Email
- GrayLog2
- DataDog
- Graphite

Here is how simple it is to add slack notifications to a cookbook. 

<script src="https://gist.github.com/spuder/6723fec3729125a25264.js"></script>

---

And here is what it looks like in slack

![](https://www.dropbox.com/s/la1hsbbq22j3g0j/Screenshot%202015-10-16%2010.52.29.png?dl=1)


