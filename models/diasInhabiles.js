DiasInhabiles 						= new Mongo.Collection("diasInhabiles");
DiasInhabiles.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});