
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
							
							if (plan.tipoCuenta == "Consignia")
								plan.mostrar = true;
							else
								plan.mostrar = false;	 
							
							var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																{fields: {"profile.nombreCompleto": 1, "profile.numeroCliente": 1 }});
	  																
	  					var cajero = Meteor.users.findOne({"_id" : cd.usuarioCobro_id}, 
	  																{fields: {"profile.nombreCompleto": 1}});											
	  												
	  					plan.cajero = cajero.profile.nombreCompleto;
	  									
							plan.numeroCliente = user.profile.numeroCliente;	
							plan.nombreCompleto = user.profile.nombreCompleto;
							
							cobranza.push(plan);
					})
					
			});
						
			return cobranza;
			
	},
	getBancos:function(fechaInicial, fechaFinal, sucursal_id){
			
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
							
							if (plan.tipoCuenta == "Banco")
								plan.mostrar = true;
							else
								plan.mostrar = false;	
								var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																{fields: {"profile.nombreCompleto": 1, "profile.numeroCliente": 1 }});
	  																
	  					var cajero = Meteor.users.findOne({"_id" : cd.usuarioCobro_id}, 
	  																{fields: {"profile.nombreCompleto": 1}});											
	  												
	  					plan.cajero = cajero.profile.nombreCompleto;
	  									
							plan.numeroCliente = user.profile.numeroCliente; 
							
							
							plan.numeroCliente = user.profile.numeroCliente;	
							plan.nombreCompleto = user.profile.nombreCompleto;
							
							cobranza.push(plan);
					})
					
			});
						
			return cobranza;
			
	},
	getCreditosEntregados:function(fechaInicial, fechaFinal, sucursal_id){
					
			
			var creditosEntregados = Creditos.find({sucursal_id: sucursal_id, fechaEntrega : { $gte : fechaInicial, $lte : fechaFinal}}).fetch();
			
			_.each(creditosEntregados, function(credito){
					
					var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																			{fields: {"profile.nombreCompleto": 1, "profile.numeroCliente": 1 }});
					
					credito.numeroCliente = user.profile.numeroCliente;	
					credito.nombreCompleto = user.profile.nombreCompleto;
					
					if (credito.garantias.length > 0 ) {
						credito.estatusGarantia = "Si"
					}else{
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
					
			
			var CreditosLiquidados = Creditos.find({sucursal_id: sucursal_id, fechaLiquidacion : { $gte : fechaInicial, $lte : fechaFinal}, saldoActual: 0}).fetch();
			
			_.each(CreditosLiquidados, function(credito){
					
					var user = Meteor.users.findOne({"_id" : credito.cliente_id}, 
	  																			{fields: {"profile.nombreCompleto": 1, "profile.numeroCliente": 1 }});
					
					credito.numeroCliente = user.profile.numeroCliente;	
					credito.nombreCompleto = user.profile.nombreCompleto;
					
					if (credito.garantias.length > 0 ) {
						credito.estatusGarantia = "Si"
					}else{
						credito.estatusGarantia = "No"
					}
					
					
			});
			
			return 	CreditosLiquidados;
			
			
		
	},
		
	
});	