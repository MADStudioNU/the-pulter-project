var PPS = (function () {
  var _pps = elasticlunr(function () {
    this.addField('title');
    this.addField('body');
    this.addField('id');
    this.setRef('id');
    this.saveDocument(true);
  });

  return {
    addPoem: function (p) {
      _pps.addDoc(p)
    },
    search: function (q, params) {
      return _pps.search(q, params);
    },
    getPoem: function (ref) {
      return _pps.documentStore.getDoc(ref);
    }
  }
})();
