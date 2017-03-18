Meteor.methods({
  getCobranza: function (fechaInicial, fechaFinal, op, sucursal_id) {
			
			var arreglo = {};
			
			var creditos = Creditos.find({sucursal_id: sucursal_id, estatus: 2}).fetch(); //estatus 2 creditos autorizados
			var creditos_ids = _.pluck(creditos, '_id'); // [45, 3]
			
			
			var planPagos = {};

			
			if (op == 0)
					var planPagos = PlanPagos.find({fechaLimite: {$lte: fechaFinal}, credito_id: { $in: creditos_ids }, estatus: 0}).fetch();
			else
					var planPagos = PlanPagos.find({fechaLimite: {$gte: fechaInicial, $lte: fechaFinal}, credito_id: { $in: creditos_ids }, estatus: 0}).fetch();
			

			var hoy = new Date();
			var fechaActual = moment();
			
			_.each(planPagos, function(planPago){
				var classPago = "";
					
					if(hoy > planPago.fechaLimite && planPago.importeRegular != 0){
						
						classPago = "text-danger";
						
					}else{
						
						classPago = "text-success";
						
					}
					
					if (planPago.importeRegular != 0)
					{
				 			if(arreglo[planPago.credito_id] == undefined){
					 			
					 			arreglo[planPago.credito_id] = {};
					 			arreglo[planPago.credito_id].credito = Creditos.findOne({_id: planPago.credito_id});
					 			arreglo[planPago.credito_id].cliente = Meteor.users.findOne({_id: planPago.cliente_id});
					 			arreglo[planPago.credito_id].importe = 0.00;
					 			arreglo[planPago.credito_id].importe = planPago.importeRegular;
					 			arreglo[planPago.credito_id].planPagos = [];			 			
					 			arreglo[planPago.credito_id].planPagos.push({numeroPago : planPago.numeroPago, fechaLimite : planPago.fechaLimite, classPago : classPago});
					 			arreglo[planPago.credito_id].multas = [];
					 			arreglo[planPago.credito_id].imprimir = false;
					 			
				 			}else{
					 			
					 			arreglo[planPago.credito_id].importe += planPago.importeRegular;
					 			arreglo[planPago.credito_id].planPagos.push({numeroPago : planPago.numeroPago, fechaLimite : planPago.fechaLimite, classPago : classPago});
				 			}
					}
			 		//console.log("Arreglo:", _.toArray(arreglo));			
			});
			
			return _.toArray(arreglo);
	},
	getPersona: function (idPersona) {
			var persona = Personas.findOne(idPersona);
			return persona;
	},
	getcobranzaNombre: function (nombre) {
			
			var arreglo = {};
			
			//Ir por los clientes
			let selector = {
	  	"profile.nombreCompleto": { '$regex' : '.*' + nombre || '' + '.*', '$options' : 'i' },
			  	roles : ["Cliente"]
			}
			var clientes = Meteor.users.find(selector).fetch();
			var clientes_ids = _.pluck(clientes,"_id");			


			
			//Ir por los creditos
			var creditos = Creditos.find({cliente_id :{ $in: clientes_ids }}).fetch(); //estatus 2 creditos autorizados
			var creditos_ids = _.pluck(creditos, '_id'); // [45, 3]

			
			//Ir por los pagos que ha hecho
			var planPagos = PlanPagos.find({credito_id: { $in: creditos_ids }, estatus: 0}).fetch();

			
			var hoy = new Date();
			var fechaActual = moment();
			
			_.each(planPagos, function(planPago){
				var classPago = "";
					
					
					
					if(hoy > planPago.fechaLimite && planPago.importeRegular != 0){
						
						classPago = "text-danger";
						
						//Calcular Multa
						
						var fechaLimite = moment(planPago.fechaLimite);
						var dias = fechaActual.diff(fechaLimite, "days");
						
						
					}else{
						
						classPago = "text-success";
						
					}
					
					
		 			if (planPago.importeRegular != 0)
					{
				 			if(arreglo[planPago.credito_id] == undefined){
					 			
					 			arreglo[planPago.credito_id] = {};
					 			arreglo[planPago.credito_id].credito = Creditos.findOne({_id: planPago.credito_id});
					 			arreglo[planPago.credito_id].cliente = Meteor.users.findOne({_id: planPago.cliente_id});
					 			arreglo[planPago.credito_id].importe = 0.00;
					 			arreglo[planPago.credito_id].importe = planPago.importeRegular;
					 			arreglo[planPago.credito_id].planPagos = [];			 			
					 			arreglo[planPago.credito_id].planPagos.push({numeroPago : planPago.numeroPago, fechaLimite : planPago.fechaLimite, classPago : classPago});
					 			arreglo[planPago.credito_id].multas = [];
					 			arreglo[planPago.credito_id].imprimir = false;
					 			
				 			}else{
					 			
					 			arreglo[planPago.credito_id].importe += planPago.importeRegular;
					 			arreglo[planPago.credito_id].planPagos.push({numeroPago : planPago.numeroPago, fechaLimite : planPago.fechaLimite, classPago : classPago});
				 			}
					}
	
			 		//console.log("Arreglo:", _.toArray(arreglo));			
			});
			
			return _.toArray(arreglo);
			
			
			
	},
	
	
});	