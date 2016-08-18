---
layout: post
title:  "Chef datacenter design pattern"
date:   2015-08-11 16:43:00
categories: chef design-pattern  

---

Every configuration management tool has the concept of config hierarchy. Puppet has Hiera, ansible has groups

I recently moved from a company that used puppet to a windows shop who was green fielding with chef. Chef is really growing on me, but there is one design pattern that it does not handle well. "Datacenters"

With puppet, if you have multiple datacenters and each needs its own config, you simply create a hiera hierarchy and put your variables in the appropriate level.

Chef has a different data model. As of chef 12, there are [15 different levels of precedence for attributes.](https://docs.chef.io/attributes.html) The main hierarchy looking like the following:  

```

          +------+                 
          | node |                 
          +------+                 
         +----------+              
         |   role   |              
         +----------+              
        +-------------+            
        | environment |            
        +-------------+            

```



## Dealing with datacenter / role specific attributes

There is still one corner case that the above design patten doesn't cover. Suppose you have a specific group of servers that need overrides that are different per datacenter. This creates a 2x matrix that normally could only be modeled by creating a role per datacenter. Thats no big deal if you only have a couple of DCs, but quickly becomes unmanageable. Suppose you had 8 datacenters and 5 types of web servers, You would need 40 roles to model them all! Any time you want to make a change that applies to all of them, you would need to modify 40 files.

```
roles
  datacenter-us-west-web-basic
  datacenter-us-west-web-custom1
  datacenter-us-west-web-custom2
  datacenter-us-west-web-custom3
  datacetner-us-east-web-basic
  datacenter-us-east-web-custom1
  datacenter-us-east-web-custom2
  datacenter-us-east-web-custom3
  datacenter-uk-north-web-basic
....
```

>Matrices should be avoided at all costs

The solution we came up with was to have a datacenter role that contains datacenter specific settings, and override roles that contain the attributes that are unique per service, per datacenter.

```
                    +------+                 
                    | node |                 
                    +------+        
                +----------------+
                | override-roleA |
                +----------------+         
         +-------+ +--------------------+                          
         | roleA | | datacenter-us-west |      
         +-------+ +--------------------+          
        +--------------------------------+            
        |          environment           |            
        +--------------------------------+   
```

This only works as long as you keep each attribute unique per level. For example, if both roleA and roleB had the `foo` attribute, the later one in the runlist would win.

# Example

We have `web servers` , `web upload servers` and custom `mail servers` that are deployed from a monolithic build. The .tgz file created by our build pipeline contains the code for all 3. A `web server`, `upload server` and a `mail server` only differ by the services that are running. Web servers have role specific settings, upload servers have role specific settings _and_ datacenter specific settings whereas mail servers have just datacenter specific settings.

Eventually we will move away from the monolithic builds, and re-architect our software to not require datacenter specific and roles settings, but for now this is what we have.

The roles and environments  

```
roles
  web-default
  web-mail
  datacenter-us-west
  datacenter-us-east
  override-web-upload-us-west
  override-web-upload-us-east
environment
  prod
  stage
```

So if you need a web server, you apply roles

    web-default, datacenter-us-east

For a mail server, you apply roles

    web-mail, datacenter-us-east

For a upload server you apply roles

    web-default, override-web-upload-us-west, datacenter-us-west


## Role principles  

1. Put as many attributes at the lowest possible level. Environment -> Role -> Override-Role -> Node
2. Avoid using node specific settings like the plague
3. Use as few environments as you really need, each has an administrative cost
4. Use as few roles as possible
5. Every node gets a datacenter role
6. Only service roles have run_lists (web,mail, ect..)
7. Only create datacenter specific service roles if absolutely necessary.    

---

Web server role  

```json
{
  "name": "web-default",
  "chef_type": "role",
  "default_attributes": {
    "webserver": true,
    "foo": 42
  },
  "override_attributes": {
  },
  "run_list": [
    "recipe[web-cookbook]",
    "recipe[web-server]"
  ]  
}
```

Mail server role  

```json
{
  "name": "web-mail",
  "chef_type": "role",
  "default_attributes": {
    "mailserver": true,
    "foo" : 33
  },
  "override_attributes": {
  },
  "run_list": [
    "recipe[web-cookbook]",
    "recipe[mail-server]"
  ]
}
```

Datacenter specific role  

```json
{
  "name": "datacenter-us-west",
  "chef_type": "role",
  "default_attributes": {
    "loadbalancer": "5.5.5.5"
  },
  "override_attributes": {
  }
}
```


Upload servers in every datacenter need their own specific settings, put those settings in an "override" role  

```json
{
  "name": "override-web-upload-us-west",
  "chef_type": "role",
  "default_attributes": {

  },
  "override_attributes": {
    "loadbalancer": "10.10.10.10"
  },
  "run_list": [
    "recipe[web-cookbook]",
    "recipe[web-upload]"
  ]
}
```

```json
{
  "name": "override-web-upload-us-east",
  "chef_type": "role",
  "default_attributes": {

  },
  "override_attributes": {
    "loadbalancer": "20.20.20.20"
  },
  "run_list": [
    "recipe[web-cookbook]",
    "recipe[web-upload]"
  ]
}
```

While designing our roles, we [brainstormed every possible pattern in a github gist:](https://gist.github.com/spuder/00aa024e61392d16f4cc). The final design is a hybrid that uses pattern `B` as much as possible, and pattern `A` for the datacenter specific roles.

This pattern works very well for us, understandably it won't work perfectly for everyone. Chef is working on the policy file which will be interesting how it will replace some of our design once it is finalized.


## Questions

### - Roles don't have versions, won't a change to a role affect all environments at once?

That is exactly why chef is creating the policy file. In our infrastructure, runlists don't change very often. And even if they do, they are in version control so it can be reverted back. We put as many settings as possible at the lowest hierarchy level (environment). Every other setting next goes to the datacenter specific role. This minimizes the number of servers that are affected by a single change.

### - What happens if you have the same setting in 2 roles?

The last one will win. Thats why the override roles have all settings in the `override_attributes` section.

### - Don't you have to make a lot of changes if you want to change a setting everywhere?

A change to the entire infrastructure requires making the change to every environment. We have 4 environments (dev, test, stage, prod). So at most 4 files need to be modified.

## Additional Information  

[https://gist.github.com/spuder/00aa024e61392d16f4cc](https://gist.github.com/spuder/00aa024e61392d16f4cc)  
[http://serverfault.com/questions/700860/can-chef-have-different-databags-in-different-datacenters](http://serverfault.com/questions/700860/can-chef-have-different-databags-in-different-datacenters)
