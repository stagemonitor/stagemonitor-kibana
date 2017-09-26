import _ from 'lodash';

export default function traceListController($routeParams, elasticsearchService, $q) {
  const vm = this;
  const pageSize = 10;

  function getBaseSearchObject() {
    return $q.when({
      'collapse': {
        'field': 'trace_id',
        'inner_hits': {
          'name': 'spans',
          'size': 1,
          'sort': [{'@timestamp': 'asc'}],
          '_source': {
            'includes': ['duration_ms', '@timestamp', 'name']
          }
        }
      },
      'sort': {'@timestamp': 'desc'},
      '_source': [
        'trace_id',
        'id',
        '@timestamp'
      ]
    });
  }

  init();

  function init() {
    vm.page = 0;
    vm.timeOffset = new Date().toISOString();
    vm.traces = [];
    vm.fetchNextPage = fetchNextPage;
    vm.onClickTrace = onClickTrace;
    vm.isOpen = isOpen;
    vm.openedTraces = [];
    vm.loadMoreDisabled = false;
    vm.singleTraceRoute = false;

    if ($routeParams.traceId) {
      vm.loadMoreDisabled = true;
      vm.singleTraceRoute = true;

      getBaseSearchObject().then(baseSearchObject => {
        const searchObject = _.defaultsDeep(
          {
            'query': {
              'term': {
                'trace_id': $routeParams.traceId
              }
            },
            'size': 1
          }, baseSearchObject);

        elasticsearchService.searchSpans(searchObject).then((response) => {
          vm.traces.push(...response.data.hits.hits);
          vm.openedTraces.push(_.head(response.data.hits.hits));
        });
      });
    } else {
      fetchPage(pageSize, vm.page, vm.timeOffset);
    }
  }

  function fetchNextPage() {
    vm.page++;
    fetchPage(pageSize, vm.page, vm.timeOffset);
  }

  function fetchPage(pageSize, pageOffset, date) {
    getBaseSearchObject().then(baseSearchObject => {
      const searchObject = _.defaultsDeep({
        'query': {
          'range': {
            '@timestamp': {
              'lt': date
            }
          },
        },
        'size': pageSize,
        'from': pageOffset * pageSize
      }, baseSearchObject);

      return elasticsearchService.searchSpans(searchObject).then((response) => {
        vm.traces.push(...response.data.hits.hits);
      });
    });
  }

  function onClickTrace(trace) {
    if (_.includes(vm.openedTraces, trace)) {
      _.pull(vm.openedTraces, trace);
    } else {
      vm.openedTraces.push(trace);
    }
  }

  function isOpen(trace) {
    return _.includes(vm.openedTraces, trace);
  }

}
