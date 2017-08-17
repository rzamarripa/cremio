Meteor.publish("buscarClientes",function(options){
	if (options != undefined)	
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }, 
			  	 roles : {$in : ["Cliente", "Distribuidor"]}
				}				
				return Meteor.users.find(selector, { fields: {roles: 1,
																											"profile.nombreCompleto"	: 1, 
																											"profile.nombre"					: 1, 
																											"profile.apellidoPaterno"	: 1, 
																											"profile.apellidoMaterno"	: 1,
																											"profile.particular"			: 1,
																											"profile.celular"					: 1, 
																											"profile.sexo"						: 1, 
																											"profile.foto"						: 1,
																											"profile.numeroCliente"		: 1,
																											roles											: 1 }}, options.options);	
			}
});


Meteor.publish("buscarRootClientesDistribuidores",function(options){
	if (options != undefined)
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
			  	roles : {$in : ["Cliente", "Distribuidor"]}
				}
				
				return Meteor.users.find(selector, { fields: {roles												: 1,
																											"profile.nombreCompleto"		: 1, 
																											"profile.sexo"							: 1, 
																											"profile.foto"							: 1,
																											"profile.numeroCliente"			: 1 }}, options.options);
			}
});


/*
Meteor.publish("buscarRootAvales",function(options){
	if (options != undefined)
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
			  	roles : ["Aval"]
				}
				return Meteor.users.find(selector, options.options);	
			}
});
*/



Meteor.publish("cliente",function(options){
  return Meteor.users.find(options);
});

Meteor.publish("clientes",function(options){
  return Meteor.users.find(options);
});

