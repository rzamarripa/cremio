Notas 						= new Mongo.Collection("notas");
Notas.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});