import _ from 'lodash';
import d3 from 'd3';
import dagreD3 from 'dagre-d3-webpack';
import flat from 'flat';
import $ from 'jquery';

import traceGraph from './traceGraph.html';

export default () => {
  return {
    template: traceGraph,
    scope: {
      'trace': '='
    },
    controller($scope, $element, elasticsearchService) {
      const vm = this;
      vm.spans = [];
      vm.selectedSpan = null;
      vm.selectedSpanProperties = [];
      vm.trace = vm.trace;
      vm.showCallTreeWarning = !localStorage.getItem('callTreeWarningDiscarded');
      vm.hideCallTreeWarning = hideCallTreeWarning;

      loadSpansOfTrace(vm.trace);

      function hideCallTreeWarning() {
        localStorage.setItem('callTreeWarningDiscarded', true);
        vm.showCallTreeWarning = false;
      }

      function loadSpansOfTrace(trace) {
        elasticsearchService.searchAllSpansFor(trace._source.trace_id)
          .then((response) => {
            vm.spans = response.data.hits.hits;
            render(vm.spans);
          });
      }

      function render(spans) {
        const graph = new dagreD3.graphlib.Graph()
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

        const longestSpan = _.max(_.map(spans, '_source.duration_ms'));
        const highImpactThreshold = longestSpan / 5;
        const mediumImpactThreshold = longestSpan / 10;

        for (const span of spans) {
          let additionalClass = '';
          if (span._source.duration_ms > highImpactThreshold) {
            additionalClass = 'node--status__high-impact';
          } else if (span._source.duration_ms > mediumImpactThreshold) {
            additionalClass = 'node--status__medium-impact';
          }

          if (!span.fields && span._source.call_tree_json) {
            span.fields = {
              call_tree_json: [span._source.call_tree_json]
            };
          }
          span.iconClass = iconForSpan(span._source);
          span.iconTitle = iconTitleForSpan(span._source);

          const node = {
            span: span,
            spanDiscoverUrl: `../app/kibana#/doc/stagemonitor-spans-*/${span._index}/spans?id=${span._id}` +
            `&_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-5y,mode:quick,to:now))`,
            label: `<div class="node--span" data-id="${span._source.id}" id="span-${span._source.id}">
                    <span class="node--status ${additionalClass}"></span>
                    <span class="node--name">
                        <i class='fa ${span.iconClass}' aria-hidden='true' title="${span.iconTitle}"></i>
                        ${span._source.name}
                        ${(span.fields && span.fields.call_tree_json) ? ' <i data-calltree class="fa fa-sitemap" aria-hidden="true" title="Call-Tree available. Click here to show."></i>' : ''}
                      </span><br />
                    <span class="node--duration">${_.round(span._source.duration_ms, 2)} ms, ${span._source.application}</span>
                  </div>`,
            labelType: 'html'
          };
          graph.setNode(span._source.id, node);
        }

        graph.nodes().forEach(function (v) {
          const node = graph.node(v);
          // Round the corners of the nodes
          node.rx = node.ry = 5;
          node.paddingTop = 0;
          node.paddingRight = 5;
          node.paddingBottom = 0;
          node.paddingLeft = 0;
        });

        // set edges
        for (const span of spans) {
          if (span._source.parent_id && graph.node(span._source.parent_id) && graph.node(span._source.id)) {
            graph.setEdge(span._source.parent_id, span._source.id);
          } else if (span._source.parent_id && (!graph.node(span._source.parent_id) || !graph.node(span._source.id))) {
            console.log('no edge between ' + span._source.parent_id + ' and ' + span._source.id + ' possible, one of them does not exist.');
          }
        }

        // Create the renderer
        const render = new dagreD3.render();
        const svgSelector = '#trace-' + vm.trace._source.trace_id;
        const svg = d3.select(svgSelector);
        const svgGroup = svg.select('g');
        const zoom = initializeZoom();
        render(d3.select(svgSelector + ' g'), graph);
        centerAndInitialScale(zoom);
        d3.selectAll(svgSelector + ' g.node').on('click', openSpanDetails);
        d3.selectAll(svgSelector + ' g.node [data-calltree]').on('click', openCallTree);

        function initializeZoom() {
          const zoom = d3.behavior.zoom().on('zoom', function () {
            svgGroup.attr('transform', 'translate(' + d3.event.translate + ')' +
              'scale(' + d3.event.scale + ')');
          });
          svg.call(zoom);
          return zoom;
        }

        function centerAndInitialScale(zoom) {
          const graphWidth = graph.graph().width + 80;
          const graphHeight = graph.graph().height + 40;
          svg.style('height', Math.min(graphHeight, 800) + 'px');
          const width = parseInt(svg.style('width').replace(/px/, ''));
          const height = parseInt(svg.style('height').replace(/px/, ''));
          const zoomScale = Math.min(Math.min(width / graphWidth, height / graphHeight), 2);
          const translate = [(width / 2) - ((graphWidth * zoomScale) / 2), (height / 2) - ((graphHeight * zoomScale) / 2)];
          zoom.translate(translate);
          zoom.scale(zoomScale);
          zoom.event(d3.select('svg'));
        }

        function openSpanDetails(nodeId) {
          const node = graph.node(nodeId);
          $('.span-open', $element).removeClass('span-open');
          node.elem.classList.add('span-open');

          const props = flattenSpanSource(node.span._source);
          $scope.$apply(() => {
            vm.selectedSpanProperties = [];
            vm.selectedSpan = node.span;
            vm.selectedSpanProperties = _.sortBy(props, 'propName');

            const hasCallTree = node.span.fields && node.span.fields.call_tree_json;
            if (!vm.openedTab || (vm.openedTab === 'calltree' && !hasCallTree)) {
              vm.openedTab = 'attributes';
            }
          });
        }

        function openCallTree() {
          const clickedNodeId = $(this).closest('.node--span').data('id');
          vm.openedTab = 'calltree';
          openSpanDetails(clickedNodeId);
        }

        function flattenSpanSource(spanSource) {
          const flatSpanSource = flat(spanSource);
          const props = [];

          for (const propName in flatSpanSource) {
            if (flatSpanSource.hasOwnProperty(propName)) {
              props.push({
                propName,
                value: flatSpanSource[propName]
              });
            }
          }
          return props;
        }

        function iconForSpan(span) {
          const spanTypeIcons = {
            http: 'fa-server',
            jdbc: 'fa-database',
            soap: 'fa-plane',

            pageload: 'fa-user',
            js_error: 'fa-user',
            ajax: 'fa-user'
          };

          const spanKindIcons = {
            server: 'fa-server',
            client: 'fa-sign-out'
          };

          if (spanTypeIcons[span.type]) {
            return spanTypeIcons[span.type];
          } else {
            return spanKindIcons[span.kind];
          }
        }

        function iconTitleForSpan(span) {
          const spanTypeTitle = {
            http: 'HTTP',
            jdbc: 'JDBC',
            soap: 'SOAP',

            pageload: 'Pageload',
            js_error: 'JavaScript error',
            ajax: 'AJAX request'
          };

          const spanKindTitle = {
            server: 'Incoming request',
            client: 'External request'
          };

          if (spanTypeTitle[span.type]) {
            return spanTypeTitle[span.type];
          } else {
            return spanKindTitle[span.kind];
          }
        }
      }

    },
    controllerAs: 'ctrl',
    bindToController: true
  };
};
