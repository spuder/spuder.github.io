---
title: 10-Inch Rack Generator
tagline: A parametric OpenSCAD model that generates 3D-printable 10-inch mini rack shelves for any device.
repo: spuder/10-Inch-Rack-OpenSCAD
group: homelab
featured: true
order: 3
tags: [OpenSCAD, 3D printing, Homelab]
image: /projects/rack.jpg
video: /projects/rack.mp4
imageAlt: Animated render of a generated 10-inch mini-rack shelf.
stars: 112
links:
  - { label: MakerWorld, url: "https://makerworld.com/en/models/1765102-10-inch-mini-rack-generator" }
---

## The problem

10-inch mini racks are popular for small homelabs, but every mini PC, switch or single-board computer needs its own mounting bracket. Designing each one by hand in CAD gets old quickly.

## What I built

One OpenSCAD file that generates a rack-mount shelf from a few settings, such as device size, rack units and air holes. Pick values in OpenSCAD's Customizer (or on MakerWorld), render, and print.

- **Presets:** my own configurations are saved as Customizer presets, so rebuilding a model is a single command:

  ```bash
  openscad -p 10InchRackGenerator.json -P "Xyber Hydra" -o out.stl 10InchRackGenerator.scad
  ```

- **Tests:** a [bats-core](https://github.com/bats-core/bats-core) suite renders fast PNG previews for every change, checks the full STL geometry through CGAL, and automatically renders every saved preset.

## Where it's used

The generator is published on MakerWorld, so people can customize a rack in the browser without installing OpenSCAD.
