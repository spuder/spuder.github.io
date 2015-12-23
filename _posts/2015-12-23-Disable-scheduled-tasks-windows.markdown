---
layout: post
title:  "Disable scheduled tasks on windows with CHEF"
date:   2015-12-23 10:49:00
categories: chef windows task  

---

Windows tries to be helpful, it really tries. Windows 2012 R2 has scheduled tasks that run in the background the perform regular maintenance.   

![](http://i.stack.imgur.com/3Bswq.png)

This task is *supposed* to run when the cpu is idle, however we find that our IIS web servers were having terrible performance problems, as soon as we disabled the maintenance, performance was restored. 


## Why you probably don't want to disable maintenance: 
 
 Windows scheduled tasks are important because they install windows updates and trigger antivirus scans. At my company, we can afford to do this because we have moved away from ["servers as pets" to "servers as cattle"](http://www.slideshare.net/randybias/pets-vs-cattle-the-elastic-cloud-story).  
We no longer let windows install windows updates. Instead we use [packer](https://www.packer.io/) to generate new fully patched windows golden images on a weekly basis. Instead of installing updates, we destroy the vm, and spin up a new fully patched one in its place. 
 
## Lets do it anyway

With the disclaimer out of the way, here is how you disable a scheduled task with powershell.

```bash
schtasks /change /tn '\Microsoft\Windows\TaskScheduler\Regular Maintenance' /DISABLE
```

And the same way to disable a task with CHEF 

```ruby
windows_task '\Microsoft\Windows\TaskScheduler\Regular Maintenance' do
  action [:end, :disable]
end
```

If you try and disable all 3 of the scheduled tasks, you will notice a problem when disabling "Maintenance Configurator"

> The user account you are operating under does not have permission to disable this task.   

![](https://www.dropbox.com/s/zed3tj3zye3b3s7/Screenshot%202015-12-23%2011.17.14.png?dl=1)

"Maintenance Configurator" is a special task that acts as a watchdog. If you disable the other two tasks, it will reenable them the next time it runs. It can not be disabled through regular means. 

Not even a local administrator can disable the task. The reason is fully explained in this [stackoverflow question](http://superuser.com/questions/497500/disable-automatic-maintenance-in-windows-8)

You can't disable the task with schedtasks.exe either

    #DOES NOT WORK
    schtasks /change /tn "\Microsoft\Windows\TaskScheduler\Maintenance Configurator" /DISABLE
    
The only way to disable the task is to use psexe to execute a remote call to itself to disable the task as SYSTEM (stupid, I know)

    #WORKS
    psexec -accepteula -h -s schtasks /change /tn "\Microsoft\Windows\TaskScheduler\Maintenance Configurator" /DISABLE
    

You would assume that you could put this in a chef `powershell_script` resource, however that is not the case. 

```ruby
# DOES NOT WORK
powershell_script 'Maintenance Configurator' do
 command 'psexec -accepteula -h -s schtasks /change /tn "\Microsoft\Windows\TaskScheduler\Maintenance Configurator" /DISABLE'
 action :run
end
```

You must use the `windows_task` resource in the [windows cookbook](https://github.com/chef-cookbooks/windows#windows_task) to create a scheduled task, that runs as 'SYSTEM' that executes powershell to call psexe.exe to remotely telnet to localhost to execute schtasks.exe to disable the scheduled task. 

Whew, that was a lot of work. Microsoft really doesn't want you disabling this. 


tl;dr add this to your cookbook

```ruby
# Stops 'Regular Maintenance' scheduled task
windows_task '\Microsoft\Windows\TaskScheduler\Regular Maintenance' do
  action [:end, :disable]
end

windows_task 'Maintenance Configurator' do
  user      "SYSTEM"
  command   "psexec -accepteula -s schtasks /change /tn '\\Microsoft\\Windows\\TaskScheduler\\Maintenance Configurator' /DISABLE"
  action [:create,:run] # http://git.io/vs1Hm
  run_level :highest
  force true
end

windows_task '\Microsoft\Windows\TaskScheduler\Idle Maintenance' do
  action [:end, :disable]
end
```

![](https://www.dropbox.com/s/ul16m4qvsr98975/Screenshot%202015-12-23%2010.57.18.png?dl=1)
