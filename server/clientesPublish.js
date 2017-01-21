Meteor.publish("buscarClientes",function(options){
	if(options.where.nombreCompleto.length > 0){
		let selector = {
	  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
	  	roles : ["Cliente"]
		}
		return Meteor.users.find(selector, options.options);	
	}
});

Meteor.publish("cliente",function(options){
  return Meteor.users.find(options.id);
});