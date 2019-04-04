Meteor.publish("prospectos",function(params){
  	return Prospectos.find(params);
});


Meteor.publish("prospectosListado",function(options){
		if (options != undefined)
		{
			
			
			let selector = { "distribuidor_id"	: options.where.distribuidor_id };		

			return Prospectos.find(selector, options.options);								 
		}									 
});


Meteor.publish("buscarProspectos",function(options){

	if (options != undefined)	
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }
				}
				return Prospectos.find(selector, { fields: {roles: 1,
																											"nombreCompleto"					: 1, 
																											"distribuidor_id"					: 1, 
																											"estatus"									: 1}},options.options);	
			}
});

