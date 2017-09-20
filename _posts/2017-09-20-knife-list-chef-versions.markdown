---
layout: post
title: Knife list chef versions
date: 2017-09-20 11:42:00
categories: chef
---

Knife tip

If you want to list the version of chef that is installed on all machines, you can do so with knife.



    knife search 'name:foobar' -a chef_packages.chef.version
    1 items found
    foobar:
      chef_packages.chef.version: 12.21.3



For me, this is helpful when cookbooks have specific cookbook requirements in their metadata.rb, and you want to know if you can run it. 


metadata.rb
```
chef_version '>= 12.17.0'
chef_version '< 13.0.0'
```
