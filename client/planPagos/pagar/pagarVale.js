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
  
  rc.fechaLimite;

  this.subscribe('planPagos', () => {
	  //determinar la fecha menor a la quincena mas pronta
	  
/*
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
*/
			//console.log(rc.fechaLimite);
			//console.log(rc.getCollectionReactively("creditos_id").length);	
			
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

  this.subscribe('cliente', () => {
    return [{ _id: $stateParams.objeto_id }];
  });

  this.subscribe('creditos', () => {
    return [{ cliente_id: $stateParams.objeto_id, estatus : {$in: [2, 4]}}];
  });
/*
  this.subscribe('pagos', () => {
    return [{ estatus: 1 }];
  });
*/
/*
  this.subscribe('ocupaciones', () => {
    return [{ estatus: true }];
  });
  this.subscribe('nacionalidades', () => {
    return [{ estatus: true }];
  });
  this.subscribe('estadoCivil', () => {
    return [{ estatus: true }];
  });
  this.subscribe('estados', () => {
    return [{ estatus: true }];
  });
  this.subscribe('paises', () => {
    return [{ estatus: true }];
  });
  this.subscribe('empresas', () => {
    return [{ estatus: true }];
  });
*/

  /*
this.subscribe('personas', () => {
    return [{}];
  });
*/
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

  
  /*
this.subscribe('notasCreditoTop1', () => {
    return [{
					cliente_id: $stateParams.objeto_id, saldo : {$gt: 0}, estatus : 1
    }]
  });
*/
		

  this.helpers({
    /*
notasCredito : ()=>{
	   	return  NotasCredito.find({cliente_id: $stateParams.objeto_id, saldo : {$gt: 0}, estatus : 1}).fetch();
    },
*/
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
		/*
historialCreditos : () => {
			
			var creditos = Creditos.find().fetch();
			if(creditos != undefined){
				rc.creditos_id = _.pluck(creditos, "cliente_id");
			}
			
			return creditos
			
			
		},
		planPagosHistorial  : () => {
			
			var planes = PlanPagos.find({credito_id : rc.getReactively("credito_id")}).fetch()
			//rc.creditos_id = _.pluck(planes, "cliente_id");
			//console.log("kaka",planes)
			return planes;

		},
*/
	/*
	historial : () => {
			arreglo = [];
			var saldoPago = 0;
			var saldoActual = 0; 
			rc.saldo =0;	
			var credito = rc.credito
			rc.saldoMultas = 0;
*/
			//return PlanPagos.find({credito_id : this.getReactively("credito_id")}).fetch();

/*
			_.each(rc.getReactively("planPagos"), function(planPago){
				
				if(planPago.descripcion == "Recibo")
					rc.saldo += planPago.cargo;
				if(planPago.descripcion == "Cargo Moratorio")
					rc.saldoMultas += planPago.importeRegular;
			});
*/
			
			/*
_.each(rc.planPagos, function(planPago, index){
				//planPago.ciudad = PlanPagos.findOne(planPago.credito_id);
				//console.log("entro al segundo");
				//console.log("credito",credito);
				
				if(planPago.descripcion == "Recibo")
					rc.saldo += planPago.cargo;
				if(planPago.descripcion == "Cargo Moratorio")
					rc.saldoMultas += planPago.importeRegular;
					
				if(planPago.descripcion == "Cargo Moratorio" )
					rc.saldo += planPago.cargo;
				
				fechaini= planPago.fechaPago? planPago.fechaPago:planPago.fechaLimite;

				arreglo.push({saldo:rc.saldo,
					numeroPago : planPago.numeroPago,
					cantidad : rc.credito.numeroPagos,
					fechaSolicito : rc.credito.fechaSolicito,
					fecha : fechaini,
					pago : 0, 
					cargo : planPago.cargo,
					movimiento : planPago.movimiento,
					planPago_id : planPago._id,
					cantidad: rc.credito.numeroPagos,
					credito_id : planPago.credito_id,
					descripcion : planPago.descripcion,
					importe : planPago.importeRegular,
					pagos : planPago.pagos
			  });				
				
				if(planPago.pagos.length > 0)
					_.each(planPago.pagos,function (pago) {
							rc.saldo -= pago.totalPago;
							arreglo.push({saldo:rc.saldo,
														numeroPago : planPago.numeroPago,
														cantidad : rc.credito.numeroPagos,
														fechaSolicito : rc.credito.fechaSolicito,
														fecha : pago.fechaPago,
														pago : pago.totalPago, 
														cargo : 0,
														movimiento : planPago.descripcion=="Cargo Moratorio"? "Abono de Cargo Moratorio":"Abono",
														planPago_id : planPago._id,
														credito_id : planPago.credito_id,
														descripcion : planPago.descripcion=="Cargo Moratorio"? "Abono de Cargo Moratorio":"Abono",
														importe : planPago.importeRegular,
														pagos : planPago.pagos
					  	});
					})
				//console.log(rc.saldo)

			});

			if(this.getReactively("credito_id")){
        var filtrado = [];
        var flags = {
          abonoKey: undefined,
          multaKey:undefined
      };
        
			_.each(arreglo, function(pago,key){
          if(pago.descripcion == "Cargo Moratorio"){
            flags.multaKey = key;
          }
          if(pago.descripcion == "Recibo"){
            flags.abonoKey = key;
          }
          if(pago.descripcion == "Abono de Multa"){
            //console.log(flags);
            //console.log(arreglo[flags.multaKey].saldoActualizado);
            if(arreglo[flags.multaKey].saldoActualizado){
              arreglo[flags.multaKey].saldoActualizado -= pago.pago;
            }else{
              arreglo[flags.multaKey].saldoActualizado = arreglo[flags.multaKey].cargo - pago.pago;
            }
          }
          if(pago.descripcion == "Abono"){
            if(arreglo[flags.abonoKey].saldoActualizado){
              arreglo[flags.abonoKey].saldoActualizado -= pago.pago;
            }else{
              arreglo[flags.abonoKey].saldoActualizado = arreglo[flags.abonoKey].cargo - pago.pago;
            }
          }
          if(pago.credito_id == rc.credito_id){
            filtrado.push(pago);
          }
          if(pago.numeroPago % 2 == 0)
            {
              
              pago.tipoPar = "par"
            }
            else
            {
              
              pago.tipoPar = "impar"
            }

        })
			  //console.log(filtrado,"filtrado")
        return filtrado;
      }
			
			return arreglo;
*/
		//},
    tiposIngreso: () => {
	    
	    var ti = TiposIngreso.find().fetch();
	    
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
   	
			var pp = PlanPagos.find({importeRegular : {$gt : 0}
															/* , fechaLimite		: {$lte: rc.fechaLimite} */ }, 
															{ sort: { fechaLimite: 1, numeroPago: 1, descripcion: -1 } }).fetch();
			
			
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
			rc.numeroPagosSeleccionados = 0;
			
			if (pp != undefined)
			{
					_.each(pp, function(pago){
						
						pago.credito = Creditos.findOne(pago.credito_id);
						pago.color = colores[0];
		        //var credito = Creditos.findOne({_id:pago.credito_id});
		        pago.verCargo = true;
		        
		        var comision = calculaBonificacion(pago.fechaLimite);
		        
		        //console.log("Com:", comision);
		        
		        pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
		        var cre = Creditos.findOne({_id: pago.credito_id});
		        pago.beneficiado =  cre.beneficiado;
		        
		        pago.saldo 					= Number(parseFloat(pago.importeRegular).toFixed(2));
		        
		        
		        
						if (pago.fechaLimite < rc.fechaLimite)		        
						{
								pago.importepagado 	= Number(parseFloat(pago.importeRegular).toFixed(2));
								pago.pagoSeleccionado = true;	
								
								rc.pago.totalPago += Number(parseFloat(pago.importeRegular).toFixed(2));
								rc.pago.bonificacion += Number(parseFloat(pago.bonificacion).toFixed(2));
								
								rc.numeroPagosSeleccionados += 1;
								
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
/*
    pagos: () => {
      return Pagos.find().fetch()
    },
*/
    /*
pagosReporte: () => {
      _.each(rc.planPagosViejo, function(pp) {
        var pagos = pp.pagos
      });

      return Pagos.find().fetch()
    },
*/
   /*
 notas: () => {
      return Notas.find().fetch();
    },
*/
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


  this.tieneFoto = function(sexo, foto) {
    if (foto === undefined) {
      if (sexo === "Masculino")
        return "img/badmenprofile.png";
      else if (sexo === "Femenino") {
        return "img/badgirlprofile.png";
      } else {
        return "img/badprofile.png";
      }
    } else {
      return foto;
    }
  }

	//Este es la columna + -
  this.seleccionarPago = function(pago) {
    pago.pagoSeleccionado = !pago.pagoSeleccionado;
    pago.estatus = 0;
    rc.pago.totalPago = 0;
    rc.pago.bonificacion = 0;
    
    
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
		        if (p.pagoSeleccionado == true) {
		           rc.pago.totalPago += Number(parseFloat(p.importepagado).toFixed(2));
		           rc.pago.bonificacion += Number(parseFloat(p.bonificacion ).toFixed(2));
		        }
		      }
				}		
    });
    rc.pago.totalPago = Number(parseFloat(rc.pago.totalPago).toFixed(2));
  }
  
  //Este es el input
  this.seleccionarMontoPago = function(pago) {
    rc.pago.totalPago = 0;
    rc.pago.bonificacion = 0;
    
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
	          rc.pago.totalPago += p.importepagado;
	          rc.pago.bonificacion += Number(parseFloat(p.bonificacion).toFixed(2));
	        }
	      }
	    }  
    });
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
	  
	  /*
if (pago.pagar < pago.totalPago)
	  {
		  	toastr.warning("No alcanza a pagar con el total ingresado");
		  	return;
	  }
*/
	  
	  if (pago.totalPago == 0)
	  {
		  	toastr.warning("No hay nada que cobrar");
		  	return;
	  }
	  
	  //Validar que sea completo el crédito a pagar    
	  var tipoIngreso = TiposIngreso.findOne(pago.tipoIngreso_id);
	  if (tipoIngreso.nombre == "REFINANCIAMIENTO")
	  {
		  		
		  		
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
		    
		    console.log(fechaProximoPago);
				
				
				Meteor.call("pagoParcialVale", 		seleccionadosId, 
		    																	pago.pagar, 
		    																	pago.bonificacion,
		    																	pago.totalPago,
		    																	pago.tipoIngreso_id, 
		    																	$stateParams.objeto_id, 
		    																	rc.ocultarMultas, 
		    																	rc.subtotal,  
		    																	rc.cargosMoratorios, 
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
			rc.total = 0;

			_.each(this.planPagosViejo, function(pago) {
					
          if (pago.descripcion == "Cargo Moratorio")
          {
	          	pago.verCargo = !pago.verCargo;
          }	
          
          if (pago.pagoSeleccionado == true && pago.verCargo == false)
          {
          		pago.pagoSeleccionado = false;
							console.log("false:", pago.importepagado);  	
							console.log("false:", rc.pago.totalPago);  	
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
								rc.cargosMoratorios += Number(parseFloat(pago.importeRegular).toFixed(2));
		        	
	
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
       
       
       rc.total = rc.subtotal + rc.cargosMoratorios;
       			
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
					console.log("Mayor");
					
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
		        
						var comision = calculaBonificacion(pago.fechaLimite);
						
		        //console.log("Com:", comision);
		        
		        pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
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
		        
						var comision = calculaBonificacion(pago.fechaLimite);
						
						//console.log("Com:", comision);
		        
		        pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
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
  
  
  
  function calculaBonificacion(fechaLimite){
	  	
	  	var fecha = new Date();
			var n = fecha.getDate();
			var mes = fecha.getMonth();
		
			var fechaPago = fechaLimite;
			var nfp = fechaPago.getDate();
			var mesfp = fechaPago.getMonth();
			
			var comision = 15;
			
			if (mes == mesfp && n >= nfp)
			{
					switch(n)
					{
						case 1: comision = 15; break;
						case 2: comision = 14; break;
						case 3: comision = 13; break;
						case 4: comision = 12; break;
						case 5: comision = 11; break;
						case 6: comision = 10; break;
						case 7: comision = 9; break;
						case 8: comision = 8; break;
						case 16: comision = 15; break;
						case 17: comision = 14; break;
						case 18: comision = 13; break;
						case 19: comision = 12; break;
						case 20: comision = 11; break;
						case 21: comision = 10; break;
						case 22: comision = 9; break;
						case 23: comision = 8; break;
						
						default: comision = 0;
					}	
			}	
	  	
	  	return comision;
	  	
  };
  

};