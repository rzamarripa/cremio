BitacoraCron 						= new Mongo.Collection("bitacoraCron");
BitacoraCron.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});