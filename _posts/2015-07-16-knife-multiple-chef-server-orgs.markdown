---
layout: post
title:  "Multiple knife config files"
date:   2015-07-16 6:27:00
categories: chef
---

Chef 12 has an awesome new feature called 'organizations' that allows you to split your chef server into logical units. Perfect if you have a hard divide between production and lab.

![](http://cl.ly/image/333o06302W15/Screenshot%202015-07-16%2017.27.42.png)

Organizations have separate cookbooks, users, roles and environments. That also means that you need to have separate knife.rb config files.

While you could try and use a tool like [knife block](https://github.com/knife-block/knife-block) to manage multiple knife config files, it currently is very buggy and [doesn't work well](https://github.com/knife-block/knife-block/issues/32) with RVM on Mac OSX

[This github gist shows an elegant solution](https://gist.github.com/kevinkarwaski/1860681)

## Variables inside the knife.rb


~/.chef/knife.rb

```
require 'yaml'

CHEF_ENV = ENV['CHEF_ENV'] || "your_environment"
current_dir = File.dirname(__FILE__)
env_config = YAML.load_file("#{current_dir}/#{CHEF_ENV}/config.yml")

log_level                :info
log_location             STDOUT
node_name                env_config["node_name"]
client_key               "#{current_dir}/#{CHEF_ENV}/#{env_config["node_name"]}.pem"
validation_client_name   env_config["validator"] || "chef-validator"
validation_key           "#{current_dir}/#{env_config["validator"]}.pem"
chef_server_url          env_config["server"]
cache_type               'BasicFile'
cache_options( :path => "#{current_dir}/#{CHEF_ENV}/checksums" )

```

Then create as many folders as you want

```bash
sowens-MBP:~ sowen$ tree ~/.chef
/Users/sowen/.chef
├── azure-prod
│   └── knife.rb
├── foo-lab
│   ├── chef-foo-lab-validator.pem
│   ├── config.yml
│   ├── knife.rb
│   └── spuder.pem
├── foo-prod
│   ├── chef-foo-prod-validator.pem
│   ├── config.yml
│   ├── knife.rb
│   └── spuder.pem
├── knife.rb
├── bar-lab
│   ├── chef-bar-lab-validator.pem
│   ├── config.yml
│   ├── knife.rb
│   └── spuder.pem
├── bar-prod
│   ├── chef-bar-prod-validator.pem
│   ├── config.yml
│   └── spuder.pem
```


Here is an example for the foo chef server with the lab environment

foo-lab/config.yml  

```yaml
node_name: "bacon"
server: "https://chef.example.com/organizations/lab"
validator: "chef-foo-lab-validator"
```

foo-lab/knife.rb

```ruby
current_dir = File.dirname(__FILE__)
log_level                :info
log_location             STDOUT
node_name                "spuder"
client_key               "#{current_dir}/spuder.pem"
validation_client_name   "lab-validator"
validation_key           "#{current_dir}/chef-foo-lab-validator.pem"
chef_server_url          "https://chef.example.com/organizations/lab"
cookbook_path            ["#{current_dir}/../cookbooks"]
```

## Usage

To switch between environments, simply set the environment variable `CHEF_ENV` where `CHEF_ENV` is the name of the folder that contains the knife.rb file you want.

```bash
CHEF_ENV=foo-lab knife node list
CHEF_ENV=foo-lab knife node edit

CHEF_ENV=bar-prod knife cookbook list
```

This makes it easy to automate with jenkins / gitlabci by creating automated upload of cookbooks to the correct chef servers, simply by changing an environment variable. 

### Caution

The only downside to this is if you use `test kitchen` and `berkshelf`, they for some reason need to query the knife.rb . You'll need to get in the habbit of setting this environment variable with them too. 


```bash
CHEF_ENV=foo-lab berks install
CHEF_ENV=foo-lab berks upload

CHEF_ENV=foo-lab kitchen setup
CHEF_ENV=foo-lab kitchen converge
```
