Meteor.publish("notasCredito", function (params) {
	return NotasCredito.find(params);
});

Meteor.publishComposite("notasCreditoCaducadas", function (options) {

	var selector = {
		sucursal_id: options.where.sucursal_id,
		estatus: options.where.estatus
	}

	return {
		find() {
			return NotasCredito.find(selector, { sort: { createdAt: -1 }, skip: options.options.skip, limit: options.options.limit });
		},
		children: [{
			find(notaCredito) {
				return Meteor.users.find({ _id: notaCredito.cliente_id });
			}
		},
		{
			find(notaCredito) {
				return Meteor.users.find({ _id: notaCredito.createdBy });
			}
		},
		]
	}
});

Meteor.publishComposite("notasCreditoAplicadas", function (options) {

	var selector = {
		sucursal_id: options.where.sucursal_id,
		estatus: options.where.estatus
	}

	return {
		find() {
			return NotasCredito.find(selector, { sort: { createdAt: -1 }, skip: options.options.skip, limit: options.options.limit });
		},
		children: [{
			find(notaCredito) {
				return Meteor.users.find({ _id: notaCredito.cliente_id });
			}
		},
		{
			find(notaCredito) {
				return Meteor.users.find({ _id: notaCredito.createdBy });
			}
		},
		]
	}
});

Meteor.publish("notasCreditoCliente", function (params) {
	return NotasCredito.find(params, { sort: { createdAt: -1 }, limit: 15 });
});

Meteor.publish("notasCreditoTop1", function (params) {
	return NotasCredito.find(params, { limit: 1 }, { sort: { createdAt: -1 } });
});

