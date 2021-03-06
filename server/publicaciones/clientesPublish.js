Meteor.publish("buscarClientes", function (options) {
	if (options != undefined)
		if (options.where.nombreCompleto.length > 0) {
			let selector = {
				"profile.nombreCompleto": { '$regex': '.*' + options.where.nombreCompleto || '' + '.*', '$options': 'i' },
				roles: { $in: ["Cliente", "Distribuidor"] }
			}

			return Meteor.users.find(selector, {
				fields: {
					roles: 1,
					"profile.nombreCompleto": 1,
					"profile.nombre": 1,
					"profile.apellidoPaterno": 1,
					"profile.apellidoMaterno": 1,
					"profile.particular": 1,
					"profile.celular": 1,
					"profile.sexo": 1,
					"profile.foto": 1,
					"profile.numeroCliente": 1,
					"profile.esAval": 1,
					"profile.sucursal_id": 1,
					roles: 1
				}
			}, options.options);
		}
});

Meteor.publish("buscarClientesNumero", function (options) {
	if (options != undefined)
		if (options.where.numeroCliente.length > 0) {
			let selector = {
				"profile.numeroCliente": { $in: options.where.numeroCliente },
				roles: { $in: ["Cliente", "Distribuidor"] }
			}
			return Meteor.users.find(selector, {
				fields: {
					roles: 1,
					"profile.nombreCompleto": 1,
					"profile.nombre": 1,
					"profile.apellidoPaterno": 1,
					"profile.apellidoMaterno": 1,
					"profile.particular": 1,
					"profile.celular": 1,
					"profile.sexo": 1,
					"profile.foto": 1,
					"profile.numeroCliente": 1,
					"profile.esAval": 1,
					"profile.sucursal_id": 1,
					roles: 1
				}
			}, options.options);
		}
});

Meteor.publish("buscarDistribuidor", function (options) {
	if (options != undefined)
		if (options.where.nombreCompleto.length > 0) {
			let selector = {
				"profile.nombreCompleto": { '$regex': '.*' + options.where.nombreCompleto || '' + '.*', '$options': 'i' },
				roles: { $in: ["Distribuidor"] }
			}

			return Meteor.users.find(selector, {
				fields: {
					roles: 1,
					"profile.numeroCliente": 1,
					"profile.nombreCompleto": 1,
				}
			}, options.options);
		}
});

Meteor.publish("buscarRootClientesDistribuidores", function (options) {
	if (options != undefined)
		if (options.where.nombreCompleto.length > 0) {
			let selector = {
				"profile.sucursal_id": options.where.sucursal_id,
				"profile.nombreCompleto": { '$regex': '.*' + options.where.nombreCompleto || '' + '.*', '$options': 'i' },
				roles: options.where.rol
			}

			return Meteor.users.find(selector, {
				fields: {
					roles: 1,
					"profile.nombreCompleto": 1,
					"profile.sexo": 1,
					"profile.foto": 1,
					"profile.numeroCliente": 1
				}
			}, options.options);
		}
});

Meteor.publish("buscarRootClientesDistribuidoresNumero", function (options) {
	if (options != undefined) {
		if (options.where.numeroCliente.length > 0) {

			let selector = {
				$or: [{ "profile.numeroCliente": options.where.numeroCliente }, { "profile.numeroCliente": options.where.numeroCliente }]
			}

			return Meteor.users.find(selector, {
				fields: {
					roles: 1,
					"profile.nombreCompleto": 1,
					"profile.sexo": 1,
					"profile.foto": 1,
					"profile.numeroCliente": 1
				}
			}, options.options);

		}

	}

});

Meteor.publish("distribuidores", function (options) {
	return Meteor.users.find(options, {
		fields: {
			roles: 1,
			createdAt: 1,
			"profile.nombreCompleto": 1,
			"profile.numeroCliente": 1,
			"profile.limiteCredito": 1,
			"profile.verificacionEstatus": 1,
			"profile.estaVerificado": 1,
			"profile.estatusCredito": 1,
			"profile.indicacion": 1,
			"profile.avales_ids": 1,
			"profile.sinAval": 1
		}
	});
});

Meteor.publish("clienteImportar", function (options) {
	return Meteor.users.find(options, {
		fields: {
			roles: 1,
			"profile.nombreCompleto": 1,
			"profile.numeroCliente": 1
		}
	});
});

Meteor.publish("cliente", function (options) {
	return Meteor.users.find(options);
});

Meteor.publish("detalleClienteEncabezado", function (options) {
	return Meteor.users.find(options, {
		fields: {
			"profile.documentos": 0,
		}
	});
});


Meteor.publish("clientes", function (options) {
	return Meteor.users.find(options);
});


Meteor.publishComposite('promotorComposite', function (params) {
	return {
		find() {
			return Meteor.users.find(params);
		},
		children: [{

			find(promotor) {
				return Paises.find({
					_id: promotor.profile.pais_id
				});
			}
		},
		{
			find(promotor) {
				return Estados.find({
					_id: promotor.profile.estado_id
				});
			}
		},
		{
			find(promotor) {
				return Municipios.find({
					_id: promotor.profile.municipio_id
				});
			}
		},
		{
			find(promotor) {
				return Ciudades.find({
					_id: promotor.profile.ciudad_id
				});
			}
		},
		{
			find(promotor) {
				return Colonias.find({
					_id: promotor.profile.colonia_id
				});
			}
		},
		{
			find(promotor) {
				return Nacionalidades.find({
					_id: promotor.profile.nacionalidad_id
				});
			}
		},
		{
			find(promotor) {
				return EstadoCivil.find({
					_id: promotor.profile.estadoCivil_id
				});
			}
		},
		{
			find(promotor) {
				return Ocupaciones.find({
					_id: promotor.profile.ocupacion_id
				});
			}
		}]
	}
});

Meteor.publish("buscarClientesDistribuidores", function (options) {
	if (options != undefined)
		if (options.where.nombreCompleto.length > 0) {
			let selector = {
				"profile.nombreCompleto": { '$regex': '.*' + options.where.nombreCompleto || '' + '.*', '$options': 'i' },
				roles: { $in: ["Distribuidor", "Cliente"] }
			}

			return Meteor.users.find(selector, {
				fields: {
					roles: 1,
					"profile.nombreCompleto": 1,
					"profile.numeroCliente": 1
				}
			}, options.options);
		}
});