Meteor.publish("notasCredito", function (params) {
	return NotasCredito.find(params);
});

Meteor.publish("notasCreditoCliente", function (params) {
	return NotasCredito.find(params, { sort: { createdAt: -1 }, limit: 15 });
});

Meteor.publish("notasCreditoTop1", function (params) {
	return NotasCredito.find(params, { limit: 1 }, { sort: { createdAt: -1 } });
});

