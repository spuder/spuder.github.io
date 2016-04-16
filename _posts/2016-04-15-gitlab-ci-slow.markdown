---
layout: post
title:  "Disable scheduled tasks on windows with CHEF"
date:   2015-12-23 10:49:00
categories: chef windows task  

---
I use gitlab and [gitlab-ci](https://about.gitlab.com/gitlab-ci/) and love it. It is the best self hosted CI / Version control system out there in my oppinion. 

I noticed a strange behavior where running `knife upload` from my workstation would return within seconds, where as the same command as a gitlab-ci job would take over 2 minutes. 

If you have seen the same problem, jump to the bottom for the tl;dr version. 

Through trial and error, I found that there are two work arounds: 

```bash
# Takes 2+ minutes
sudo -i -u gitlab-runner knife upload --chef-repo-path . roles -V -n
```

```bash
# Takes seconds to run
sudo -u gitlab-runner knife upload --chef-repo-path . roles -V -n
```

```bash 
# Takes seconds to run
sudo -i -u gitlab-runner /usr/bin/knife upload --chef-repo-path . roles -V -n
```
Progress. It looks like using sudo with `-i` (simulate initial login) is causing problems. Also giving the full path fixes the issue. Thats when I stumbled on this SO question: 
http://stackoverflow.com/questions/13910948/super-slow-usr-bin-env-invocation

Through more trial and error, it definitely looks to be a ruby problem. My gitlab build runner is ubuntu 14.04 using the default ruby 1.9 from apt (no RVM or rbenv). Sure enough, ruby commands take a long time

```bash
# Returns in milliseconds
time /usr/bin/env which
```

```bash
# Returns in minutes
time /user/bin/env ruby
```
Hmmm... Sounds like a problem with the path. 

Looking at the shadow file shows some interesting information: 

```bash
getent shadow gitlab-runner
gitlab-runner:!:16643:0:99999:7:::
```

Looking at the first character after `gitlab-runner`, we see `!`. That indicates that the user account has logins disabled. That gets me thinking, the user probably has a different PATH. 

```bash
# My user path
env | grep PATH
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

```bash
# gitlab-runner path
sudo -i -u gitlab-runner env | grep PATH
PATH=/home/gitlab-runner/.rvm/gems/ruby-2.2.2/bin:/home/gitlab-runner/.rvm/gems/ruby-2.2.2@global/bin:/home/gitlab-runner/.rvm/rubies/ruby-2.2.2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/gitlab-runner/.rvm/bin
```

No wonder. The gitlab-runner has a super weird path to a non existent RVM installation. I'm guessing that there is a 1 minute timeout looking at the first 2 weird paths, then when it gets to /usr/local it returns immediately. 

tl;dr make sure you use the full path to knife in your gitlab-ci (/usr/bin/knife)

```yaml
devops:lab:environments:
  stage: deploy
  script:
    - /usr/bin/knife upload --chef-repo-path . environments
```
