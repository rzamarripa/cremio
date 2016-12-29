Departamentos 						= new Mongo.Collection("departamentos");
Departamentos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});