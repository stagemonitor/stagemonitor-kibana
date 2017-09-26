import fieldFormats from 'ui/registry/field_formats';
import IndexPatternsFieldFormatProvider from 'ui/index_patterns/_field_format/field_format';

export default function HTMLFormatProvider(Private) {
  let FieldFormat = Private(IndexPatternsFieldFormatProvider);

  class HTML extends FieldFormat {
    constructor(params) {
      super(params);
    }
  }

  HTML.prototype._convert = {
    text: value => value + "test",
    html: value => '<div class="html-value" style="display: block ! important; color: red;">' + value + '</div>'
  };

  HTML.id = 'html-formatter';
  HTML.title = 'HTML Field';
  HTML.fieldType = ['string'];
  HTML.editor = require('plugins/stagemonitor-kibana/ui/stringify/editors/calltree.html');

  HTML.sampleInputs = [
    'A Quick Brown Fox.',
    'STAY CALM!',
    'com.organizations.project.ClassName',
    'hostname.net',
    'SGVsbG8gd29ybGQ='
  ];

  return HTML;
}

fieldFormats.register(HTMLFormatProvider);
