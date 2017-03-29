CortesCaja 						= new Mongo.Collection("cortesCaja");
CortesCaja.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});