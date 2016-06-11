---
layout: post
title:  "CHEF update chef version on windows"
date:   2015-11-03 9:25:00
categories: chef windows msi  

---

**Update** Since this blog post was written, chef has introduced the omni truck 'pipe to bash' style installer for windows.

[Additional documentation](https://docs.chef.io/install_omnibus.html)

Pipe to bash

    curl -L https://omnitruck.chef.io/install.sh | sudo bash

Pipe to powershell / iex

    . { iwr -useb https://omnitruck.chef.io/install.ps1 } | iex; install

---

# Find old nodes

A simple knife search will show what nodes are running old versions of chef

    $ knife search "role:web-default" -a chef_packages.chef.version
    lab-web21:
      chef_packages.chef.version: 12.4.1

or

    $ knife search node 'version:12.4.*'

So how do you update all your nodes to chef 12.5 ?

# Linux
-------

Linux nodes are easy to update using the [omnibus_updater cookbook](https://github.com/hw-cookbooks/omnibus_updater), or simply curling and piping to bash

    knife ssh 'name:[* TO *]' 'curl -L https://www.opscode.com/chef/install.sh | sudo bash'

http://stackoverflow.com/questions/20205889/how-to-update-the-chef-client-version

# Windows
---------


There is no official way to upgrade CHEF on windows nodes. In the future the omnibus_updater cookbook [may support windows](https://github.com/hw-cookbooks/omnibus_updater/issues/32), as of right now the cookbook doesn't work with windows.

So you are left to the following options.

- Copy the MSI to every node, and run

    `msiexec /qn /i C:\inst\chef-client-12.5.1-1.windows.msi ADDLOCAL="ChefClientFeature,ChefServiceFeature,ChefPSModuleFeature"`

    with either `knife winrm` `knife ssh` or  `invoke-command`

This gets tricky because of the [double-hop problem](http://blogs.msdn.com/b/knowledgecast/archive/2007/01/31/the-double-hop-problem.aspx). You will undoubletly get permission denied errors if the msi is on a network share, or if using desktop folder redirection.

- Write a cookbook to deploy the msi to every node

This is its own pandora's box, because unexpected things will happen if you try and run the chef msi from chef. Also, you don't want to try and deploy the msi every time chef runs. You probably only want to run it once.

- Group policy, system center

No, just no. Besides, you probably don't want to update all nodes at once.


----

So what else can you do?


Use a 3rd party utility to deploy msi's to a collection of nodes

Two free ones

- [PDQ](http://www.adminarsenal.com/pdq-deploy)
- [Ninite](https://ninite.com/)

To use PDQ. Simply define a "package", making sure to add the appropriate "ADDLOCAL" string to the parameters section.

- `ChefClientFeature` Required - Adds chef client
- `ChefPSModuleFeature` Optional - Adds chef commands to powershell
- `ChefServiceFeature` Optional - Starts chef as a service

![](http://cl.ly/image/3O0B2W1W2V2P/Screenshot%202015-11-04%2008.12.42.png)


Then create a target list that includes the nodes you want to update. Unfortunately you need to add these nodes by hand, or query from active directory. Again, you can find these nodes like so:

    knife search "role:web-default"  -a chef_packages.chef.version

You could alternatively save to a .txt or .csv file and import that into PDQ

    knife search node 'version:12.4.*' | grep 'Node Name' | awk '{print $3}' > /tmp/nodes.txt

![](http://cl.ly/image/3S3S3k0r0F2P/Screenshot%202015-11-04%2008.51.24.png)


Then click `deploy once` and all target nodes will get the appropriate msi deployed.

![](http://cl.ly/image/2T150Y081A33/Screenshot%202015-11-04%2008.56.23.png)


**Note knife search and the chef web portal won't show the new chef version until chef actually converges on that node**
