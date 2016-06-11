---
layout: post
title:  "CHEF breadcrumb design pattern"
date:   2015-10-08 9:30:00
categories: chef design-pattern  

---


Sometimes when you are automating your infrastructure, you run into a situation where you need to manage a file once, and then ignore it later so that another program can modify it. (Looking at you redis).

Chef has a `create_if_missing` resource type which can accomplish this nicely.


```ruby
file '/var/foo.sh' do
  action :create_if_missing
end
```

However what if you later have a need to modify that file? Your only option would be to destroy and recreate the VM, or ssh/rdp in and delete foo.sh.

Here is an alternative idea; Use a breadcrumb.



```ruby
file '/var/foo.sh' do
  action :create
  not_if do File.exists?('/var/foo.breadcrumb') end
end

file '/var/foo.breadcrumb' do
  content 'foo.breadcrumb prevents foo.sh from being modified'
  action :create_if_missing
end
```

The foo.sh will be overwritten once, and as long as the breadcrumb file exists, it will not be modified again.

The main advantage over the bread crumb over just using `create_if_missing` directly on the resource, is that you can perform additional logic on that file.

For example, only restart a service if the file is created

```ruby
file '/var/foo.sh' do
  action :create
  not_if do File.exists?('/var/foo.breadcrumb') end
  notifies :restart, 'service[bar]'
end
```

Or delete the breadcrumb if a package is updated. Chef will then modify `foo.sh`

```ruby
package 'derp' do
  action :install
  notifies :delete, 'file[/var/foo.breadcrumb]'
end
```
In cookbooks where an application needs to create the initial config file, then surrender control of that file to another process, this pattern allows you to take control back of that file by deleting its breadcrumb file.


We use this breadcrumb pattern in one of our cookbooks at work to let chef create a config file once, and then let developers modify it as often as they want. It also lets a config file persist across updates of a build, and only get reset on major updates.

Related: [The food taster pattern](http://spuder.github.io/chef/design-pattern/chef-taste-tester-pattern/)
