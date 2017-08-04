export default class ElasticsearchService {

  constructor($http) {
    this.$http = $http;
  }

  searchAllSpansFor(traceId) {
    return this.searchSpans({
      'query': {
        'term': {
          'trace_id': traceId
        }
      },
      'size': 10000
    });
  }

  searchSpans(searchObject) {
    return this.$http.post('../elasticsearch/stagemonitor-spans-*/_search', searchObject);
  }

  updateTracingVisualizationUrlScriptedField() {
    this.$http.get('../elasticsearch/.kibana/index-pattern/stagemonitor-spans-*').then(res => {
      const fields = JSON.parse(res.data._source.fields);
      const tracingVisualization = {
        aggregatable: true,
        analyzed: false,
        count: 0,
        doc_values: false,
        indexed: false,
        lang: 'painless',
        name: 'trace_visualization',
        script: 'doc[\'trace_id\'].value',
        scripted: true,
        searchable: false,
        type: 'string'
      };

      if (_.some(fields, _.matchesProperty('name', 'trace_visualization'))) {
        // remove if already exists so that we always get the up-to-date mapping definition
        _.remove(fields, _.matchesProperty('name', 'trace_visualization'));
      }
      fields.push(tracingVisualization);
      res.data._source.fields = JSON.stringify(fields);

      const fieldFormatMap = JSON.parse(res.data._source.fieldFormatMap);
      fieldFormatMap.trace_visualization = {
        id: 'url',
        params: {
          'labelTemplate': 'Trace Visualization',
          'urlTemplate': '../app/stagemonitor-kibana#/trace/{{value}}'
        }
      };
      res.data._source.fieldFormatMap = JSON.stringify(fieldFormatMap);

      this.$http.post('../elasticsearch/.kibana/index-pattern/stagemonitor-spans-*/_update', { doc: res.data._source });
    });
  }

}
