---
title: OpenSpool Mobile
tagline: iOS and Android companion app for reading and writing OpenSpool NFC filament tags.
repo: spuder/OpenSpoolMobile
group: hardware
featured: true
order: 2
tags: [TypeScript, iOS, Android, NFC]
image: /projects/openspool-mobile.png
imageFit: contain
imageAlt: Screenshot of the OpenSpool app on an iPhone showing filament tag details.
stars: 14
links:
  - { label: App Store, url: "https://apps.apple.com/us/app/openspool/id6740551901" }
  - { label: Google Play, url: "https://play.google.com/store/apps/details?id=io.openspool" }
---

## Why an app

[OpenSpool](/projects/openspool/) needs a tag on every spool. Most phones can already read and write NFC, so a phone app is the easiest way to program those tags. You don't need a second device.

## What it does

- Reads an existing OpenSpool tag and shows its filament type, color and brand
- Writes new tags in the OpenSpool format
- Available on the iOS App Store and Google Play, with a sideload APK on every GitHub release

## Shipping it

Releases are automated. Pushing a version tag builds both platforms in GitHub Actions: an APK for the GitHub release, an AAB for the Play Store, and a TestFlight build for iOS. The version number comes from the tag, and publishing goes through protected environments that need approval.
