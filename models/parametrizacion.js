Parametrizacion 						= new Mongo.Collection("parametrizacion");
Parametrizacion.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});