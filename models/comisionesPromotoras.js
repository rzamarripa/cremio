ComisionesPromotoras					= new Mongo.Collection("comisionesPromotoras");
ComisionesPromotoras.allow({
  insert: function () { return true; },
  update: function () { return true; }
  // remove: function () { return true; }
});

