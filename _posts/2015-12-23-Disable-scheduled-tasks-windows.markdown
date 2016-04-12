---
layout: post
title:  "Disable scheduled tasks on windows with CHEF"
date:   2015-12-23 10:49:00
categories: chef windows task  

---
Everybody knows that windows is very aggressive in encouraging you to install windows updates. Windows 2012 R2 takes this to a whole new level by running background maintenance tasks that are impossible to kill normally.

Windows maintenance can suck up a lot of cpu performance. 

![](http://i.stack.imgur.com/3Bswq.png)


**tl;dr** See [this stack overflow question](http://superuser.com/a/743187/167769) for an explanation of how to kill maintenance tasks.  

In theory the maintenance tasks run are *supposed* to run when the cpu is idle, however I've found that a subset of my web servers were having terrible performance problems. 


## Why you probably don't want to disable maintenance: 
 
 Fist a disclaimer. The maintenance tasks does things like defragging (do people still do that?). They also trigger automatic windows updates. If you disable these tasks make sure you have some other mechanism to deploy windows updates on a schedule. 
Two good approaches are: 

- WSUS - Microsofts Windows Update Server
- [packer](http://www.hurryupandwait.io/blog/creating-windows-base-images-for-virtualbox-and-hyper-v-using-packer-boxstarter-and-vagrant?rq=packer)

At my job, we use a combination of both. WSUS for long lived 'pets' servers, and new golden images deployed with configuration management for the ['cattle' servers](http://www.slideshare.net/randybias/pets-vs-cattle-the-elastic-cloud-story). In fact, many web servers aren't patched at all. They are instead destroyed and recreated from packer updated golden images on a biweekly basis. 

 
## Lets do it anyway

With the disclaimer out of the way, here is how you disable a scheduled task with powershell, taken from the stack overflow question mentioned earlier. 

```bash
schtasks /change /tn '\Microsoft\Windows\TaskScheduler\Regular Maintenance' /DISABLE
```

And the same way to disable a task with CHEF 

```ruby
windows_task '\Microsoft\Windows\TaskScheduler\Regular Maintenance' do
  action [:end, :disable]
end
```

Note! If you try and disable all 3 of the scheduled tasks, you will notice a problem when disabling "Maintenance Configurator"

> The user account you are operating under does not have permission to disable this task.   

![](https://www.dropbox.com/s/zed3tj3zye3b3s7/Screenshot%202015-12-23%2011.17.14.png?dl=1)

"Maintenance Configurator" is a special task that acts as a watchdog. If you disable the other two tasks, it will reenable them the next time it runs. It can not be disabled through regular means. 

Not even a local administrator can disable the task. (Thanks Microsoft)

You can't disable the task with schedtasks.exe either

    #DOES NOT WORK
    schtasks /change /tn "\Microsoft\Windows\TaskScheduler\Maintenance Configurator" /DISABLE
    
The only way to disable the task is to use psexec to execute a remote call to itself to disable the task as SYSTEM (stupid, I know)

Install [pstools](https://technet.microsoft.com/en-us/sysinternals/psexec.aspx?f=255&MSPPError=-2147217396) by downloading installer

If you use chocolatey package manager, you can install pstools like so:

    choco install pstools

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


The final cookbook would look like this:

```ruby
# Stops 'Regular Maintenance' scheduled task
windows_task '\Microsoft\Windows\TaskScheduler\Regular Maintenance' do
  action [:end, :disable]
end

# Assumes chocolatey cookbook is present
chocolatey 'pstools' do
  action :install
end

windows_task 'Maintenance Configurator' do
  user      "SYSTEM"
  command   "psexec -accepteula -s schtasks /change /tn '\\Microsoft\\Windows\\TaskScheduler\\Maintenance Configurator' /DISABLE"
  action [:create,:run,:delete] # http://git.io/vs1Hm
  run_level :highest
  force true
end

windows_task '\Microsoft\Windows\TaskScheduler\Idle Maintenance' do
  action [:end, :disable]
end
```

![](https://www.dropbox.com/s/ul16m4qvsr98975/Screenshot%202015-12-23%2010.57.18.png?dl=1)
