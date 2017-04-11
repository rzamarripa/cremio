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
		//console.log(credito);
		var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
		//console.log(tipoCredito);

		var totalPagos = 0;

		if(credito.periodoPago == "Semanal")
			totalPagos = credito.duracionMeses * 4;
		else if (credito.periodoPago == "Quincenal")
			totalPagos = credito.duracionMeses * 2;
		else if(credito.periodoPago == "Mensual")
			totalPagos = credito.duracionMeses;
		
		
		if(credito.requiereVerificacion == true)
			credito.estatus = 0;
		else
			credito.estatus = 1;
		
		
		var importeParcial = (((credito.capitalSolicitado * (tipoCredito.tasa / 100)*1.16)
								*credito.duracionMeses+credito.capitalSolicitado)/totalPagos);
		
		var iva = ((credito.capitalSolicitado * (tipoCredito.tasa / 100)*0.16)*credito.duracionMeses)/totalPagos;
		iva = parseFloat(iva.toFixed(2));
		var interes = (credito.capitalSolicitado * (tipoCredito.tasa / 100) *credito.duracionMeses)/totalPagos;
		interes = parseFloat(interes.toFixed(2));
		var capital = parseFloat((credito.capitalSolicitado / totalPagos).toFixed(2));
		importeParcial=Math.round(importeParcial * 100) / 100;
		var plan = [];

		for (var i = 0; i < totalPagos; i++) {
			var pago = {
				semana				: mfecha.isoWeek(),
				fechaLimite			: new Date(new Date(mfecha.toDate().getTime()).setHours(23,59,59)),
				diaSemana			: mfecha.weekday(),
				tipoPlan			: credito.periodoPago,
				numeroPago			: i + 1,
				importeRegular		: importeParcial,
				iva					: iva,
				interes 			: interes,
				cliente_id			: cliente._id,
				capital 			: capital,
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
				descripcion			: "Recibo",
				ultimaModificacion	: new Date(),
				credito_id 			: credito._id,
				mes					: mfecha.get('month') + 1,
				anio				: mfecha.get('year'),
				cargo				: importeParcial,

				movimiento			: "Recibo"
			}
			plan.push(clonar(pago));
			if(credito.periodoPago == "Semanal"){
				mfecha = mfecha.add(7, 'days');
			}
			else if(credito.periodoPago == "Quincenal"){
				mfecha = mfecha.add(15, 'days');
				
			}
			else if(credito.periodoPago == "Mensual"){
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
		Meteor.call("generarMultas");
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		var mfecha = moment(ahora);

		//console.log(ahora);
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
		//console.log(pagos);
		_.each(pagos, function(pago){
			try{
				//console.log(ahora,pago.ultimaModificacion,mfecha.diff(pago.ultimaModificacion, "days"))
				var dias = mfecha.diff(pago.ultimaModificacion, "days");
				var credito = Creditos.findOne(pago.credito_id);
				var multas = (dias/100) * credito.capitalSolicitado; 
				pago.ultimaModificacion = ahora
				pago.fechaLimite = ahora
				multas=Math.round(multas * 100) / 100;
				//console.log(pago._id,multas,pago.importeRegular,pago.ultimaModificacion);
				pago.importeRegular += multas;
				pago.importeRegular=Math.round(pago.importeRegular * 100) / 100;
				pago.cargo += multas;
				pago.cargo=Math.round(pago.cargo * 100) / 100;

				PlanPagos.update({_id:pago._id},{$set:{cargo:pago.cargo,importeRegular:pago.importeRegular,ultimaModificacion:ahora,fechaLimite:ahora}})
			}catch(e){
				console.log(e)
			}
		});
		
	},
	pagoParcialCredito:function(pagos,abono,totalPago,tipoIngresoId){
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		
		var cajaid = Meteor.user().profile.caja_id;
		var user = Meteor.user();
		var caja = Cajas.findOne(cajaid);

		var ffecha = moment(new Date());
		var pago = {};
		pago.fechaPago = new Date();
		pago.usuario_id = Meteor.userId();
		pago.sucursalPago_id = Meteor.user().profile.sucursal_id;
		pago.usuarioCobro_id = Meteor.userId();
		pago.pago = abono;
		pago.totalPago = totalPago;
		pago.cambio = abono - totalPago;
		pago.cambio = pago.cambio<0? 0:pago.cambio;
		pago.diaPago = ffecha.weekday();
		pago.semanaPago = ffecha.isoWeek();
		pago.semanaPago = ahora.getMonth();
		pago.estatus = 1;
		pago.planPagos=[];
	
		var pago_id=undefined;
		pago_id = Pagos.insert(pago);


		var pagos=PlanPagos.find({_id:{$in:pagos}},{sort:{descripcion:1}}).fetch();
		var mfecha = moment(ahora);
		_.each(pagos,function(p){
			if(p.estatus!=1){
				var ttpago = 0;
				//console.log(p.importeRegular,abono)
				if(p.importeRegular<=abono){
					//console.log("Total",p._id,p.descripcion)
					if(p.descripcion=="Multa" && p.multa==1)
						p.estatus=1;
					else if(p.multada==1){
						var multa = PlanPagos.findOne(p.multa_id);
						
						multa.multa = 1;
						p.estatus = 1;
						if(multa.importeRegular==0)
							multa.estatus = 1;
		
						delete multa._id;
						PlanPagos.update({_id:p.multa_id},{$set:multa});
					}
					
					if(p.descripcion=="Recibo"){
						p.estatus=1
					}

					
					abono-=p.importeRegular;
					abono=Math.round(abono * 100) / 100;

					ttpago = p.importeRegular;
					p.pago += p.importeRegular;
					p.pago=Math.round(p.pago * 100) / 100;
					p.importeRegular = 0;
					
				}	
				else
				{
					//console.log("Parcial",p._id,p.descripcion)
					ttpago = abono;
					p.importeRegular = p.importeRegular-abono;
					//p.importeRegular =Number(p.importeRegular.toFixed(2))
					p.importeRegular=Math.round(p.importeRegular * 100) / 100;

					p.pago += abono
					p.pago=Math.round(p.pago * 100) / 100;

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
						 numeroPago : p.numeroPago,movimiento:p.movimiento,cargo:p.importe,planPago_id:p._id}

				p.pagos.push(npp);

				var npago={planPago_id:p._id,totalPago:ttpago,estatus:p.estatus, descripcion:p.descripcion,
						fechaPago:pago.fechaPago, numeroPago : p.numeroPago};
				pago.planPagos.push(npago);

				var pid = p._id;
				delete p._id;
				
				PlanPagos.update({_id:pid},{$set:p})
				
			}
		});
		

		var movimiento = {
				tipoMovimiento : "Pago",
				origen : "Pago de Cliente",
				origen_id : pago_id,
				monto : pago.totalPago,
				cuenta_id : tipoIngresoId,
				caja_id : caja._id,
				sucursal_id : user.profile.sucursal_id,
				createdAt : new Date(),
				createdBy : user._id,
				updated : false,
				estatus : 1
			}
		var movimientoid = MovimientosCajas.insert(movimiento);
		delete pago._id;
		pago.caja_id =caja._id;
		pago.movimientoCaja_id = movimientoid;
		Pagos.update({_id:pago_id},{$set:pago})
		caja.cuenta[movimiento.cuenta_id].saldo = caja.cuenta[movimiento.cuenta_id].saldo? caja.cuenta[movimiento.cuenta_id].saldo+movimiento.monto:movimiento.monto;
		Cajas.update({_id:caja._id},{$set:{cuenta:caja.cuenta}}); 
		return pago_id;

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
												descripcion : "Recibo"
											},
											{
												fechaLimite : { $lt : ahora }
											}
										]}).fetch();
		//console.log(pagos)
		_.each(pagos, function(pago){
			try{
				var mfecha = moment(ahora);
				//console.log("fechaLimite",pago.fechaLimite, ahora)
				limite = new Date (pago.fechaLimite.getFullYear(),pago.fechaLimite.getMonth(),pago.fechaLimite.getDate());
				var dias = mfecha.diff(limite, "days");
				var credito = Creditos.findOne(pago.credito_id);
				var multas = (dias/100) * credito.capitalSolicitado; 
				multas=Math.round(multas * 100) / 100;
				var multa = {
					semana				: mfecha.isoWeek(),
					fechaLimite			: ahora,
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
					cargo				: multas,
					movimiento			: "Gastos de Cobranza"
				};
				var multa_id = PlanPagos.insert(multa);
				PlanPagos.update({_id:pago._id},{$set:{multada:1,multa_id:multa_id}})
			}catch(e){
				console.log(e);
			}
		})
	}
});