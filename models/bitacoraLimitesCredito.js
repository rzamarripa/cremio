BitacoraLimitesCredito 						= new Mongo.Collection("bitacoraLimitesCredito");
BitacoraLimitesCredito.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});