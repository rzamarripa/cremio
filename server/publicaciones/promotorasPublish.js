
Meteor.publish("buscarPromotoras", function (options) {
	if (options != undefined)
		if (options.where.nombreCompleto.length > 0) {
			let selector = {
				"profile.nombreCompleto": { '$regex': '.*' + options.where.nombreCompleto || '' + '.*', '$options': 'i' },
				roles: ["Promotora"]
			}
			return Meteor.users.find(selector, options.options);
		}
});

Meteor.publish("promotoras", function (params) {
	return Meteor.users.find(params);
});

Meteor.publish("allPromotoras", function () {
	return Meteor.users.find({ roles: ["Promotora"] });
})

Meteor.publish("promotoraId", function (options) {
	return Meteor.users.find({ _id: options.id, roles: ["Promotora"] });
});


Meteor.publishComposite("pagosHistoricoPromotora", function (options) {
	if (options != undefined) {
		let selector = {
			usuario_id: options.where.cliente_id,
		}
		//console.log(selector)
		return {
			find() {
				return Pagos.find(selector, {
					sort: { fechaPago: -1 }, skip: options.options.skip, limit: options.options.limit
				});
			},
			children: [{
				find(pago) {
					return TiposIngreso.find({ _id: pago.tipoIngreso_id });
				}
			},
			{
				find(pago) {
					return Meteor.users.find({ _id: pago.usuarioCobro_id });
				}
			},
			{
				find(pago) {
					return MovimientosCajas.find({ origen_id: pago._id, tipoMovimiento: "Cancelación" });
				}
			},
			]
		}

	}
});

