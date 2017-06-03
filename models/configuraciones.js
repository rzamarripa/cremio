Configuraciones					= new Mongo.Collection("configuraciones");
Configuraciones.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});