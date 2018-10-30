Meteor.publish("prospectos",function(params){
  	return Prospectos.find(params);
});


Meteor.publish("buscarProspectos",function(options){

	if (options != undefined)	
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }
				}
				return Prospectos.find(selector, options.options);	
			}
});