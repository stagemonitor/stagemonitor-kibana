import 'ui/autoload/all';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';

import traceSelection from './templates/traceSelection.html';
import traceInformation from './templates/traceInformation.html';

import './app.less';

import _ from 'lodash';
import d3 from 'd3';
import dagreD3 from 'dagre-d3-webpack';

uiRoutes.enable();
uiRoutes
  .when('/:traceId?', {
    template: traceSelection,
    controller: 'traceSelectionController',
    controllerAs: 'ctrl'
  });


uiModules
  .get('app/stagemonitor', ['elasticsearch'])
  .controller('traceSelectionController', function ($http, $routeParams) {
    const vm = this;
    const pageSize = 10;

    vm.page = 0;
    vm.timeOffset = new Date().toISOString();
    vm.traces = [];
    vm.fetchNextPage = fetchNextPage;
    vm.onClickTrace = onClickTrace;
    vm.isOpen = isOpen;
    vm.openedTraces = [];
    vm.loadMoreDisabled = false;

    const baseSearchObject = {
      'collapse': {
        'field': 'trace_id',
        'inner_hits': {
          'name': 'spans',
          'size': 1,
          'sort': [{ '@timestamp': 'asc' }],
          '_source': ['duration_ms', '@timestamp', 'name']
        }
      },
      'sort': { '@timestamp': 'desc' },
      '_source': [
        'trace_id',
        'id',
        '@timestamp'
      ]
    };

    init();

    function init() {
      if ($routeParams.traceId) {
        vm.loadMoreDisabled = true;

        const searchObject = _.defaultsDeep(
          {
            'query': {
              'term': {
                'trace_id': $routeParams.traceId
              }
            },
            'size': 1
          }, baseSearchObject);

        $http.post('../elasticsearch/stagemonitor-spans-*/_search', searchObject).then((response) => {
          vm.traces.push(...response.data.hits.hits);
          vm.openedTraces.push(_.head(response.data.hits.hits));
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

      $http.post('../elasticsearch/stagemonitor-spans-*/_search', searchObject).then((response) => {
        vm.traces.push(...response.data.hits.hits);
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

  })
  .directive('traceInformation', () => {
    return {
      template: traceInformation,
      scope: {
        'trace': '='
      },
      controller($http) {
        const vm = this;
        vm.spans = [];

        loadSpansOfTrace(vm.trace);

        function loadSpansOfTrace(trace) {
          $http.post('../elasticsearch/stagemonitor-spans-*/_search', {
            'query': {
              'term': {
                'trace_id': trace._source.trace_id
              }
            },
            'size': 10000
          }).then((response) => {
            vm.spans = response.data.hits.hits;
            render(vm.spans);
          });
        }

        function render(data) {
          // Create the input graph
          const g = new dagreD3.graphlib.Graph()
            .setGraph({
              nodesep: 70,
              ranksep: 50,
              rankdir: 'LR',
              marginx: 20,
              marginy: 20
            })
            .setDefaultEdgeLabel(function () {
              return {};
            });

          // Here we"re setting nodeclass, which is used by our custom drawNodes function
          // below.

          const longestSpan = _.max(_.map(data, '_source.duration_ms'));
          const highImpactThreshold = longestSpan / 5;
          const mediumImpactThreshold = longestSpan / 10;

          for (const node of data) {

            let additionalClass = '';
            if (node._source.duration_ms > highImpactThreshold) {
              additionalClass = 'node--status__high-impact';
            } else if (node._source.duration_ms > mediumImpactThreshold) {
              additionalClass = 'node--status__medium-impact';
            }
            g.setNode(node._source.id, {
              spanDiscoverUrl: `../app/kibana#/doc/stagemonitor-spans-*/${node._index}/spans?id=${node._id}` +
                `&_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-5y,mode:quick,to:now))`,
              label: `<div class="node--span">
                        <span class="node--status ${additionalClass}"></span>
                        <span class="node--name">${node._source.name}</span><br />
                        <span class="node--duration">${_.round(node._source.duration_ms, 2)} ms, ${node._source.application}</span>
                      </div>`,
              class: 'todo',
              labelType: 'html'
              // TODO: label, labelType
            });
          }

          g.nodes().forEach(function (v) {
            const node = g.node(v);
            // Round the corners of the nodes
            node.rx = node.ry = 5;
            node.paddingTop = 0;
            node.paddingRight = 5;
            node.paddingBottom = 0;
            node.paddingLeft = 0;
          });


          for (const node of data) {
            if (node._source.parent_id) {
              g.setEdge(node._source.parent_id, node._source.id);
            }
          }

          // Create the renderer
          const render = new dagreD3.render();

          // Set up an SVG group so that we can translate / zoom the final graph
          const svgSelector = '#trace-' + vm.trace._source.trace_id;
          const svg = d3.select(svgSelector);
          const svgGroup = svg.select('g');
          const zoom = d3.behavior.zoom().on('zoom', function () {
            svgGroup.attr('transform', 'translate(' + d3.event.translate + ')' +
              'scale(' + d3.event.scale + ')');
          });
          svg.call(zoom);

          render(d3.select(svgSelector + ' g'), g);

          // center and initial scale
          const graphWidth = g.graph().width + 80;
          const graphHeight = g.graph().height + 40;
          svg.style('height', Math.min(graphHeight, 800) + 'px');
          const width = parseInt(svg.style('width').replace(/px/, ''));
          const height = parseInt(svg.style('height').replace(/px/, ''));
          const zoomScale = Math.min(Math.min(width / graphWidth, height / graphHeight), 2);
          const translate = [(width / 2) - ((graphWidth * zoomScale) / 2), (height / 2) - ((graphHeight * zoomScale) / 2)];
          zoom.translate(translate);
          zoom.scale(zoomScale);
          zoom.event(d3.select('svg'));

          // open discover tab on click
          d3.selectAll(svgSelector + ' g.node').on('click', function (id) {
            const node = g.node(id);
            window.open(node.spanDiscoverUrl);
          });
        }

      },
      controllerAs: 'ctrl',
      bindToController: true
    };
  });
