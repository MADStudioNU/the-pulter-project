var PPS = (function () {
  var _pps = elasticlunr(function () {
    this.addField('id');
    this.addField('type');
    this.addField('poemRef');
    this.addField('title');
    this.addField('authorship');
    this.addField('body');
    this.addField('meta');

    this.setRef('id');
    this.saveDocument(true);
  });

  return {
    addResource: function (p) {
      _pps.addDoc(p, false);
    },
    search: function (q, params) {
      return _pps.search(q, params);
    },
    getResource: function (ref) {
      return _pps.documentStore.getDoc(ref);
    }
  }
})();
