---
layout: post
title:  "Slack notifications with hyperv"
date:   2015-05-22 15:00:00
categories: slack, hyperv
---

# HyperV

I frequently start VM's on a hyperV host using the following powershell

```
$HVNAME="vm01"
$HVCPUS=2
$HVMEMORY=2GB
$HVCOMPUTERNAME="hyperv01"
$HVPATH="\\networkshare01\hyperv-shared"
$HVTEMPLATE="$HVPATH\$HVNAME"
$HVVLAN=123
$SLACKUSERNAME = '@someone'

Copy-Item "$HVPATH\Templates" "$HVPATH\$HVNAME" -recurse

NEW-VM -ComputerName $HVCOMPUTERNAME -Name $HVNAME -MemoryStartupBytes $HVMEMORY -VHDPath "$HVPATH\$HVNAME\ubuntu\Virtual Hard Disks\ubuntu.vhdx" -Path $HVPATH -SwitchName "vSwitch" -BootDevice VHD -Generation 1

Get-VM -ComputerName $HVCOMPUTERNAME -VMName $HVNAME | Get-VMProcessor | Set-VMProcessor -Count $HVCPUS

Set-VMNetworkAdapterVlan -ComputerName $HVCOMPUTERNAME -VMName $HVNAME -Access -VlanId $HVVLAN

Start-VM -ComputerName $HVCOMPUTERNAME -VMName $HVNAME
```

I'm using the awesome slack instant messaging application. It has an awesome API that lets you send messags through REST. 

Steps to integrate:

1. Add a [custom incomming webook](https://api.slack.com/incoming-webhooks)  

2. Execute the following REST command


Linux
```bash
curl -s -X POST --data "payload={\"channel\":\"@somone\",\"username\":\"foobar\",\"text\":\"Your VM is ready @someone\"}" https://hooks.slack.com/services/XXXXXXXXXXXX/xxxxxxx
```

Powershell   
 
```bash
$Slackjson = @{}
$Slackjson.channel = '@someone'
$Slackjson.username = 'foobar'
$Slackjson.text = "@somone Your VM $HVNAME is ready on $HVCOMPUTERNAME"
$Slackjson = $Slackjson | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri https://hooks.slack.com/services/XXXXXXXXXXXX/xxxxxx -Body $Slackjson

```

Notice that I'm not sending the data to a channel, but instead am sending a direct message to myself. I found [this trick here:](https://groups.google.com/forum/#!topic/slack-api/091x-gs1iFI) 

Now whenever I start a VM, I get a notification when it is booted up. This could be futher extended to fetch the IP Address or any additional information that you want. 