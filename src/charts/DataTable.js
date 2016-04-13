
/**
 * @fileoverview Simple DataTable implementation.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * DataTable constructor.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @extends {dom.EventDispatcher} dom.EventDispatcher
 * @requires dom.css
 * @requires dom.events
 * @requires dom.Template
 * @requires formatters.NumberFormatter
 * @requires formatters.DateFormatter
 * @requires util.Object
 * @example
 * <b>Simple:</b>
 * <b>var</b> table = <b>new</b> charts.DataTable('container_id');
 * table.draw([
 *   ['Work', 'Eat', 'Commute', 'Watch TV', 'Sleep'], // Columns
 *   [100,      50,         30,         10,      40], // First row
 *   [140,       2,        110,        150,    1300]  // Second row
 * ]);
 *
 * <b>Complex:</b>
 * <b>var</b> options = {
 *   'bool-format': ['&lt;input type="checkbox" checked>',
 *                   '&lt;input type="checkbox">'],
 *   'date-format': 'YYYY-MM-dd'
 * };
 *
 * <b>var</b> table = <b>new</b> charts.DataTable('container_id');
 *
 * table.addEventListener('sort', <b>function</b>() {
 *   window.console <b>&&</b> console.log(table.getColumn());
 * });
 *
 * table.draw([
 *   // Columns:
 *   [
 *     {label: '', type: 'bool', name: 'checkbox'}
 *     {label: 'Country', title: 'Title text', name: 'country', width: '40%'},
 *     {label: 'Population', type: 'number', name: 'population'},
 *     {label: 'Date', type: 'date', name: 'date', format: 'YYYY/MM/dd'}
 *   ],
 *   // Simple row:
 *   [true, 'Germany', 80619000, new Date(2013, 6, 31)],
 *   // Complex rows:
 *   [0, 'USA', 317638000, {value: new Date(2014, 2, 5), format: 'YY/MM/dd'}],
 *   [1, {label: 'Vatican', format: '&lt;b>{{ value }}&lt;/b>'}, 839, new Date],
 * ], options);
 *
 * <b>Styles: (default prefix: "data-")</b>
 * table.data-table {}
 * table.data-table caption {}
 * table.data-table thead tr th {}
 * table.data-table thead tr th span {}
 * table.data-table tbody tr td {}
 * table.data-table tfoot tr td {}
 * table.data-table tr.data-row-even {}
 * table.data-table tr.data-row-odd {}
 * table.data-table thead tr th.data-cell-text {}
 * table.data-table thead tr th.data-cell-date {}
 * table.data-table thead tr th.data-cell-bool {}
 * table.data-table thead tr th.data-cell-number {}
 * table.data-table tbody tr td.data-cell-text {}
 * table.data-table tbody tr td.data-cell-date {}
 * table.data-table tbody tr td.data-cell-bool {}
 * table.data-table tbody tr td.data-cell-number {}
 * table.data-table tfoot tr td.data-cell-text {}
 * table.data-table tfoot tr td.data-cell-date {}
 * table.data-table tfoot tr td.data-cell-bool {}
 * table.data-table tfoot tr td.data-cell-number {}
 * table.data-table thead th.data-sort-asc {}
 * table.data-table thead th.data-sort-desc {}
 */
charts.DataTable = function(container) {
  dom.EventDispatcher.apply(this, arguments);

  /**
   * Default data table options.
   * @dict
   * @example <code>{
   *   'date-format': 'YYYY-MM-dd',      // Default date format.
   *   'bool-format': ['True', 'False'], // Default boolean format.
   *   'text-format': '{{ value }}',     // Default text template format.
   *   'css-prefix': 'data-',            // Default css prefix.
   *   'header': true,                   // Shows first row as header (THEAD).
   *   'footer': true,                   // Shows last row as footer (TFOOT).
   *   'caption': '',                    // Default table caption text.
   *   'sort': {
   *     'column': 0,                    // Default column index to sort by.
   *     'dir': 'asc'                    // Default sort direction.
   *   }
   * }</code>
   */
  var DEFAULT_OPTIONS = {
    'date-format': 'YYYY-MM-dd',
    'bool-format': ['True', 'False'],
    'text-format': '{{ value }}',
    'css-prefix': 'data-',
    'header': true,
    'footer': true,
    'caption': '',
    'sort': {'column': 0, 'dir': 'asc'},
    'rows': {'offset': 0, 'limit': 0}
  };

  /**
   * Draws the table based on <code>data</code> and <code>opt_options</code>.
   * @param {!Array.<Array>} data A table data.
   * @param {Object=} opt_options A configuration options.
   * @see <a href="#-DEFAULT_OPTIONS">DEFAULT_OPTIONS</a>
   */
  this.draw = function(data, opt_options) {
    if (data instanceof Array) {
      options_ = util.Object.extend(DEFAULT_OPTIONS, opt_options || {});
      /** @type {DocumentFragment} */
      var fragment = dom.document.createDocumentFragment();
      /** @type {Node} */
      var table = fragment.appendChild(dom.createElement('TABLE'));

      if (options_['caption']) {
        /** @type {Node} */
        var caption = table.appendChild(dom.createElement('CAPTION'));
        caption.innerHTML = options_['caption'];
      }

      /** @type {Node} */
      var thead = options_['header'] ?
          table.appendChild(dom.createElement('THEAD')) : null;
      /** @type {Node} */
      var tfoot = options_['footer'] ?
          table.appendChild(dom.createElement('TFOOT')) : null;
      /** @type {Node} */
      var tbody = table.appendChild(dom.createElement('TBODY'));

      draw_(data, thead, tbody, tfoot);
      dom.css.setClass(table, options_['css-prefix'] + 'table');
      container_.appendChild(fragment);
    }
  };

  // Export for closure compiler.
  this['draw'] = this.draw;

  /**
   * Gets active column data.
   * Useful while handling 'sort' event.
   * @return {Object} Return active column data.
   * @example <code>{
   *   'index': 'number, column index',
   *   'name': 'string, column name',
   *   'type': 'string, column type',
   *   'dir': 'string, column sort direction'
   * }</code>
   */
  this.getColumn = function() {
    return column_ && {
      'index': column_.getAttribute('data-index') || column_.cellIndex,
      'name': column_.name || column_.id || '',
      'type': column_.getAttribute('data-type') || '',
      'dir': dom.css.hasClass(
          column_, options_['css-prefix'] + 'sort-asc') ? 'asc' : 'desc'
    };
  };

  // Export for closure compiler.
  this['getColumn'] = this.getColumn;

  /**
   * Dispatched when any header column is clicked.
   * @event
   * @example
   * table.addEventListener('sort', <b>function</b>() {
   *   window.console <b>&&</b> console.log(table.getColumn());
   * });
   */
  function sort() {
    /** @type {string} */ var key = 'sort';
    if (options_[key] && 'null' != options_[key]) {
      /** @type {Event} */ var event = arguments[0] || window.event;
      column_ = /** @type {Node} */ (event.currentTarget || event.srcElement);
      while ('TH' != column_.nodeName) {
        // Getting parent, if cell rendered with custom template.
        column_ = column_.parentNode;
      }
      /** @type {string} */ var prefix =
          /** @type {string} */ (options_['css-prefix']);
      /** @type {!Array.<string>} */ var css = [key + '-asc', key + '-desc'];
      var hasClass = dom.css.hasClass(column_, prefix + css[0]);
      /** @type {string} */ var dir = css[+hasClass];

      /** @type {NodeList} */ var cells = column_.parentNode.cells;
      for (/** @type {number} */ var i = 0; i < cells.length;) {
        /** @type {Element} */ var cell = cells[i++];
        dom.css.removeClass(cell, prefix + css[0], prefix + css[1]);
      }
      dom.css.addClass(column_, prefix + dir);
      self_.dispatchEvent(key);
    }
  }

  /**
   * @param {!Array.<Array>} data The data to draw.
   * @param {Node} thead The thead element.
   * @param {Node} tbody The tbody element.
   * @param {Node} tfoot The tfoot element.
   * @private
   */
  function draw_(data, thead, tbody, tfoot) {
    /** @type {Array.<Object|string>} */ var headers = getHeaders_(data);
    /** @type {number} */ var length = data.length >>> 0;
    /** @type {number} */
    var limit = options_['rows'] && options_['rows']['limit'];

    for (/** @type {number} */ var i = 0; i < length; i++) {
      if (limit && limit == i && i < length - 2) {
        i = length - 2;
      }
      /** @type {Array} */ var row = data[i];

      /** @type {Node} */ var group = !i && thead ? thead : tbody;
      if (tfoot && i == length - 1) group = tfoot;
      /** @type {Element} */ var tr = group.insertRow(-1);
      dom.css.setClass(
          tr, options_['css-prefix'] + 'row-' + (i % 2 ? 'even' : 'odd'));
      /** @type {number} */ var index = 0;
      for (/** @type {number} */ var j = 0; j < row.length; j++) {
        /** @type {Node} */
        var cell = tr.appendChild(dom.createElement(i ? 'TD' : 'TH'));
        /** @type {Object|Date|string|number|boolean} */ var value = row[j];
        /** @type {Object|string} */ var header = headers[index];
        /** @type {number} */ var span = getColSpan_(value);
        cell.colSpan = span;
        index += span;
        if (!i && thead) {
          setHeader_(cell, value);
          column_ = cell;
        } else {
          setValue_(cell, value, header);
        }
        setCellClass_(cell, value, index, span, getColSpan_(header));

        if (header && header['hidden'])
          cell.style.display = 'none';
      }
    }
  }

  /**
   * Sets class to table cells.
   * @param {Node} cell Table's cell.
   * @param {Object|Date|string|number|boolean} data The table cell data.
   * @param {number} index Cell's index.
   * @param {number} span Cell's span.
   * @param {number} colSpan Header cell's colspan attribute.
   * @private
   */
  function setCellClass_(cell, data, index, span, colSpan) {
    /** @type {string} */ var prefix =
        /** @type {string} */ (options_['css-prefix']);
    /** @type {Object} */ var sort = /** @type {Object} */ (options_['sort']);
    /** @type {number} */ var column = !sort['column'] ?
        sort['column'] + colSpan :
        sort['column'] + span + colSpan;
    dom.css.setClass(cell, prefix + 'cell-' + cell.getAttribute('data-type'));
    if (sort && (index == column) && sort['dir'])
      dom.css.addClass(cell, prefix + 'sort-' + sort['dir']);

    if (data['css-class'])
      dom.css.addClass(cell, data['css-class']);
  }

  /**
   * @param {Array} data The table data.
   * @return {Array.<Object|string>} Returns table headers.
   * @private
   */
  function getHeaders_(data) {
    /** @type {Array.<Object|string>} */ var headers = [];
    /** @type {Array.<Object|string>} */ var row = data[0];
    for (/** @type {number} */ var i = 0; i < row.length; i++) {
      /** @type {Object|string} */ var header = row[i];
      /** @type {number} */ var span = getColSpan_(header);
      for (/** @type {number} */ var j = 0; j < span; j++) {
        headers.push(header);
      }
    }

    return headers;
  }

  /**
   * @param {Node} cell The table cell element.
   * @param {Object|Date|string|number|boolean} data The table cell data.
   * @private
   */
  function setHeader_(cell, data) {
    if (typeof data != 'object') {
      data = {'label': data};
    }

    if (data != null) {
      cell.innerHTML = '<span>' + data['label'] + '</span>';
      for (/** @type {string} */ var key in data) {
        cell[key] = data[key];
      }
      cell.setAttribute('data-type', getType_(data, null));
      dom.events.addEventListener(cell, dom.events.TYPE.CLICK, sort);
    }
  }

  /**
   * @param {Node} cell The table cell element.
   * @param {Object|Date|string|number|boolean} data The table cell data.
   * @param {Object|string} header The table cell header.
   * @private
   */
  function setValue_(cell, data, header) {
    if (typeof data != 'object' || data instanceof Date) {
      data = {'value': data};
    }

    if (data != null) {
      /** @type {Date|string|number|boolean} */ var value = data['value'];

      if (value != null) {
        data['type'] = getType_(data, header);
        if ('date' == data['type'] || value instanceof Date) {
          data['type'] = 'date';
          value = formatters.DateFormatter.formatDate(
              new Date(value),
              /** @type {string} */ (getFormat_(data, header)));
        } else if ('bool' == data['type'] || value === !0 || value === !1) {
          data['type'] = 'bool';
          value = /** @type {Array} */ (getFormat_(data, header))[+!value];
        } else if ('number' == data['type']) {
          value = formatter_.formatNumber(/** @type {number} */ (value));
        } else {
          value = template_.parse(
              /** @type {string} */ (getFormat_(data, header)), data);
        }
        cell.innerHTML = value;
        cell.setAttribute('data-type', data['type']);
      }
    }
  }

  /**
   * @param {Object} data The table cell data.
   * @param {Object|string} header The table cell header.
   * @return {Array|string} Returns data format.
   * @private
   */
  function getFormat_(data, header) {
    return /** @type {Array|string} */ (
        data['format'] ||
        (header && header['format']) ||
        options_[data['type'] + '-format']);
  }

  /**
   * @param {Object} data The table cell data.
   * @param {Object|string} header The table cell header.
   * @return {string} Returns data type.
   * @private
   */
  function getType_(data, header) {
    return data['type'] || (header && header['type']) || 'text';
  }

  /**
   * @param {*} data The table cell data.
   * @return {number} Returns cell column span.
   * @private
   */
  function getColSpan_(data) {
    return null != data && typeof data == 'object' ? (+data['span'] || 1) : 1;
  }

  /**
   * @type {Element}
   * @private
   */
  var container_ = typeof container == 'string' ?
      dom.getElementById(container) : container;

  /**
   * @type {!formatters.NumberFormatter}
   * @private
   */
  var formatter_ = new formatters.NumberFormatter;

  /**
   * @type {!dom.Template}
   * @private
   */
  var template_ = new dom.Template;

  /**
   * Reference to last column sorted by.
   * @type {Node}
   * @private
   */
  var column_ = null;

  /**
   * @type {!Object.<string, *>}
   * @private
   */
  var options_ = {};

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.DataTable}
   * @private
   */
  var self_ = this;
};


// Export for closure compiler.
charts['DataTable'] = charts.DataTable;
