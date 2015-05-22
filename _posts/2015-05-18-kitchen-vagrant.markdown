---
layout: post
title:  "Elasticsearch Commands"
date:   2015-04-28 11:34:00
categories: elasticsearch
---

# Elasticsearch shortcuts

When you execute a command from the command line, use curl. 

    curl -XGET 'http://elasticsearch.example.com:9200/_all/_settings?pretty'
    
   
However typing out `elasticsearch.example.com:9200` everytime gets tedious. Add the following to your `~/.bashrc` (or `~/.bash_profile` if on Mac)


```bash
export ELK="http://elasticsearch.example.com:9200/"
clk() {
  curl $ELK/$1
}
```

Then instead of typing out the full url, just type

    clk /_all/_settings?pretty  

# Clear Cache 

    POST 'http://elasticsearch.example.com:9200/_cache/clear' -d '{ "fielddata": "true" }'

# CAT

Cat is an api that provides a lot of information about nodes


    GET /_cat/nodes?help'
    GET /_cat/nodes?v&h=indexing.index_current'


# Fielddata

Field data provides information about the performance and memory

```
GET /_all/_settings?pretty'
GET /_cluster/settings?pretty'
GET /_stats/fielddata?pretty&fields=*  #Per index 
GET /_nodes/stats/indices/fielddata?fields=* #Per Node
```
