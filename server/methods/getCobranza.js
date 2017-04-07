Meteor.methods({
  getCobranza: function (fechaInicial, fechaFinal, op, sucursal_id) {
			
			var arreglo = {};
			
			var creditos = Creditos.find({sucursal_id: sucursal_id, estatus: 4}).fetch(); //estatus 2 creditos entregado
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
					
					if(hoy > planPago.fechaLimite && planPago.estatus == 0){
						
						classPago = "text-danger";
						
					}else{
						
						classPago = "text-success";
						
					}
					
					if (planPago.importeRegular != 0 )
					{
						
				 			if(arreglo[planPago.credito_id] == undefined ){
					 			
					 			arreglo[planPago.credito_id] = {};
					 			arreglo[planPago.credito_id].credito = Creditos.findOne({_id: planPago.credito_id});
					 			arreglo[planPago.credito_id].cliente = Meteor.users.findOne({_id: planPago.cliente_id});
					 			arreglo[planPago.credito_id].planPagos = [];			 			
					 			arreglo[planPago.credito_id].planPagos.push({numeroPago : planPago.numeroPago, fechaLimite : planPago.fechaLimite, classPago : classPago});
					 			
					 			//arreglo[planPago.credito_id].importe = 0.00;
					 			if (planPago.movimiento == "Recibo")
					 			{
					 					arreglo[planPago.credito_id].importe = planPago.importeRegular;
					 					arreglo[planPago.credito_id].multas = 0;
					 			}		
					 			else
					 			{
						 				arreglo[planPago.credito_id].importe = 0;
					 					arreglo[planPago.credito_id].multas = planPago.importeRegular;
					 			}
					 					
					 			arreglo[planPago.credito_id].imprimir = false;
					 			arreglo[planPago.credito_id].saldo = planPago.importeRegular + planPago.multa;
					 			
					 			
				 			}else{
					 			
					 			if (planPago.movimiento == "Recibo")
						 				arreglo[planPago.credito_id].importe += planPago.importeRegular;
					 			else
						 				arreglo[planPago.credito_id].multas += planPago.importeRegular;

					 			
					 			arreglo[planPago.credito_id].saldo += planPago.importeRegular + planPago.multa;
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
					
					
					
					if(hoy > planPago.fechaLimite && planPago.estatus == 0){
						
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
					 			arreglo[planPago.credito_id].planPagos = [];			 			
					 			arreglo[planPago.credito_id].planPagos.push({numeroPago : planPago.numeroPago, fechaLimite : planPago.fechaLimite, classPago : classPago});
					 			
					 			if (planPago.movimiento == "Recibo")
					 			{
					 					arreglo[planPago.credito_id].importe = planPago.importeRegular;
					 					arreglo[planPago.credito_id].multas = 0;
					 			}		
					 			else
					 			{
						 				arreglo[planPago.credito_id].importe = 0;
					 					arreglo[planPago.credito_id].multas = planPago.importeRegular;
					 			}
					 			
					 			arreglo[planPago.credito_id].imprimir = false;
					 			arreglo[planPago.credito_id].saldo = planPago.importeRegular + planPago.multa;
					 			
					 			
				 			}else{
					 			
					 			if (planPago.movimiento == "Recibo")
						 				arreglo[planPago.credito_id].importe += planPago.importeRegular;
					 			else
						 				arreglo[planPago.credito_id].multas += planPago.importeRegular;
					 			
					 			arreglo[planPago.credito_id].saldo += planPago.importeRegular + planPago.multa;
					 			arreglo[planPago.credito_id].planPagos.push({numeroPago : planPago.numeroPago, fechaLimite : planPago.fechaLimite, classPago : classPago});
					 			
					
					 			
				 			}
					}
	
			 		//console.log("Arreglo:", _.toArray(arreglo));			
			});
			
			return _.toArray(arreglo);
			
			
			
	},
	gethistorialPago: function (credito_id) {
			var arreglo = [];
			
			var saldoPago = 0;
			var saldoActual = 0; 
			var saldoMultas=0;
			
			//console.log(credito_id);			
			
			var credito = Creditos.findOne({_id: credito_id});
			var planPagos = PlanPagos.find({credito_id:credito_id},{sort:{numeroPago:1,descripcion:-1}}).fetch();
			
			//console.log(planPagos);
			
			var saldo =0;
			//try{ saldo = credito.numeroPago*pagos[0].cargo;} catch(ex){console.log("aqui",pagos)}
			//console.log("credito",credito);
			_.each(planPagos, function(planPago){
				if(planPago.descripcion=="Recibo")
					saldo+=planPago.cargo;
				if(planPago.descripcion=="Multa")
					saldoMultas+=planPago.importeRegular;
			});
			_.each(planPagos, function(planPago, index){

				
				if(planPago.descripcion=="Multa")
					saldo+=planPago.cargo
				
				fechaini= planPago.fechaPago? planPago.fechaPago:planPago.fechaLimite
				//console.log(fechaini,planPago.fechaPago,planPago.fechaLimite)
				arreglo.push({saldo:saldo,
					numeroPago : planPago.numeroPago,
					cantidad : credito.numeroPagos,
					fechaSolicito : credito.fechaSolicito,
					fecha : fechaini,
					pago : 0, 
					cargo : planPago.cargo,
					movimiento : planPago.movimiento,
					planPago_id : planPago._id,
					credito_id : planPago.credito_id,
					descripcion : planPago.descripcion,
					importe : planPago.importeRegular,
					pagos : planPago.pagos,
					iva : planPago.iva,
					interes : planPago.interes,
					abono : planPago.abono,
			  	});
					
				
				if(planPago.pagos.length>0)
					_.each(planPago.pagos,function (pago) {
						saldo-=pago.totalPago
						arreglo.push({saldo:saldo,
							numeroPago : planPago.numeroPago,
							cantidad : credito.numeroPagos,
							fechaSolicito : credito.fechaSolicito,
							fecha : pago.fechaPago,
							pago : pago.totalPago, 
							cargo : 0,
							movimiento : planPago.descripcion=="Multa"? "Abono de Multa":"Abono",
							planPago_id : planPago._id,
							credito_id : planPago.credito_id,
							descripcion : planPago.descripcion=="Multa"? "Abono de Multa":"Abono",
							importe : planPago.importeRegular,
							pagos : planPago.pagos,

					  	});
					})
				//console.log(rc.saldo)
			});

			
			return arreglo;
		
	},	

	getreportesPagos: function (credito_id) {
			var arreglo = [];
			
			var saldoPago = 0;
			var saldoActual = 0; 
			var saldoMultas=0;
			
			//console.log(credito_id);			
			
			var credito = Creditos.findOne({_id: credito_id});
			var planPagos = PlanPagos.find({credito_id:credito_id},{sort:{numeroPago:1,descripcion:-1}}).fetch();
			
			//console.log(planPagos);
			
			var saldo =0;
			//try{ saldo = credito.numeroPago*pagos[0].cargo;} catch(ex){console.log("aqui",pagos)}
			//console.log("credito",credito);
			_.each(planPagos, function(planPago){
				if(planPago.descripcion=="Recibo")
					saldo+=planPago.cargo;
				if(planPago.descripcion=="Multa")
					saldoMultas+=planPago.importeRegular;
			});
			_.each(planPagos, function(planPago, index){

				
				if(planPago.descripcion=="Multa")
					saldo+=planPago.cargo
				
				fechaini= planPago.fechaPago? planPago.fechaPago:planPago.fechaLimite
				//console.log(fechaini,planPago.fechaPago,planPago.fechaLimite)
				arreglo.push({saldo:saldo,
					numeroPago : planPago.numeroPago,
					cantidad : credito.numeroPagos,
					fechaSolicito : credito.fechaSolicito,
					fecha : fechaini,
					pago : 0, 
					cargo : planPago.cargo,
					movimiento : planPago.movimiento,
					planPago_id : planPago._id,
					credito_id : planPago.credito_id,
					descripcion : planPago.descripcion,
					importe : planPago.importeRegular,
					pagos : planPago.pagos,
					iva : planPago.iva,
					interes : planPago.interes,
					abono : planPago.abono,
			  	});

			
					

			});

			
			return arreglo;
		
	}	
	
});	