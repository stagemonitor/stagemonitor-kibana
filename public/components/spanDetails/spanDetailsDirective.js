import spanDetails from './spanDetails.html';

export default () => {
  return {
    bindToController: true,
    controllerAs: 'ctrl',
    template: spanDetails,
    scope: {
      'selectedSpan': '=',
      'selectedSpanProperties': '='
    },
    controller($scope) {
      const vm = this;
      vm.selectedSpan;
      vm.selectedSpanProperties;
      vm.openedTab = 'attributes';
      vm.hasCallTreeTab = hasCallTreeTab;
      vm.openCallTreeTab = openCallTreeTab;

      $scope.$watch('ctrl.selectedSpan', resetTab);
      $scope.$on('openCallTreeTab', openCallTreeTab);

      init();

      function init() {
        resetTab();
      }

      function resetTab() {
        if (!vm.openedTab || (vm.openedTab === 'calltree' && !hasCallTreeTab())) {
          vm.openedTab = 'attributes';
        }
      }

      function openCallTreeTab() {
        if (hasCallTreeTab()) {
          vm.openedTab = 'calltree';
        }
      }

      function hasCallTreeTab() {
        return vm.selectedSpan.fields && vm.selectedSpan.fields.call_tree_json;
      }
    }
  };
};
