---
layout: post
title:  "Habitat Tips & Tricks"
date:   2016-06-17 3:16:00
categories: habitat
---

![](https://raw.githubusercontent.com/habitat-sh/habitat/master/www/source/images/habitat-mark.png)

In the first 48 hours with habitat, here are a few things that I've learned. 

# 1. Debugging hab builds

You can see additional output if you prefix any hab command with `DEBUG=1` 

    $ DEBUG=1 hab pkg build . -k yourdepot

# 2. Extract a habitat file

.hart files are basically just a tarball with metadata. You can explode the contents using `tail`, `xzcat` and `tar`

    tail -n +6 /tmp/foo-bar.hart | xzcat | tar xf - -C .

The files will be extracted to the current directory.


# 3. Use variables from other habitat packages

Suppose you have a jar. How do you set JAVA_HOME when JAVA_HOME is defined in core/server-jre ? 

Put the following inside hooks/run or hooks/init

    export JAVA_HOME=$(hab pkg path core/server-jre) 

[Example hook file](https://github.com/habitat-sh/habitat/blob/master/plans/artifactory-pro/hooks/run#L5)

# 4.  Installing a habitat package you just built from studio

Once you have built a package, you presumably want to test it. 
At the end of the build notice the line `Artifact: /src/results/foo-bar-1.0.0....hart`

```
[0][default:/src:0]# build
....
'/hab/cache/artifacts/spuder-ant-1.9.7-20160617211801-x86_64-linux.hart' -> '/src/results/spuder-ant-1.9.7-20160617211801-x86_64-linux.hart'
   ant: hab-plan-build cleanup
   ant:
   ant: Source Cache: /hab/cache/src/ant-1.9.7
   ant: Installed Path: /hab/pkgs/spuder/ant/1.9.7/20160617211801
   ant: Artifact: /src/results/spuder-ant-1.9.7-20160617211801-x86_64-linux.hart
   ant: Build Report: /src/results/last_build.env
   ant: SHA256 Checksum: 7f6de0e8388212396dafd67152392c72b6456f3eb9814da03cd835cacd7634ef
   ant: Blake2b Checksum: 633a61e417debb57c32ea7c998f546b23fcbf94d45ab44e7dc59bd78e7b67d38
   ant:
   ant: I love it when a plan.sh comes together.
   ant:
   ant: Build time: 0m22s
```

If you built your package from outside of studio, there will be a file that contains this same information

    results/last_build.env

To Install the package that was just created

    [0][default:/src:0]# hab pkg install foo/bar

If your package has a runtime, (or service to run) you can start it like so

    [0][default:/src:0]# hab start foo/bar

If your package doesn't have a runtime, but does contain an executable, see the next tip. 

# 5. Test run executable from inside habitat studio

You can test that your binary works using `hab pkg exec foo/bar bazz`

```
[0][default:/src:0]# hab pkg install /src/results/foo/bar/1.0.0/xxxx.hart
[1][default:/src:0]# hab pkg exec foo/bar bazz
```

```
[0][default:/src:0]# hab pkg exec core/curl curl --version
curl 7.47.1 (x86_64-pc-linux-gnu) libcurl/7.47.1 OpenSSL/1.0.2h zlib/1.2.8
Protocols: dict file ftp ftps gopher http https imap imaps pop3 pop3s smb smbs smtp smtps telnet tftp
Features: IPv6 Largefile NTLM NTLM_WB SSL libz TLS-SRP UnixSockets
```

```
[0][default:/src:0]$ hab pkg exec core/which which --version
GNU which v2.21, Copyright (C) 1999 - 2015 Carlo Wood.
GNU which comes with ABSOLUTELY NO WARRANTY;
This program is free software; your freedom to use, change
and distribute this program is protected by the GPL.
```

# 6. Making package from local directory

All the current examples from habitat show examples where the source is downloadable from a url. 
But what if you want to put your plan.sh file inside your project? 

Set `pkg_source` and `pkg_shasum` to any made up value (can't be empty)
Override the `do_download`, `do_verify` and `do_unpack` to `return 0`
```
pkg_origin=foo
pkg_name=bar
pkg_version=1.0.0
pkg_maintainer='Example <example@example.com>'
pkg_license=('Apache 2')
pkg_distname=$pkg_name
pkg_source='.' # This can't be blank, but setting it to a non http URL does nothing
pkg_shasum='0' # This can't be blank. it will be overwritten later
pkg_deps=()
pkg_build_deps=()

do_download() {
  return 0
}

do_verify() {
  return 0
}

do_unpack() {
  return 0
}

do_build() {
  return 0
}

do_install() {
  # Copy everything from present directory to the root of habitat package
  # $PLAN_CONTEXT = the current directory when studio was started
  # $pkg_prefix = /src (which becomes the root directory of the habitat package)
  cp -a $PLAN_CONTEXT/. $pkg_prefix/
}

```
