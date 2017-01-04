Meteor.publish("clientes",function(params){
  	return Clientes.find(params);
});