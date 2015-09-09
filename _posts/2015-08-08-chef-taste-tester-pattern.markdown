---
layout: post
title:  "Chef notify :before resource"
date:   2015-08-10 13:30:00
categories: chef design-pattern  

---

Chef is awesome. The one feature that chef 12 is missing is the ability to do a conditional notify *before* another resource. I don't blame chef since no other configuration management tool I've tried supports this either. Normally this should be provided by the package.

Example scenario:

Windows machine with a custom DLL that is managed by a cookbook. The dll is needed by a service that is also managed by the cookbook.

What do you do if you need to stop the service *before* you replace the dll. While chef cookbooks run in order, there is no way to determine that a resource is *about* to be updated. You can use null resources, and send a notify to stop a service, but you can't know that the service needs to be restarted until after the file is replaced.

Option A: Ask the developer who made the dll to make an MSI package that handles the services (not likely to happen).  
Option B: Use the food taster design pattern. (I just made that term up)  

Hundreds of years ago, kings and leaders would have prisoners taste their food before they ate so they could determine if the food was poisoned. We will use the same principle to determine if a file is about to be changed.

Example  

```ruby
powershell_script 'stopService' do
  guard_interpreter :powershell_script
  code <<-EOH
    Stop-Service 'foo'
  EOH
  only_if "(Get-Service -Name foo)"
  action :run
end

cookbook_file 'c:\\windows\\foo.dll' do
  source 'foo.dll'
  action :nothing
end

cookbook_file 'c:\\windows\\foo-chef.dll' do
  source 'foo.dll'
  action :create
  notifies :run, "powershell_script[stopService]", :immediately
  notifies :create, "cookbook_file[c:\\windows\\foo.dll]", :immediately
end

powershell_script 'startService' do
  guard_interpreter :powershell_script
  cod <<-EOH
    Start-Service 'foo'
  EOH
  only_if "(Get-Service foo.status -eq 'Stopped'"
  action :run
end
```

Here we have 2 identical files
c:\windows\foo-chef.dll
c:\windows\foo.dll

If the foo-chef.dll is updated, then chef stop the service and replace the real dll

Additional Resources  
[updated_by_last_action?](http://www.frankmitchell.org/2013/02/chef-events/)
[compile time vs run time](http://stackoverflow.com/questions/25980820/please-explain-compile-time-vs-run-time-in-chef-recipes/26000270#26000270)
