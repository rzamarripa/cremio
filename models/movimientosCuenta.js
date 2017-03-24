MovimientosCuenta	= new Mongo.Collection("movimientosCuenta");
MovimientosCuenta.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});