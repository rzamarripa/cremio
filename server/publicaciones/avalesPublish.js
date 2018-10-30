Meteor.publish("buscarAvales",function(options){
	if (options != undefined)	
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }
				}
				return Avales.find(selector, { fields: {roles: 1,
																											"profile.nombreCompleto"	: 1, 
																											"profile.nombre"					: 1, 
																											"profile.apellidoPaterno"	: 1, 
																											"profile.apellidoMaterno"	: 1,
																											"profile.particular"			: 1,
																											"profile.celular"					: 1, 
																											"profile.sexo"						: 1, 
																											"profile.foto"						: 1,
																											"profile.esCliente"				: 1,
																											"profile.esDistribuidor"	: 1 }}, options.options);	
			}
});


Meteor.publish("avales",function(options){
  return Avales.find(options);
});




