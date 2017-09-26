import callTree from './callTree.html';
import '../../lib/jquery-treetable';
import $ from 'jquery';

export default () => {
  return {
    template: callTree,
    scope: {
      'source': '='
    },
    controller($scope, $element, $timeout) {
      const vm = this;
      vm.callTreeParsed = JSON.parse(vm.source);
      vm.callTree = [];
      processCallTree(vm.callTree, [vm.callTreeParsed], null, 1, vm.callTreeParsed.executionTime);

      $timeout(function () {
        const $callTreeTable = $element.find('.callTree');
        $callTreeTable.treetable({
          expandable: true,
          force: true,
          indent: 25,
          initialState: 'expanded',
          expanderTemplate: '<a class="expander" href="#">&nbsp;</a>'
        });

        $callTreeTable.find('tr[data-tt-expanded="false"]').each(function () {
          $callTreeTable.treetable('collapseNode', $(this).attr('data-tt-id'));
        });

        $('[data-display-none=\'true\']').hide();

        $callTreeTable.find('.branch').click(function () {
          const $branch = $(this);
          if (!$(event.target).hasClass('expander')) {
            const treeTableNodeId = $branch.data('tt-id');
            $callTreeTable.treetable('node', treeTableNodeId).toggle();
          }
          const $queryCount = $branch.find('.query-count');
          $branch.hasClass('collapsed') ? $queryCount.show() : $queryCount.hide();
        });

      });
    },
    controllerAs: 'ctrl',
    bindToController: true
  };
};

function processCallTree(callTreeRows, callArray, parentId, myId, totalExecutionTimeInNs) {
  const thresholdPercent = localStorage.getItem('widget-settings-execution-threshold-percent') || 0.05;
  const totalExecutionTimeInMs = totalExecutionTimeInNs / 1000 / 1000;
  for (let i = 0; i < callArray.length; i++) {
    const callData = callArray[i];

    const executionTimeInMs = Math.round(callData.executionTime / 1000 / 10) / 100;
    const selfExecutionTimeInMs = Math.round(callData.netExecutionTime / 1000 / 10) / 100;
    const executionTimePercent = (executionTimeInMs / totalExecutionTimeInMs) * 100;
    const selfExecutionTimePercent = (selfExecutionTimeInMs / totalExecutionTimeInMs) * 100;
    const anyChildExceedsThreshold = $.grep(callData.children,function (e) {
      return (e.executionTime / totalExecutionTimeInNs * 100) > thresholdPercent;
    }).length > 0;

    callData.queryCount = callData.ioquery ? 1 : 0;
    const thisRow = {
      executionTimeExceededThreshold: executionTimePercent > thresholdPercent,
      anyChildExceedsThreshold: anyChildExceedsThreshold,
      parentId: parentId,
      myId: myId,
      shortSignature: callData.shortSignature,
      signature: callData.signature,
      ioQuery: callData.ioquery,
      queryCount: callData.queryCount,
      executionTimePercent: executionTimePercent,
      executionTimeInNs: callData.executionTime,
      executionTimeInMs: executionTimeInMs,
      selfExecutionTimePercent: selfExecutionTimePercent,
      selfExecutionTimeInMs: selfExecutionTimeInMs
    };
    callTreeRows.push(thisRow);

    myId = processCallTree(callTreeRows, callData.children, myId, myId + 1, totalExecutionTimeInNs);

    callData.queryCount += _.sum(callData.children, 'queryCount');
    thisRow.queryCount += callData.queryCount;
  }
  return myId;
}
