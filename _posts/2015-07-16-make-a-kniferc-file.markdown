---
layout: post
title:  "Multiple organizations with a .kniferc file"
date:   2015-07-16 6:27:00
categories: chef
---

Chef 12 has an awesome new feature called 'organizations' that allows you to split your chef server into logical units. Perfect if you have a hard divide between production and lab.

![](http://cl.ly/image/333o06302W15/Screenshot%202015-07-16%2017.27.42.png)

Organizations have separate cookbooks, users, roles and environments. That also means that you need to have separate knife.rb config files.

While you could try and use a tool like [knife block](https://github.com/knife-block/knife-block) to manage multiple knife config files, it currently is very buggy and [doesn't work well](https://github.com/knife-block/knife-block/issues/32) with RVM on Mac OSX

Another approach would be to use variables in your knife.rb

```ruby
current_dir = File.dirname(__FILE__)
  user = ENV['OPSCODE_USER'] || ENV['USER']
  node_name                user
  client_key               "#{ENV['HOME']}/chef-repo/.chef/#{user}.pem"
  validation_client_name   "#{ENV['ORGNAME']}-validator"
  validation_key           "#{ENV['HOME']}/chef-repo/.chef/#{ENV['ORGNAME']}-validator.pem"
  chef_server_url          "https://api.opscode.com/organizations/#{ENV['ORGNAME']}"
  syntax_check_cache_path  "#{ENV['HOME']}/chef-repo/.chef/syntax_check_cache"
  cookbook_path            ["#{current_dir}/../cookbooks"]
  cookbook_copyright       "Your Company, Inc."
  cookbook_license         "apachev2"
  cookbook_email           "cookbooks@yourcompany.com"
```
Then you can just run `export ORGNAME=foo` everytime you run a knife command. While that may work for some, it still makes it easy to accidentially run the knife command against the wrong server.


## Aliases to the rescue

Here is how I do it.

~/.chef/.kniferc  

```bash
knifeprodfun() {
  /opt/chefdk/bin/knife $@ -c ~/.chef/nd-prod-knife.rb
}

knifelabfun() {
  /opt/chefdk/bin/knife $@ -c ~/.chef/nd-dev-knife.rb
}

alias knifeprod=knifeprodfun
alias knifelab=knifelabfun
```

~/.bash_profile (for mac, or ~/.bashrc if on linux)

```bash
source ~/.chef/.kniferc
```

~/.chef/knife.rb  

```bash
This file is intentionally left blank.
Dont use knife anymore you fool, use knifeprod and knifelab
```

Then you have two commands that will ensure you are running against the correct chef server

    knifeprod  
    knifelab  

Ensure that there is nothing in the default ~/.chef/knife.rb

Have a better way to handle this problem? Please let me know. 