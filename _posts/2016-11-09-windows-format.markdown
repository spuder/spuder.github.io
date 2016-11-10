---
layout: post
title: windows automated volume format
date: 2016-11-10 12:43:00
categories: windows nutanix
---

On linux there are two common ways to format a secondary volume

- ssh and then run fdisk
- cloud init

So how do you do this on windows in an automated way? 

[AWS recommends](http://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/ebs-using-volumes.html) using plain old RDP and clicking through Disk Management or using their EC2Configuration Service   
[Azure recommends](https://azure.microsoft.com/en-us/documentation/articles/virtual-machines-windows-classic-attach-disk/) RDP, the azure-cli or plain old powershell. 
OpenStack recommends CloudBase init  

## CloudBase Init

[CloudBase init](https://cloudbase.it/cloudbase-init/) is the windows version of cloud init from the fine folks at cloudbase solutions.


## Nutanix

Unfortunately nutanix doesn't have a metadata service yet, so cloudbase init wont work on windows machines. 

The following powershell will find all raw volumes, and format them as GPT with the name 'datadisk'


{% gist 50b722400097efb3854de7408065a8af %}


## Deploying

To actually deploy this script, you will need to `Invoke-Command` or embed it in your configuration managment tool (Ansible,Chef,Puppet,Salt)

Here is an example for Chef

```ruby
owershell_script 'Format Volumes' do
  guard_interpreter :powershell_script
  code <<-EOH
  Write-Host "Initializing and formatting raw disks"

  $disks = Get-Disk | where partitionstyle -eq 'raw'

  ## start at F: because D: is reserved in Azure and sometimes E: shows up as a CD drive in Azure
  $letters = New-Object System.Collections.ArrayList
  $letters.AddRange( ('F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z') )

  Function AvailableVolumes() {
      $currentDrives = get-volume
      ForEach ($v in $currentDrives) {
          if ($letters -contains $v.DriveLetter.ToString()) {
              Write-Host "Drive letter $($v.DriveLetter) is taken, moving to next letter"
              $letters.Remove($v.DriveLetter.ToString())
          }
      }
  }

  ForEach ($d in $disks) {
      AvailableVolumes
      $driveLetter = $letters[0]
      Write-Host "Creating volume $($driveLetter)"
      $d | Initialize-Disk -PartitionStyle GPT -PassThru | New-Partition -DriveLetter $driveLetter  -UseMaximumSize
      # Prevent error ' Cannot perform the requested operation while the drive is read only'
      Start-Sleep 1
      Format-Volume  -FileSystem NTFS -NewFileSystemLabel "datadisk" -DriveLetter $driveLetter -Confirm:$false
  }
  EOH
  only_if "[bool]$(get-disk | where partitionstyle -eq 'raw')"
end
```
