var mockSpans = [
  {
    '_index': 'stagemonitor-spans-2017.08.04',
    '_type': 'spans',
    '_id': 'AV2saE9h0sacwixIDLu4',
    '_score': 4.5685062,
    '_source': {
      'db.type': 'HSQL Database Engine',
      'trace_id': '30d10566858cd70e',
      'instance': 'localhost',
      'method': 'SELECT',
      'db.statement': 'select distinct owner0_.id as id1_0_0_, pets1_.id as id1_1_1_, owner0_.first_name as first_na2_0_0_, owner0_.last_name as last_nam3_0_0_, owner0_.address as address4_0_0_, owner0_.city as city5_0_0_, owner0_.telephone as telephon6_0_0_, pets1_.name as name2_1_1_, pets1_.birth_date as birth_da3_1_1_, pets1_.owner_id as owner_id4_1_1_, pets1_.type_id as type_id5_1_1_, pets1_.owner_id as owner_id4_0_0__, pets1_.id as id1_1_0__ from owners owner0_ left outer join pets pets1_ on owner0_.id=pets1_.owner_id where owner0_.last_name like \'f%\'',
      'type': 'jdbc',
      'error': false,
      'duration_ms': 4.880729,
      'db.user': 'SA',
      '@timestamp': '2017-08-04T10:41:42.550+0200',
      'application': 'Spring-PetClinic',
      'span.kind': 'client',
      'parent_id': '30d10566858cd70e',
      'peer.service': 'SA@jdbc:hsqldb:mem:petclinic',
      'host': 'Fabians-MBP.isys-software.de',
      'name': 'JpaOwnerRepositoryImpl#findByLastName',
      'id': '1b2f6c80a557fb16'
    }
  },
  {
    '_index': 'stagemonitor-spans-2017.08.04',
    '_type': 'spans',
    '_id': 'AV2saE9h0sacwixIDLu5',
    '_score': 4.5685062,
    '_source': {
      'duration_cpu_ms': 404.687,
      'external_requests.jdbc.count': 1,
      'instance': 'localhost',
      'http.headers.accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
      'tracking.unique_visitor_id': '01b7612cf06f9b65a2ef604c3659a7f9707c9fdd',
      'http.url': '/petclinic/owners.html',
      'type': 'http',
      'http.headers.accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'error': false,
      'http.headers.referer': 'http://localhost:9966/petclinic/owners/find.html',
      'bytes_written': 2837,
      'http.headers.connection': 'keep-alive',
      'http.headers.host': 'localhost:9966',
      'span.kind': 'server',
      'host': 'Fabians-MBP.isys-software.de',
      'external_requests.jdbc.duration_ms': 4.880729,
      'id': '30d10566858cd70e',
      'jdbc_get_connection_count': 1,
      'trace_id': '30d10566858cd70e',
      'method': 'GET',
      'http.headers.dnt': '1',
      'http.headers.user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
      'session_id': 'D3EE1EAE25654D56B33E3FDFFA1577FF',
      'peer.port': 59732,
      'peer.ipv6': '0:0:0:0:0:0:0:1',
      'duration_ms': 598.432389,
      'http.status_code': 200,
      'http.headers.accept-encoding': 'gzip, deflate, br',
      '@timestamp': '2017-08-04T10:41:41.976+0200',
      'application': 'Spring-PetClinic',
      'gc_time_ms': 50,
      'jdbc_connection_wait_time_ms': 0.123325,
      'name': 'Process Find Form',
      'http.headers.upgrade-insecure-requests': '1',
      'parameters': [
        {
          'key': 'lastName',
          'value': 'f'
        }
      ]
    }
  }
];

importTypeMapping();

function importTypeMapping() {
  var page = require('webpage').create();

  var settings = {
    operation: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      mappings: {
        spans: {
          "_all": {
            "enabled": false
          },
          "_source": {
            "excludes": [
              "call_tree_json"
            ]
          },
          "dynamic_templates": [
            {
              "string_fields": {
                "match": "*",
                "match_mapping_type": "string",
                "mapping": {
                  "ignore_above": 256,
                  "type": "keyword"
                }
              }
            }
          ]
        }
      }
    })
  };

  addLoggingToPage(page);

  page.open('http://localhost:9200/stagemonitor-spans-2017.08.04', settings, importMockSpans);
}


function importMockSpans() {
  if (mockSpans.length > 0) {
    var span = mockSpans.pop();
    var id = span._id;
    span = span._source;
    var page = require('webpage').create();
    var settings = {
      operation: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(span)
    };

    addLoggingToPage(page);

    page.open('http://localhost:9200/stagemonitor-spans-2017.08.04/spans/' + id, settings, importMockSpans);
  } else {
    // all mock spans posted, start normal testing, wait for elasticsearch to ingest
    window.setTimeout(startTest, 5000);
  }
}

function startTest() {
  var page = require('webpage').create();
  addLoggingToPage(page);
  console.log("running test");
  page.open('http://localhost:5601/app/stagemonitor-kibana', function() {
    var start = new Date();
    console.log("opening page");

    poll();
    function poll() {
      window.setTimeout(function() {
        if ((new Date()) - start > 10000) {
          console.log("timeout while initial start");
          page.render("timeout.png");
          phantom.exit(1);
        } else {
          var countOfRows = page.evaluate(function() { return $(".trace-table tr").length; });
          if (countOfRows > 0) {
            console.log("found " + countOfRows + " rows");
            page.evaluate(function() { $(".trace-table tr").eq(1).click(); });

            pollForSvg();
            function pollForSvg() {
              window.setTimeout(function() {
                if ((new Date()) - start > 20000) {
                  console.log("timeout while opening");
                  page.render("timeout.png");
                  phantom.exit(0); // for now
                } else {
                  var countOfSpans = page.evaluate(function() { return $(".node--span").length; });
                  if (countOfSpans === 2) {
                    console.log("found " + countOfSpans + " spans");
                    phantom.exit(0);
                  } else {
                    pollForSvg();
                  }
                }
              }, 500);
            }

          } else {
            console.log("found no rows");
            poll();
          }
        }
      }, 500);
    }
  });
}

function addLoggingToPage(page) {
  page.onResourceRequested = function(requestData, networkRequest) {
    console.log('Request (#' + requestData.id + '): ');
    console.log(JSON.stringify(requestData));
  };

  page.onResourceReceived = function(response) {
    console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
  };

  page.onLoadFinished = function(status) {
    console.log('Status: ' + status);
    // Do other things here...
  };
  page.onResourceError = function(resourceError) {
    console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
    console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
  };
  page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
  };
}
