# Service data connector

This service is used to periodically read data from configured URL using PUT or GET requests. Retrieved data are stored to DB or file. 
Supported formats are:
* csv
* InfluxDB

Data source can be Auroral node (GET,PUT or EVENT) or external service (GET or PUT).

## Configuration
It can be used with Auroral platform manager or standalone. 
In standalone mode it is necessary to provide configuration file.

### Format of json configuration file
``` json
{
      "enabled": true,
      "dsid": "<data_stream_id>",
      "oid": "<oid_of_remote_object>",
      "agid": "<agid_of_my_node>",
      "cid": "<my_cid>",
      "iid": "<PID or EID>",
      "type": "<read|write|event>",
      "service": "<oid_of_my_service>",
      "requestUrl": "<url_where_to_get_data>",
      "monitors": "<monitors>",
      "frequency": "<frequency_in_ms>",
      "queryParams": {},
      "body": {}
    }
```

### Environment variables
- SERVICE_IP - IP address of the service
- DATA_CONNECTOR_PORT - port of the service
- DS_FILE - path to the file with data streams configuration
- DS_TYPE:
  -  csv - data will be stored in csv file
  -  influxdb - data will be stored in InfluxDB
- INFLUXDB_URL - url of InfluxDB (IF using Influx)
- INFLUXDB_USER - user of InfluxDB (IF using Influx)
- INFLUXDB_PASSWORD - password of InfluxDB (IF using Influx)
- INFLUXDB_ORG - organization of InfluxDB (IF using Influx)
- INFLUXDB_BUCKET - bucket of InfluxDB (IF using Influx)
- INFLUXDB_TOKEN - token of InfluxDB (IF using Influx)


### Deployment

In order to deploy this service, you need to have docker and docker-compose installed.
Dockerfile is provided for building docker image.
For proper deployment, you need to provide configuration file, environment variables and ensure connectivity to chosen database.



### Who do I talk to? ###

Developed by bAvenir

* jorge.almela@bavenir.eu
* peter.drahovsky@bavenir.eu
