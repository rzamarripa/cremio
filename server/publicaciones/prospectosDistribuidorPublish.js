Meteor.publish("prospectosDistribuidor",function(params){
  	return ProspectosDistribuidor.find(params);
});


Meteor.publish("prospectosDistribuidorListado",function(options){
		if (options != undefined)
		{
			
			
			let selector = { "promotora_id"	: options.where.distribuidor_id };

			return ProspectosDistribuidor.find(selector, { fields: {
																											"profile.nombreCompleto"	: 1, 
																											"profile.promotora_id"		: 1, 
																											"profile.fechaCreacion"		: 1, 
																											"profile.estatusProspecto": 1}},options.options);								 
		}									 
});

Meteor.publish("buscarProspectosDistribuidor",function(options){

	if (options != undefined)	
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }
				}
				return ProspectosDistribuidor.find(selector, { fields: {roles: 1,
																											"profile.nombreCompleto"					: 1, 
																											"profile.promotora_id"						: 1, 
																											"profile.fechaCreacion"						: 1,
																											"profile.estatusProspecto"				: 1}},options.options);	
			}
});

