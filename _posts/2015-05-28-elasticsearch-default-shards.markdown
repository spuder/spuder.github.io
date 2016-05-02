---
layout: post
title:  "Elasticsearch change default shard count"
date:   2015-05-28 11:45:00
categories: elasticsearch, logstash

---

By default, elasticsearch will create 5 shards when receiving data from logstash. 
While 5 shards, may be a good default, there are times that you may want to increase and decrease this value. 

Suppose you are splitting up your data into a lot of indexes. And you are keeping data for 30 days. 

- web-servers  
- database-servers  
- mail-servers  

At 10 shards per day (5 shards x 2 copies), thats 300 shards. Considering that each shard is its own lucene index, this has the potential to be a lot of overhead. 

![](http://cl.ly/image/3L1G1L3u1g1W/pCwA6HJQrR4gt0I0gbcGMLXI7Ap2w3HUlX71RHTgwWU.png
)

# Templates

Elasticserach leverages templates to define the settings for the indexes in shards. You can see the elasticsearch template for logstash with this http GET 

    _template/logstash?pretty

From linux / Mac terminal

    curl elasticsearch.example.com:9200/_template/logstash?pretty

Notice how the template leverages a wildcard to apply to all logstash indexes. `logstash-*`. 


My config will likely look different than yours since it leverages ['doc_values'](https://www.elastic.co/guide/en/elasticsearch/guide/current/doc-values.html#_enabling_doc_values) according to [this blog](http://svops.com/blog/elasticsearch-mappings-and-templates/)

```
  "logstash" : {
    "order" : 0,
    "template" : "logstash-*",
    "settings" : { },
    "mappings" : {
      "_default_" : {
        "dynamic_templates" : [ {
          "date_fields" : {
            "mapping" : {
              "format" : "dateOptionalTime",
              "doc_values" : true,
              "type" : "date"
            },
            "match" : "*",
            "match_mapping_type" : "date"
          }
        }, {
          "byte_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "byte"
            },
            "match" : "*",
            "match_mapping_type" : "byte"
          }
        }, {
          "double_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "double"
            },
            "match" : "*",
            "match_mapping_type" : "double"
          }
        }, {
          "float_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "float"
            },
            "match" : "*",
            "match_mapping_type" : "float"
          }
        }, {
          "integer_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "integer"
            },
            "match" : "*",
            "match_mapping_type" : "integer"
          }
        }, {
          "long_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "long"
            },
            "match" : "*",
            "match_mapping_type" : "long"
          }
        }, {
          "short_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "short"
            },
            "match" : "*",
            "match_mapping_type" : "short"
          }
        }, {
          "string_fields" : {
            "mapping" : {
              "index" : "not_analyzed",
              "omit_norms" : true,
              "doc_values" : true,
              "type" : "string"
            },
            "match" : "*",
            "match_mapping_type" : "string"
          }
        } ],
        "properties" : {
          "@version" : {
            "index" : "not_analyzed",
            "doc_values" : true,
            "type" : "string"
          }
        },
        "_all" : {
          "enabled" : true
        }
      }
    },
    "aliases" : { }
  }
}
```

# Modify default shard count

To change the default shard count, we will need to modify the settings field in the template. 

```
"settings" : {
        "number_of_shards" : 2
    },
    ...
```

Before you proceede, understand that this **only applies to new indexes**. You can't change the mapping of an already indexed indicie without reimporting your data. 

Save the template to your workstation

    $elk = 'http://elasticsearch.example.com:9200'
    curl $elk/_template/logstash?pretty > ~/Desktop/logstash-template.json

Backup the file, then edit the 'settings' section of your file to reflect the number of shards that you want. I'm going to change mine from the default of 5 down to 2

You will then need to remove the following fields 

```
  "logstash" : {
    "order" : 0,
   ...
   }
```

Here is a full config that has the 'logstash', and 'order' fields removed

```
{
    "template" : "logstash-*",
    "settings" : {
      "number_of_shards": 2
    },
    "mappings" : {
      "_default_" : {
        "dynamic_templates" : [ {
          "date_fields" : {
            "mapping" : {
              "format" : "dateOptionalTime",
              "doc_values" : true,
              "type" : "date"
            },
            "match" : "*",
            "match_mapping_type" : "date"
          }
        }, {
          "byte_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "byte"
            },
            "match" : "*",
            "match_mapping_type" : "byte"
          }
        }, {
          "double_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "double"
            },
            "match" : "*",
            "match_mapping_type" : "double"
          }
        }, {
          "float_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "float"
            },
            "match" : "*",
            "match_mapping_type" : "float"
          }
        }, {
          "integer_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "integer"
            },
            "match" : "*",
            "match_mapping_type" : "integer"
          }
        }, {
          "long_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "long"
            },
            "match" : "*",
            "match_mapping_type" : "long"
          }
        }, {
          "short_fields" : {
            "mapping" : {
              "doc_values" : true,
              "type" : "short"
            },
            "match" : "*",
            "match_mapping_type" : "short"
          }
        }, {
          "string_fields" : {
            "mapping" : {
              "index" : "not_analyzed",
              "omit_norms" : true,
              "doc_values" : true,
              "type" : "string"
            },
            "match" : "*",
            "match_mapping_type" : "string"
          }
        } ],
        "properties" : {
          "@version" : {
            "index" : "not_analyzed",
            "doc_values" : true,
            "type" : "string"
          }
        },
        "_all" : {
          "enabled" : true
        }
      }
    },
    "aliases" : { }

}

```




Verify that you have valid json by using [a tool like this one](http://jsonlint.com/)

Double check your config, then upload to any elasticsearch node. You can specify a file to upload by prefacing the filename with `@`. In this case, I named my file 'foobar.json'

    cd ~/Desktop
    $elk = 'http://elasticsearch.example.com:9200'
    curl -XPUT $elk/_template/logstash -d "@foobar.json"

If everything uploaded correctly, you can check with the same command you ran earlier

    curl elasticsearch.example.com:9200/_template/logstash?pretty

Now tomorrows index should only have 2 shards

If there is a problem reading the file, or uploading, elasticsearch will warn you and ignore the changes. 

```
Warning: Couldn't read data from file "foobar", this makes an empty
Warning: POST.
```

Additional Resources

[indices-templates](https://www.elastic.co/guide/en/elasticsearch/reference/1.3/indices-templates.html)


[changing default number of shards](https://discuss.elastic.co/t/how-do-you-change-the-default-number-of-shards/1508)
