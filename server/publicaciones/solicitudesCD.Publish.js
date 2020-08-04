Meteor.publish("solicitudesClientes", function (params) {
	return SolicitudesClientes.find(params);
});

Meteor.publishComposite('solicitudesClientesComposite', function (params) {
	return {
		find() {
			return SolicitudesClientes.find(params);
		},
		children: [{
			find(solicitud) {
				return Meteor.users.find({
					_id: solicitud.profile.usuario_id
				});
			}
		}]
	}
});

Meteor.publish("solicitudesDistribuidores", function (params) {
	return SolicitudesDistribuidores.find(params);
});

Meteor.publishComposite('solicitudesDistribuidoresComposite', function (params) {
	return {
		find() {
			return SolicitudesDistribuidores.find(params);
		},
		children: [{
			find(solicitud) {
				return Meteor.users.find({
					_id: solicitud.profile.usuario_id
				});
			}
		}]
	}
});


Meteor.publish("buscarSolicitudCreditoPersonal", function (options) {

	if (options != undefined)
		if (options.where.nombreCompleto.length > 0) {
			let selector = {
				"profile.nombreCompleto": { '$regex': '.*' + options.where.nombreCompleto || '' + '.*', '$options': 'i' },
				"profile.sucursal_id": options.where.sucursal_id,
				"profile.estatus": { $in: [3, 4, 5, 6, 7] }
			}

			return SolicitudesClientes.find(selector, options.options);
		}
});

Meteor.publish("buscarSolicitudDistribuidor", function (options) {
	if (options != undefined)
		if (options.where.nombreCompleto.length > 0) {
			let selector = {
				"profile.nombreCompleto": { '$regex': '.*' + options.where.nombreCompleto || '' + '.*', '$options': 'i' },
				"profile.sucursal_id": options.where.sucursal_id,
				"profile.estatus": { $in: [3, 4, 5, 6, 7] }
			}
			return SolicitudesDistribuidores.find(selector, options.options);
		}
});