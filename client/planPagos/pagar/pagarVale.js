angular
  .module("creditoMio")
  .controller("PagarValeCtrl", PagarValeCtrl);

function PagarValeCtrl($scope, $filter, $meteor, $reactive, $state, $stateParams, toastr) {

  let rc = $reactive(this).attach($scope);
  this.action = false;
  this.fechaActual = new Date();

  window.rc = rc;
  this.credito_id = "";
  
  this.credito = {};
  this.pago = {};
  this.pago.pagar = 0;
  this.pago.totalPago = 0;
  this.pago.bonificacion = 0;
  this.pago.aPagar = 0;
  
  this.pago.totalito = 0
  this.creditos = [];
  this.creditos_id = []
  this.total = 0;
  rc.credit = $stateParams
  this.creditoAp = true;
  this.masInfo = true;
  this.masInfo = true;
  this.masInfoCredito = true;
  rc.openModal = false
  rc.foliosCreditos = [];
	rc.planPagosViejo = [];
	
	this.valorOrdenar = "Fecha";

	rc.creditoRefinanciar = {};
	rc.creditosAutorizados = [];
	rc.pagoR = {};
	rc.subtotal = 0;
	rc.cargosMoratorios = 0;
	rc.total = 0;

	rc.numeroPagosSeleccionados = 0;
	
	rc.selectedRow = null;  // initialize our variable to null
  //console.log(rc.credito)
  
  rc.fechaLimite = "" ;

  this.subscribe('planPagos', () => {			
			if (rc.getCollectionReactively("creditos_id").length > 0)
			{
					return [{
			      cliente_id			: $stateParams.objeto_id,
			      credito_id			: { $in: rc.getCollectionReactively("creditos_id") },
			      importeRegular  : {$gt : 0}//,
			      //fechaLimite			: {$lte: rc.fechaLimite}
			    }];
			} 
  });

  this.subscribe("tiposCredito", () => {
    return [{ estatus: true, sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
  });
  
  this.subscribe("pagosSeguro", () => {
	  var fecha = new Date();
	  var mes 	= fecha.getMonth() + 1;
		var dia 	= fecha.getDate();
		var anio 	= fecha.getFullYear();
		var quincena = 0;
		
		if (dia <= 15)
				quincena = mes * 2 - 1;
		else
				quincena = mes * 2;		
				
    return [{ distribuidor_id: $stateParams.objeto_id, anio: fecha.getFullYear(), quincena: quincena , estatus: 1}]
  });

  this.subscribe('cliente', () => {
    return [{ _id: $stateParams.objeto_id }];
  });

  this.subscribe('creditos', () => {
    return [{ cliente_id: $stateParams.objeto_id, estatus : {$in: [2, 4]}}];
  });

  this.subscribe('tiposIngreso', () => {
    return [{estatus: true}]
  });
  
  this.subscribe('cuentas', () => {
    return [{}]
  });
  
  this.subscribe('cajas', () => {
    return [{usuario_id : Meteor.userId()
    }]
  });
  
  this.subscribe('configuraciones', () => {
    return [{}]
  });

  this.helpers({
    objeto : () => {
			var cli = Meteor.users.findOne({_id : $stateParams.objeto_id});
			
			_.each(rc.getReactively("notaPerfil"), function(nota){
				//console.log(rc.notaPerfil.cliente_id,"nota a l avga")
				if (cli._id == rc.notaPerfil.cliente_id) {
					//console.log("entro aqui compilla")
					$("#notaPerfil").modal();	
				}
			});

			_.each(cli, function(objeto){
				 //console.log(objeto,"objeto")
				 rc.referencias = [];
				 //rc.empresas = [];
				
				objeto.empresa = Empresas.findOne(objeto.empresa_id)
				// objeto.documento = Documentos.findOne(objeto.docuemnto_id)
				objeto.documento = Documentos.findOne(objeto.documento_id)
				objeto.pais = Paises.findOne(objeto.pais_id)
				objeto.estado = Estados.findOne(objeto.estado_id)
				objeto.municipio = Municipios.findOne(objeto.municipio_id)
				objeto.ciudad = Ciudades.findOne(objeto.ciudad_id)
				objeto.colonia = Colonias.findOne(objeto.colonia_id)
				objeto.ocupacion = Ocupaciones.findOne(objeto.ocupacion_id)
				objeto.nacionalidad = Nacionalidades.findOne(objeto.nacionalidad_id)
				objeto.estadoCivil = EstadoCivil.findOne(objeto.estadoCivil_id)
				
				_.each(objeto.referenciasPersonales_ids, function(referencia){
						Meteor.call('getReferencias', referencia, function(error, result){	
							if (result)
							{
								//console.log("entra aqui");
								//console.log("result",result);
								rc.referencias.push(result);
								$scope.$apply();			
							}
						});	
					});
	
					Meteor.call('getEmpresas', objeto.empresa_id, function(error, result){	
						if (result)
						{
								rc.empresa = result
								$scope.$apply();			
							}
						});	
					
				});

				if(cli){
					this.ocupacion_id = cli.profile.ocupacion_id;
					return cli;
				}		
		},
    tiposIngreso: () => {
	    
	    var ti = TiposIngreso.find({}, {sort: {nombre: 1}}).fetch();
	    
	    if (ti != undefined)
	    {
		  		var fondos = Cuentas.find({}).fetch();
					//console.log("Fonfo:",fondos);  	
					if (fondos != undefined)
					{
							_.each(ti, function(tipo){
									
									var fondo = Cuentas.findOne({tipoIngreso_id: tipo._id});
									if (fondo != undefined)
											tipo.tipoCuenta = fondo.tipoCuenta;
							});	
					}
					return ti;
	    }
    },	
    tiposCredito: () => {
      return TiposCredito.find();
    },
    planPagosViejo: () => {
    	var colores = ['active', 'info', 'warning', 'success', 'danger'];
    	var asignados = [];
    				
			var fecha = new Date();
			var n = fecha.getDate();
			//var fechaLimite = "";
		
			if (n >= 20)
			{
					rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,15,0,0,0,0);		
					rc.fechaLimite.setHours(23,59,59,999);
					var pp = PlanPagos.find({fechaLimite: { $lt: rc.fechaLimite }, importeRegular: {$gt: 0}, estatus:{$in: [0,2]}},{sort : {fechaLimite : 1}}).fetch();
			}
			else if (n < 5) 
			{
					rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),15,0,0,0,0);
					rc.fechaLimite.setHours(23,59,59,999);
					var pp = PlanPagos.find({fechaLimite: { $lt: rc.fechaLimite }, importeRegular: {$gt: 0}, estatus:{$in: [0,2]}},{sort : {fechaLimite : 1}}).fetch();
			}
			else if (n >= 5 && n < 20)		
			{
					rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),16,0,0,0,0);
					rc.fechaLimite.setHours(23,59,59,999);
					var pp = PlanPagos.find({fechaLimite: { $lte: rc.fechaLimite }, importeRegular: {$gt: 0}, estatus:{$in: [0,2]}},{sort : {fechaLimite : 1}}).fetch();
			}

      rc.subtotal = 0;
			rc.cargosMoratorios = 0;
			rc.pago.bonificacion = 0;
			rc.pago.cargosMoratorios = 0;
			rc.pago.totalPago = 0;
			//Revisar si ya pago el Seguro De esa quincena para ya no cobrarselo (24 quicenas)			
			var fecha = new Date();
			
			var mes 	= fecha.getMonth() + 1;
			var dia 	= fecha.getDate();
			var anio 	= fecha.getFullYear();
			var quincena = 0;
			
			if (dia <= 15)
					quincena = mes * 2 - 1;
			else
					quincena = mes * 2;		
					
/*
			console.log("Quincena: ", quincena);	
			console.log("Año: ", fecha.getFullYear());		
			console.log("cantidad: ", quincena);	
*/

			
			if (PagosSeguro.find().count() > 0)
			{
					rc.pago.seguro = 0;
			}
			else
			{
					var config = Configuraciones.findOne();
					if (config != undefined)
			 			 rc.pago.seguro = config.seguro;				
			}
			
			rc.numeroPagosSeleccionados = 0;
			
			if (pp != undefined)
			{
					_.each(pp, function(pago){
						
						pago.credito = Creditos.findOne(pago.credito_id);
						pago.color = colores[0];

		        pago.verCargo = true;
		        
		        var configuraciones = Configuraciones.findOne();
		        var comision = 0;
		        if (pago.importeRegular == pago.cargo)
		        	 comision = calculaBonificacion(pago.fechaLimite, configuraciones.arregloComisiones);
		        
		        pago.bonificacion 		= 0;
		        
		        //pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
		        if (pago.importeRegular == pago.cargo)
			      {
		        		pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
		        }
		        
		        
		        var cre = Creditos.findOne({_id: pago.credito_id});
		        
		        if (cre != undefined && cre.beneficiario_id != undefined)
						{
							Meteor.call('getBeneficiario', cre.beneficiario_id, function(error, result) {           
						          if (result)
						          {
						          		pago.beneficiario = result;
						          		$scope.$apply();
											}
						  });
							//pp.beneficiado = credito.beneficiado;
							
						}
		        
		        //pago.beneficiado =  cre.beneficiado;
		        
		        pago.saldo 					= Number(parseFloat(pago.importeRegular).toFixed(2));
		        
		        
		        
						if (pago.fechaLimite < rc.fechaLimite)		        
						{
								pago.importepagado 	= Number(parseFloat(pago.importeRegular).toFixed(2));
								pago.pagoSeleccionado = true;	
								
								if (pago.descripcion == "Recibo")
				        {
									 rc.pago.totalPago += Number(parseFloat(pago.importeRegular).toFixed(2));
								}	
								
								rc.pago.bonificacion += Number(parseFloat(pago.bonificacion).toFixed(2));
								
								rc.numeroPagosSeleccionados += 1;
								
								if (pago.descripcion == "Cargo Moratorio")
				        {
				        		rc.pago.cargosMoratorios +=  pago.importeRegular;
				        }
								
						}
						else
						{
								pago.importepagado 	= 0;
								pago.pagoSeleccionado = false;							
						}
		        
		        
		        if (pago.descripcion == "Recibo")
		        		rc.subtotal +=  pago.importeRegular;
		        else if (pago.descripcion == "Cargo Moratorio")
		        {
		        		rc.cargosMoratorios +=  pago.importeRegular;
		        		//console.log("Entro: CM", pago)
		        }
		        pago.folio = pago.credito.folio;
		        
		        //console.log(pago.folio);
		        
		        if (pago.pagoSeguro !=  undefined)
							 pago.seguro = pago.seguro -  pago.pagoSeguro;
						
						if (pago.pagoIva !=  undefined)
							 pago.iva = pago.iva -  pago.pagoIva;
							 
						if (pago.pagoInteres !=  undefined)
							 pago.interes = pago.interes -  pago.pagoInteres;
							 
						if (pago.pagoCapital !=  undefined)
							 pago.capital = pago.capital -  pago.pagoCapital;	 	 
							 
						
								        				      								
		      });
		      
		      rc.pago.aPagar = Number(parseFloat(rc.pago.totalPago - rc.pago.bonificacion + rc.pago.cargosMoratorios + rc.pago.seguro).toFixed(2));
		      
		      pp = $filter('orderBy')(pp, 'fechaLimite')
		  		_.each(pp, function(pago) {
						if(asignados[pago.credito.folio] == undefined){
								ultimo = _.last(asignados);
								asignados[pago.credito.folio] = (ultimo == undefined ? 0 : ultimo+1 > 4 ? ultimo-4 : ultimo+1);
						}
						
						pago.color = colores[asignados[pago.credito.folio]];
			      rc.total = rc.subtotal + rc.cargosMoratorios;
			      
					});
					
					
			}		

      return pp;
      
    },
    creditos: () => {
      var creditos = Creditos.find({estatus: 4}).fetch();
      if (creditos != undefined) {
        rc.creditos_id = _.pluck(creditos, "_id");

        _.each(creditos, function(credito) {
          credito.planPagos = PlanPagos.find({ credito_id: credito._id }, { sort: { numeroPago: -1 } }).fetch();
          credito.nombreTipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
        })
        
        
        
        
        
      }
			
			
			
     /*
 if (creditos) {
        _.each(creditos, function(credito) {
        	// credito[0].color = credito.folio

          _.each(credito.avales_ids, function(aval) {
            credito.aval = Personas.findOne(aval)

          });

        })
      }
*/

      return creditos;
    },
    caja: () => {
	  	var c = Cajas.findOne({usuario_id: Meteor.userId()});   
      if (c != undefined)
      {
	      	return c;	      	
      }
    },
  });
  
  this.getFolio = function(credito_id) {
    var credito = Creditos.findOne(credito_id);
    return credito ? credito.folio : "";

  };
  
  this.getnumeroPagos = function(credito_id) {
    var credito = Creditos.findOne(credito_id);
    return credito ? credito.numeroPagos : "";

  };

  this.editar = function(pago) {
    this.pago = pago;
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
  };

  this.cambiarEstatus = function(pago, estatus, tipoMov) {
    var res = confirm("Está seguro que quiere " + tipoMov + " el pago?");
    if (res == true) {
      PlanPagos.update(pago._id, { $set: { estatus: estatus } });
      toastr.success('Cancelado correctamente.');
    }
  }

	//Este es la columna + -
  this.seleccionarPago = function(pago) {
    pago.pagoSeleccionado = !pago.pagoSeleccionado;
    pago.estatus = 0;
    rc.pago.totalPago = 0;
    rc.pago.bonificacion = 0;
    rc.pago.cargosMoratorios = 0;
    
    if (pago.importepagado > 0 && pago.importepagado < pago.importeRegular)
		{
				pago.bonificacion = 0;
		}
		else
		{
				var configuraciones = Configuraciones.findOne();
				var comision = 0;
        if (pago.importeRegular == pago.cargo)
        	 comision = calculaBonificacion(pago.fechaLimite, configuraciones.arregloComisiones);
        	 
        if (pago.importeRegular == pago.cargo)
			  {	 
		    		pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
		    }		
		}

    
		if (pago.pagoSeleccionado == true && pago.movimiento == "Cargo Moratorio")
    {
	    	pago.importeRegular = Number(parseFloat(pago.importeRegular).toFixed(2));
		    pago.importepagado = Number(parseFloat(pago.importeRegular).toFixed(2));

		    
		    pago.pagoSeleccionado = true;
	    
    }
    
    if (!pago.pagoSeleccionado)
      	pago.importepagado = 0;
      
    _.each(rc.planPagosViejo, function(p) {
				if (p.verCargo)
	      {	    
		      if (!pago.pagoSeleccionado && pago.credito_id == p.credito_id && p.numeroPago > pago.numeroPago && p.estatus != 1 && pago.movimiento == "Recibo") {
		        p.importepagado = 0;
		        p.pagoSeleccionado = false;
		      }
		      if (pago.pagoSeleccionado && pago.credito_id == p.credito_id && p.numeroPago <= pago.numeroPago && p.estatus != 1 && pago.movimiento == "Recibo") {
			      p.importeRegular = Number(parseFloat(p.importeRegular).toFixed(2));
		        p.importepagado = Number(parseFloat(p.importeRegular).toFixed(2));
		        p.pagoSeleccionado = true;
		      }
		      		      
		      if (p.pagoSeleccionado != undefined) {
		        if (p.pagoSeleccionado == true) 
		        {
		           
		           //rc.pago.totalPago += Number(parseFloat(p.importepagado).toFixed(2));
		           //rc.pago.bonificacion += Number(parseFloat(p.bonificacion ).toFixed(2));
							 
							 if (p.descripcion == "Cargo Moratorio")
							 		rc.pago.cargosMoratorios += Number(parseFloat(p.importeRegular).toFixed(2));
							 else {
								rc.pago.totalPago += p.importepagado;
								rc.pago.bonificacion += Number(parseFloat(p.bonificacion).toFixed(2));	
							
							 }			
							 
		        }
		      }
				}		
    });
    
    rc.pago.totalPago = Number(parseFloat(rc.pago.totalPago).toFixed(2));
    rc.pago.aPagar =  Number(parseFloat(rc.pago.totalPago + rc.pago.bonificacion + rc.pago.cargosMoratorios + rc.pago.seguro).toFixed(2));
    
  }
  
  //Este es el input
  this.seleccionarMontoPago = function(pago) {
    //console.log("aqui");
    
    rc.pago.totalPago = 0;
    rc.pago.bonificacion = 0;
    rc.pago.cargosMoratorios = 0;
    
		if (pago.importepagado > 0 && pago.importepagado < pago.importeRegular)
		{
				pago.bonificacion = 0;
		}
		else
		{
				if (pago.importeRegular == pago.cargo)
			  {				
				  	var configuraciones = Configuraciones.findOne();
						var comision = calculaBonificacion(pago.fechaLimite, configuraciones.arregloComisiones);
						if (pago.importeRegular == pago.cargo)
						{	
				    	pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
				    }	
		    }
		}
        
    var i = 0;
    _.each(rc.planPagosViejo, function(p) {
			if (p.verCargo)
	    {	    
	      if (pago.credito_id == p.credito_id && p.numeroPago < pago.numeroPago && p.estatus != 1) {
		      p.importeRegular = Number(p.importeRegular).toFixed(2);
	        p.importepagado = parseFloat(p.importeRegular);
	        p.pagoSeleccionado = true;
	        p.estatus = 0;
	      }
	      if (pago == p) {
	        p.estatus = 0;
	        p.pagoSeleccionado = true;
	        if (p.importepagado > p.importeRegular)
	        {
	         	p.importeRegular = Number(p.importeRegular).toFixed(2);
	          p.importepagado = parseFloat(p.importeRegular);
	        }  
	        if (p.importepagado <= 0 || !p.importepagado || isNaN(p.importepagado)) {
	          //p.importepagado = 0
	          p.pagoSeleccionado = false;
	        }
	      }
	      if (p.pagoSeleccionado != undefined) {
	        if (p.pagoSeleccionado == true) {
	          	          	          
						if (p.descripcion == "Cargo Moratorio")
							 	rc.pago.cargosMoratorios += Number(parseFloat(p.importeRegular).toFixed(2));
						else {
								rc.pago.totalPago += p.importepagado;
								rc.pago.bonificacion += Number(parseFloat(p.bonificacion).toFixed(2));	
							
						}	 	
							 	
	        }
	      }
	    }  
    });
    
    rc.pago.totalPago = Number(parseFloat(rc.pago.totalPago).toFixed(2));
    rc.pago.aPagar =  Number(parseFloat(rc.pago.totalPago - rc.pago.bonificacion + rc.pago.cargosMoratorios + rc.pago.seguro).toFixed(2));
    
  }
  
  this.funcionOrdenar = function() 
	{
		
			if (this.valorOrdenar == "Folio")
	    		return ['folio'];
	    if (this.valorOrdenar == "Fecha")
	    		return ['fechaLimite'];
	    if (this.valorOrdenar == "Recibo")
	    		return ['numeroPago'];
	};

  this.guardarPago = function(pago, credito) {
		
		
		if (rc.caja.estadoCaja == "Cerrada")
		{
				toastr.error("La caja esta cerrada, favor de reportar con el Gerente");
				return;	
		}
		
		
	  if (this.pago.tipoIngreso_id == undefined)
	  {
		  	toastr.warning("Seleccione una forma de pago");
		  	return;
	  }
	  
	  if (pago.pagar == undefined || pago.pagar <= 0)
	  {
		  	toastr.warning("Ingrese la cantidad a cobrar correctamente");
		  	return;
	  }
	  
	  if (Number(parseFloat(pago.pagar).toFixed(2)) < Number(parseFloat(pago.aPagar).toFixed(2)))
	  {
		  	toastr.warning("No alcanza a pagar con el total ingresado");
		  	return;
	  }
	  
	  if (pago.aPagar == 0)
	  {
		  	toastr.warning("No hay nada que cobrar");
		  	return;
	  }
	  
	  //Validar que sea completo el crédito a pagar    
	  var tipoIngreso = TiposIngreso.findOne(pago.tipoIngreso_id);
	  if (tipoIngreso.nombre == "REFINANCIAMIENTO")
	  {
		  	//Validar que no tenga cargos Moratorios
		  	var CM = 0;
		  	
		  	var pp = PlanPagos.find({movimiento: "Cargo Moratorio"}).fetch();
		  	_.each(pp, function(pago){
			  		
			  		CM += pago.importeRegular;
		  	});
		  	
		  	if (CM > 0)
		  	{
			  	 toastr.warning("No es posible refinanciar con cargos moratorios");	
			  	 return;
		  	}
		  		
		  		
		  	//Validar si hay creditos Autorizados
		  	rc.creditosAutorizados = Creditos.find({estatus : 2}).fetch();
		  	//console.log(rc.creditosAutorizados);
		  	if (rc.creditosAutorizados.length == 0)
		  	{
			  		toastr.warning("No existen créditos autorizados para liquidar los pagos");
						return;
		  	}
				
				//Si existen creditos Validar que alcance sobre el total
				var ban = false;				
			  _.each(rc.creditosAutorizados, function(ca) {
			      if (ca.capitalSolicitado >= pago.totalPago)
			      {
								ban = true;
								ca.esRefinanciado = ban;
						}		
		    });
		    
		    if (!ban)
		  	{
			  		toastr.warning("El cliente no tiene al menos un crédito autorizado que pueda liquidar el crédito actual");
						return;
		  	}
		  	rc.pagoR = pago;
		  	//Abrir el modal de los creditos
		  	$("#modalRefinanciamiento").modal('show');
		  	
		  	
	  }
	  else
	  {		
		  	var fechaProximoPago = "";
		  	
		  	if (tipoIngreso.nombre == "Nota de Credito")
				{
				  	//Revisar que tenga notas de credito si no para que ir al Metodo
						var nc = NotasCredito.findOne({});
						if (nc.length == 0)
						{
								toastr.warning("El cliente no tiene notas de credito por aplicar");
								return;					
						}
										
						//Validar que es lo que se va a pagar recibo, cargo o ambos
						var sePagaraRecibo = false;
						var sePagaraCargo = false;
						
						
						var fechaProximoPagoArray = [];
						
						var seleccionadosId = [];
				    _.each(rc.planPagosViejo, function(p) {
				      if (p.pagoSeleccionado){
								 if (p.descripcion == "Recibo") sePagaraRecibo = true;
								 if (p.descripcion == "Cargo Moratorio") sePagaraCargo = true;
					       seleccionadosId.push({ id: p._id, importe: p.importepagado })
				      }
				      if (p.importepagado != p.importeRegular)				      				      
				      	 fechaProximoPagoArray.push(p.fechaLimite);
				    });
				    
				    fechaProximoPago = new Date(Math.min.apply(null,fechaProximoPagoArray));
				    
				    if (fechaProximoPago == "Invalid Date")
								fechaProximoPago = "";
						
				    	    
				    if (nc.aplica == "RECIBO" &&  sePagaraCargo == true)
				    {
					    	toastr.warning("La nota de crédito es solo para recibos");
								return;
				    }
				    
				    if (nc.aplica == "CARGO MORATORIO" && sePagaraRecibo == true)
				    {
					    	toastr.warning("La nota de crédito es solo para cargos moratorios");
								return;
				    }					
				}
				else
				{
						
						var fechaProximoPagoArray = [];
												
						var seleccionadosId = [];
				    _.each(rc.planPagosViejo, function(p) {
				      if (p.pagoSeleccionado){
								 if (p.descripcion == "Recibo") sePagaraRecibo = true;
								 if (p.descripcion == "Cargo Moratorio") sePagaraCargo = true;
					       seleccionadosId.push({ id: p._id, importe: p.importepagado, bonificacion: Number(p.bonificacion) })
				      }
				      
				      if (p.importepagado != p.importeRegular)				      				      
				      	 fechaProximoPagoArray.push(p.fechaLimite);
				    });
				    
				    fechaProximoPago = new Date(Math.min.apply(null,fechaProximoPagoArray));
						
						if (fechaProximoPago == "Invalid Date")
								fechaProximoPago = "";								
						
				}		    
		    //console.log(pago);
				Meteor.call("pagoParcialVale", 		seleccionadosId, 
		    																	pago.pagar, 							//Con cuanto Pago el distribuidor
		    																	pago.bonificacion,				
		    																	pago.seguro,							
		    																	pago.totalPago,						// El total vales 
		    																	pago.aPagar,							// El total a Pagar la suma de CM, Vales, - bonificaciones
		    																	pago.tipoIngreso_id, 			
		    																	$stateParams.objeto_id, 	
		    																	rc.ocultarMultas, 
		    																	rc.subtotal,  
		    																	pago.cargosMoratorios, 
		    																	rc.total, 
		    																	fechaProximoPago,
		    																	pago.fechaDeposito, function(error, success) {
		      if (!success) {
			      
		        toastr.error('Error al guardar.', success);
		        return;
		      }
		      toastr.success('Guardado correctamente.');
		      rc.pago = {};
		      
		      rc.pago.totalPago = 0;
		      rc.pago.totalito = 0
		      rc.pago.fechaEntrega = pago.fechaEntrega
		      rc.ocultarMultas = false;
		      var url = $state.href("anon.imprimirTicketVale", { pago_id: success }, { newTab: true });
		      window.open(url, '_blank');
		      rc.tipoIngresoSeleccionado = {};
		      $state.go("root.distribuidoresDetalle",{objeto_id : $stateParams.objeto_id});
		    });
	  }
  };

  this.creditosAprobados = function(){
		this.creditoAp = !this.creditoAp;
	}

	this.verPagos= function(credito) {
		//console.log(credito,"el ob ")
		rc.credito = credito;
		rc.credito_id = credito._id;
		$("#modalpagos").modal();
		credito.pagos = Pagos.find({credito_id: rc.getReactively("credito_id")}).fetch()
		rc.pagos = credito.pagos
		rc.openModal = true
		
		////console.log(rc.pagos,"pagos")
		//console.log(rc.historial,"historial act")
			

	};

  $(document).ready(function() {
    $('body').addClass("hidden-menu");
		
		//Quita el mouse wheels 
		document.getElementById('cobro').onwheel = function(){ return false; }
  

	});

	this.ocultar = function() 
	{
			rc.subtotal = 0;
			rc.cargosMoratorios = 0;
			rc.pago.cargosMoratorios = 0;
			rc.total = 0;

			_.each(this.planPagosViejo, function(pago) {
					
          if (pago.descripcion == "Cargo Moratorio")
          {
	          	pago.verCargo = !pago.verCargo;
          }	
          
          if (pago.pagoSeleccionado == true && pago.verCargo == false)
          {
          		pago.pagoSeleccionado = false;
/*
							console.log("false:", pago.importepagado);  	
							console.log("false:", rc.pago.totalPago);  	
*/
          		rc.pago.totalPago = rc.pago.totalPago - Number(parseFloat(pago.importepagado).toFixed(2));
							pago.importepagado	= 0;
          }
	        if (pago.verCargo == true)
	        {
		      		
		        	if(pago.descripcion == "Recibo")
		        	{
								rc.subtotal = rc.subtotal + Number(parseFloat(pago.importeRegular).toFixed(2));
								
							}	
							if(pago.descripcion == "Cargo Moratorio")
							{
									rc.cargosMoratorios += Number(parseFloat(pago.importeRegular).toFixed(2));
									rc.pago.cargosMoratorios += Number(parseFloat(pago.importeRegular).toFixed(2));
							}
	
	        }		
	        else if (pago.verCargo == false)
	        {
		        	if(pago.descripcion=="Recibo")
								rc.subtotal += Number(parseFloat(pago.importeRegular).toFixed(2));
							/*
if(pago.descripcion=="Cargo Moratorio")
								rc.cargosMoratorios = 0;
*/
	        }
	        
       });
       
       
       rc.total = rc.subtotal + rc.pago.cargosMoratorios;
       			
	};

	this.guardarRefinanciamiento = function() 
	{
			
			var fechaProximoPago = "";			
			rc.creditoRefinanciar.refinanciar = Number(parseFloat(rc.pagoR.totalPago).toFixed(2));
			
			var fechaProximoPagoArray = [];
			var seleccionadosId = [];
	    _.each(rc.planPagosViejo, function(p) {
	      if (p.pagoSeleccionado){
					 if (p.descripcion == "Recibo") sePagaraRecibo = true;
					 if (p.descripcion == "Cargo Moratorio") sePagaraCargo = true;
		       seleccionadosId.push({ id: p._id, importe: p.importepagado })
	      }
	      
	      if (p.importepagado != p.importeRegular)				      				      
      	 	 fechaProximoPagoArray.push(p.fechaLimite);
	      
	    });
	    
	    fechaProximoPago = new Date(Math.min.apply(null,fechaProximoPagoArray));
						
			if (fechaProximoPago == "Invalid Date")
					fechaProximoPago = "";
	    
	    
			//console.log(seleccionadosId, pago.pagar, pago.totalPago, pago.tipoIngreso_id)
	    Meteor.call("pagoParcialVale", seleccionadosId, 
	    																	rc.pagoR.pagar, 
	    																	rc.pagoR.totalPago, 
	    																	rc.pagoR.tipoIngreso_id, 
	    																	$stateParams.objeto_id, 
	    																	rc.ocultarMultas, 
	    																	rc.subtotal,  
	    																	rc.cargosMoratorios, 
	    																	rc.total, 
	    																	fechaProximoPago, 
	    																	undefined, function(error, success) {
	      if (!success) {
	        toastr.error('Error al guardar.');
	        return;
	      }
	      //console.log("Entro a actualizar ");
	      //Actualizar Creditos
	      
	      //var tempId = rc.creditoRefinanciar._id;
	      //delete rc.creditoRefinanciar._id;
	      Creditos.update({_id: rc.creditoRefinanciar._id}, {$set: {esRefinanciado: true, refinanciar: rc.creditoRefinanciar.refinanciar}});
	      
	      toastr.success('Guardado correctamente.');
	      rc.pago = {};
	      rc.pago.totalPago = 0;
	      rc.pago.totalito = 0
	      rc.pago.fechaEntrega = rc.pagoR.fechaEntrega
	      var url = $state.href("anon.imprimirTicketVale", { pago_id: success }, { newTab: true });
	      window.open(url, '_blank');
	      
	    });
			
			
			$("#modalRefinanciamiento").modal('hide');
	}
	
	this.marcarRefinanciamiento = function(credito, index) 
	{
			//console.log(credito);
			rc.selectedRow = index;
			rc.creditoRefinanciar = credito;
			
			//console.log(index);
			//console.log(rc.selectedRow);
			
	}
	
	this.cerrarRefinanciamiento = function() 
	{
			rc.modalRefinanciamiento = false;
		
	}
	
	this.seleccionTipoIngreso = function(tipoIngreso) 
	{

			var ti = TiposIngreso.findOne(tipoIngreso);
			rc.tipoIngresoSeleccionado = Cuentas.findOne({tipoIngreso_id: tipoIngreso});

			if (ti.nombre == "Nota de Credito")
			{
					var p = document.getElementById('cobro');
					p.disabled = true;
					
					var nc = NotasCredito.findOne({cliente_id: $stateParams.objeto_id, saldo : {$gt: 0}, estatus : 1});
					if (nc != undefined)
					{
							this.pago.pagar = Number(parseFloat(nc.saldo).toFixed(2));		
					}					
					else
							this.pago.pagar = 0;
			}
			else
			{
					var p = document.getElementById('cobro');
					p.disabled = false;
					this.pago.pagar = 0;
			}		
			
	}
	
  this.setClickedRow = function(index){  //function that sets the value of selectedRow to current index
	   console.log(index);
     rc.selectedRow = index;
  }
  
  this.calcularAbono = function(){
	  	
	  	//Menor
	  	if (rc.pago.pagar != 0 && rc.pago.pagar < Number(parseFloat(rc.pago.aPagar).toFixed(2)))
			{
					//Menor					
					rc.pago.totalPago 		= 0; 
					rc.pago.bonificacion 	= 0;

					var abonoPagado = Number(parseFloat(rc.pago.pagar / rc.numeroPagosSeleccionados).toFixed(2));
					
					console.log("Abono:", abonoPagado);
									
					var fecha = new Date();
					var n = fecha.getDate();
				
					if (n >= 20)
					{
							rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,1,0,0,0,0);		
					}
					else if (n < 5) 
					{
							rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),1,0,0,0,0);
					}
					else if (n >= 5 && n < 20)		
					{
									rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),16,0,0,0,0);
					}
					
					rc.fechaLimite.setHours(23,59,59,999);
																	
		      rc.subtotal = 0;
					rc.cargosMoratorios = 0;
					
					
					
					
					_.each(rc.planPagosViejo, function(pago){
						
						pago.credito = Creditos.findOne(pago.credito_id);

		        //var credito = Creditos.findOne({_id:pago.credito_id});
		        pago.verCargo = true;
		        
		        
		        var fecha = new Date();
						var n = fecha.getDate();
						var mes = fecha.getMonth();
					
						var fechaPago = pago.fechaLimite;
						var nfp = fechaPago.getDate();
						var mesfp = fechaPago.getMonth();
						
						var comision = 0;
			
			     
		        pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
		        var cre = Creditos.findOne({_id: pago.credito_id});
		        pago.beneficiado =  cre.beneficiado;
		        
		        pago.saldo 					= Number(parseFloat(pago.importeRegular).toFixed(2));
		        
		        
		        
						if (pago.fechaLimite < rc.fechaLimite)		        
						{
								pago.importepagado 	= Number(parseFloat(abonoPagado).toFixed(2));
								pago.pagoSeleccionado = true;	
								
								rc.pago.totalPago += Number(parseFloat(pago.importeRegular).toFixed(2));
								rc.pago.bonificacion += Number(parseFloat(pago.bonificacion).toFixed(2));
								
							
						}
						else
						{
								pago.importepagado 	= 0;
								pago.pagoSeleccionado = false;	
							
						}
		        
		        
		        if (pago.descripcion == "Recibo")
		        		rc.subtotal +=  pago.importeRegular;
		        else if (pago.descripcion == "Cargo Moratorio")
		        {
		        		rc.cargosMoratorios +=  pago.importeRegular;
		        		//console.log("Entro: CM", pago)
		        }
		        pago.folio = pago.credito.folio;
		        
		        //console.log(pago.folio);
		        
		        if (pago.pagoSeguro !=  undefined)
							 pago.seguro = pago.seguro -  pago.pagoSeguro;
						
						if (pago.pagoIva !=  undefined)
							 pago.iva = pago.iva -  pago.pagoIva;
							 
						if (pago.pagoInteres !=  undefined)
							 pago.interes = pago.interes -  pago.pagoInteres;
							 
						if (pago.pagoCapital !=  undefined)
							 pago.capital = pago.capital -  pago.pagoCapital;	 	 
							 
						
								        				      								
		      });
					
					rc.pago.aPagar = Number(parseFloat(rc.pago.totalPago - rc.pago.bonificacion).toFixed(2));
					
			}
			else if (rc.pago.pagar > Number(parseFloat(rc.pago.aPagar).toFixed(2))) //Mayor
			{
					//console.log("Mayor");
					
					rc.pago.totalPago 		= 0; 
					rc.pago.bonificacion 	= 0;

					var pagoDistribuidor = rc.pago.pagar;	
					
					var colores = ['active', 'info', 'warning', 'success', 'danger'];
		    	var asignados = [];
		   	
					var fecha = new Date();
					var n = fecha.getDate();
				
					if (n >= 20)
					{
							rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,1,0,0,0,0);		
					}
					else if (n < 5) 
					{
							rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),1,0,0,0,0);
					}
					else if (n >= 5 && n < 20)		
					{
									rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),16,0,0,0,0);
					}
					
					rc.fechaLimite.setHours(23,59,59,999);
																	
		      rc.subtotal = 0;
					rc.cargosMoratorios = 0;
					
					
					_.each(rc.planPagosViejo, function(pago){
						
						//pago.credito = Creditos.findOne(pago.credito_id);

		        //var credito = Creditos.findOne({_id:pago.credito_id});
		        pago.verCargo = true;
		        
		        var configuraciones = Configuraciones.findOne();
						var comision = calculaBonificacion(pago.fechaLimite, configuraciones.arregloComisiones);
						
		        //console.log("Com:", comision);
		        if (pago.importeRegular == pago.cargo)
						{		
		        		pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
		        }	
		        //var cre = Creditos.findOne({_id: pago.credito_id});
		        //pago.beneficiado =  cre.beneficiado;
		        
		        pago.saldo 					= Number(parseFloat(pago.importeRegular).toFixed(2));
		        
						
						
						
						if (Number(parseFloat(pago.importeRegular - pago.bonificacion).toFixed(2) <= pagoDistribuidor))
						{
								pago.importepagado 	= Number(parseFloat(pago.importeRegular).toFixed(2));
								pago.pagoSeleccionado = true;	
								
								rc.pago.totalPago += Number(parseFloat(pago.importeRegular).toFixed(2));
								rc.pago.bonificacion += Number(parseFloat(pago.bonificacion).toFixed(2));
								
								pagoDistribuidor -= Number(parseFloat(pago.importeRegular - pago.bonificacion).toFixed(2));
								pagoDistribuidor = Number(parseFloat(pagoDistribuidor).toFixed(2));	
						}
						else
						{
								
								
						}
								        
		        
		        
						/*
if (pago.fechaLimite < rc.fechaLimite)		        
						{
								pago.importepagado 	= Number(parseFloat(pago.importeRegular).toFixed(2));
								pago.pagoSeleccionado = true;	
								
								rc.pago.totalPago += Number(parseFloat(pago.importeRegular).toFixed(2));
								rc.pago.bonificacion += Number(parseFloat(pago.bonificacion).toFixed(2));
								
								pagoDistribuidor -= Number(parseFloat(pago.importeRegular - pago.bonificacion).toFixed(2));
								pagoDistribuidor = Number(parseFloat(pagoDistribuidor).toFixed(2));
								
						}
						else
						{
								pago.importepagado 	= 0;
								pago.pagoSeleccionado = false;	
							
						}
*/
		        
		        console.log(pagoDistribuidor);
		        
		        

		        /*
if (pago.descripcion == "Recibo")
		        		rc.subtotal +=  pago.importeRegular;
		        else if (pago.descripcion == "Cargo Moratorio")
		        {
		        		rc.cargosMoratorios +=  pago.importeRegular;
		        		//console.log("Entro: CM", pago)
		        }
		        pago.folio = pago.credito.folio;
		        
		        //console.log(pago.folio);
		        
		        if (pago.pagoSeguro !=  undefined)
							 pago.seguro = pago.seguro -  pago.pagoSeguro;
						
						if (pago.pagoIva !=  undefined)
							 pago.iva = pago.iva -  pago.pagoIva;
							 
						if (pago.pagoInteres !=  undefined)
							 pago.interes = pago.interes -  pago.pagoInteres;
							 
						if (pago.pagoCapital !=  undefined)
							 pago.capital = pago.capital -  pago.pagoCapital;	
*/ 	 
							 
						
								        				      								
		      });
					
					rc.pago.aPagar = Number(parseFloat(rc.pago.totalPago - rc.pago.bonificacion).toFixed(2));
			}
			else //igual
			{
					console.log("Igual");
					
					rc.pago.totalPago 		= 0; 
					rc.pago.bonificacion 	= 0;

					
					var colores = ['active', 'info', 'warning', 'success', 'danger'];
		    	var asignados = [];
		   	
					
					var fecha = new Date();
					var n = fecha.getDate();
				
					if (n >= 20)
					{
							rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,1,0,0,0,0);		
					}
					else if (n < 5) 
					{
							rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),1,0,0,0,0);
					}
					else if (n >= 5 && n < 20)		
					{
									rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),16,0,0,0,0);
					}
					
					rc.fechaLimite.setHours(23,59,59,999);
																	
		      rc.subtotal = 0;
					rc.cargosMoratorios = 0;
					
					
					_.each(rc.planPagosViejo, function(pago){
						
						pago.credito = Creditos.findOne(pago.credito_id);

		        //var credito = Creditos.findOne({_id:pago.credito_id});
		        pago.verCargo = true;
		        		        
		        var configuraciones = Configuraciones.findOne();
						var comision = calculaBonificacion(pago.fechaLimite, configuraciones.arregloComisiones);
						
						//console.log("Com:", comision);
		        if (pago.importeRegular == pago.cargo)
						{		
		        		pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
		        }
		        		
		        var cre = Creditos.findOne({_id: pago.credito_id});
		        pago.beneficiado =  cre.beneficiado;
		        
		        pago.saldo 					= Number(parseFloat(pago.importeRegular).toFixed(2));
		        
		        
		        
						if (pago.fechaLimite < rc.fechaLimite)		        
						{
								pago.importepagado 	= Number(parseFloat(pago.importeRegular).toFixed(2));
								pago.pagoSeleccionado = true;	
								
								rc.pago.totalPago += Number(parseFloat(pago.importeRegular).toFixed(2));
								rc.pago.bonificacion += Number(parseFloat(pago.bonificacion).toFixed(2));
							
						}
						else
						{
								pago.importepagado 	= 0;
								pago.pagoSeleccionado = false;	
							
						}
		        
		        
		        if (pago.descripcion == "Recibo")
		        		rc.subtotal +=  pago.importeRegular;
		        else if (pago.descripcion == "Cargo Moratorio")
		        {
		        		rc.cargosMoratorios +=  pago.importeRegular;
		        		//console.log("Entro: CM", pago)
		        }
		        pago.folio = pago.credito.folio;
		        
		        //console.log(pago.folio);
		        
		        if (pago.pagoSeguro !=  undefined)
							 pago.seguro = pago.seguro -  pago.pagoSeguro;
						
						if (pago.pagoIva !=  undefined)
							 pago.iva = pago.iva -  pago.pagoIva;
							 
						if (pago.pagoInteres !=  undefined)
							 pago.interes = pago.interes -  pago.pagoInteres;
							 
						if (pago.pagoCapital !=  undefined)
							 pago.capital = pago.capital -  pago.pagoCapital;	 	 
							 
						
								        				      								
		      });
		  
					rc.pago.aPagar = Number(parseFloat(rc.pago.totalPago - rc.pago.bonificacion).toFixed(2));
			}
	  	
	  
  };
  
  this.mostrarTodos = function(valor)
	{
			
			if (valor){
					rc.planPagosViejo = PlanPagos.find({importeRegular: {$gt: 0}},{sort : {fechaLimite : 1}}).fetch();
			}
			else
			{
					
					/*//var fecha = new Date();
					//var n = fecha.getDate();
					//var fechaLimite = "";
				
					
if (n >= 20)
					{
							fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,1,0,0,0,0);		
					}
					else if (n < 5) 
					{
							fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),1,0,0,0,0);
					}
					else if (n >= 5 && n < 20)		
					{
							fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),16,0,0,0,0);
					}
					
					fechaLimite.setHours(23,59,59,999);
					
					rc.planPagosViejo = PlanPagos.find({fechaLimite: { $lte: fechaLimite }, importeRegular: {$gt: 0}},{sort : {fechaLimite : 1}}).fetch();
*/
					
					var fecha = new Date();
					var n = fecha.getDate();
					//var fechaLimite = "";
				
					if (n >= 20)
					{
							rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,15,0,0,0,0);		
							rc.fechaLimite.setHours(23,59,59,999);
							rc.planPagosViejo = PlanPagos.find({fechaLimite: { $lt: rc.fechaLimite }, importeRegular: {$gt: 0}, estatus:{$in: [0,2]}},{sort : {fechaLimite : 1}}).fetch();
					}
					else if (n < 5) 
					{
							rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),15,0,0,0,0);
							rc.fechaLimite.setHours(23,59,59,999);
							rc.planPagosViejo = PlanPagos.find({fechaLimite: { $lt: rc.fechaLimite }, importeRegular: {$gt: 0}, estatus:{$in: [0,2]}},{sort : {fechaLimite : 1}}).fetch();
					}
					else if (n >= 5 && n < 20)		
					{
							rc.fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),16,0,0,0,0);
							rc.fechaLimite.setHours(23,59,59,999);
							rc.planPagosViejo = PlanPagos.find({fechaLimite: { $lte: rc.fechaLimite }, importeRegular: {$gt: 0}, estatus:{$in: [0,2]}},{sort : {fechaLimite : 1}}).fetch();
					}
					
					
			}
			
			var colores = ['active', 'info', 'warning', 'success', 'danger'];
			var asignados = [];
			
			
			rc.pago.totalPago = 0;
			rc.pago.bonificacion = 0;
			rc.pago.cargosMoratorios = 0;
						
			rc.subtotal = 0;
			rc.cargosMoratorios = 0;
			rc.numeroPagosSeleccionados = 0;
			rc.total = 0;
			
			_.each(rc.planPagosViejo, function(pago){				
					//var credito = Creditos.findOne(pp.credito_id);
					
					pago.credito = Creditos.findOne(pago.credito_id);
					
					pago.color = colores[0];
	        //var credito = Creditos.findOne({_id:pago.credito_id});
	        pago.verCargo = true;
	        
	        var configuraciones = Configuraciones.findOne();
	        var comision = 0;
	        if (pago.importeRegular == pago.cargo)
	        	 comision = calculaBonificacion(pago.fechaLimite, configuraciones.arregloComisiones);
	        if (pago.importeRegular == pago.cargo)
					{	
	        		pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
	        }		
	        		
	        var cre = Creditos.findOne({_id: pago.credito_id});
	        
	        if (cre != undefined && cre.beneficiario_id != undefined)
					{
						Meteor.call('getBeneficiario', cre.beneficiario_id, function(error, result) {           
					          if (result)
					          {
					          		pago.beneficiario = result;
					          		//console.log(result);
					          		$scope.$apply();
										}
					  });
					  
					}
	        
	        //pago.beneficiado =  cre.beneficiado;
	        
	        pago.saldo 					= Number(parseFloat(pago.importeRegular).toFixed(2));	        
	        
					if (pago.fechaLimite < rc.fechaLimite)		        
					{
							pago.importepagado 	= Number(parseFloat(pago.importeRegular).toFixed(2));
							pago.pagoSeleccionado = true;	
							
							if (pago.descripcion == "Recibo")
			        {
								 rc.pago.totalPago += Number(parseFloat(pago.importeRegular).toFixed(2));
							}	
							
							rc.pago.bonificacion += Number(parseFloat(pago.bonificacion).toFixed(2));
							
							rc.numeroPagosSeleccionados += 1;
							
							if (pago.descripcion == "Cargo Moratorio")
			        {
			        		rc.pago.cargosMoratorios +=  pago.importeRegular;
			        }
							
					}
					else
					{
							pago.importepagado 	= 0;
							pago.pagoSeleccionado = false;	
						
					}
	        
	        
	        if (pago.descripcion == "Recibo")
	        		rc.subtotal +=  pago.importeRegular;
	        else if (pago.descripcion == "Cargo Moratorio")
	        {
	        		rc.cargosMoratorios +=  pago.importeRegular;
	        }
	        pago.folio = pago.credito.folio;
	        
	        if (pago.pagoSeguro !=  undefined)
						 pago.seguro = pago.seguro -  pago.pagoSeguro;
					
					if (pago.pagoIva !=  undefined)
						 pago.iva = pago.iva -  pago.pagoIva;
						 
					if (pago.pagoInteres !=  undefined)
						 pago.interes = pago.interes -  pago.pagoInteres;
						 
					if (pago.pagoCapital !=  undefined)
						 pago.capital = pago.capital -  pago.pagoCapital;	 
					
					
					pago.beneficiado = pago.credito.beneficiado;
					pago.numeroPagos = pago.credito.numeroPagos;
					pago.verCargo = true;
					

					
			});
			
			rc.total = rc.subtotal + rc.cargosMoratorios;
			
			rc.pago.aPagar =  Number(parseFloat(rc.pago.totalPago - rc.pago.bonificacion  + rc.pago.cargosMoratorios + rc.pago.seguro).toFixed(2));

	};	
  
	function calculaBonificacion (fechaLimite, arregloComisiones){
	  	
	  	//var configuraciones = Configuraciones.findOne();

	  	var comisionMayor = 0;
	  	var comision = 0;
	  	
	  	_.each(arregloComisiones, function(c){
		  		if (c.porcentaje > comisionMayor)
		  			comisionMayor = c.porcentaje;
	  	});
	  	
	  	var date = new Date();
	  	date.setHours(23,59,59);
	  	var fecha1 = moment(date);
	  	
			var fecha2 = moment(fechaLimite);
			
			var dias = fecha1.diff(fecha2, 'days');

			comision = comisionMayor;
			
			if (dias > 6)
			{
				 	comision = 0;
			}
			else if (dias <= 0)
			{
					//Comisión Mayor
					comision = comisionMayor;
			}
			else if (dias <= 6)
			{
					var fechaPago = new Date(fecha1);
					var nfp = fechaPago.getDate();
					var mesfp = fechaPago.getMonth();					
					comision = 0;
					_.each(arregloComisiones, function(c){
			  		if (c.valor1 == nfp || c.valor2 == nfp)
			  				comision = c.porcentaje;
					});				
			}	
	  	
	  	return comision;
	  	
  };
  
};