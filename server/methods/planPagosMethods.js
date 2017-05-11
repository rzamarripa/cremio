Meteor.methods({
	generarPlanPagos: function(credito,cliente){

		function clonar( original )  {		    
		    var clone = {} ;
		    for (var key in original )
		        clone[ key ] = original[ key ] ;
		    return clone ;
		}
	
		//console.log(fecha);
		var mfecha = moment(credito.fechaPrimerAbono);
		var inicio = mfecha.toDate();
		//console.log(credito);
		var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
		//console.log(tipoCredito);

		var totalPagos = 0;
		var seguro = tipoCredito.seguro;

		if(credito.periodoPago == "Semanal")
		{
			totalPagos = credito.duracionMeses * 4;
			seguro = seguro / 2;	
		}	
		else if (credito.periodoPago == "Quincenal")
		{
			totalPagos = credito.duracionMeses * 2;
		}	
		else if(credito.periodoPago == "Mensual")
		{
			totalPagos = credito.duracionMeses;
			seguro = seguro * 2;
		
		}	
		
		
/*
		if(credito.requiereVerificacion == true)
			credito.estatus = 0;
		else
			credito.estatus = 1;
*/
		
		
		var importeParcial = (((credito.capitalSolicitado * (tipoCredito.tasa / 100)*1.16)
								*credito.duracionMeses+credito.capitalSolicitado)/totalPagos)+seguro;
		
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
				fechaLimite		: new Date(new Date(mfecha.toDate().getTime()).setHours(23,59,59)),
				diaSemana			: mfecha.weekday(),
				tipoPlan			: credito.periodoPago,
				numeroPago			: i + 1,
				importeRegular		: importeParcial,
				iva					: iva,
				interes 			: interes,
				seguro				: seguro,
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
				
				var interes = multas / 1.16
				interes = Number(interes.toFixed(2));
				var iva = multas - interes;
				iva = Number(iva.toFixed(2));
				if(isNaN(pago.iva))
					pago.iva=0;
				if(isNaN(pago.interes))
					pago.interes=0;

				pago.iva += iva;
				pago.interes += interes;
				pago.cargo += multas;
				pago.cargo=Math.round(pago.cargo * 100) / 100;

				PlanPagos.update({_id:pago._id},{$set:{cargo:pago.cargo,importeRegular:pago.importeRegular,ultimaModificacion:ahora,fechaLimite:ahora}})
			}catch(e){
				console.log(e)
			}
		});
		
	},
	pagoParcialCredito:function(pagos,abono,totalPago,tipoIngresoId,credito_id){
		console.log(credito_id,"el id del credito papu")
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
		pago.credito_id = credito_id;
		pago.planPagos=[];
	
		var pago_id=undefined;
		pago_id = Pagos.insert(pago);

		var idpagos = [];
		var pagosId = {};
		_.each(pagos,function (p) {
			idpagos.push(p.id);
			pagosId[p.id]=p.importe;
		})
		var pagos=PlanPagos.find({_id:{$in:idpagos}},{sort:{descripcion:1}}).fetch();
		var mfecha = moment(ahora);
		_.each(pagos,function(p){
			if(p.estatus!=1){
				var ttpago = 0;
				//console.log(p.importeRegular,abono)
				var residuos={pagoSeguro:0,pagoInteres:0,pagoIva:0,pagoCapital:0};
				p.pagoInteres = p.pagoInteres? p.pagoInteres:0;
				p.pagoIva = p.pagoIva? p.pagoIva:0;
				p.pagoCapital = p.pagoCapital? p.pagoCapital:0;
				p.pagoSeguro = p.pagoSeguro? p.pagoSeguro:0; 
				if(p.importeRegular<=pagosId[p._id]){
					//console.log("Total",p._id,p.descripcion)
					if(p.descripcion=="Multa" && p.multa==1)
						p.estatus=1;
					else if(p.multada==1){
						var multa = PlanPagos.findOne(p.multa_id);
						residuos.pagoInteres = p.interes-p.pagoInteres
						residuos.pagoIva = p.pagoIva-p.pagoIva
						multa.multa = 1;
						p.estatus = 1;
						if(multa.importeRegular==0)
							multa.estatus = 1;
		
						delete multa._id;
						PlanPagos.update({_id:p.multa_id},{$set:multa});
					}
					
					if(p.descripcion=="Recibo"){
						p.estatus=1
						residuos.pagoSeguro =p.seguro-p.pagoSeguro
						residuos.pagoInteres =p.interes-p.pagoInteres
						residuos.pagoIva =p.pagoIva-p.pagoIva
						residuos.pagoCapital =p.capital-p.pagoCapital
						p.pagoInteres = p.interes
						p.pagoIva = p.iva
						p.pagoCapital = p.capital
						p.pagoSeguro = p.seguro
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
					ttpago = pagosId[p._id];
					abono = pagosId[p._id]
					p.importeRegular = p.importeRegular-abono;
					//p.importeRegular =Number(p.importeRegular.toFixed(2))
					p.importeRegular=Math.round(p.importeRegular * 100) / 100;

					p.pago += abono
					p.pago=Math.round(p.pago * 100) / 100;

					p.estatus = 2;
					

					if(p.seguro-p.pagoSeguro>abono){
						residuos.pagoSeguro= abono
						p.pagoSeguro+=abono
						abono=0;
					}
					else if(p.seguro-p.pagoSeguro>0){
						abono -= (p.seguro-p.pagoSeguro)
						residuos.pagoSeguro= (p.seguro-p.pagoSeguro)
						p.pagoSeguro = p.seguro
					}
					if(((p.interes-p.pagoInteres) + (p.iva-p.pagoIva))>abono){
						p.pagoInteres += abono / 1.16;
						p.pagoIva += abono - (abono / 1.16)
						residuos.pagoInteres = abono / 1.16;
						residuos.pagoIva = abono - (abono / 1.16)
						abono=0
					}
					else if( ((p.interes-p.pagoInteres) + (p.iva-p.pagoIva))>0){
						abono -= ((p.interes-p.pagoInteres) + (p.iva-p.pagoIva))
						residuos.pagoInteres= (p.interes-p.pagoInteres)
						residuos.pagoIva= (p.iva-p.pagoIva)
						p.pagoInteres = p.interes
						p.iva = p.iva
					}

					if(p.capital-p.pagoCapital>abono){
						residuos.pagoCapital= abono
						p.pagoCapital+=abono
						abono=0;
					}
					else if(p.capital-p.pagoCapital>0){
						abono -= (p.capital-p.pagoCapital)
						residuos.pagoCapital= (p.seguro-p.pagoCapital)
						p.pagoCapital = p.capital
					}

					abono=0;
				}
				pago.credito_id =p.credito_id;
				p.modificada = 1;
				p.ultimaModificacion = ahora;
				p.fechaPago = ahora;
				semanaPago = mfecha.isoWeek();
				diaPago	= mfecha.weekday();

				var npp={pago_id:pago_id,totalPago:ttpago,estatus:p.estatus,fechaPago:pago.fechaPago, 
						 numeroPago : p.numeroPago,movimiento:p.movimiento,cargo:p.importe,planPago_id:p._id,
						 pagoCapital : p.pagoCapital, pagoInteres: p.pagoInteres,
						 pagoIva : p.pagoIva, pagoSeguro : p.pagoSeguro};

				p.pagos.push(npp);
				credit = Creditos.findOne(pago.credito_id);
				var npago={planPago_id:p._id,totalPago:ttpago,estatus:p.estatus, descripcion:p.descripcion,
						 fechaPago:pago.fechaPago, numeroPago : p.numeroPago,folioCredito:credit.folio,
						 pagoCapital : p.pagoCapital, pagoInteres: p.pagoInteres,
						 pagoIva : p.pagoIva, pagoSeguro : p.pagoSeguro};
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
		console.log("si entre")
		_.each(pagos, function(pago){
			try{
				var mfecha = moment(ahora);
				//console.log("fechaLimite",pago.fechaLimite, ahora)
				limite = new Date (pago.fechaLimite.getFullYear(),pago.fechaLimite.getMonth(),pago.fechaLimite.getDate());
				var dias = mfecha.diff(limite, "days");
				var credito = Creditos.findOne(pago.credito_id);
				console.log(pago)
				console.log(pago.credito_id)
				console.log(credito)
				var multas = (dias/100) * credito.capitalSolicitado; 
				multas=Math.round(multas * 100) / 100;
				var interes = multas / 1.16
				interes = Number(interes.toFixed(2));
				var iva = multas - interes;
				iva = Number(iva.toFixed(2));
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
					iva					: iva,
					interes 			: interes,
					seguro				: 0,
					capital 			: 0,
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
				console.log(e.stack);
			}
		})
	}
});