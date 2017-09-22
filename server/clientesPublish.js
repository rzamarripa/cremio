Meteor.publish("buscarClientes",function(options){
	if (options != undefined)	
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }, 
			  	 roles : {$in : ["Cliente", "Distribuidor"]}
				}				
				

				
				return Meteor.users.find(selector, { fields: {roles: 1,
																											"profile.nombreCompleto"			: 1, 
																											"profile.nombre"							: 1, 
																											"profile.apellidoPaterno"			: 1, 
																											"profile.apellidoMaterno"			: 1,
																											"profile.particular"					: 1,
																											"profile.celular"							: 1, 
																											"profile.sexo"								: 1, 
																											"profile.foto"								: 1,
																											"profile.numeroCliente"				: 1,
																											"profile.numeroDistribuidor"	: 1,
																											roles													: 1 }}, options.options);	
			}
});


Meteor.publish("buscarRootClientesDistribuidores",function(options){
	if (options != undefined)
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
			  	roles : {$in : ["Cliente", "Distribuidor"]}
				}

				return Meteor.users.find(selector, { fields: {roles													: 1,
																											"profile.nombreCompleto"			: 1, 
																											"profile.sexo"								: 1, 
																											"profile.foto"								: 1,
																											"profile.numeroCliente"				: 1,
																											"profile.numeroDistribuidor"	: 1 }}, options.options);
			}
});
Meteor.publish("buscarRootClientesDistribuidoresNumero",function(options){
	if (options != undefined){
			if(options.where.numeroCliente.length > 0 || options.where.numeroDistribuidor.length > 0){
				//console.log("entro",options)
				
					let selector = {
				  	"profile.numeroCliente": { '$regex' : '.*' + options.where.numeroCliente || '' + '.*', '$options' : 'i' },
				  	roles : {$in : ["Cliente","Distribuidor"]}
					}
	
					let selector2 = {
					
				  	"profile.numeroDistribuidor": { '$regex' : '.*' + options.where.numeroDistribuidor || '' + '.*', '$options' : 'i' },
				  	roles : {$in : [ "Distribuidor"]}
					}
					console.log(options.where,"el options")
				
				if (options.where.numeroCliente.indexOf("C")!= -1)
				 {
				 	console.log("selector1",options)
					return Meteor.users.find(selector, { fields: {roles												: 1,
																											"profile.nombreCompleto"			: 1, 
																											"profile.sexo"								: 1, 
																											"profile.foto"								: 1,
																											"profile.numeroDistribuidor"	: 1,
																											"profile.numeroCliente"				: 1 }}, options.options);
				}else{
										console.log("selector2")
					return Meteor.users.find(selector2, { fields: {roles											: 1,
																											"profile.nombreCompleto"			: 1, 
																											"profile.sexo"								: 1, 
																											"profile.foto"								: 1,
																											"profile.numeroDistribuidor"	: 1 }}, options.options);

				}
			


				
			}

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


Meteor.publish("distribuidores",function(options){
  return Meteor.users.find(options,{ fields: {roles	: 1,
	  																					createdAt:1,
																							"profile.nombreCompleto"			: 1, 
																							"profile.numeroDistribuidor"	: 1,
																							"profile.limiteCredito"				: 1,
																							"profile.verificacionEstatus"	: 1,
																							"profile.indicacion"					: 1,
																							"profile.avales_ids"					: 1, }});
});


Meteor.publish("cliente",function(options){
  return Meteor.users.find(options);
});


Meteor.publish("clientes",function(options){
  return Meteor.users.find(options);
});

