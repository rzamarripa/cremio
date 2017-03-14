notasCobranza 						= new Mongo.Collection("notascobranza");
notasCobranza.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});