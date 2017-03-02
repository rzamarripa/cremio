Meteor.methods({
	generarPlanPagos: function(credito,cliente){
	

		var mfecha = moment(credito.primerAbono);
		var inicio = mfecha.toDate();

		var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
		var totalPagos = 0;

		if(credito.periodoPago == "Semanal")
			totalPagos = credito.duracionMeses * 4;
		else if(this.credito.periodoPago == "Mensual")
			totalPagos = credito.duracionMeses;
		
		
		if(credito.requiereVerificacion == true)
			credito.estatus = 0;
		else
			credito.estatus = 1;
		
		
		var importeParcial = (((credito.capitalSolicitado * (tipoCredito.tasa / 100)*1.16)*credito.duracionMeses+credito.capitalSolicitado)/totalPagos);
		var plan = [];
		
		for (var i = 0; i < totalPagos; i++) {
			
			var pago = {
				semana				: mfecha.isoWeek(),
				fechaLimite			: new Date(new Date(mfecha.toDate().getTime()).setHours(23,59,59)),
				diaSemana			: mfecha.weekday(),
				tipoPlan			: credito.periodoPago,
				numeroPago			: i + 1,
				importeRegular		: importeParcial,
				cliente_id			: cliente._id,
				fechaPago			: undefined,
				semanaPago			: undefined,
				diaPago				: undefined,
				pago				: 0,
				estatus				: 0,
				multada				: 0,
				multa_id			: undefined,
				planPago_id			: undefined,
				tiempoPago			: 0,
				modificada			: false,
				mes					: mfecha.get('month') + 1,
				anio				: mfecha.get('year'),
				cargo				: importeParcial,
			}
			plan.push(angular.copy(pago));
			if(credito.periodoPago == "Semanal"){
				mfecha = mfecha.add(7, 'days');
			}else if(credito.periodoPago == "Mensual"){
				var siguienteMes = moment(mfecha).add(1, 'M');
				var finalSiguienteMes = moment(siguienteMes).endOf('month');
				
				if(mfecha.date() != siguienteMes.date() && siguienteMes.isSame(finalSiguienteMes.format('YYYY-MM-DD'))) 
					siguienteMes = siguienteMes.add(1, 'd');
				
				
				mfecha = siguienteMes;
			}	
		}
	}
});