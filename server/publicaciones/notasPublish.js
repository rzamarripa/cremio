Meteor.publish("notas",function(params){
  	return Notas.find(params);
});

Meteor.publish("notasPerfil",function(params){
  	return Notas.find(params);
});