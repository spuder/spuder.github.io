---
layout: post
title:  "CHEF on Windows - Promote to local administrator"
date:   2015-07-27 15:00:00
categories: chef
---

The world of Automation on Windows, sometimes requires that you run a script as a local administrator account.

In powershell/batch the command to add and remove a domain account to local administrators is: 


    net localgroup administrators example.com\someuser /add
    
    
To automate this with chef, do this: 

```ruby
  batch 'promote user' do
    code <<-EOH
      net.exe localgroup administrators #{node['domain']}\\#{some_user} /add
      EOH
    action :run
    notifies :run, 'batch[demote user]', :delayed
  end
```

Then to demote that user at the end of the chef run (because you don't want to leave domain admin accounts just laying arround)

```ruby
batch 'demote user' do
    guard_interpreter :powershell_script
    code <<-EOH
    net.exe localgroup administrators #{some_user} /delete
    EOH
    only_if "[boolean](net.exe localgroup administrators  | where {$_ -match '#{some_User}'} )"
  action :run
end
```

Note that you need to ensure proper idempotency by using an `only_if` statement. In the demote resource, I'm using a `powershell_script` as a [guard interpreter](https://docs.chef.io/resource_common.html#guard-interpreters), but running the actual command as batch. 


##Additional Windows Automation

In windows, if you need to run a command as another user, you have a couple of options. 

Use `Invoke-Command`

The problem with Invoke-Command is that it is intended to be executed on a remote host. While you can pass in `.` or `<localhostname>` as a parameter, that only works if you user has remote access enabled.


The most commonly suggested workaround from the community, is to run the script as a scheduled task. 

Lucklily, the windows cookbook has a scheduled task resource called `windows_task`


```ruby
#You will need to include the windows cookbook

template 'start_regall.ps1' do
  source 'start_regall.ps1.erb'
  path "c:\\start_regall.ps1"
  variables(
    :user            => "#{node['domain']}\\#{some_user}",
    :password        => "#{user_password}",
  )
  action :create
end

windows_task 'regall' do
  user     "#{node['domain']}\\#{some_user}"
  password "#{user_password}"
  command  "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe -noprofile -noexit -executionpolicy Bypass -File 'c:\\start_regall.ps1'"
  action [:create,:run,:delete]
  force true
end

```

This code could likely be cleaned up a bit, but is pretty bulletproof in my tests. 
