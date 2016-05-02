---
layout: post
title:  "CHEF 12 Admin Clients"
date:   2015-07-29 08:14:00
categories: chef
---

There are two types of objects in chef.

- Users
- Clients

A client is just like a user, except that they are only able to access the API (no web interface). Every node that you bootstrap becomes a client.

    knife client list

We got to the point in chef, where we wanted to automate uploading cookbooks, roles, environments ect..  Up until now, I've been running the following commands on my workstation. 

    cd ~/chef/dev-repo
    knife role from file roles\*.json
    knife environment from file environments\*.json
    cd ~/chef/prod-repo
    knife role from file roles\*.json
    knife environment from file environments\*.json

Tedious right? 

## gitlab-ci to the rescue

The natural solution is to make a automated task in your Integration tool ( jenkins, bamboo, gitlab-ci, travis )

If you create a new client, and attempt to have a job run these scrips for you, you'll likely get this error. 

```bash
CHEF_ENV=devops-lab knife user list
ERROR: You authenticated successfully to https://chef.example.com:443/organizations/dev as foobar but you are not authorized for this action
Response:  missing read permission
```

Thats because your user isn't an administrative user. In chef 11 and chef 12 opensource (but not chef 12 enterprise), you create [an administrative client with the -a flag:](https://docs.chef.io/knife_client.html#create) 


	# Only works on chef 11, and chef 12 opensource
    knife client create foobar -a


Chef 12 enterprise doesn't really have the concept of administrative clients. You could create an admin user, but that would be dangerous. So what do you do?  

## Knife ACL

In chef 12 enteprise, to grant a specific user CRUD actions on the API, you will need to explicitly set an ACL for them. Chef has an [official plugin called knife-acl](https://github.com/chef/knife-acl) which will do this for you. You could also try and do this through the chef web portal, however even after working with chef support for hours, I couldn't get the web portal to set all the ACL's that I wanted. 

You can set 5 attributes 'create,read,update,delete,grant' (CRUDG). In most cases, I don't allow the clients to delete data since I prefer to do that manually. 

Here I'll create a new client called 'foobar', and a new group called 'admin-clients'. You can name them whatever you like. 

```bash
knife client create foobar
knife group create admin-clients

knife group add client foobar admin-clients

# Environments CRU
knife acl add group admin-clients containers environments create,read,update
knife acl bulk add group admin-clients environments '.*' create,read,update --yes

# Roles CRU
knife acl add group admin-clients containers roles create,read,update
knife acl bulk add group admin-clients roles '.*' create,read,update --yes
```

This will allow any client in the admin-client group to read and upload new environments / roles. 
You could also add the ability to update databags, cookbooks ect.. Note that cookbooks are special and need 3 commands, instead of the normal 2. 

```bash
# Cookbooks
knife acl add group admin-clients containers cookbooks  create,read,update
knife acl add group admin-clients containers sandboxes create,update,delete #Sandbox is needed when uploading cookbooks http://bit.ly/1D7Fd4w
knife acl bulk add group admin-clients cookbooks '.*' create,read,update --yes  #Note, this could take some time
```

You should have a new group in the administration pane, with a new client in it. 

![](https://www.dropbox.com/s/b7w918tacggtsp0/Screenshot%202015-07-30%2010.49.14.png?dl=1)


Now just add that client key to your node, and it will be able to upload data for you. 

In another blog post, I'll cover the details of setting up a web hook to push cookbooks every time you commit to a master branch. 

![](https://www.dropbox.com/s/xyffcqzyv3ix91w/Screenshot%202015-07-30%2010.54.28.png?dl=1)
