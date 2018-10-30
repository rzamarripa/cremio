Meteor.publish("documentosClientes",function(params){
  	return DocumentosClientes.find(params);
});