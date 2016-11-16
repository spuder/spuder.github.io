---
layout: post
title: Automating F5s with powershell
date: 2016-11-15 06:04:00
categories: powershell f5 automation
---

At my job we are on the 'infrastructure as code' bandwagon. The most popular tool for coding your infrastructure is terraform. 

Unfortunatly we have 3 core pieces of software that don't yet work with terraform, and we don't have the time to learn golang to write them. 

- F5 loadbalancers
- Nutanix Hypervisors
- Octopus Deploy

Until terraform gets the support we need, we wrote our own home grown version of terraform in powershell. 
Now we can define our vms as objects and put them in version control. Hooray! 

```json
{
  "foobar": {
    "Size": {
      "CPU": 1,
      "RAM": 2,
      "Cores": 4
    },
    "Volumes": [{
      "Description": "Cdrive",
      "ImageName": "win2012-vagrant",
      "Type": "FromImage"
    }],
    "Provisioners": [{ 
      "Chef": {
        "Environment": "dev",
        "RunList": [
          "role[web]",
          "role[splunk]"
        ],
        "BootstrapVersion": "12.16.42"
      }
    },{
      "F5": {
        "Pools": [ "foo", "bar" ],
        "Port": 80,
        "HealthMonitors": ["icmp"]
      }
    }],
    "Location": {
      "ActiveHypervisor": "nutanix",
      "Nutanix": "nutanix.example.com"
    },
    "Metadata": {
      "Powerform": "true"
    },
    "Network": [{
      "VLANID": "130"
    }],
    "DNS": {
      "Server": "lab-domain01",
      "Zone": "example.com"
    }
  }
}

```

The hardest part by far was navigating the poorly written F5 powershell cmdlet api documentation. It doesn't even have examples! 
I've shared the hard work of guessing how the powershell cmdlets are supposed to work here. I've navigated the mine field, here is some help. 

{% gist b6d0bf622c35a21f96d0d38cbea5c7fd %}
