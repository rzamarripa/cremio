Meteor.publish("verificaciones",function(params){
  	return Verificaciones.find(params);
});

