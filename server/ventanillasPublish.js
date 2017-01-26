Meteor.publish("buscarVentanillas",function(options){
	if(options.where.nombreCompleto.length > 0){
		let selector = {
	  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
	  	roles : ["Ventanilla"]
		}
		return Meteor.users.find(selector, options.options);	
	}
});

Meteor.publish("ventanillas",function(options){
  return Meteor.users.find(options.id);
});