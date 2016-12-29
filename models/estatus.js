Estatus 						= new Mongo.Collection("estatus");
Estatus.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});