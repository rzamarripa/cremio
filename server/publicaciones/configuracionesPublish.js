Meteor.publish("configuraciones",function(params){
  	return Configuraciones.find(params);
});