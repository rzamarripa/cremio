Meteor.methods({
  getCobranza: function (fechaInicial, fechaFinal) {
			
			var arreglo = {};
			var planPagos = PlanPagos.find({fechaLimite: {$gte: fechaInicial,$lt: fechaFinal}, estatus: 0}).fetch();
			
			var cobranza = {credito_id:"", cliente_id:"",nombreCliente:"",recibos:{},importe:0.00,saldo:0.00}
			_.each(planPagos, function(planPago){
			 			
			 			
			 			
			 			//Buscar si esta el Credito en el arreglo
			 			//var buscarCredito = arreglo.indexOf(planPago.credito_id);
			 			console.log(arreglo.length);
			 			if (arreglo.length === undefined)
			 			{
				 				var credito = Creditos.findOne({_id: planPago.credito_id});
				 				console.log("Credito:",credito);
				 				var cliente = Meteor.users.findOne({_id: planPago.cliente_id});
				 				console.log("cliente:",cliente);
				 				
				 				cobranza.credito_id = credito._id;
				 				cobranza.cliente_id = cliente._id;
				 				cobranza.nombreCliente = cliente.profile.nombreCompleto;
				 				
				 				cobranza.importe = 0.00;
				 				cobranza.saldo = credito.saldoActual;

				 				//cobranza.recibos.push()
				 				
				 				//arreglo[grupo._id].
			 			}
			 			/*
			 			else if()
			 			{
				 				
			 			}
			 			else
			 			{
				 				
				 			
			 			}
			 			*/	
			 			
			 			//console.log(planPago.credito_id);
			 			
			
			});
			
			//console.log(planPagos);
			
			return arreglo;
	},
	
});	