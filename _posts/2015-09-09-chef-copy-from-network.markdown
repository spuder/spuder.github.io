---
layout: post
title:  "CHEF copy from network path"
date:   2015-09-09 15:00:00
categories: chef windows  

---

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
  device '\\\\nas01.example.com
  domain 'example.com'
  username 'foo'
  password 'correct-horse-battery-staple'
  action :mount
end

# Note that you need 3 slashes after 'file:'
remote_file 'C:\\someAwesomePackage.msi' do
  source 'file:///T:/someAwesomePackage.msi'
end
```

Avoid the temptation to unmount the network share after you have copied your files. In my testing, chef could unmount before the file is fully copied. The network share will automatically disappear when the chef run ends, and wont be available to other users, nor be visible in 'My Computer'

Additional Information: [mount](https://docs.chef.io/resource_mount.html)