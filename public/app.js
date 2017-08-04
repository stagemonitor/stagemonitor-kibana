import 'ui/autoload/all';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';

import './app.less';
import traceListTemplate from './templates/traceList.html';
import ElasticsearchService from './elasticsearchService';
import traceListController from './traceListController';
import traceGraph from './traceGraphDirective';

uiRoutes.enable();
uiRoutes
  .when('/trace/:traceId', {
    template: traceListTemplate,
    controller: 'traceListController',
    controllerAs: 'ctrl'
  })
  .otherwise({
    template: traceListTemplate,
    controller: 'traceListController',
    controllerAs: 'ctrl'
  });

uiModules
  .get('app/stagemonitor', ['elasticsearch', 'kibana'])
  .service('elasticsearchService', ElasticsearchService)
  .controller('traceListController', traceListController)
  .directive('traceGraph', traceGraph)
  .run((elasticsearchService) => {
    elasticsearchService.updateTracingVisualizationUrlScriptedField();
  });
