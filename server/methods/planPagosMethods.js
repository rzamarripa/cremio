Meteor.methods({
	generarPlanPagos: function(credito,cliente){

		function clonar( original )  {		    
		    var clone = {} ;
		    for (var key in original )
		        clone[ key ] = original[ key ] ;
		    return clone ;
		}
	

		var mfecha = moment(credito.fechaPrimerAbono);
		var inicio = mfecha.toDate();
		console.log(credito);
		var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
		//console.log(tipoCredito);

		var totalPagos = 0;

		if(credito.periodoPago == "Semanal")
			totalPagos = credito.duracionMeses * 4;
		else if(credito.periodoPago == "Mensual")
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
				pagos 				: [],
				descripcion			: "Abono",
				ultimaModificacion	: new Date(),
				credito_id 			: credito._id,
				mes					: mfecha.get('month') + 1,
				anio				: mfecha.get('year'),
				cargo				: importeParcial,
				movimiento			: "Abono"
			}
			plan.push(clonar(pago));
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
		return plan;
	},
	actualizarMultas: function(){
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		var mfecha = moment(ahora);
		console.log(ahora);
		var pagos = PlanPagos.find({$and:[
											{
												$or:[
														{multa:0},
														{multa:2}
													]
											},
											{
												descripcion : "Multa"
											},
											{
												ultimaModificacion : { $lt : ahora }
											}
										]}).fetch();
		console.log(pagos);
		_.each(pagos, function(pago){
			try{
				var dias = mfecha.diff(pago.ultimaModificacion, "days");
				var credito = Creditos.findOne(pago.credito_id);
				var multas = (dias/100) * credito.capitalSolicitado; 
				pago.ultimaModificacion = ahora
				pago.importeRegular += multas;

				PlanPagos.update({_id:pago._id},{$set:{importeRegular:pago.importeRegular,ultimaModificacion:ahora}})
			}catch(e){
				console.log(e)
			}
		});
	},
	pagoParcialCredito:function(pagos,abono,totalPago){
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());

		var ffecha = moment(new Date());
		var pago = {};
		pago.fechaPago = ahora;
		pago.usuario_id = Meteor.userId();
		pago.sucursalPago_id = Meteor.user().profile.sucursal_id;
		pago.usuarioCobro_id = Meteor.userId();
		pago.pago = abono;
		pago.totalPago = totalPago;
		pago.cambio = abono -totalPago;
		pago.cambio = pago.cambio<0? 0:pago.cambio;
		pago.diaPago = ffecha.weekday();
		pago.semanaPago = ffecha.isoWeek();
		pago.semanaPago = ahora.getMonth();
		pago.estatus = 1;
		pago.planPagos=[];
	
		var pago_id=undefined;
		pago_id = Pagos.insert(pago);

		var pagos=PlanPagos.find({_id:{$in:pagos}}).fetch();
		var mfecha = moment(ahora);
		_.each(pagos,function(p){
			if(p.estatus!=1){
				var ttpago = 0;
				if(p.importeRegular<=abono){
					
					if(p.descripcion=="Multa" && p.multa==1)
						p.estatus=1;
					else if(p.multada==1){
						var multa =PlanPagos.findOne(p.multa_id);
						multa.multa = 1;
						p.estatus = 1
						if(multa.importeRegular==0)
							multa.estatus = 1
						var multaid = multa._id;
						delete multa_id;
						PlanPagos.update({_id:multaid},{$set:multa});
					}
					else if(p.descripcion=="abono"){
						p.estatus=1
					}
					
					abono-=p.importeRegular;
					ttpago = p.importeRegular;
					p.importeRegular = 0;
					
				}	
				else{
					tttpago = abono;
					p.importeRegular = p.importeRegular-abono;
					p.estatus = 2;
					abono=0;
				}
				pago.credito_id =p.credito_id;
				p.modificada = 1;
				p.ultimaModificacion = ahora;
				p.fechaPago = ahora;
				semanaPago = mfecha.isoWeek();
				diaPago	= mfecha.weekday();

				var npp={pago_id:pago_id,totalPago:ttpago,estatus:p.estatus,fechaPago:pago.fechaPago, 
						 numeroPago : p.numeroPago,movimiento:p.descripcion,cargo:p.importe,planPago_id:p._id}

				p.pagos.push(npp);

				var npago={planPago_id:p._id,totalPago:ttpago,estatus:p.estatus,
						fechaPago:pago.fechaPago, numeroPago : p.numeroPago};
				pago.planPagos.push(npago);

				var pid = p._id;
				delete p._id;
				
				PlanPagos.update({_id:pid},{$set:p})
				
			}
		});
		delete pago._id;
		Pagos.update({_id:pago_id},{$set:pago})
		return "OK"

	},
	generarMultas:function(){
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		var pagos = PlanPagos.find({$and:[
											{
												$or:[
														{estatus:0},
														{estatus:2}
													]
											},
											{
												multada		: 0,
												descripcion : "Abono"
											},
											{
												fechaLimite : { $lt : ahora }
											}
										]}).fetch();
		console.log(pagos)
		_.each(pagos, function(pago){
			try{
				var mfecha = moment(ahora);
				var dias = mfecha.diff(pago.fechaLimite, "days");
				var credito = Creditos.findOne(pago.credito_id);
				var multas = (dias/100) * credito.capitalSolicitado; 
				var multa = {
					semana				: mfecha.isoWeek(),
					fechaLimite			: pago.fechaLimite,
					diaSemana			: mfecha.weekday(),
					tipoPlan			: pago.tipoPlan,
					numeroPago			: pago.numeroPago,
					importeRegular		: multas,
					cliente_id			: pago.cliente_id,
					fechaPago			: undefined,
					semanaPago			: undefined,
					diaPago				: undefined,
					pago				: 0,
					estatus				: 0,
					multada				: 0,
					multa 				: 0,
					multa_id			: undefined,
					planPago_id			: pago._id,
					tiempoPago			: 0,
					modificada			: false,
					pagos 				: [],
					descripcion			: "Multa",
					ultimaModificacion	: ahora,
					credito_id 			: credito._id,
					mes					: mfecha.get('month') + 1,
					anio				: mfecha.get('year'),
					cargo				: pago.cargo,
					movimiento			: "Multa"
				};
				var multa_id = PlanPagos.insert(multa);
				PlanPagos.update({_id:pago._id},{$set:{multada:1,multa_id:multa_id}})
			}catch(e){
				console.log(e);
			}
		})
	}
});