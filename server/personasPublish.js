
Meteor.publish("buscarPersonas",function(options){
	if (options != undefined)
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }
				}
				console.log(selector);
				console.log(options);
				return Personas.find(selector, options.options);	
			}
});