---
layout: post
title:  "CHEF copy from network path"
date:   2015-09-09 15:00:00
categories: chef windows  

---

#Update
I discovered a bug in the `mount` resouce which [has been reported here:](https://github.com/chef/chef/issues/3904)

Until that bug is fixed, mount can wreak havoc on your VM. Use this code instead: 

```
  batch "download_someAwesomePackage" do
    code <<-EOH
    SET username=#{node['domain']}\\#{someuser}
    SET password=#{somepassword}
    net use "\\nas01.example.com\\msi" %password% /user:%username%
    :copy
    copy "\\nas01.example.com\\msi\\someAwesomePackage.msi" "c:\\someAwesomePackage.msi
    IF ERRORLEVEL 0 goto disconnect
    goto end
    :disconnect
    net use "\\nas01.example.com\\msi" /delete
    goto end
    :end
    EOH
    action :run
    not_if do File.exists?("c:\\someAwesomePackage.msi") end
  end

  windows_package 'someAwesomePackage' do
    source 'c:\\someAwesomePackage.msi'
  end
  
```

----

One of the beauties of chef is the ease of deploying software from a package or git repo.

If you are in a windows world, or have a samba network share that requires authentication, you might notice something wierd.

Given the following example:

```ruby

remote_file "c:\\someAwesomePackage.msi" do
  source "\\\\nas01.example.com\\someAwesomePackage.msi"
end

```

If you run this from the command line, it work work as expected.

However if you run chef from a scheduled task, you will get errors.

```
[2015-09-09T14:36:31-04:00] FATAL: Errno::EACCES: remote_file[c:\someAwesomePackage.msi] (foo::bar line 1) had an
 error: Errno::EACCES: Permission denied - \\nas01.example.com\someAwesomePackage.msi
```

Thats because when you run chef as yourself, you will inherit your credentials. Whereas when running from a scheduled task, chef runs as `SYSTEM`

Proof

```ruby
powershell_script "foo" do
  code <<-EOH
    whoami >> c:\\whoami.txt
  EOH
  action :run
end

```

    chef-apply ~\Desktop\foo.rb


## Solutions

Clever chefers might think of two solutions:

- Add credentials to [remote_file](https://docs.chef.io/resource_remote_file.html) => Unfortunately, remote_file doesn't have the option for credentials  
- [deploy](https://docs.chef.io/resource_deploy.html)  => While deploy does accept credentials, it only works with git repos, not UNC paths.


Luckliy chef has a native way to mount network shares that *does* accept network credentials.

```ruby
mount 'T:' do
  device '\\\\nas01.example.com'
  domain 'example.com'
  username 'foo'
  password 'correct-horse-battery-staple'
  action :mount
end

# Note that you need 3 slashes after 'file:'
remote_file 'C:\\someAwesomePackage.msi' do
  source 'file:///T:/someAwesomePackage.msi' #Use T:/ not T:\\
  checksum "12345" #shasum -a 256 someAwesomePackage.msi
  notifies :umount, 'mount[N:]', :delayed # Not needed but doesn't hurt
end
```

The network share will automatically disappear when the chef run ends. Additionally you don't need to worry about the mapped network drive being available to other users, nor be visible in 'My Computer'

Additional Information: [mount](https://docs.chef.io/resource_mount.html)

Thanks to stevenmurawski in the IRC channel for the suggestion


## Troubleshooting

**Problem:**   

```
 remote_file[c:\someAwesomePackage.msi] action create[2015-09-10T13:47:46-04:00] WARN: file:///T:\someAwesomePackage.msi was an invalid URI. Trying to escape invalid characters
```

**Solution:**

  Make sure you use `file:///T:/foo` and not `file:///T:\\foo`

--- 
**Problem:**

  Network Share won't unmount and powershell gives error "Attempting to perform the InitializeDefaultDrives operation on the 'FileSystem' provider failed."

**Solution:**

  You had a typo in your mount point. You need to edit the registry to unmount

  [https://github.com/chef/chef/issues/3904](https://github.com/chef/chef/issues/3904)
