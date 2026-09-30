---
title: Shipping Container K8s
tagline: A Kubernetes cluster of small computers built into a 1:20 scale model shipping container.
repo: spuder/shipping-container-k8s
group: homelab
featured: true
order: 4
tags: [Fusion 360, Kubernetes, 3D printing]
image: /projects/shipping-container.jpg
imageAlt: A green 1:20 scale Evergreen shipping container on a 3D-printed base, with its door open to show a cooling fan inside.
stars: 8
links:
  - { label: Fusion 360 model, url: "https://a360.co/344KoWN" }
---

## The idea

Kubernetes runs on containers, so I put a Kubernetes cluster inside a shipping container: a 1:20 scale plastic model, fitted with 3D-printed parts that hold several small computers.

## How it's built

- **Printed parts:** a base, backplate, front plate, ribs, pegs and SSD holders, designed in Fusion 360 and printed in PETG.
- **Cooling:** a 92 mm fan in a holder printed in flexible TPU, so it squeezes into the container and stays put by friction.
- **Connections:** Cat6 keystones and a DC barrel jack mounted in the container for network and power.

All the Fusion 360 source files and printable STLs are in the repo. The README has the parts list and notes on the two versions of the container model, which differ by about 1 mm.
