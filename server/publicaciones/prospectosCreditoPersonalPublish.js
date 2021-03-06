Meteor.publish("prospectosCreditoPersonal", function (params) {
	return ProspectosCreditoPersonal.find(params);
});

Meteor.publishComposite("prospectosCreditoPersonalVerificacionesComposite", function (params) {
	return {
		find() {
			return ProspectosCreditoPersonal.find(params);
		},
		children: [{
			find(prospecto) {
				return Verificaciones.find({
					cliente_id: prospecto._id
				});
			}
		}]
	}
});

Meteor.publishComposite('prospectosCreditoPersonalComposite', function (params, options) {
	return {
		find() {
			return ProspectosCreditoPersonal.find(params);
		},
		children: [{
			find(prospecto) {
				return Meteor.users.find({
					_id: prospecto.profile.usuarioCreacion_id
				});
			}
		},
		{
			find(prospecto) {
				return Meteor.users.find({
					_id: prospecto.profile.promotora_id
				});
			}
		}]
	}
});

Meteor.publish("buscarProspectoCreditoPersonal", function (options) {

	if (options != undefined)
		if (options.where.nombreCompleto.length > 0) {
			let selector = {
				"profile.nombreCompleto": { '$regex': '.*' + options.where.nombreCompleto || '' + '.*', '$options': 'i' },
				"profile.sucursal_id": options.where.sucursal_id
				// ,
				// "profile.estatus": { $in: [3, 4] }
			}

			return ProspectosCreditoPersonal.find(selector, {
				fields: {
					//"profile.referenciasPersonales_ids": 0,
					//"profile.avales_ids": 0
					// "profile.nombre": 1,
					// "profile.apellidoPaterno": 1,
					// "profile.apellidoMaterno": 1,
					// "profile.particular": 1,
					// "profile.celular": 1,
					// "profile.tipo": 1,
					// "profile.sexo": 1,
					// "profile.estatus": 1,
					// "profile.sucursal_id": 1,
					// roles: 1
				}
			}, options.options);
		}
});



// Meteor.publish("prospectosDistribuidorListado",function(options){
// 		if (options != undefined)
// 		{


// 			let selector = { "promotora_id"	: options.where.distribuidor_id };

// 			return ProspectosDistribuidor.find(selector, { fields: {
// 																											"profile.nombreCompleto"	: 1, 
// 																											"profile.promotora_id"		: 1, 
// 																											"profile.fechaCreacion"		: 1, 
// 																											"profile.estatusProspecto": 1}},options.options);								 
// 		}									 
// });

// Meteor.publish("buscarProspectosDistribuidor",function(options){

// 	if (options != undefined)	
// 			if(options.where.nombreCompleto.length > 0){
// 				let selector = {
// 			  	"nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }
// 				}
// 				return ProspectosDistribuidor.find(selector, { fields: {roles: 1,
// 																											"profile.nombreCompleto"					: 1, 
// 																											"profile.promotora_id"						: 1, 
// 																											"profile.fechaCreacion"						: 1,
// 																											"profile.estatusProspecto"				: 1}},options.options);	
// 			}
// });

