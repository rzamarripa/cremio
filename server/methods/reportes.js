
Meteor.methods({

	getCobranzaDiaria:function(fechaInicial, fechaFinal, sucursal_id){
			
			var cobranzaDiaria = Pagos.find({sucursalPago_id: sucursal_id, fechaPago : { $gte : fechaInicial, $lte : fechaFinal}, estatus: 1}).fetch();
			
			var resultado = {};
			
			resultado.cobranza 										= [];
			resultado.seguroDistribuidorCobranza 	= [];
			resultado.seguroDistribuidor 					= 0;
			resultado.bonificaciones							= 0;
						
			_.each(cobranzaDiaria, function(cd){
				
					if (cd.seguro != undefined && cd.seguro != 0)
					{
							var pago = {};
							resultado.seguroDistribuidor += Number(parseFloat(cd.seguro).toFixed(2));
							
							pago.seguro = Number(parseFloat(cd.seguro).toFixed(2));
							pago.tipoIngreso	= TiposIngreso.findOne(cd.tipoIngreso_id).nombre;
							pago.fechaPago		= cd.fechaPago;
							pago.seguro				= cd.seguro;
							
							var user = Meteor.users.findOne({"_id" : cd.usuario_id}, 
		  																{fields: {"profile.nombreCompleto": 1,
			  																				"profile.nombre": 1,
			  																				"profile.apellidoPaterno": 1,
			  																				"profile.numeroCliente": 1 }});
		  				
		  				pago.numeroCliente 	= user.profile.numeroCliente;	
							pago.nombreCompleto = user.profile.nombre  + ' ' + user.profile.apellidoPaterno;												
							
	  					var cajero = Meteor.users.findOne({"_id" : cd.usuarioCobro_id}, 
	  																{fields: {"profile.nombre": 1}});											
	  					
	  					
	  					pago.cajero = cajero.profile.nombre;
	  									
							pago.numeroCliente = user.profile.numeroCliente;	
							pago.nombreCompleto = user.profile.nombre  + ' ' + user.profile.apellidoPaterno;
							
		  				resultado.seguroDistribuidorCobranza.push(pago);
								
					}
					
					if (cd.bonificacion != undefined)		
							resultado.bonificaciones += Number(parseFloat(cd.bonificacion).toFixed(2));
				
					_.each(cd.planPagos, function(plan){
						
						if (plan.folioCredito != 0)
						{
								plan.fechaPago 		= cd.fechaPago;
								var pp 						= PlanPagos.findOne(plan.planPago_id);
								var credito 			= Creditos.findOne(pp.credito_id);
								var tipoIngreso 	= TiposIngreso.findOne(cd.tipoIngreso_id);
								var cuenta 				= Cuentas.findOne({tipoIngreso_id: cd.tipoIngreso_id});
									
								plan.folio 				= credito.folio;
								plan.numeroPago 	= pp.numeroPago;
								plan.tipoCredito	= pp.tipoCredito;
								plan.numeroPagos 	= credito.numeroPagos;
								plan.tipoIngreso 	= tipoIngreso.nombre;								
								
								if (cuenta != undefined)
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
								
								
								
								resultado.cobranza.push(plan);
							
						}
						else
						{
								plan.fechaPago 		= cd.fechaPago;
								var tipoIngreso 	= TiposIngreso.findOne(cd.tipoIngreso_id);
								var cuenta 				= Cuentas.findOne({tipoIngreso_id: cd.tipoIngreso_id});
								
								plan.folio 				= 0;
								plan.numeroPago 	= 0;
								plan.numeroPagos 	= 0;
								plan.tipoIngreso 	= tipoIngreso.nombre;
								plan.tipoCuenta 	= cuenta.tipoCuenta;
								
		  					var cajero = Meteor.users.findOne({"_id" : cd.usuarioCobro_id}, 
		  																						{fields: {"profile.nombre": 1}});											
		  					
		  					
		  					plan.cajero = cajero.profile.nombre;
		  									
								plan.numeroCliente = "S/N";	
								plan.nombreCompleto = cd.usuario_id;
								
								resultado.cobranza.push(plan);	
							
						}
					})
					
			});
									
			return resultado;
			
	},
	
	getBancos:function(fechaInicial, fechaFinal, sucursal_id){
			
			var cobranzaDiaria = Pagos.find({sucursalPago_id: sucursal_id, fechaPago : { $gte : fechaInicial, $lte : fechaFinal}, estatus: 1}, {sort: {fechaEntrega: 1}}).fetch();

			var resultado = {};
			
			resultado.cobranza 						= [];
			resultado.seguroDistribuidor 	= 0;
			resultado.bonificaciones			= 0;

			_.each(cobranzaDiaria, function(cd){
				
					if (cd.seguro != undefined)
							resultado.seguroDistribuidor += Number(parseFloat(cd.seguro).toFixed(2));
					
					if (cd.bonificacion != undefined)		
							resultado.bonificaciones += Number(parseFloat(cd.bonificacion).toFixed(2));
				
					_.each(cd.planPagos, function(plan){
						
						if (plan.folioCredito != 0)
						{
						
							plan.fechaPago = cd.fechaPago;
							var pp = PlanPagos.findOne(plan.planPago_id);
							var credito = Creditos.findOne(pp.credito_id);
							var tipoIngreso = TiposIngreso.findOne(cd.tipoIngreso_id);
							var cuenta = Cuentas.findOne({tipoIngreso_id: cd.tipoIngreso_id});

							plan.folio 				= credito.folio;
							plan.numeroPago 	= pp.numeroPago;
							plan.tipoCredito	= pp.tipoCredito;
							plan.numeroPagos 	= credito.numeroPagos;
							plan.tipoIngreso 	= tipoIngreso.nombre;
							plan.tipoCuenta 	= cuenta.tipoCuenta;
													
							var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																{fields: {"profile.nombreCompleto": 1, "profile.numeroCliente": 1 }});
	  																
	  					var cajero = Meteor.users.findOne({"_id" : cd.usuarioCobro_id}, 
		  																{fields: {"profile.nombre": 1}});											
		  						
		  				plan.cajero = cajero.profile.nombre;
	  									
							plan.numeroCliente = user.profile.numeroCliente; 
							
							
							plan.numeroCliente = user.profile.numeroCliente;	
							plan.nombreCompleto = user.profile.nombreCompleto;
							if (plan.tipoCuenta == "Banco"){
								resultado.cobranza.push(plan);
								plan.mostrar = true;
							}
							else{
								plan.mostrar = false;	
							}
						}
						else
						{
								plan.fechaPago 		= cd.fechaPago;
								var tipoIngreso 	= TiposIngreso.findOne(cd.tipoIngreso_id);
								var cuenta 				= Cuentas.findOne({tipoIngreso_id: cd.tipoIngreso_id});
								
								plan.folio 				= 0;
								plan.numeroPago 	= 0;
								plan.tipoCredito	= pp.tipoCredito;
								plan.numeroPagos 	= 0;
								plan.tipoIngreso 	= tipoIngreso.nombre;
								plan.tipoCuenta 	= cuenta.tipoCuenta;
								
		  					var cajero = Meteor.users.findOne({"_id" : cd.usuarioCobro_id}, 
		  																{fields: {"profile.nombre": 1}});											
		  					
		  					
		  					plan.cajero = cajero.profile.nombre;
		  									
								plan.numeroCliente = "S/N";	
								plan.nombreCompleto = cd.usuario_id;
								
								if (plan.tipoCuenta == "Banco"){
									resultado.cobranza.push(plan);
									plan.mostrar = true;
								}
								else{
									plan.mostrar = false;	
								}
							
						}
							
							
					})
					
			});
						
			return resultado;
			
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
			
			var creditosEntregados = Creditos.find({sucursal_id: sucursal_id, fechaEntrega : { $gte : fechaInicial, $lte : fechaFinal}, estatus: { $in: [ 4, 5 ] }}, 
																						 {sort: {fechaEntrega: 1}}).fetch();
			
			_.each(creditosEntregados, function(credito){
					
					var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																			{fields: {"profile.nombreCompleto": 1, "profile.numeroCliente": 1 }});
					
					credito.numeroCliente = user.profile.numeroCliente;	
					credito.nombreCompleto = user.profile.nombreCompleto;
					
					var entrega_id = credito.entrega.movimientosCaja[0];

					var movimientoCaja = MovimientosCajas.findOne(entrega_id);
					var tipoIngreso 	 = TiposIngreso.findOne(movimientoCaja.tipoIngreso_id);
					
					credito.entregaCredito = tipoIngreso.nombre;
					
					if (credito.tipo == "vale")
					{
							var beneficiario = Beneficiarios.findOne(credito.beneficiario_id);
							
							if (beneficiario != undefined)
									credito.beneficiario = beneficiario.nombreCompleto;
							
					}
										
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
	  																{fields: {"profile.nombre": 1}});
	  			if (cajero != undefined)
	  				 credito.cajero = cajero.profile.nombre;
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
			
			var CreditosLiquidados = Creditos.find({sucursal_id: sucursal_id, fechaLiquidacion : { $gte : fechaInicial, $lte : fechaFinal}, estatus: 5},
																						 {sort: {fechaLiquidacion: 1}}).fetch();
			
			
			_.each(CreditosLiquidados, function(credito){
					
					var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																			{fields: {"profile.nombreCompleto": 1, "profile.numeroCliente": 1 }});
					
					credito.numeroCliente = user.profile.numeroCliente;	
					credito.nombreCompleto = user.profile.nombreCompleto;
					
					if (credito.tipo == "vale")
					{
							var beneficiario = Beneficiarios.findOne(credito.beneficiario_id);
							
							if (beneficiario != undefined)
									credito.beneficiario = beneficiario.nombreCompleto;
							
					}
					
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
								 						,fechaPago				: { $gte : fechaInicial, $lte : fechaFinal}}, {sort: {fechaPago : -1}}).fetch();
								 						
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
	
	ReporteCobranza: function (objeto,inicial,final,tiposIngreso) {
	
		//console.log(objeto,"creditos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		//var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		var unoconv = require('better-unoconv');
    var future = require('fibers/future');
		
		var templateType = 'pdf';
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
						 
		var content = fs
    	   .readFileSync(produccion+"reporteDiarioCobranza.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		const formatCurrency = require('format-currency');
		
		var res = new future();

		var fecha = new Date();
		
		var f = fecha;
		
		console.log("Ini:", inicial);
		console.log("Fin:", final);
		
		
		var fechaInicial = inicial;
		var fechaFinal = final;

    
	  var suma 										= 0;
		var sumaInter 							= 0;
		var sumaIva 								= 0;
		var sumaSeguro 							= 0;
		var sumaSeguroDistribuidor 	= 0;
		var sumaCargosM 						= 0;
		var totalcobranza 					= 0;
		
		
	    _.each(objeto,function(item){

	    	item.fechaPago = moment(item.fechaPago).format("DD-MM-YYYY")
	    	moment(item.fechaInicial).format("DD-MM-YYYY")
	      moment(item.fechaFinal).format("DD-MM-YYYY")
	      
	      if (item.tipoIngreso == 'EFECTIVO')
	      	item.tipoIngreso = 'EFVO.';
	      else if (item.tipoIngreso == 'Nota de Credito')		
	      	item.tipoIngreso = 'NC.';
	      else if (item.tipoIngreso == 'FICHA DE DEPOSITO')		
	      	item.tipoIngreso = 'F DEP.';		
	      else if (item.tipoIngreso == 'TRANSFERENCIA')		
	      	item.tipoIngreso = 'TRANSF.';
	      else if (item.tipoIngreso == 'TARJETA DE CREDITO/DEBITO')		
	      	item.tipoIngreso = 'TC/D.';
	      else if (item.tipoIngreso == 'REFINANCIAMIENTO')		
	      	item.tipoIngreso = 'REF.';		
	      else if (item.tipoIngreso == 'CHEQUE')		
	      	item.tipoIngreso = 'CH.';			
	      
	      if (item.descripcion == "Recibo") 
	      {
	      	item.movimiento = "R";
	      }
	      else if (item.descripcion == "Cargo Moratorio")
	      {
	      	item.movimiento = "CM";
	      	sumaCargosM += Number(parseFloat(item.totalPago).toFixed(2));
	      }
	      else if (item.descripcion == "Vale") 
	      {
	      	item.movimiento = "V";
	      }

	       suma 				 += item.pagoCapital;
	       sumaInter 		 += item.pagoInteres;
	       sumaIva 			 += item.pagoIva;
	       sumaSeguro 	 += item.pagoSeguro;
	       	       

	       if (item.tipoIngreso != 'NC.')
		       	totalcobranza += parseFloat(item.totalPago);
	       

	        item.cargo = parseFloat(item.totalPago).toFixed(2);
	        item.cargo = formatCurrency(item.cargo);
	        item.interes = parseFloat(item.pagoInteres).toFixed(2)
	        item.interes = formatCurrency(item.interes)
	        item.iva = parseFloat(item.pagoIva).toFixed(2);
	        item.iva = formatCurrency(item.iva)
	        item.seguro = parseFloat(item.pagoSeguro).toFixed(2);
	        item.seguro = formatCurrency(item.seguro)
	        item.pago = parseFloat(item.pagoCapital).toFixed(2)
	        item.pago = formatCurrency(item.pago)
	        if (item.folio < 10) {
						 item.folio = "0"+item.folio
	 	 	}
	 	 	if (item.numeroPago < 10) {
	 	 		item.numeroPago = "0"+item.numeroPago
	 	 	}
	 	 	if (item.numeroPagos < 10) {
	 	 		item.numeroPagos = "0"+item.numeroPagos
	 	 	}
	    });
	    

 		    var dia = fecha.getDate()
 		    var mes = fecha.getMonth()+1
 		    var anio = fecha.getFullYear()
 		    if (Number(dia) < 10) {
 		    	dia = "0" + dia;
 		    }
 		    if (Number(mes) < 10) {
 		    	mes = "0" + mes;
 		    }
 		    fecha = dia+ "-" + mes + "-" + anio;

 		    var dia2 = fechaInicial.getDate()
 		    var mes2 = fechaInicial.getMonth()+1
 		    var anio2 = fechaInicial.getFullYear()
 		    if (Number(dia2) < 10) {
 		    	dia2 = "0" + dia2;
 		    }
 		    if (Number(mes2) < 10) {
 		    	mes2 = "0" + mes2;
 		    }
 		    fechaInicial = dia2+ "-" + mes2 + "-" + anio2;

 		    var dia3 = fechaFinal.getDate()
 		    var mes3 = fechaFinal.getMonth()+1
 		    var anio3 = fechaFinal.getFullYear()
 		    if (Number(dia3) < 10) {
 		    	dia3 = "0" + dia3;
 		    }
 		    if (Number(mes3) < 10) {
 		    	mes3 = "0" + mes3;
 		    }
 		    fechaFinal = dia3 + "-" + mes3 + "-" + anio3;
 		    
 		    parseFloat(suma.toFixed(2))
 		    suma = formatCurrency(suma)
 		    parseFloat(sumaInter.toFixed(2))
 		    sumaInter = formatCurrency(sumaInter)
 		    parseFloat(sumaIva.toFixed(2))
 		    sumaIva = formatCurrency(sumaIva)
 		    parseFloat(sumaSeguro.toFixed(2))
 		    sumaSeguro = formatCurrency(sumaSeguro)
 		    parseFloat(sumaCargosM.toFixed(2))
 		    sumaCargosM = formatCurrency(sumaCargosM)
 		    parseFloat(totalcobranza.toFixed(2))
 		    totalcobranza = formatCurrency(totalcobranza)
 				
 				//Tipos de Ingreso
 				_.each(tiposIngreso, function(ti){
	 				ti.total = formatCurrency(ti.total)
 				});
 				
 				var hora = moment(new Date()).format("hh:mm:ss a");
		
	      doc.setData({				
    	            items					: objeto,
									fecha					: fecha,
									hora					: hora,
									inicial				: fechaInicial,
									final					: fechaFinal,
									sumaCapital		: suma,
									sumaIntereses	: sumaInter,
									sumaIva				: sumaIva,
									totalSeguro		: sumaSeguro,
									totalCobranza	: totalcobranza,
									totalCargosM	: sumaCargosM,
									tiposIngreso	:	tiposIngreso
	
			  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
             		 
    var rutaOutput = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "reporteDiarioCobranzaSalida" + templateType; 
             		 
		//fs.writeFileSync(produccionSalida+"reporteDiarioCobranzaSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    /*
var bitmap = fs.readFileSync(produccionSalida+"reporteDiarioCobranzaSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
*/
		fs.writeFileSync(rutaOutput, buf);
     
		unoconv.convert(rutaOutput, 'pdf', function(err, result) {
        if(!err){
          fs.unlink(rutaOutput);
          res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: "reporteDiarioCobranzaSalida" + '.pdf' });
        }else{
          res['return']({err: err});
          console.log("Error al convertir pdf:", err);
        }
     });

    return res.wait();
		
		
		
  },
	ReportesBanco: function (objeto,inicial,final) {
	
		//console.log(objeto,"creditos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		var unoconv = require('better-unoconv');
    var future = require('fibers/future');
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }

		
		//var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
		
		var templateType = 'pdf';
		var res = new future();
				 
		var content = fs
    	   .readFileSync(produccion+"ReporteBancos.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		const formatCurrency = require('format-currency')
			var fecha = new Date();
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final

	     var suma 					= 0
		   var sumaInter 			= 0
		   var sumaIva 				= 0
		   var sumaSeguro 		= 0
		   var totalcobranza 	= 0
		   
	    _.each(objeto,function(item){
		    	
		    	if (item.tipoIngreso == 'EFECTIVO')
		      	item.tipoIngreso = 'EFVO.';
		      else if (item.tipoIngreso == 'Nota de Credito')		
		      	item.tipoIngreso = 'NC.';
		      else if (item.tipoIngreso == 'FICHA DE DEPOSITO')		
		      	item.tipoIngreso = 'F DEP.';		
		      else if (item.tipoIngreso == 'TRANSFERENCIA')		
		      	item.tipoIngreso = 'TRANSF.';
		      else if (item.tipoIngreso == 'TARJETA DE CREDITO/DEBITO')		
		      	item.tipoIngreso = 'TC/D.';
		      else if (item.tipoIngreso == 'REFINANCIAMIENTO')		
		      	item.tipoIngreso = 'REF.';		
		      else if (item.tipoIngreso == 'CHEQUE')		
		      	item.tipoIngreso = 'CH.';	
		      	
		      if (item.descripcion == "Recibo") 
		      {
		      	item.movimiento = "R";
		      }
		      else if (item.descripcion == "Cargo Moratorio")
		      {
		      	item.movimiento = "CM";
		      	//sumaCargosM += Number(parseFloat(item.totalPago).toFixed(2));
		      }
		      else if (item.descripcion == "Vale") 
		      {
		      	item.movimiento = "V";
		      }	
		    
		    	suma += item.pagoCapital
		        sumaInter += item.pagoInteres
		        sumaIva += item.pagoIva
		        sumaSeguro += item.pagoSeguro;
		        totalcobranza += parseFloat(item.totalPago);
		        
		    	item.fechaPago = moment(item.fechaPago).format("DD-MM-YYYY");
		    	item.fechaDeposito = moment(item.fechaDeposito).format("DD-MM-YYYY");
		    	item.totalPago = parseFloat(item.totalPago).toFixed(2);
		    	item.totalPago = formatCurrency(item.totalPago)
		    	item.pagoInteres = parseFloat(item.pagoInteres).toFixed(2);
		    	item.pagoInteres = formatCurrency(item.pagoInteres)
		    	item.pagoCapital = parseFloat(item.pagoCapital).toFixed(2);
		    	item.pagoCapital = formatCurrency(item.pagoCapital);
		    	item.pagoIva = parseFloat(item.pagoIva).toFixed(2);
		    	item.pagoIva = formatCurrency(item.pagoIva);
	    });
	    

	 		    
 		   var dia = fecha.getDate()
 		    var mes = fecha.getMonth()+1
 		    var anio = fecha.getFullYear()
 		    if (Number(dia) < 10) {
 		    	dia = "0" + dia;
 		    }
 		    if (Number(mes) < 10) {
 		    	mes = "0" + mes;
 		    }
 		    fecha = dia+ "-" + mes + "-" + anio

 		    var dia2 = fechaInicial.getDate()
 		    var mes2 = fechaInicial.getMonth()+1
 		    var anio2 = fechaInicial.getFullYear()
 		    if (Number(dia2) < 10) {
 		    	dia2 = "0" + dia2;
 		    }
 		    if (Number(mes2) < 10) {
 		    	mes2 = "0" + mes2;
 		    }
 		    fechaInicial = dia2+ "-" + mes2 + "-" + anio2

 		    var dia3 = fechaFinal.getDate()
 		    var mes3 = fechaFinal.getMonth()+1
 		    var anio3 = fechaFinal.getFullYear()
 		    if (Number(dia3) < 10) {
 		    	dia3 = "0" + dia3;
 		    }
 		    if (Number(mes3) < 10) {
 		    	mes3 = "0" + mes3;
 		    }
 		    fechaFinal = dia3+ "-" + mes3 + "-" + anio3
 		    //totalcobranza = suma + sumaIva + sumaInter
 		    
        parseFloat(suma).toFixed(2);
 		    suma = formatCurrency(suma)
 		    parseFloat(sumaInter).toFixed(2);
 		    sumaInter = formatCurrency(sumaInter)
 		    parseFloat(sumaIva).toFixed(2);
 		    sumaIva = formatCurrency(sumaIva)
 		    parseFloat(sumaSeguro).toFixed(2);
 		    sumaSeguro = formatCurrency(sumaSeguro);
 		    parseFloat(totalcobranza).toFixed(2);
 		    totalcobranza = formatCurrency(totalcobranza);
		
		doc.setData({				
			            item: 		 objeto,
						fecha:       fecha,
						inicial:     fechaInicial,
						final:       fechaFinal,
						sumaCapital:    suma,
						sumaIntereses:  sumaInter,
						sumaIva:        sumaIva,
						totalSeguro:    sumaSeguro,
						totalCobranza:  totalcobranza,
													
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
             		 
		//fs.writeFileSync(produccionSalida+"ReporteBancosSalida.docx",buf);
		
		var rutaOutput = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "ReporteBancosSalida" + templateType;
				
		//Pasar a base64
		// read binary data
    //var bitmap = fs.readFileSync(produccionSalida+"ReporteBancosSalida.docx");
    
    // convert binary data to base64 encoded string
    //return new Buffer(bitmap).toString('base64');
    
    fs.writeFileSync(rutaOutput, buf);
    
    unoconv.convert(rutaOutput, 'pdf', function(err, result) {
        if(!err){
          fs.unlink(rutaOutput);
          res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: "ReporteBancosSalida" + '.pdf' });
        }else{
          res['return']({err: err});
          console.log("Error al convertir pdf:", err);
        }
     });

    return res.wait();
		
  },
  ReporteCarteraVencida: function (objeto, tipo) {
	
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var unoconv = require('better-unoconv');
    var future = require('fibers/future');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		var templateType = (tipo === 'pdf') ? '.docx' : (tipo === 'excel' ? '.xlsx' : '.docx');
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
						 
		var content = fs
    	   .readFileSync(produccion+"ReporteCarteraVencida.docx", "binary");
		var zip = new JSZip(content);
		var res = new future();
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		const formatCurrency = require('format-currency');


		var fecha = new Date();
		var hora = moment(fecha).format("hh:mm:ss a");
   
		var numeroClientes	= 0;
		var sumaTotal	= 0;
		var sumaSaldo = 0;
		var sumaCargosMoratorios = 0;
		var sumaPorVencer = 0;
		var sumaTotalVencido = 0;
		var suma7Dias = 0;
		var suma14Dias = 0;
		var suma21Dias = 0;
		var suma28Dias = 0;
		var sumaMas28Dias = 0;
		
		
	  _.each(objeto,function(cliente){
		  	
		
				numeroClientes 				+= 1;
		  	sumaTotal 						+= Number(parseFloat(cliente.total).toFixed(2));
				sumaSaldo 						+= Number(parseFloat(cliente.saldo).toFixed(2));
	  		sumaCargosMoratorios 	+= Number(parseFloat(cliente.saldoCargosMoratorios).toFixed(2));
	  		sumaPorVencer 				+= Number(parseFloat(cliente.porVencer).toFixed(2));
	  		sumaTotalVencido 			+= Number(parseFloat(cliente.totalVencido).toFixed(2));
	  		suma7Dias 						+= Number(parseFloat(cliente.sieteDias).toFixed(2));	  		
				suma14Dias 						+= Number(parseFloat(cliente.siete14Dias).toFixed(2));
				suma21Dias 						+= Number(parseFloat(cliente.catorce21Dias).toFixed(2));
				suma28Dias 						+= Number(parseFloat(cliente.ventiuno28Dias).toFixed(2));
				sumaMas28Dias 				+= Number(parseFloat(cliente.mas28Dias).toFixed(2));

	  		cliente.total = formatCurrency(cliente.total);
	  		cliente.saldo = formatCurrency(cliente.saldo);
	  		cliente.saldoCargosMoratorios = formatCurrency(cliente.saldoCargosMoratorios);
	  		cliente.porVencer = formatCurrency(cliente.porVencer);
	  		cliente.totalVencido = formatCurrency(cliente.totalVencido);
	  		cliente.sieteDias = formatCurrency(cliente.sieteDias);	  		
				cliente.siete14Dias = formatCurrency(cliente.siete14Dias);
				cliente.catorce21Dias = formatCurrency(cliente.catorce21Dias);
				cliente.ventiuno28Dias = formatCurrency(cliente.ventiuno28Dias);
				cliente.mas28Dias = formatCurrency(cliente.mas28Dias);
	  	
	  });
	   
		sumaTotal 						= formatCurrency(sumaTotal);
		sumaSaldo 						= formatCurrency(sumaSaldo);
		sumaCargosMoratorios 	= formatCurrency(sumaCargosMoratorios);
		sumaPorVencer 				= formatCurrency(sumaPorVencer);
		sumaTotalVencido 			= formatCurrency(sumaTotalVencido);
		suma7Dias 						= formatCurrency(suma7Dias);	  		
		suma14Dias 						= formatCurrency(suma14Dias);
		suma21Dias 						= formatCurrency(suma21Dias);
		suma28Dias 						= formatCurrency(suma28Dias);
		sumaMas28Dias 				= formatCurrency(sumaMas28Dias);


    var dia = fecha.getDate()
    var mes = fecha.getMonth()+1
    var anio = fecha.getFullYear()
    if (Number(dia) < 10) {
    	dia = "0" + dia;
    }
    if (Number(mes) < 10) {
    	mes = "0" + mes;
    }
    fecha = dia+ "-" + mes + "-" + anio;
		
	  doc.setData({				
	            items									:	objeto,
							fecha									: fecha,
							hora									:	hora,
							sumaTotal							: sumaTotal,
							sumaSaldo							: sumaSaldo,
							sumaCargosMoratorios 	: sumaCargosMoratorios,
							sumaPorVencer					: sumaPorVencer,
							sumaTotalVencido			: sumaTotalVencido,
							suma7Dias							: suma7Dias,
							suma14Dias						: suma14Dias,
							suma21Dias						: suma21Dias,
							suma28Dias						: suma28Dias,
							sumaMas28Dias					: sumaMas28Dias,
							numeroClientes				: numeroClientes
	  });
					
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		//fs.writeFileSync(produccionSalida+"ReporteCarteraVencidaSalida.docx",buf);		
		
		
		var rutaOutput = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "ReporteCarteraVencidaOut" + objeto.nombreCompleto + templateType;
    //var rutaOutputpdf = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "FICHASOCIOOut.pdf" ;
     
    fs.writeFileSync(rutaOutput, buf);
    
		unoconv.convert(rutaOutput, 'pdf', function(err, result) {
        if(!err){
          fs.unlink(rutaOutput);
          res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: "ReporteCarteraVencidaOut" + '.pdf' });
        }else{
          res['return']({err: err});
          console.log("Error al convertir pdf:", err);
        }
     });

    return res.wait();

		
				
		//Pasar a base64
		// read binary data
   /*  var bitmap = fs.readFileSync(produccionSalida+"ReporteCarteraVencidaSalida.docx"); */
    
    // convert binary data to base64 encoded string
    //return new Buffer(bitmap).toString('base64');
    
    
    
    
		
  },
  ReporteCreditos: function (objeto, inicial, final, totalSolicitadoVales, totalPagarVales, totalSolicitadoCreditos, totalPagarCreditos, numeroCreditos, numeroVales) {
			
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var unoconv = require('better-unoconv');
    var future = require('fibers/future');
		
		var templateType = 'pdf';
		
		var res = new future();
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
    				 
		var content = fs
    	   .readFileSync(produccion+"ReporteDiarioCreditos.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
			const formatCurrency = require('format-currency')
			var fecha = new Date();
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
		   
		  _.each(objeto,function(item){
		    	item.fechaEntrega = moment(item.fechaEntrega).format("DD-MM-YYYY")
		    	item.numeroCliente = item.numeroCliente + "";
		    	item.adeudoInicial = parseFloat(item.adeudoInicial.toFixed(2))
		    	item.adeudoInicial = formatCurrency(item.adeudoInicial)
		    	item.capitalSolicitado = parseFloat(item.capitalSolicitado.toFixed(2))
		    	item.capitalSolicitado = formatCurrency(item.capitalSolicitado)
		    	 if (item.folio < 10) {
		 	 		item.folio = "0"+item.folio
		 	 	}
		 	 	if (item.numeroPagos < 10) {
		 	 		item.numeroPagos = "0"+item.numeroPagos
		 	 	}
	
		  });	       
	
		 	
		 	var solCreditos		=	formatCurrency(totalSolicitadoCreditos);
		 	var pagCreditos		=	formatCurrency(totalPagarCreditos);
		 	var numCreditos		=	numeroCreditos;
		 	
		 	var solVales			=	formatCurrency(totalSolicitadoVales);
		 	var pagVales 			=	formatCurrency(totalPagarVales);
		 	var numVales 			=	numeroVales;	    
		 	
		 		    
	    var dia = fecha.getDate()
	    var mes = fecha.getMonth()+1
	    var anio = fecha.getFullYear()
	    if (Number(dia) < 10) {
	    	dia = "0" + dia;
	    }
	    if (Number(mes) < 10) {
	    	mes = "0" + mes;
	    }
	    fecha = dia+ "-" + mes + "-" + anio
	
	    var dia2 = fechaInicial.getDate()
	    var mes2 = fechaInicial.getMonth()+1
	    var anio2 = fechaInicial.getFullYear()
	    if (Number(dia2) < 10) {
	    	dia2 = "0" + dia2;
	    }
	    if (Number(mes2) < 10) {
	    	mes2 = "0" + mes2;
	    }
	    fechaInicial = dia2+ "-" + mes2 + "-" + anio2
	
	    var dia3 = fechaFinal.getDate()
	    var mes3 = fechaFinal.getMonth()+1
	    var anio3 = fechaFinal.getFullYear()
	    if (Number(dia3) < 10) {
	    	dia3 = "0" + dia3;
	    }
	    if (Number(mes3) < 10) {
	    	mes3 = "0" + mes3;
	    }
	    fechaFinal = dia3+ "-" + mes3 + "-" + anio3
	    	
	 		var hora = moment(new Date()).format("hh:mm:ss a");
	 				
			doc.setData({				
							items				: objeto,
							fecha				: fecha,
							hora				: hora,
							inicial			: fechaInicial,
							final				: fechaFinal,
							solCreditos : solCreditos,
							pagCreditos	: pagCreditos,
							numCreditos	: numCreditos,
							solVales		: solVales,
							pagVales		: pagVales,
							numVales		: numVales
					  });
									
			doc.render();
	 
			var buf = doc.getZip()
	             		 .generate({type:"nodebuffer"});
	             		 
	    var rutaOutput = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "ReporteDiarioCreditosSalida" + templateType; 
	
			fs.writeFileSync(rutaOutput, buf);
	     
			unoconv.convert(rutaOutput, 'pdf', function(err, result) {
	        if(!err){
	          fs.unlink(rutaOutput);
	          res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: "ReporteDiarioCreditosSalida" + '.pdf' });
	        }else{
	          res['return']({err: err});
	          console.log("Error al convertir pdf:", err);
	        }
	     });
	
	    return res.wait();
		
  },
  ReporteCreditosLiquidados: function (objeto, inicial, final, totalSolicitadoVales, totalPagarVales, totalSolicitadoCreditos, totalPagarCreditos, numeroCreditos, numeroVales) {

			var fs = require('fs');
	    var Docxtemplater = require('docxtemplater');
			var JSZip = require('jszip');
			var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
			var unoconv = require('better-unoconv');
	    var future = require('fibers/future');
			
			var templateType = 'pdf';
			
			var res = new future();
			
			if(Meteor.isDevelopment){
	      var path = require('path');
	      var publicPath = path.resolve('.').split('.meteor')[0];
	      var produccion = publicPath + "public/plantillas/";
	      var produccionSalida = publicPath + "public/generados/";
	    }
	    else{						 
	      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
	      var produccion = publicPath + "/plantillas/";
	      var produccionSalida = "/home/cremio/archivos/";
	    }
	    
			var content = fs
	    	   .readFileSync(produccion+"ReporteDiarioCreditosLiquidados.docx", "binary");
			var zip = new JSZip(content);
			var doc=new Docxtemplater()
									.loadZip(zip).setOptions({nullGetter: function(part) {
				if (!part.module) {
				return "";
				}
				if (part.module === "rawxml") {
				return "";
				}
				return "";
			}});
			const formatCurrency = require('format-currency')
			var fecha = new Date();
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final

	    _.each(objeto,function(item){
		    	item.fechaEntrega = moment(item.fechaEntrega).format("DD-MM-YYYY")
		    	suma = item.sumaCapital
		    	sumaSol = item.sumaAPagar
		    	item.numeroCliente = item.numeroCliente + "";
		    	item.adeudoInicial = parseFloat(item.adeudoInicial.toFixed(2))
		    	item.adeudoInicial = formatCurrency(item.adeudoInicial)
	/*
		    	item.saldoActual = parseFloat(item.saldoActual.toFixed(2))
		    	item.saldoActual = formatCurrency(item.saldoActual)
	*/
		    	item.capitalSolicitado = parseFloat(item.capitalSolicitado.toFixed(2))
		    	item.capitalSolicitado = formatCurrency(item.capitalSolicitado)
		    	 if (item.folio < 10) {
		 	 		item.folio = "0"+item.folio
			 	 	}
			 	 	if (item.numeroPagos < 10) {
			 	 		item.numeroPagos = "0"+item.numeroPagos
			 	 	}

	    });	
	    
	    var solCreditos		=	formatCurrency(totalSolicitadoCreditos);
		 	var pagCreditos		=	formatCurrency(totalPagarCreditos);
		 	var numCreditos		=	numeroCreditos;
		 	
		 	var solVales			=	formatCurrency(totalSolicitadoVales);
		 	var pagVales 			=	formatCurrency(totalPagarVales);
		 	var numVales 			=	numeroVales;	           
	 		    
	    var dia = fecha.getDate()
	    var mes = fecha.getMonth()+1
	    var anio = fecha.getFullYear()
	    if (Number(dia) < 10) {
	    	dia = "0" + dia;
	    }
	    if (Number(mes) < 10) {
	    	mes = "0" + mes;
	    }
	    fecha = dia+ "-" + mes + "-" + anio

	    var dia2 = fechaInicial.getDate()
	    var mes2 = fechaInicial.getMonth()+1
	    var anio2 = fechaInicial.getFullYear()
	    if (Number(dia2) < 10) {
	    	dia2 = "0" + dia2;
	    }
	    if (Number(mes2) < 10) {
	    	mes2 = "0" + mes2;
	    }
	    fechaInicial = dia2+ "-" + mes2 + "-" + anio2

	    var dia3 = fechaFinal.getDate()
	    var mes3 = fechaFinal.getMonth()+1
	    var anio3 = fechaFinal.getFullYear()
	    if (Number(dia3) < 10) {
	    	dia3 = "0" + dia3;
	    }
	    if (Number(mes3) < 10) {
	    	mes3 = "0" + mes3;
	    }
	    fechaFinal = dia3+ "-" + mes3 + "-" + anio3
			
			var hora = moment(new Date()).format("hh:mm:ss a");
		
			doc.setData({				
								items				: objeto,
								fecha				: fecha,
								hora				: hora,
								inicial			: fechaInicial,
								final				: fechaFinal,
								solCreditos : solCreditos,
								pagCreditos	: pagCreditos,
								numCreditos	: numCreditos,
								solVales		: solVales,
								pagVales		: pagVales,
								numVales		: numVales
					  });
									
			doc.render();
	 
			var buf = doc.getZip()
	             		 .generate({type:"nodebuffer"});
	             		 
	             		 
	    var rutaOutput = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "ReporteDiarioCreditosLiquidadosSalida" + templateType; 
	             		 
			fs.writeFileSync(rutaOutput, buf);
	     
			unoconv.convert(rutaOutput, 'pdf', function(err, result) {
	        if(!err){
	          fs.unlink(rutaOutput);
	          res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: "ReporteDiarioCreditosLiquidadosSalida" + '.pdf' });
	        }else{
	          res['return']({err: err});
	          console.log("Error al convertir pdf:", err);
	        }
	     });
	
	    return res.wait();
	    		
  },
	
	report: function(params) {
    var Docxtemplater = require('docxtemplater');
    var JSZip = require('jszip');
    var unoconv = require('better-unoconv');
    var future = require('fibers/future');
    var fs = require('fs');
    
    var objParse = function(datos, obj, prof) {
      if (!obj) {
        obj = {};
      }
      _.each(datos, function(d, dd) {
        var i = prof ? prof + dd : dd;
        if (_.isDate(d)) {
          obj[i] = moment(d).format('DD-MM-YYYY');
        } else if (_.isArray(d)) {
          obj[i] = arrParse(d, []);
        } else if (_.isObject(d)) {
          objParse(d, obj, i + '.');
        } else {
          obj[i] = d;
        }
      });
      return obj
    };

    var arrParse = function(datos, arr) {
      _.each(datos, function(d) {
        if (_.isArray(d)){
          arr.push(arrParse(d, []));
        }else if (_.isObject(d)){
          var obj = objParse(d, {});
          arr.push(obj);
        } else {
          arr.push(!_.isDate(d) ? d : moment(d).format('DD-MM-YYYY'));
        }
      });
      return arr
    };

		
		
    params.datos = objParse(params.datos);
    params.datos.fechaReporte = moment().format('DD-MM-YYYY');  
    var templateType = (params.type === 'pdf') ? '.docx' : (params.type === 'excel' ? '.xlsx' : '.docx');
    /*
if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var templateRoute = publicPath + "public/plantillas/" + params.templateNombre + templateType;
    }else{
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/plantillas/generados/';      
      var templateRoute = publicPath +  params.templateNombre + templateType;
    }
*/
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/" + params.templateNombre + templateType;
      //var produccionFoto = publicPath + "public/fotos/" + "FICHASOCIO";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "plantillas/" + params.templateNombre + templateType;
      //var produccionFoto = publicPath + "fotos/" + "FICHASOCIO";
      var produccionSalida = "/home/cremio/archivos/";
    }

    var content = fs.readFileSync(produccion, "binary");
    var res = new future();
    var zip = new JSZip(content);
    var doc = new Docxtemplater().loadZip(zip).setOptions({
      nullGetter: function(part) {
        if (!part.module) {
          return "";
        }
        if (part.module === "rawxml") {
          return "";
        }
        return "";
      }
    });

    doc.setData(params.datos);
    doc.render();
    var buf = doc.getZip().generate({ type: "nodebuffer" });
    if (params.type == 'pdf') {
      var rutaOutput = (Meteor.isDevelopment ? publicPath +  ".outputs/" : produccionSalida) + params.reportNombre + moment().format('x') + templateType;
      fs.writeFileSync(rutaOutput, buf);
      unoconv.convert(rutaOutput, 'pdf', function(err, result) {
        if(!err){
          fs.unlink(rutaOutput, (error) => {  });
          res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: params.reportNombre + '.pdf' });
        }else{
          res['return']({err: err});
        }
      });
    } else {
      var mime;
      if (templateType === '.xlsx') {
        mime = 'vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
      res['return']({ uri: 'data:application/' + mime + ';base64,' + buf.toString('base64'), nombre: params.reportNombre + templateType });
    }
    return res.wait()
  }
});	