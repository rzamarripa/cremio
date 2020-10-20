Meteor.publish("pagos", function (params) {
	return Pagos.find(params);
});

// Meteor.publishComposite("pagosComposite", function (options) {

// 	return {
// 		find() {
// 			return Pagos.find(params);
// 		},
// 		children: [{
// 			find(pago) {
// 				return Creditos.find({
// 					_id: pago.movimientoCaja_id
// 				});
// 			},
// 			find(pago) {
// 				return Meteor.users.find({
// 					_id: pago.usuarioCobro_id
// 				});
// 			},
// 		}]
// 	}

// });
