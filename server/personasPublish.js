Meteor.publish("personas",function(params){
  	return Personas.find(params);
});


Meteor.publish("buscarPersonas",function(options){
	if (options != undefined)
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }
				}
				
				return Personas.find(selector, options.options);	
			}
});