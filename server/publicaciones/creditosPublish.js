Meteor.publish("creditos",function(options){
  return Creditos.find(options);
});


Meteor.publish("creditosActivos",function(options){
  return Creditos.find(options);
});

Meteor.publish("creditosCancelados",function(options){
  return Creditos.find(options);
});

Meteor.publish("creditosAprobados",function(options){
  return Creditos.find(options);
});

Meteor.publish("creditosPendientes",function(options){
  return Creditos.find(options);
});