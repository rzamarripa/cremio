
Meteor.methods({

	getCobranzaDiaria:function(fechaInicial, fechaFinal, sucursal_id){
			
			var cobranzaDiaria = Pagos.find({sucursalPago_id: sucursal_id, fechaPago : { $gte : fechaInicial, $lte : fechaFinal}, estatus: 1}).fetch();
			
			var cobranza = [];
			
			_.each(cobranzaDiaria, function(cd){
					_.each(cd.planPagos, function(plan){
						
							plan.fechaPago = cd.fechaPago;
							var pp = PlanPagos.findOne(plan.planPago_id);
							var credito = Creditos.findOne(pp.credito_id);
							var tipoIngreso = TiposIngreso.findOne(cd.tipoIngreso_id);
							var cuenta = Cuentas.findOne({tipoIngreso_id: cd.tipoIngreso_id});
							
							plan.folio = credito.folio;
							plan.numeroPago = pp.numeroPago;
							plan.numeroPagos = credito.numeroPagos;
							plan.tipoIngreso = tipoIngreso.nombre;
							plan.tipoCuenta = cuenta.tipoCuenta;
							
							var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																{fields: {"profile.nombreCompleto": 1,
		  																				"profile.nombre": 1,
		  																				"profile.apellidoPaterno": 1,
		  																				"profile.numeroCliente": 1 }});
	  																
	  					var cajero = Meteor.users.findOne({"_id" : cd.usuarioCobro_id}, 
	  																{fields: {"profile.nombre": 1}});											
	  					
	  					
	  					plan.cajero = cajero.profile.nombre;
	  									
							plan.numeroCliente = user.profile.numeroCliente;	
							plan.nombreCompleto = user.profile.nombre  + ' ' + user.profile.apellidoPaterno;
							
							cobranza.push(plan);
/*
							if (plan.tipoCuenta == "Consignia"){
								plan.mostrar = true;
								cobranza.push(plan);
							}
							
							else{
								plan.mostrar = false;
							}
*/
							
					})
					
			});
						
			return cobranza;
			
	},
	getBancos:function(fechaInicial, fechaFinal, sucursal_id){
			
			var cobranzaDiaria = Pagos.find({sucursalPago_id: sucursal_id, fechaPago : { $gte : fechaInicial, $lte : fechaFinal}, estatus: 1}, {sort: {fechaEntrega: 1}}).fetch();

			var cobranza = [];
			
			_.each(cobranzaDiaria, function(cd){
					_.each(cd.planPagos, function(plan){
						
							plan.fechaPago = cd.fechaPago;
							var pp = PlanPagos.findOne(plan.planPago_id);
							var credito = Creditos.findOne(pp.credito_id);
							var tipoIngreso = TiposIngreso.findOne(cd.tipoIngreso_id);
							var cuenta = Cuentas.findOne({tipoIngreso_id: cd.tipoIngreso_id});

							
							plan.folio = credito.folio;
							plan.numeroPago = pp.numeroPago;
							plan.numeroPagos = credito.numeroPagos;
							plan.tipoIngreso = tipoIngreso.nombre;
							plan.tipoCuenta = cuenta.tipoCuenta;
							
							
						
						var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																{fields: {"profile.nombreCompleto": 1, "profile.numeroCliente": 1 }});
	  																
	  					var cajero = Meteor.users.findOne({"_id" : cd.usuarioCobro_id}, 
	  																{fields: {"profile.nombreCompleto": 1}});											
	  												
	  					plan.cajero = cajero.profile.nombreCompleto;
	  									
							plan.numeroCliente = user.profile.numeroCliente; 
							
							
							plan.numeroCliente = user.profile.numeroCliente;	
							plan.nombreCompleto = user.profile.nombreCompleto;
							if (plan.tipoCuenta == "Banco"){
								cobranza.push(plan);
								plan.mostrar = true;
							}
							else{
								plan.mostrar = false;	
							}
							
							
					})
					
			});
						
			return cobranza;
			
	},

	getRDocumentos:function(fechaInicial, fechaFinal, sucursal_id){
			
			var cobranzaDiaria = Pagos.find({sucursalPago_id: sucursal_id, fechaPago : { $gte : fechaInicial, $lte : fechaFinal}, estatus: 1}).fetch();

			var cobranza = [];
			
			_.each(cobranzaDiaria, function(cd){
					_.each(cd.planPagos, function(plan){
						
							plan.fechaPago = cd.fechaPago;
							var pp = PlanPagos.findOne(plan.planPago_id);
							var credito = Creditos.findOne(pp.credito_id);
							var tipoIngreso = TiposIngreso.findOne(cd.tipoIngreso_id);
							var cuenta = Cuentas.findOne({tipoIngreso_id: cd.tipoIngreso_id});

							
							plan.folio = credito.folio;
							plan.numeroPago = pp.numeroPago;
							plan.numeroPagos = credito.numeroPagos;
							plan.tipoIngreso = tipoIngreso.nombre;
							plan.tipoCuenta = cuenta.tipoCuenta;
							
								
								var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																{fields: {"profile.nombreCompleto": 1, "profile.numeroCliente": 1 }});
	  																
	  					var cajero = Meteor.users.findOne({"_id" : cd.usuarioCobro_id}, 
	  																{fields: {"profile.nombreCompleto": 1}});											
	  												
	  					plan.cajero = cajero.profile.nombreCompleto;
	  									
							plan.numeroCliente = user.profile.numeroCliente; 
							
							
							plan.numeroCliente = user.profile.numeroCliente;	
							plan.nombreCompleto = user.profile.nombreCompleto;
							if (plan.tipoCuenta == "Documento"){
								plan.mostrar = true;
								cobranza.push(plan);
							}
							else{
								plan.mostrar = false;
							}
							
							
					})
					
			});
						
			return cobranza;
			
	},
	getCreditosEntregados:function(fechaInicial, fechaFinal, sucursal_id){
			
			var creditosEntregados = Creditos.find({sucursal_id: sucursal_id, fechaEntrega : { $gte : fechaInicial, $lte : fechaFinal}}, {sort: {fechaEntrega: 1}}).fetch();
			
			_.each(creditosEntregados, function(credito){
					
					var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																			{fields: {"profile.nombreCompleto": 1, "profile.numeroCliente": 1 }});
					
					credito.numeroCliente = user.profile.numeroCliente;	
					credito.nombreCompleto = user.profile.nombreCompleto;
					
					if (credito.garantias != undefined)
					{
						if (credito.garantias.length > 0 ) {
							credito.estatusGarantia = "Si"
						}
						else{
							credito.estatusGarantia = "No"
						}	
						
					}
					else{
							credito.estatusGarantia = "No"
						}
					
					
					
					

					var cajero = Meteor.users.findOne({"_id" : credito.usuario_id}, 
	  																{fields: {"profile.nombreCompleto": 1}});											
	  			
	  			if (cajero != undefined)
	  				 credito.cajero = cajero.profile.nombreCompleto;
	  			else
	  				 credito.cajero = "";	 

					
					
			});
			
			return 	creditosEntregados;
			
			
		
	},
	getCreditosLiquidados:function(fechaInicial, fechaFinal, sucursal_id){
					
/*
			console.log(fechaInicial);
			console.log(fechaFinal);
*/
			
			var CreditosLiquidados = Creditos.find({sucursal_id: sucursal_id, fechaLiquidacion : { $gte : fechaInicial, $lte : fechaFinal}, saldoActual: 0}).fetch();
			
			
			_.each(CreditosLiquidados, function(credito){
					
					var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																			{fields: {"profile.nombreCompleto": 1, "profile.numeroCliente": 1 }});
					
					credito.numeroCliente = user.profile.numeroCliente;	
					credito.nombreCompleto = user.profile.nombreCompleto;
					
					if (credito.garantias != undefined)
					{
					
							if (credito.garantias.length > 0 ) {
								credito.estatusGarantia = "Si"
							}else{
								credito.estatusGarantia = "No"
							}
					}
					else{
							credito.estatusGarantia = "No"
						}		
					
			});
			
			return 	CreditosLiquidados;
			
			
		
	},
	
	getCarteraVencida:function(sucursal_id){
			
			//Obtener los clientes y ver si tienen creditos con saldo
			var carteraVencida = [];
			var fechaInicial =  new Date();
			fechaInicial.setHours(0,0,0,0);
			var fechaFinal	= new Date();
			fechaFinal.setHours(23,59,59,999);
			
			var totales = {};
			
			totales.sumaTotal	= 0;
			totales.sumaSaldo = 0;
			totales.sumaCargosMoratorios = 0;
			totales.sumaPorVencer = 0;
			totales.sumaTotalVencido = 0;
			totales.suma7Dias = 0;
			totales.suma14Dias = 0;
			totales.suma21Dias = 0;
			totales.suma28Dias = 0;
			totales.sumaMas28Dias = 0;
			
			
		
			var clientes = Meteor.users.find({"profile.sucursal_id": sucursal_id, roles : {$in : ["Cliente"]}}).fetch();
			
			_.each(clientes, function(cliente){
				
					var creditos =  Creditos.find({cliente_id: cliente._id, saldoActual: {$gt:0}, estatus: 4}).fetch();
					var total = 0;
					var saldo = 0;
					
					var porVencer 				= 0;
					var totalVencido 			= 0;
					var sieteDias					= 0;
					var siete14Dias				= 0;
					var catorce21Dias			= 0;
					var ventiuno28Dias		= 0;
					var mas28Dias					= 0;
					
					if (creditos.length > 0)
					{
					
							var saldoCargosMoratorios = 0;
							_.each(creditos, function(credito){
																						
									total += Number(parseFloat(credito.adeudoInicial).toFixed(2));
									saldo += Number(parseFloat(credito.saldoActual).toFixed(2));
									saldoCargosMoratorios += Number(parseFloat(credito.saldoMultas).toFixed(2));							
									
									porVencer 				= 0;
									totalVencido 			= 0;
									sieteDias					= 0;
									siete14Dias				= 0;
									catorce21Dias			= 0;
									ventiuno28Dias		= 0;
									mas28Dias					= 0;
									
									
									//por Vencer
									var planPagos = PlanPagos.find({credito_id: credito._id, fechaLimite: {$gte: fechaFinal}, descripcion: "Recibo" , estatus: { $ne: 1 }}).fetch();
									_.each(planPagos, function(planPago){
											porVencer += Number(parseFloat(planPago.importeRegular).toFixed(2));							
									});
									
									//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
									
									//Total Vencido Unicamente Recibos
									var planPagosTV = PlanPagos.find({credito_id: credito._id, fechaLimite: {$lte: fechaFinal}, descripcion: "Recibo" , estatus: { $ne: 1 }}).fetch();
									_.each(planPagosTV, function(planPago){
											totalVencido += Number(parseFloat(planPago.importeRegular).toFixed(2));							
									});
		
									//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
									
									//7 Dias
									var fechaMenor7dias = moment(new Date()).add();
									fechaMenor7dias = fechaMenor7dias.subtract(7, 'days');
									var ff7dias = new Date(fechaMenor7dias);
									ff7dias.setHours(0,0,0,0);
									var planPagos7 = PlanPagos.find({credito_id: credito._id, fechaLimite: { $gte : ff7dias, $lte : fechaInicial}, descripcion: "Recibo", estatus: { $ne: 1 }}).fetch();
									_.each(planPagos7, function(planPago){
											sieteDias += Number(parseFloat(planPago.importeRegular).toFixed(2));							
									});
									
									//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////						
									
									//7 - 14 dias Dias
									
									var fechaMenor7dias = moment(new Date()).add();
									fechaMenor7dias = fechaMenor7dias.subtract(7, 'days');
									var fi7dias = new Date(fechaMenor7dias);
									fi7dias.setHours(23,59,59,999);
									
									var fechaMenor7dias = moment(new Date()).add();
									fechaMenor7dias = fechaMenor7dias.subtract(14, 'days');
									var ff14dias = new Date(fechaMenor7dias);
									ff14dias.setHours(0,0,0,0);
									
									var planPagos14 = PlanPagos.find({credito_id: credito._id, fechaLimite: { $gte : ff14dias, $lte : fi7dias}, descripcion: "Recibo" , estatus: { $ne: 1 }}).fetch();
									_.each(planPagos14, function(planPago){
											siete14Dias += Number(parseFloat(planPago.importeRegular).toFixed(2));							
									});
									
									//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////						
								
									//14 - 21 dias Dias
									
									var fechaMenor7dias = moment(new Date()).add();
									fechaMenor7dias = fechaMenor7dias.subtract(14, 'days');
									var fi14dias = new Date(fechaMenor7dias);
									fi14dias.setHours(23,59,59,999);
									
									var fechaMenor7dias = moment(new Date()).add();
									fechaMenor7dias = fechaMenor7dias.subtract(21, 'days');
									var ff21dias = new Date(fechaMenor7dias);
									ff21dias.setHours(0,0,0,0);
									
									var planPagos21 = PlanPagos.find({credito_id: credito._id, fechaLimite: { $gte : ff21dias, $lte : fi14dias}, descripcion: "Recibo" , estatus: { $ne: 1 }}).fetch();
									_.each(planPagos21, function(planPago){
											catorce21Dias += Number(parseFloat(planPago.importeRegular).toFixed(2));							
									});
									
									//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
									
									//21 - 28 dias Dias
									
									var fechaMenor7dias = moment(new Date()).add();
									fechaMenor7dias = fechaMenor7dias.subtract(21, 'days');
									var fi21dias = new Date(fechaMenor7dias);
									fi21dias.setHours(23,59,59,999);
									
									var fechaMenor7dias = moment(new Date()).add();
									fechaMenor7dias = fechaMenor7dias.subtract(28, 'days');
									var ff28dias = new Date(fechaMenor7dias);
									ff28dias.setHours(0,0,0,0);
									
									var planPagos28 = PlanPagos.find({credito_id: credito._id, fechaLimite: { $lte : ff28dias, $gte : fi21dias}, descripcion: "Recibo" , estatus: { $ne: 1 }}).fetch();
									_.each(planPagos28, function(planPago){
											ventiuno28Dias += Number(parseFloat(planPago.importeRegular).toFixed(2));							
									});
									
									//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
									
									//mas de 28 dias Dias
									
									var fechaMenor7dias = moment(new Date()).add();
									fechaMenor7dias = fechaMenor7dias.subtract(28, 'days');
									var ff28dias = new Date(fechaMenor7dias);
									ff28dias.setHours(0,0,0,0);
									
									var planPagosMas28 = PlanPagos.find({credito_id: credito._id, fechaLimite: {$lt : ff28dias}, descripcion: "Recibo", estatus: { $ne: 1 }}).fetch();
									_.each(planPagosMas28, function(planPago){
											mas28Dias += Number(parseFloat(planPago.importeRegular).toFixed(2));							
									});
									
									//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
									
							  	
						  		

									
									
									
								
							});
							
							totales.sumaTotal 						+= Number(parseFloat(total).toFixed(2));
							totales.sumaSaldo 						+= Number(parseFloat(saldo).toFixed(2));
							totales.sumaCargosMoratorios 	+= Number(parseFloat(saldoCargosMoratorios).toFixed(2));
				  		totales.sumaPorVencer 				+= Number(parseFloat(porVencer).toFixed(2));
				  		totales.sumaTotalVencido 			+= Number(parseFloat(totalVencido).toFixed(2));
				  		totales.suma7Dias 						+= Number(parseFloat(sieteDias).toFixed(2));	  		
							totales.suma14Dias 						+= Number(parseFloat(siete14Dias).toFixed(2));
							totales.suma21Dias 						+= Number(parseFloat(catorce21Dias).toFixed(2));
							totales.suma28Dias 						+= Number(parseFloat(ventiuno28Dias).toFixed(2));
							totales.sumaMas28Dias 				+= Number(parseFloat(mas28Dias).toFixed(2));
							
							var clienteCarteraVencida = { numeroCliente					: cliente.profile.numeroCliente,
																						nombre								: cliente.profile.nombreCompleto,
																						total									: total,
																						saldo									: saldo,
																						saldoCargosMoratorios	: saldoCargosMoratorios,
																						porVencer							: porVencer,
																						totalVencido					: totalVencido,
																						sieteDias							: sieteDias,
																						siete14Dias						: siete14Dias,
																						catorce21Dias					: catorce21Dias,
																						ventiuno28Dias				: ventiuno28Dias,
																						mas28Dias							: mas28Dias
																						};
							carteraVencida.push(clienteCarteraVencida);			
							
					}														
																					
			});
			
			var resultado = {};
			resultado.carteraVencida = [];
			
			resultado.carteraVencida = carteraVencida;
			resultado.totales = totales;
						
			return resultado;
			
	},
	
	
	//Método para Impresión de Tickets
	getPagosDiarios:function(usuario_id, fechaInicial, fechaFinal){
			
			var pagos = Pagos.find({usuarioCobro_id : usuario_id
								 						,fechaPago				: { $gte : fechaInicial, $lte : fechaFinal}}).fetch();
								 						
			_.each(pagos, function(pago){
					
					//**********************************************************************************************************************************************************
					var cliente = Meteor.users.findOne({_id: pago.usuario_id}, 
																						 {fields: {"profile.nombreCompleto": 1, 
																							 				 "profile.numeroCliente": 1,
																							 				 "profile.numeroDistribuidor": 1,
																							 				 roles: 1 }});
																							 				 
					pago.cliente = cliente.profile.nombreCompleto;
					pago.numero = cliente.profile.numeroCliente != undefined ? cliente.profile.numeroCliente : cliente.profile.numeroDistribuidor;
					
					//**********************************************************************************************************************************************************
					var tipoIngreso = TiposIngreso.findOne({_id: pago.tipoIngreso_id});
					pago.tipoIngreso = tipoIngreso.nombre;
					
					//**********************************************************************************************************************************************************
					var movimientoCaja = MovimientosCajas.findOne({_id: pago.movimientoCaja_id});
					pago.movimientoCaja = movimientoCaja.origen;
					
			});
			
			return pagos;
	},	
	
	
});	