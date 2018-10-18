PagosSeguro 						= new Mongo.Collection("pagosSeguro");
PagosSeguro.allow({
  insert: function () { return true; },
  update: function () { return true; }
});