Meteor.methods({
  getCobranza: function (fechaInicial, fechaFinal) {
			
			var arreglo = {};
			var planPagos = PlanPagos.find({fechaLimite: {$gte: fechaInicial,$lt: fechaFinal}, estatus: 0}).fetch();

			var hoy = new Date();
			
			
			_.each(planPagos, function(planPago){
				var classPago = "";
					
					
					if(hoy > planPago.fechaLimite){
						
						classPago = "text-danger";
						
						//Calcular Multa
						var fechaActual = moment();
						var fechaLimite = moment(planPago.fechaLimite);
						var dias = fechaActual.diff(fechaLimite, "days");
						
						
					}else{
						
						classPago = "text-success";
						
					}
					
					
		 			if(arreglo[planPago.credito_id] == undefined){
			 			
			 			arreglo[planPago.credito_id] = {};
			 			arreglo[planPago.credito_id].credito = Creditos.findOne({_id: planPago.credito_id});
			 			arreglo[planPago.credito_id].cliente = Meteor.users.findOne({_id: planPago.cliente_id});
			 			arreglo[planPago.credito_id].importe = 0.00;
			 			arreglo[planPago.credito_id].importe = planPago.importeRegular;
			 			arreglo[planPago.credito_id].planPagos = [];			 			
			 			arreglo[planPago.credito_id].planPagos.push({numeroPago : planPago.numeroPago, fechaLimite : planPago.fechaLimite, classPago : classPago});
			 			arreglo[planPago.credito_id].multas = [];
			 			
			 			/*
			 			if(hoy > planPago.fechaLimite){
							
						}else{
							
						}
						*/
			 			
			 			
		 			}else{
			 			
			 			arreglo[planPago.credito_id].importe += planPago.importeRegular;
			 			arreglo[planPago.credito_id].planPagos.push({numeroPago : planPago.numeroPago, fechaLimite : planPago.fechaLimite, classPago : classPago});
		 			}
	
			 		console.log("Arreglo:", _.toArray(arreglo));			
			});
			
			return _.toArray(arreglo);
	},
	
});	