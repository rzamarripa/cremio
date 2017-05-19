Meteor.publish("buscarVerificadores",function(options){
	if (options != undefined)
		if(options.where.nombreCompleto.length > 0){
			let selector = {
		  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
		  	roles : ["Verificador"]
			}
			return Meteor.users.find(selector, options.options);	
		}
});

Meteor.publish("verificadores",function(options){
  return Meteor.users.find(options.id);
});