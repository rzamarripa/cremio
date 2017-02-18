Meteor.methods({
  getCobranza: function (fechaInicial, fechaFinal) {
			
			var arreglo = {};
			var planPagos = PlanPagos.find({fechaLimite: {$gte: fechaInicial,$lt: fechaFinal}, estatus: 0}).fetch();
			
			
			
			_.each(planPagos, function(planPago){
			 			if(arreglo[planPago.credito_id] == undefined){
				 			
				 			arreglo[planPago.credito_id] = {};
				 			arreglo[planPago.credito_id].credito = Creditos.findOne({_id: planPago.credito_id});
				 			arreglo[planPago.credito_id].cliente = Meteor.users.findOne({_id: planPago.cliente_id});
				 			arreglo[planPago.credito_id].importe = 0.00;
				 			arreglo[planPago.credito_id].importe = planPago.importeRegular;
				 			arreglo[planPago.credito_id].planPagos = [];
				 			arreglo[planPago.credito_id].planPagos.push(planPago.numeroPago);
				 			
				 			//if (planPlago.fechaLimite )
				 			
			 			}else{
				 			
				 			arreglo[planPago.credito_id].importe += planPago.importeRegular;
				 			arreglo[planPago.credito_id].planPagos.push(planPago.numeroPago);
			 			}
		
				 		console.log("Arreglo:", _.toArray(arreglo));			
			});
			
			return _.toArray(arreglo);
	},
	
});	