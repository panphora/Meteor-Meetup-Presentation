(function(){
Template.body.addContent((function() {
  var view = this;
  return HTML.Raw('<div class="container mt3">\n    <div class="p3">\n      <h1>Hello</h1>\n    </div>\n  </div>');
}));
Meteor.startup(Template.body.renderToDocument);

})();
