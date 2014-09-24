---
layout: post
title:  "Defensive puppet with strict variables"
date:   2014-09-22 22:44:30
categories: jekyll update
---
At puppetconf 2014, Tomas Doran pointed out that if you aren't checking your puppet manifests for strict variables, you are figurativly punching a puppy in the face. Noone wants that, nor do they want to debug why your module is trying to use an invalid variable. You should always enable checks for strict variables. Here's why: 

For example, suppose you are using the fact `$::operatingsystemmajrelease`. This fact will return '6' on a Cent 6.5 machine, '7' on a Cent 7 machine. However this fact is only available in newer version of facter (>=1.8). 

    puppet apply -e 'notice($::operatingsystemmajrelease)'

If you attempt to run this on a machine that doesn't have a major release (e.g. Os X), or on a machine with facter <=1.8; facter will silently return a null value.

If you are wise, you will validate all inputs like so: 

    if $operatingsystemmajrelease {
        notice("Major OS reporting ${::operatingsystemmajrelase}")
     }
    else {
        fail('Why you no have operating system with major release?')
    }

While this validation is good, you should instead catch it at the source with strict variables. 

# Testing

To test that your variables are strict, export the following variable. 

    $ export STRICT_VARIABLES=yes

Then run your rake tests

    $ rake spec

You are running rake tests aren't you?  
If you aren't yet see this blog. [puppetlabs nextgeneration of testing](http://puppetlabs.com/blog/the-next-generation-of-puppet-module-testing)
You can find an example of how to write tests, look at the spec folder of this module [spuder/gitlab](https://github.com/spuder/puppet-gitlab) 

# Custom Facts

Using an old version of facter isn't the only way to get an error. Another common occurrence is if using a custom fact. 

      13) gitlab when $puppet_manage_packages is false 
     Failure/Error: it { should_not contain_class('gitlab::packages') }
     Puppet::Error:
       Undefined variable "::operatingsystem_lowercase"; Undefined variable "operatingsystem_lowercase" at /vagrant/spec/fixtures/modules/gitlab/manifests/install.pp:114 on node gitlab-test
     # ./spec/classes/gitlab_spec.rb:227

# Solution

If you have errors, you can fix them by wrapping the fact lookup with the puppetlabs/stdlib function. (Make sure to add the dependency to your metadata.json file.)
https://forge.puppetlabs.com/puppetlabs/stdlib/1.0.0

Example, 

     getvar( $::operatingsystemmajrelease )
     
*Make sure you aren't doing text expansion on the fact, or you will still get the error*      

    #Bad, this won't work
    getvar( "${::operatingsystemmajrelease}")


# getvar()

Unfortunately as of the time of this writing, the getvar function is awaiting [this pull request](https://github.com/puppetlabs/puppetlabs-stdlib/pull/303)

Until that merge request is accepted, you will need to manually edit your `.fixtures.yaml` file to point to a fork with the fix.

Before:

    fixtures:
      repositories:
        stdlib: git://github.com/puppetlabs/puppetlabs-stdlib.git
      symlinks:
        gitlab: "#{source_dir}"

After: (note that we are using the bobtfish fork)

    fixtures:
      repositories:
        stdlib: git://github.com/bobtfish/puppetlabs-stdlib
        ref: "fix_strict_variables"
      symlinks:
        gitlab: "#{source_dir}"


Then to run your tests, run the following

     $ rake spec_prep
     $ rake spec

# Travis

Lastly, if you have a .travis file, add tests for strict variables by exporting the environment variable.

    env:
      - PUPPET_VERSION=3.1.0 FACTER_VERSION=1.7.6
      - PUPPET_VERSION=3.4.0 FACTER_VERSION=2.0.2
      - PUPPET_VERSION=3.6.0 FACTER_VERSION=2.1.0
      - PUPPET_VERSION=3.6.0 FACTER_VERSION=2.1.0 STRICT_VARIABLES=yes


You now can be sure that your modules won't fail silently if a fact returns null. 