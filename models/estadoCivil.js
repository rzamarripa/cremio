EsatdoCivil 						= new Mongo.Collection("esatdoCivil");
EsatdoCivil.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});