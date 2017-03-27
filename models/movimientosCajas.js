MovimientosCajas 						= new Mongo.Collection("movimientosCajas");
MovimientosCajas.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});