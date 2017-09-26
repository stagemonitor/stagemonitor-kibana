module.exports = function (kibana) {
  return new kibana.Plugin({
    require: ['kibana', 'elasticsearch'],
    uiExports: {
//    fieldFormats: ['plugins/stagemonitor-kibana/ui/stringify/types/calltree/calltree'],
      app: {
        title: 'stagemonitor',
        order: -1000,
        description: 'Visualize traces from stagemonitor',
        icon: 'plugins/stagemonitor-kibana/icon.svg',
        main: 'plugins/stagemonitor-kibana/app',
        injectVars: function (server) {
          const config = server.config();
          return {
            kbnIndex: config.get('kibana.index'),
            esShardTimeout: config.get('elasticsearch.shardTimeout'),
            esApiVersion: config.get('elasticsearch.apiVersion')
          };
        }
      }
    },
    //init: require('./init.js'),
  });
};
