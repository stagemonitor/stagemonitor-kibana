import 'ui/autoload/all';
import modules from 'ui/modules';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';

import './app.less';
import traceListTemplate from './components/traceList/traceList.html';
import ElasticsearchService from './services/elasticsearchService';

import traceListController from './components/traceList/traceListController';

import callTree from './components/callTree/callTreeDirective';
import spanDetails from './components/spanDetails/spanDetailsDirective';
import traceGraph from './components/traceGraph/traceGraphDirective';

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

let realUiModule;
if (modules) {
  // kibana 5.4.x
  realUiModule = modules;
} else {
  // kibana 5.5.x
  realUiModule = uiModules;
}

realUiModule
  .get('app/stagemonitor', ['elasticsearch', 'kibana'])
  .service('elasticsearchService', ElasticsearchService)
  .controller('traceListController', traceListController)
  .directive('callTree', callTree)
  .directive('spanDetails', spanDetails)
  .directive('traceGraph', traceGraph)
  .run((elasticsearchService) => {
    elasticsearchService.updateTracingVisualizationUrlScriptedField();
  });
