---
layout: post
title:  "Chef notify :before resource"
date:   2015-08-10 13:30:00
categories: chef, design-pattern  

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
  code <<-EOH
    Stop-Service 'foo'
  EOH
  action :nothing
end

tasteTesterIsDead = file 'c:\windows\foo-chef.dll' do
  source 'foo.dll'
  action :create
end

if tasteTesterIsDead.updated_by_last_action?
  powershell_script 'stopService' do
    guard_interpreter :powershell_script
    code <<-EOH
      Stop-Service 'foo'
    EOH
    only_if "(Get-Service -Name foo)"
    action :run
  end

  file 'c:\windows\foo.dll' do
    source 'foo.dll'
    action :create
  end
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

If the foo-chef.dll is updated, then chef will mark the resource as being updated and will enter the conditional that replaces the real file.

To learn more about updated_by_last_action? [see this blog](http://www.frankmitchell.org/2013/02/chef-events/)
