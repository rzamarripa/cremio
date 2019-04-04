angular.module("creditoMio")
.controller("CobranzaValesCtrl", CobranzaValesCtrl);
 function CobranzaValesCtrl($scope, $meteor, $reactive, $state, toastr){
  
  let rc = $reactive(this).attach($scope);
  window.rc = rc;
    
  this.fechaInicial = new Date();
  this.fechaInicial.setHours(0,0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,59,59,999);
  
  rc.buscar = {};
  rc.buscar.nombre = "";
  rc.credito_id = "";
  rc.cliente_id = "";
  rc.historial = [];
  
  var FI, FF;
  rc.cliente = {};
  rc.credito = {};
  rc.historialCrediticio = {};
  rc.cobranza = {};

  rc.avales = [];
  rc.referenciasPersonales = [];
  rc.ihistorialCrediticio = [];
  rc.clientes_id = [];
 
  rc.cobranza_id = "";
  rc.notaCobranza = {};
  rc.totalRecibos = 0;
  rc.totalMultas = 0;
  rc.seleccionadoRecibos = 0;
  rc.seleccionadoMultas = 0;
  rc.recibo = [];
  
  
  this.selected_numero = 0;
  this.ban = false;
  this.respuestaNotaCLiente = false;
  rc.verRecibos = false;
  rc.selectRecibo = false
  rc.conRespuesta = false
  //rc.cobranza.estatus = 
  
  rc.pago_id = "";
  rc.pagos_ids = [];
  
  this.estadoCivilSeleccionado = "";
  this.valorOrdenar = "Folio";

  rc.colonia =""
  
  rc.abonosRecibos 					= 0;
	rc.abonosCargorMoratorios = 0;

  this.subscribe("tiposCredito", ()=>{
    return [{}]
  });
  
  this.subscribe('pagos',()=>{
		return [{ _id : { $in : rc.getReactively("pagos_ids")}}];
	});
  
  this.subscribe("estadoCivil", ()=>{
    return [{estatus : true}]
  });

	//Quitar
	
	
  this.subscribe("configuraciones", ()=>{
    return [{}]
  });
 
  this.subscribe("nacionalidades", ()=>{
    return [{}]
  });
  this.subscribe("ocupaciones", ()=>{
    return [{}]
  });

  this.subscribe("paises", ()=>{
    return [{}]
  });
  this.subscribe("estados", ()=>{
    return [{}]
  });
  this.subscribe("municipios", ()=>{
    return [{}]
  });
  this.subscribe("ciudades", ()=>{
    return [{}]
  });
  this.subscribe("colonias", ()=>{
    return [{}]
  });
  this.subscribe("empresas", ()=>{
    return [{}]
  });   
  
  this.subscribe('tiposIngreso',()=>{
		return [{}] 
	});

  this.subscribe('notas',()=>{
    return [{cliente_id:this.getReactively("cliente_id"),}]
  });

/*
  this.subscribe("planPagos", ()=>{
    return [{credito_id : this.getReactively("credito_id") }]
  });
*/

  this.subscribe('creditos', () => {
    return [{cliente_id : rc.getReactively("cliente_id")}];
  });

  
  this.helpers({
    tiposCredito : () => {
      return TiposCredito.find();
    },
    notas : () => {
	    
	    var not = Notas.find().fetch();
	    
	    _.each(not, function(nota){
		    	 Meteor.call('getUsuario', nota.usuario_id, function(error, result) {           
			          if (result)
			          {
			              nota.usuario = result.nombre;
			              $scope.$apply();
			          }
			        
			    }); 
			    
			    if (nota.respuestaNota != undefined)
			    {
				    	nota.descripcion = nota.descripcion + " - " + nota.respuestaNota;
			    }
		    	
	    });
	    
      return not;
    },
    usuario : () => {
      return Meteor.users.findOne();
    },
    creditos : () => {
      var creditos = Creditos.find().fetch();
      _.each(creditos, function(credito){
        credito.cliente = Personas.findOne(credito.cliente_id)
      });


      return Creditos.find().fetch();
    },
    /*
planPagos : () => {
      var planes = PlanPagos.find({multada:1});
      var obj = planes.length
      // _.each(planes,function(plan){
      //   plan.fechaLimite = moment(plan.fechaLimite).format("DD-MM-YYYY")
      // });

      return planes;
    },
*/
    /*
planPagosViejo : () => {
    
      pagos = PlanPagos.find({},{sort : {numeroPago : 1,descripcion:-1}}).fetch();

      _.each(pagos, function(pay){

         pay.credito = Creditos.findOne(pay.credito_id);
     });

       return pagos
    },
*/
    /*

    historialDelCredito : () => {
      
      arreglo = [];
			
			var saldoPago = 0;
			var saldoActual = 0; 
			rc.saldo = 0;	
			var credito = rc.credito
			rc.saldoMultas = 0;
			
			rc.abonosRecibos 					= 0;
			rc.abonosCargorMoratorios = 0;

			_.each(rc.getReactively("planPagosViejo"), function(planPago){	
				if(planPago.descripcion == "Recibo")
					rc.saldo += Number(parseFloat(planPago.cargo).toFixed(2));
				if(planPago.descripcion == "Cargo Moratorio")
					rc.saldoMultas += Number(parseFloat(planPago.importeRegular).toFixed(2));
			});
			
			//rc.saldo 				= Number(parseFloat(rc.saldo).toFixed(2));
			//rc.saldoMultas 	= Number(parseFloat(rc.saldoMultas).toFixed(2));
			rc.pagos_ids = [];
			
			_.each(rc.getReactively("planPagosViejo"), function(planPago, index){
					
				if (planPago.descripcion == "Cargo Moratorio")
				{
						rc.saldoMultas 	+= Number(parseFloat(planPago.cargo).toFixed(2));
				}			
				
				var sa = 0;
			  if (planPago.descripcion == 'Recibo')
						sa = Number(parseFloat( planPago.cargo - (planPago.pagoInteres + planPago.pagoIva + planPago.pagoCapital +	planPago.pagoSeguro) ).toFixed(2)); 
			  else if (planPago.descripcion == 'Cargo Moratorio')
			 			sa = Number(parseFloat(planPago.cargo - planPago.pago).toFixed(2));

				arreglo.push({saldo							: rc.saldo,
											numeroPago  			: planPago.numeroPago,
											cantidad 					: rc.credito.numeroPagos,
											fechaSolicito 		: rc.credito.fechaSolicito,
											fecha 						: planPago.fechaLimite,
											pago  						: 0, 
											cargo 						: planPago.cargo,
											movimiento 				: planPago.movimiento,
											planPago_id 			: planPago._id,
											credito_id 				: planPago.credito_id,
											descripcion 			: planPago.descripcion,
											importe 					: planPago.importeRegular,
											pagos 						: planPago.pagos,
											notaCredito				: 0,
											saldoActualizado	: planPago.pagos.length == 0 ? planPago.importeRegular : sa
			  	});			
			  		
				if (planPago.pagos.length > 0)
				{
					_.each(planPago.pagos,function (pago) {
							rc.pagos_ids.push(pago.pago_id);
					});
					
					var pagos = Pagos.find({}).fetch();
					
					_.each(planPago.pagos,function (pago) {
						
							//Ir por la Forma de Pago
							var formaPago = "";
							var pag = Pagos.findOne(pago.pago_id);
							if (pag != undefined)
							{
								 var ti = TiposIngreso.findOne(pag.tipoIngreso_id);
								 if (ti != undefined)
								 		formaPago = ti.nombre;
							}
							
							if (planPago.descripcion == 'Recibo')
							{
									rc.abonosRecibos += pago.totalPago;
							}	
							else if (planPago.descripcion == "Cargo Moratorio")	
							{
									rc.abonosCargorMoratorios += pago.totalPago;
							}	
							
							rc.saldo -= pago.totalPago
							arreglo.push({saldo							: rc.saldo,
														numeroPago 				: planPago.numeroPago,
														cantidad 					: credito.numeroPagos,
														fechaSolicito 		: rc.credito.fechaSolicito,
														fecha 						: pago.fechaPago,
														pago  						: pago.totalPago, 
														cargo 						: 0,
														movimiento 				: planPago.descripcion == "Cargo Moratorio"? "Abono de Cargo Moratorio": "Abono",
														planPago_id 			: planPago._id,
														credito_id 				: planPago.credito_id,
														descripcion 			: planPago.descripcion == "Cargo Moratorio"? "Abono de Cargo Moratorio": "Abono",
														importe 					: planPago.importeRegular,
														pagos 						: planPago.pagos,
														notaCredito				: formaPago == 'Nota de Credito' ? pago.totalPago : 0,
														saldoActualizado	: 0
					  	});
					})
				}
				
				
					
			});
			
			rc.saldo 				= (credito.adeudoInicial + rc.saldoMultas ) - ( rc.abonosRecibos + rc.abonosCargorMoratorios );
			
      return arreglo;
    },
*/
    historialCredito : () => {
      var creditos = [];
      rc.clientes_id = _.pluck(rc.cobranza,"cliente._id")
      return creditos
      
    },
    cobranza :() =>{
		  
		  var fecha = rc.getReactively("fechaInicial");
		  if (fecha != undefined)
		  {
		  
				var n = fecha.getDate();
				var fechaLimite = "";
				
				/*
if (n < 15) 
				{
						fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),30,0,0,0,0);
				}
				else //if (n >= 5 && n < 20)		
				{
						fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,15,0,0,0,0);
				}
*/
				if (n >= 22)
				{
						fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,1,0,0,0,0);		
				}
				else if (n <= 7) 
				{
						fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),1,0,0,0,0);
				}
				else if (n > 7 && n < 22)		
				{
						fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),16,0,0,0,0);
				}
				
				/*
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
*/
				
				//console.log(n);
				//console.log("");
				//console.log(fechaLimite);
				
				fechaLimite.setHours(0,0,0,0);
			  
		    this.fechaFinal = new Date(fechaLimite.getTime());
		    this.fechaFinal.setHours(23,59,59,999);
		    FI = fechaLimite;
		    FF = this.fechaFinal;
		    rc.verRecibos = true;
		    
		    loading(true);
		    Meteor.call('getCobranzaVales', FI, FF, 1, Meteor.user().profile.sucursal_id, function(error, result) {           
		          if (result)
		          {
		              //console.log(result,"resullltt")
		              rc.cobranza = result;
		              rc.totalRecibos = 0;
		              rc.totalMultas = 0;
		              _.each(rc.cobranza,function(c){
		                  if (c.descripcion == "Recibo")
		                     rc.totalRecibos = rc.totalRecibos + c.importeRegular;
		                  else if (c.descripcion == "Cargo Moratorio")    
		                     rc.totalMultas = rc.totalMultas + c.importeRegular;
		              });	              
		
		              $scope.$apply();
		              loading(false);
		          }
		        
		    }); 
			}	
	    
    },

  });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  
  this.calcularSemana = function(w, y) 
  {
      var ini, fin;
    
      var simple = new Date(y, 0, 1 + (w - 1) * 7);
      FI = new Date(simple);
      FF = new Date(moment(simple).add(7,"days"));
      
      FF.setHours(23,59,59,999);
      
  }
  
  this.calcularMes = function(m, y) 
  {
      var startDate = moment([y, m]);
      var endDate = moment(startDate).endOf('month');
      FI = startDate.toDate();
      FF = endDate.toDate();
      FF.setHours(23,59,59,999);
  }
  
  this.AsignaFecha = function(op)
  { 
	  	
      this.selected_numero = 0;
      this.ban = false;
      
      if (op == 0) //Vencimiento Hoy
      {
          FI = new Date();
          FI.setHours(0,0,0,0);
          FF = new Date(FI.getTime() - (1 * 24 * 3600 * 1000));
          FF.setHours(23,59,59,999);
          rc.verRecibos = false;
          //console.log("FI:",FI);
          //console.log("FF:",FF);
          
      } 
      else if (op == 1) //Día
      {
	      	var fecha = rc.getReactively("fechaInicial");
					var n = fecha.getDate();
					var fechaLimite = "";
					
					if (n < 15) 
					{
							fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),30,0,0,0,0);
					}
					else //if (n >= 5 && n < 20)		
					{
							fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,15,0,0,0,0);
					}
					
					/*
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
*/
					
					fechaLimite.setHours(0,0,0,0);
				  
			    this.fechaFinal = new Date(fechaLimite.getTime());
			    this.fechaFinal.setHours(23,59,59,999);
			    FI = fechaLimite;
			    FF = this.fechaFinal;	      
          rc.verRecibos = true;
          
      } 
      else if (op == 2) //Semana
      {         
          
          FI = new Date();
          FI.setHours(0,0,0,0);
          FF = new Date(FI.getTime());
          FF.setHours(23,59,59,999);
          
          var semana = moment().isoWeek();
          var anio = FI.getFullYear();
          this.calcularSemana(semana, anio);
          rc.verRecibos = false;
          //console.log("FI:", FI);
          //console.log("FF:", FF);
        
      }
      else if (op == 3) //Mes
      {
        
          FI = new Date();
          FI.setHours(0,0,0,0);
          var anio = FI.getFullYear();
          var mes = FI.getMonth();
          //console.log(mes);
          this.calcularMes(mes,anio);
          rc.verRecibos = false;
          //console.log("FI:", FI);
          //console.log("FF:", FF);
        
      }
      else if (op == 4) //Siguiente Mes
      {
          FI = new Date();
          var anio = FI.getFullYear();
          var mes = FI.getMonth();
          if (mes == 11) 
          {
              mes = 0;
              anio = anio + 1; 
          }
          else
              mes = mes + 1;  
          
          this.calcularMes(mes,anio);
          rc.verRecibos = false;
          //console.log("FI:", FI);
          //console.log("FF:", FF);
      }
      
      //console.log(n);
			//console.log("opcion:", op);
			//console.log(fechaLimite);
      
      //Meteor.call("actualizarMultas",function(err, res){console.log("Fue por multas:",res)});
      
      loading(true);
      Meteor.call('getCobranzaVales', FI, FF, op, Meteor.user().profile.sucursal_id, function(error, result) {           
          if (result)
          {
              
              rc.cobranza = result;
              rc.totalRecibos = 0;
              rc.totalMultas = 0;
              _.each(rc.cobranza,function(c){
                  if (c.descripcion == "Recibo")
                      rc.totalRecibos = rc.totalRecibos + c.importeRegular;
                  else if (c.descripcion == "Cargo Moratorio")    
                      rc.totalMultas = rc.totalMultas + c.importeRegular;
              });

              $scope.$apply();
              loading(false);
          }
      }); 
      
      
  }
  
  this.selCredito=function(objeto, num)
  {
			
			//console.log("wep:", objeto);
			
			rc.planPagos = objeto.planPagos;
			
			//console.log(rc.planPagos);
			
			
      Meteor.call('getPeople',objeto.distribuidor._id, function(error, result)
      {                     
          if (result)
          {

            objeto.cliente = result;
						
						// console.log("Objeto:", objeto);
						
			      rc.cliente_id = objeto.cliente._id
			
			      Creditos.find({cliente_id: rc.getReactively("cliente_id")}).fetch()
			
			      objeto.historialCreditos = Creditos.find({cliente_id: rc.getReactively("cliente_id")}).fetch()
			
			      rc.ban = !rc.ban;
			
			      rc.credito_id = objeto.credito._id;
			      //console.log("Objeto: ",objeto)
			      rc.historial = objeto
			
			      //Información del Cliente
			      rc.cliente = objeto.cliente;
			      
			      var ec = EstadoCivil.findOne(rc.cliente.profile.estadoCivil_id);
			      if (ec != undefined)
			          this.estadoCivilSeleccionado =  ec.nombre;
			
      
			      //-----------------------------------------------------------------------------
			      
			      //Información del Crédito
			    
			      rc.credito = objeto.credito;  
			      var tipocredito = TiposCredito.findOne(objeto.credito.tipoCredito_id);
			      //console.log(tipocredito);
			      objeto.credito.tipoCredito = tipocredito.nombre;
						
			      rc.avales = [];
			      _.each(rc.credito.avales_ids,function(aval){
				      		//console.log("A:", aval);
			            Meteor.call('getPersona', aval.aval_id, function(error, result){           
			                  if (result)
			                  {
				                  	console.log("R:", result)
			                      rc.avales.push(result);
			                      $scope.$apply();      
			                  }
			            }); 
			      });
			      //-----------------------------------------------------------------------------
			      
			      //Historial Crediticio
			      Meteor.call('gethistorialPago', rc.credito._id, function(error, result) {
			            if (result)
			            {
			                rc.historialCrediticio = result;
			                $scope.$apply();
			                //console.log(rc.historialCrediticio);
			            }
			      });
			             
			      //-----------------------------------------------------------------------------

			      rc.selected_numero = num;
       }
      });
      
      
      
  };

  this.getPagos=function(objeto)
  {

			loading(true);
			Meteor.call ("getPagosDistribuidor", objeto.cliente._id, function(error,result){
	
					if (error){
						 console.log(error);
						 toastr.error('Error al obtener pagos: ', error.details);
						 loading(false);
						 return
					}
					if (result)
					{
						 rc.pagos = result;
						 $scope.$apply();
						 loading(false);							
					}
			});


  }
  
  this.verPagos= function(pago) {
	  
		rc.pagoPlanPago = pago.planPagos;		
		rc.pago					= pago;
		$("#modalPagos").modal('show');
	};
  
  this.verHistorial = function(pago) {

			rc.credito = Creditos.findOne({folio: pago.folioCredito});
			//console.log(rc.credito);
			rc.pagoDis	  = pago;
			//console.log(pago);
			Meteor.call('getPlanPagos', rc.credito._id, function(error, result) {
	       if(error)
	       {
	        console.log('ERROR :', error);
	        return;
	       }
	       if (result)
	       {
	           	
							rc.credito_id = rc.credito._id;							
							var planes = result;

							arreglo = [];
							
							var saldoPago 			= 0;
							var saldoActual 		= 0; 
							rc.saldo 						= 0;	
							rc.saldoGeneral 		= 0;
							rc.sumaNotaCredito 	= 0;
							var credito 				= rc.credito
							rc.saldoMultas 			= 0;
				
							rc.abonosRecibos 					= 0;
							rc.abonosCargorMoratorios = 0;
				
							_.each(planes, function(planPago){	
								if(planPago.descripcion == "Recibo")
									rc.saldo += Number(parseFloat(planPago.cargo).toFixed(2));
								if(planPago.descripcion == "Cargo Moratorio")
									rc.saldoMultas 	+= Number(planPago.importeRegular + planPago.pago);	
								planPago.cantidad = credito.numerosPagos;								
							});
							
							rc.pagos_ids = [];
							
							_.each(planes, function(planPago, index){
																		
								var sa = 0;
								var cargoCM 	= 0;
							  if (planPago.descripcion == 'Recibo')
							  {
										sa = Number(parseFloat( planPago.cargo - (planPago.pagoInteres + planPago.pagoIva + planPago.pagoCapital +	planPago.pagoSeguro) ).toFixed(2)); 
										planPago.fechaLimite.setHours(0,0,0,0);
								}		
							  else if (planPago.descripcion == 'Cargo Moratorio')
							  {
								  	sa = Number(parseFloat(planPago.importeRegular).toFixed(2));
								  	planPago.fechaLimite.setHours(1,0,0,0);
								  	cargoCM = Number(planPago.importeRegular + planPago.pago);
							  }
				
								arreglo.push({saldo							: rc.saldo,
															numeroPago  			: planPago.numeroPago,
															cantidad 					: rc.credito.numeroPagos,
															fechaSolicito 		: rc.credito.fechaSolicito,
															fecha 						: planPago.fechaLimite,
															pago  						: 0, 
															cargo 						: planPago.descripcion == "Recibo"? planPago.cargo: cargoCM,
															movimiento 				: planPago.movimiento,
															planPago_id 			: planPago._id,
															credito_id 				: planPago.credito_id,
															descripcion 			: planPago.descripcion,
															importe 					: planPago.importeRegular,
															pagos 						: planPago.pagos,
															notaCredito				: 0,
															saldoActualizado	: planPago.pagos.length == 0 ? planPago.importeRegular : sa
																																																													 
							  	});			
							  		
								if (planPago.pagos.length > 0)
								{
				
									_.each(planPago.pagos,function (pago) {
											rc.pagos_ids.push(pago.pago_id);
									});	
									
									_.each(planPago.pagos,function (pago) {
										
											//Ir por la Forma de Pago
											var formaPago = "";
											var pag = Pagos.findOne(pago.pago_id);
											if (pag != undefined)
											{
												 var ti = TiposIngreso.findOne(pag.tipoIngreso_id);
												 if (ti != undefined)
						 							 formaPago = ti.nombre;
											}
											
											if (planPago.descripcion == 'Recibo')
												rc.abonosRecibos += pago.totalPago;
											else if (planPago.descripcion == "Cargo Moratorio")	
												rc.abonosCargorMoratorios += pago.totalPago;
											
											if (formaPago == 'Nota de Credito')
												rc.sumaNotaCredito 	+= pago.totalPago;	

											arreglo.push({saldo							: rc.saldo,
																		numeroPago 				: planPago.numeroPago,
																		cantidad 					: credito.numeroPagos,
																		fechaSolicito 		: rc.credito.fechaSolicito,
																		fecha 						: pago.fechaPago,
																		pago  						: pago.totalPago, 
																		cargo 						: 0,
																		movimiento 				: planPago.descripcion == "Cargo Moratorio"? "Abono a CM": "Abono",
																		planPago_id 			: planPago._id,
																		credito_id 				: planPago.credito_id,
																		descripcion 			: planPago.descripcion == "Cargo Moratorio"? "Abono a CM": "Abono",
																		importe 					: planPago.importeRegular,
																		pagos 						: planPago.pagos,
																		notaCredito				: formaPago == 'Nota de Credito' ? pago.totalPago : 0,
																		saldoActualizado	: 0
									  	});
									})
								}
							});
							
							rc.saldoGeneral 	= (rc.saldo + rc.saldoMultas ) - ( rc.abonosRecibos + rc.abonosCargorMoratorios );
							
							arreglo.sort(function(a,b){		
								return a.numeroPago - b.numeroPago || new Date(a.fecha) - new Date(b.fecha) ;
							});
							
							_.each(arreglo, function(item, index){
									if (index > 0)
									{
											if (item.descripcion == "Cargo Moratorio")
													rc.saldo += Number(parseFloat(item.cargo).toFixed(2));
											else if  (item.movimiento == "Abono" || item.movimiento == "Abono a CM")
													rc.saldo -= Number(parseFloat(item.pago).toFixed(2));
									}
									item.saldo = rc.saldo;
							});
							
							rc.historial = arreglo;
							$scope.$apply();
							
							$("#modalpagosHistorico").modal();  
	  
	       }
			});
			
	};  
  
  this.isSelected=function(objeto){
   
		
		// if (this.selected_numero === objeto)
		//{
				// console.log("isSelected:", objeto); 	
				 //console.log(objeto,"ATMOSFEARZ")
		//}
		
		
    this.sumarSeleccionados();
      return this.selected_numero===objeto;
      
    

  };
  
  this.buscarNombre=function()
  {

			if (rc.buscar.nombre == "")
			{
					toastr.warning("Proporcione un nombre");
					return;
			}
			
	  	loading(true);
      Meteor.call('getcobranzaNombre', rc.buscar.nombre, function(error, result) {
            if (result)
            {

                rc.cobranza = result;
                rc.totalRecibos = 0;
                rc.totalMultas = 0;
                _.each(rc.cobranza,function(c){
                    if (c.descripcion == "Recibo")
                        rc.totalRecibos = rc.totalRecibos + c.importeRegular;
                    else if (c.descripcion == "Cargo Moratorio")    
                        rc.totalMultas = rc.totalMultas + c.importeRegular;

                });
                $scope.$apply();
                loading(false);
            }
      });
  };  

  this.cambiar = function() 
  {

			var chkxr = document.getElementById('todos');
				
			_.each(rc.cobranza, function(cobranza){
				cobranza.imprimir = chkxr.checked;
				//rc.cobranza.estatus = !rc.estatus.estatus;
			})
			
			this.sumarSeleccionados();
			//console.log(rc.cobranza)
					
	};
	
	this.sumarSeleccionados = function()
	{		
			
		   // rc.selectRecibo = !rc.cobranza.estatus;
			if (rc.cobranza != undefined)
			{
					//console.log(objeto,"caaaaaaa");
					rc.seleccionadoRecibos = 0;
					rc.seleccionadoMultas = 0;
					_.each(rc.cobranza,function(c){
						//console.log(c,"caaaaaaacahuateee")	
							if (c.imprimir == true)
							{
									if (c.descripcion == "Recibo")
											rc.seleccionadoRecibos += c.importeRegular;
									else if (c.descripcion == "Cargo Moratorio")		
											rc.seleccionadoMultas += c.importeRegular;
							}	

					});
			}
	};
	
	this.Seleccionar = function(objeto)
	{
			if (objeto != undefined)
			{
					if (objeto.imprimir)
					{
							if (objeto.descripcion == "Recibo")
									rc.seleccionadoRecibos += objeto.importeRegular;
							else if (objeto.descripcion == "Cargo Moratorio")		
									rc.seleccionadoMultas += objeto.importeRegular;
						
					}
					else
					{
							if (objeto.descripcion == "Recibo")
									rc.seleccionadoRecibos -= objeto.importeRegular;
							else if (objeto.descripcion == "Cargo Moratorio")		
									rc.seleccionadoMultas -= objeto.importeRegular;
						
					}	
			}
	}


	var fecha = moment();
	this.guardarNotaCobranza=function(nota, form){
		
			if(form.$invalid){
		     toastr.error('Faltan Datos.');
		     return;
		  }						
			nota.estatus = true;
			nota.fecha = new Date()
			nota.hora = moment(nota.fecha).format("hh:mm:ss a")
			rc.notaCobranza.usuario_id = Meteor.userId();
			rc.notaCobranza.tipo = "Cobranza"
			Notas.insert(nota);
			this.notaCobranza = {}
			$('#myModal').modal('hide');
			toastr.success('Guardado correctamente.');
	};
	this.mostrarNotaCobranza=function(objeto){
		//console.log("Nota de Cobranza:",objeto)
		rc.notaCobranza.cliente = objeto.cliente.profile.nombreCompleto;
		//rc.notaCobranza.folioCredito = objeto.credito.folio;
		//rc.notaCobranza.recibo = objeto.numeroPago;

	  rc.notaCobranza.cliente_id = objeto.cliente._id;
		//rc.cobranza_id = objeto.credito._id;
		//console.log("rc.cobranza_id",rc.cobranza_id);
		$("#myModal").modal();


	}

	this.mostrarNotaCliente=function(objeto){
		//console.log("Nota de Cliente:",objeto);
		rc.notaCobranza.cliente = objeto.cliente.profile.nombreCompleto;
		//rc.notaCobranza.folioCredito = objeto.credito.folio;
		//rc.notaCobranza.recibo = objeto.numeroPago;
    //rc.cobranza_id = objeto.credito_id;
    rc.notaCobranza.cliente_id = objeto.cliente._id;
    //console.log("rc.cobranza_id",rc.cobranza_id);
    $("#modalCliente").modal();


  }
  this.guardarNotaCliente=function(nota, form){
      //console.log(nota);
      if(form.$invalid){
		     toastr.error('Faltan Datos.');
		     return;
		  }
      
      nota.perfil = "perfil"      
      nota.estatus = true;
      nota.fecha = new Date()
      nota.hora = moment(nota.fecha).format("hh:mm:ss a")
      rc.notaCobranza.usuario_id = Meteor.userId();
      rc.notaCobranza.tipo = "Cliente"
        //rc.notaCobranza.cliente_id = objeto.cliente._id
      rc.notaCobranza.respuesta =  this.respuestaNotaCLiente      
      Notas.insert(nota);
      this.notaCobranza = {}
      $('#modalCliente').modal('hide');
      toastr.success('Guardado correctamente.');
  }
  this.cambioEstatusRespuesta=function(){
    this.respuestaNotaCLiente = !this.respuestaNotaCLiente;
          
  }

  this.mostrarNotaCuenta=function(objeto){
    //console.log(objeto)
    rc.notaCobranza.cliente= objeto.cliente.profile.nombreCompleto 
/*
    rc.notaCobranza.folioCredito = objeto.credito.folio 
    rc.notaCobranza.recibo= objeto.numeroPago
*/
     rc.cobranza_id = objeto.credito._id
     rc.notaCobranza.cliente_id = objeto.cliente._id
     //console.log("rc.cobranza_id",rc.cobranza_id)
     $("#modalCuenta").modal();

  }
  this.guardarNotaCuenta=function(nota, form){
      //console.log(nota);      
      
      if(form.$invalid){
		     toastr.error('Faltan Datos.');
		     return;
		  }
      
      nota.estatus = true;
      nota.fecha = new Date()
      nota.hora = moment(nota.fecha).format("hh:mm:ss a")
      rc.notaCobranza.usuario_id = Meteor.userId();
      rc.notaCobranza.tipo = "Cuenta"
      rc.notaCobranza.respuesta =  this.respuestaNotaCLiente  
       // rc.notaCobranza.cliente_id = objeto.cliente._id
      Notas.insert(nota);
      this.notaCobranza = {}
      $('#modalCuenta').modal('hide');
      toastr.success('Guardado correctamente.');
  }
  
	//CERTIFICACION JUDICIAL
  this.download = function(objeto) 
  {
    
			var cliente = {};
			
			cliente.nombreCompleto = objeto.cliente.profile.nombreCompleto;
			cliente.calle					 = objeto.cliente.profile.calle;
			cliente.numero				 = objeto.cliente.profile.numero;
			cliente.codigoPostal	 = objeto.cliente.profile.codigoPostal;
			
			cliente.codigoPostal	 = objeto.cliente.profile.codigoPostal.toString();
			cliente.colonia_id		 = objeto.cliente.profile.colonia_id;
			
    Meteor.call('getNotificacionJudicial', objeto.credito, cliente, function(error, response) {
       if(error)
       {
        console.log('ERROR :', error);
        return;
       }
       else
       {
              function b64toBlob(b64Data, contentType, sliceSize) {
                  contentType = contentType || '';
                  sliceSize = sliceSize || 512;
                
                  var byteCharacters = atob(b64Data);
                  var byteArrays = [];
                
                  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);
                
                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                      byteNumbers[i] = slice.charCodeAt(i);
                    }
                
                    var byteArray = new Uint8Array(byteNumbers);
                
                    byteArrays.push(byteArray);
                  }
                    
                  var blob = new Blob(byteArrays, {type: contentType});
                  return blob;
              }
              
              var blob = b64toBlob(response, "application/docx");
              var url = window.URL.createObjectURL(blob);
              
              //console.log(url);
              var dlnk = document.getElementById('dwnldLnk');

              dlnk.download = "recordatorios.docx"; 
              dlnk.href = url;
              dlnk.click();       
              window.URL.revokeObjectURL(url);
  
       }
    });

    
  };

  this.downloadCartaUrgente = function(objeto) 
  {
      var cliente = {};
    
			cliente.nombreCompleto = objeto.cliente.profile.nombreCompleto;
			cliente.calle					 = objeto.cliente.profile.calle;
			cliente.numero				 = objeto.cliente.profile.numero;
			cliente.codigoPostal	 = objeto.cliente.profile.codigoPostal;
			
			cliente.codigoPostal	 = objeto.cliente.profile.codigoPostal.toString();
			cliente.colonia_id		 = objeto.cliente.profile.colonia_id;


			loading(true);
    Meteor.call('getcitatorio', objeto.credito, cliente, function(error, response) {
       if(error)
       {
        console.log('ERROR :', error);
        return;
       }
       else
       {
              function b64toBlob(b64Data, contentType, sliceSize) {
                  contentType = contentType || '';
                  sliceSize = sliceSize || 512;
                
                  var byteCharacters = atob(b64Data);
                  var byteArrays = [];
                
                  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);
                
                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                      byteNumbers[i] = slice.charCodeAt(i);
                    }
                
                    var byteArray = new Uint8Array(byteNumbers);
                
                    byteArrays.push(byteArray);
                  }
                    
                  var blob = new Blob(byteArrays, {type: contentType});
                  return blob;
              }
              
              var blob = b64toBlob(response, "application/docx");
              var url = window.URL.createObjectURL(blob);
              
              //console.log(url);
              var dlnk = document.getElementById('dwnldLnk');
							
							loading(false);
							
              dlnk.download = "URGENTE.docx"; 
              dlnk.href = url;
              dlnk.click();       
              window.URL.revokeObjectURL(url);
  
       }
    });

    
  };

  this.downloadCartaCertificado = function(objeto) 
  {
      
    //console.log("entro:", objeto);
     var cliente = {};
    
			cliente.nombreCompleto = objeto.cliente.profile.nombreCompleto;
			cliente.calle					 = objeto.cliente.profile.calle;
			cliente.numero				 = objeto.cliente.profile.numero;
			cliente.codigoPostal	 = objeto.cliente.profile.codigoPostal;
			
			cliente.codigoPostal	 = objeto.cliente.profile.codigoPostal.toString();
			cliente.colonia_id		 = objeto.cliente.profile.colonia_id;

    Meteor.call('getcartaCertificacionPatrimonial', objeto.credito, cliente, function(error, response) {

       if(error)
       {
        console.log('ERROR :', error);
        return;
       }
       else
       {
              function b64toBlob(b64Data, contentType, sliceSize) {
                  contentType = contentType || '';
                  sliceSize = sliceSize || 512;
                
                  var byteCharacters = atob(b64Data);
                  var byteArrays = [];
                
                  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);
                
                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                      byteNumbers[i] = slice.charCodeAt(i);
                    }
                
                    var byteArray = new Uint8Array(byteNumbers);
                
                    byteArrays.push(byteArray);
                  }
                    
                  var blob = new Blob(byteArrays, {type: contentType});
                  return blob;
              }
            var blob = b64toBlob(response, "application/docx");
            var url = window.URL.createObjectURL(blob);
              
              //console.log(url);
              var dlnk = document.getElementById('dwnldLnk');

              dlnk.download = "certificacionPatrimonial.docx"; 
              dlnk.href = url;
              dlnk.click();       
              window.URL.revokeObjectURL(url);
       }
    });

    
  };

  this.imprimirRecibos= function(objeto) 
  {
    var toPrint = [];
		
		 //console.log(objeto);
		
	  if (objeto.length == 0)
    {
	    	toastr.warning("No hay nada para imprimir");
	    	return;
    }
    
    var ban = false;
    _.each(objeto, function(print){
	    	
	    	if (print.imprimir)
	    	{ 
	    		 ban = true;
 				}	 
    });
 
    if (ban == false)
    {
	     toastr.warning("Seleccione alguno para imprimir");
	    	return;
	    
    }
    
		
    _.each(objeto,function(item, key){
      if (item.imprimir) {
	      
 	      
        item.cliente.profile.colonia 		= Colonias.findOne(item.cliente.profile.colonia_id)
        item.colonia 								 		= item.cliente.profile.colonia == undefined ? "" : item.cliente.profile.colonia.nombre;
        item.calle 									 		= item.cliente.profile.calle == undefined ? "" : item.cliente.profile.calle;
        item.cliente.profile.estado  		= Estados.findOne(item.cliente.profile.estado_id)
        item.estado 								 		= item.cliente.profile.estado.nombre == undefined ? "" : item.cliente.profile.estado.nombre;
        item.cliente.profile.municipio 	= Municipios.findOne(item.cliente.profile.municipio_id)
        item.municipio 									= item.cliente.profile.municipio  == undefined ? "" : item.cliente.profile.municipio.nombre;
        item.nombreCompleto 					  = item.cliente.profile.nombreCompleto; 
        item.numeroCliente 						  = item.cliente.profile.folio;
        item.planPagoNumero 						= item.numeroPago;
        item.no 												= item.cliente.profile.numero
        item.nombreCompleto 						= item.cliente.profile.nombreCompleto
        item.telefono 									= item.cliente.profile.telefono
        item.celular 										= item.cliente.profile.celular
        item.telefonoOficina 						= item.cliente.profile.telefonoOficina
        item.cantidadPagos 							= item.credito.numeroPagos
        item.telefono 									= item.cliente.profile.particular
        item.celular  									= item.cliente.profile.celular
        item.telefonoOficina 						= item.cliente.profile.telefonoOficina
        item.folioCredito 							= item.credito.folio
        item.saldo 											= item.credito.saldoActual

          
          if (objeto[key+1]  == undefined) {
            item.proximoPago = "No hay proximo pago"
          }else{
          
         }

        
        var saldoActual = 0;
        if (saldoActual == 0) {
          saldoActual = item.saldo
        }else{
          saldoActual = saldoActual - item.cargo
        }
         item.saldoAnterior = parseFloat(saldoActual.toFixed(2))
         item.saldoActual = parseFloat((saldoActual - item.cargo).toFixed(2));
        toPrint.push(item);
      }
    });
       
    //console.log("reciboooooo:",objeto);

		loading(true);
    Meteor.call('getRecibos', toPrint, 'pdf',function(error, response) {     
       if(error)
       {
        console.log('ERROR :', error);
        loading(false);
        return;
       }
       else
		   {
			   	//console.log(response);
			 		downloadFile(response);
			 		loading(false);
			 }
			 		
			 
			/*
 function b64toBlob(b64Data, contentType, sliceSize) {
          contentType = contentType || '';
          sliceSize = sliceSize || 512;
          var byteCharacters = atob(b64Data);
          var byteArrays = [];
          for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
        
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
        
            var byteArray = new Uint8Array(byteNumbers);
        
            byteArrays.push(byteArray);
          }
            
          var blob = new Blob(byteArrays, {type: contentType});
          return blob;
          }
              
          var blob = b64toBlob(response, "application/docx");
          var url = window.URL.createObjectURL(blob);
          var dlnk = document.getElementById('dwnldLnk');

           dlnk.download = "RECIBOS.docx"; 
          dlnk.href = url;
          dlnk.click();       
          window.URL.revokeObjectURL(url);
   
      }
*/
    
    });
    rc.recibo = [];
    
  };

  this.cerrarModal= function() {
    rc.mostrarModal = false

  };
   
  this.funcionOrdenar = function() {
    
      if (this.valorOrdenar == "Folio")
          return ['credito.folio','numeroPago'];
      if (this.valorOrdenar == "Fecha")
          return ['fechaLimite'];
      if (this.valorOrdenar == "Cliente")
          return ['cliente.profile.nombreCompleto', 'credito.folio', 'numeroPago'];    
  }

  this.aparecerCheck = function() {
    rc.conRespuesta = !rc.conRespuesta;
  };

  this.imprimirListas= function(lista) 
  {

    var toPrint = [];
    
    //console.log(lista,"lista")
    
    if (lista.length == 0)
    {
	    	toastr.warning("No ha seleccionado nada para imprimir");
	    	return;
    }
		
		var ban = false;
    _.each(lista, function(print){
	    	
	    	if (print.imprimir)
	    	{ 
	    		 ban = true;
 				}	 
    });
 
    if (ban == false)
    {
	     toastr.warning("Seleccione alguno para imprimir");
	    	return;
	    
    }
		
		
	  _.each(lista,function(item){
	      if (item.imprimir) {
	      item.folioCredito	 	= item.credito.folio;
	      item.nombreCompleto = item.cliente.profile.nombreCompleto;
	      item.numeroCliente 	= item.cliente.profile.numeroCliente;
	      toPrint.push(item);
	    };

    });

    //console.log(lista,"lista")
		
		loading(true);
		Meteor.call('getListaCobranza', toPrint, 'pdf', function(error, response) {

			   if(error)
			   {
			    console.log('ERROR :', error);
			    loading(false);
			    return;
			   }
			   else
			   {
				   	//console.log(response);
				 		downloadFile(response);
				 		loading(false);
				 }
		});
		
    /*
Meteor.call('getListaCobranza', toPrint, function(error, response) {     
       if(error)
       {
        console.log('ERROR :', error);
        return;
       }
       else
       {
      function b64toBlob(b64Data, contentType, sliceSize) {
          contentType = contentType || '';
          sliceSize = sliceSize || 512;
          var byteCharacters = atob(b64Data);
          var byteArrays = [];
          for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
        
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
        
            var byteArray = new Uint8Array(byteNumbers);
        
            byteArrays.push(byteArray);
          }
            
          var blob = new Blob(byteArrays, {type: contentType});
          return blob;
          }
              
          var blob = b64toBlob(response, "application/docx");
          var url = window.URL.createObjectURL(blob);
          var dlnk = document.getElementById('dwnldLnk');

           dlnk.download = "LISTACOBRANZA.docx"; 
          dlnk.href = url;
          dlnk.click();       
          window.URL.revokeObjectURL(url);
   
      }
    
    });
*/

  };

  this.imprimirHistorial= function(objeto,cliente,credito) 
  {
    cliente = rc.cliente.profile;			
		loading(true);
		Meteor.call('imprimirHistorialVales', objeto, cliente, credito, 'pdf', rc.saldoMultas, rc.abonosRecibos, rc.abonosCargorMoratorios, rc.saldoGeneral, rc.sumaNotaCredito, function(error, response) {
			   if(error)
			   {
			    console.log('ERROR :', error);
			    loading(false);
			    return;
			   }
			   else
			   {
				 		downloadFile(response);
				 		loading(false);
				 }
		});
  };
  
  this.imprimirEstadoCuenta= function(objeto) 
  {
		//console.log(objeto);    
    Meteor.call('getPeople',objeto.distribuidor._id, function(error, result)
    {                     
        if (result)
        {
	        
	        Number.prototype.format = function(n, x) {
					    var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
					    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
					};
	        
	        
					var fecha = rc.getReactively("fechaInicial");
					var n = fecha.getDate();
					var fechaCorte = "";
					
					if (n < 15) 
					{
							fechaCorte = new Date(fecha.getFullYear(),fecha.getMonth(),7,0,0,0,0);
					}
					else //if (n >= 5 && n < 20)		
					{
							fechaCorte = new Date(fecha.getFullYear(),fecha.getMonth(),22,0,0,0,0);
					}        
	        
          
          
          objeto.cliente = result;
          
          var datos = {};
					
					
			    var sumaCargos = 0;
			    var sumaAbonos = 0;
			    var sumaAbonosCM = 0;
			    
			    datos.fechaCorte		= fechaCorte;
					
					datos.distribuidor 	= objeto.cliente.profile.nombreCompleto;
					datos.direccion 		= objeto.cliente.profile.calle + 
																' #' + objeto.cliente.profile.numero + 
																' Col.' + objeto.cliente.profile.coloniaCliente.nombre + 
																' CP:' + objeto.cliente.profile.codigoPostal;
																
					datos.telefonos 		= objeto.cliente.profile.celular + ' y ' + objeto.cliente.profile.particular;

					datos.limiteCredito	= '$' + Number(objeto.cliente.profile.limiteCredito).format(2);
					datos.disponible		= '$' + Number(objeto.cliente.profile.limiteCredito - (objeto.cliente.profile.limiteCredito - objeto.cliente.profile.saldoCredito)).format(2);
					datos.saldo					= '$' + Number(objeto.cliente.profile.limiteCredito - objeto.cliente.profile.saldoCredito).format(2);
					
					datos.aLiberar			= 0;
			    
			    datos.planPagos			= [];
			    			    
			    datos.prestamos 			= 0;
			    datos.saldoAnterior 	= 0;
			    datos.pagoVigente 		= 0;
			    datos.saldoActual			= 0;
			    
			    var sumaConComision  	= 0;
			    var sumaSinComision  	= 0;
			    var sumaBonificacion  = 0;
			    var cargosMoratorios 	= 0;
			    
			    _.each(objeto.planPagos, function(pp){
				    	var pago = {};
				    	
				    	pago.beneficiario 			= pp.beneficiario;
				    	pago.folio							= pp.folio;
				    	pago.fechaLimite				= pp.fechaLimite;
				    	pago.numeroPagos				= pp.numeroPago.toString() + "-" + pp.numeroPagos.toString();
				    	
				    	datos.prestamos				 += Number(parseFloat(pp.adeudoInicial).toFixed(2));
				    	datos.saldoAnterior		 += Number(parseFloat(pp.saldoActual).toFixed(2));
				    	datos.pagoVigente			 += Number(parseFloat(pp.importeRegular).toFixed(2));
				    	datos.saldoActual			 += Number(parseFloat(pp.saldoActual - pp.importeRegular).toFixed(2));
				    	
				    	pago.adeudoInicial			= '$' + Number(pp.adeudoInicial).format(2);
				    	pago.saldoAnterior			= '$' + Number(pp.saldoActual).format(2);
				    	pago.saldoActual				= '$' + Number(parseFloat(pp.saldoActual - pp.importeRegular).toFixed(2)).format(2); 	
				    	
				    	pago.impReg							= '$' + Number(pp.importeRegular).format(2);
				    	
				    	datos.aLiberar				 += Number(parseFloat(pp.capital).toFixed(2));
							
							if (pp.movimiento == "Recibo")
							{
									//NO SUMAR iva y Seguro
									if (pp.bonificacion > 0)
									{
											sumaBonificacion	+= Number(parseFloat(pp.capital + pp.interes).toFixed(2));
											sumaConComision		+= Number(parseFloat(pp.importeRegular).toFixed(2));
									}
										  
									else 
										 sumaSinComision		+= Number(parseFloat(pp.importeRegular).toFixed(2));				
									pago.tipo = "V";	 
									
							}
							else if (pp.movimiento == "Cargo Moratorio")
							{
									cargosMoratorios += pp.importeRegular;
									pago.tipo = "CM";
							} 
							datos.planPagos.push(pago);
			    });
			   
			    datos.aLiberar				= '$' + Number(datos.aLiberar).format(2);
			    
			    datos.prestamos			  = '$' + Number(datos.prestamos).format(2);
		    	datos.saldoAnterior	  = '$' + Number(datos.saldoAnterior).format(2);
		    	datos.pagoVigente		  = '$' + Number(datos.pagoVigente).format(2);
		    	datos.saldoActual		  = '$' + Number(datos.saldoActual).format(2);
		    				    
			    //Obtener el dia del mes para saber si pongo los dias... del 3 al 7 o del 18 al 22
			    
					var dia = rc.fechaInicial.getDate();
					var mes = rc.fechaInicial.getMonth();
					
					var configuracion = Configuraciones.findOne();
					var arregloComisiones = configuracion.arregloComisiones;
			    
			    datos.comisiones = [];
			    
			    if (dia >= 22 || dia <= 6)
			    {
				    	
				    	if (dia >= 22)
					    	 mes = mes + 1;
					    	 
					    datos.fechaLimitePago	= new Date(rc.fechaInicial.getFullYear(),mes, 6);	 
				    	
							for (i = 1; i <= 5 ; i++)
				    	{	
					    		var comisiones = {};
					    		
					    							    		
					    		_.each(arregloComisiones, function(c){
						    			if (c.numero == i + 1)
						    			{
							    				comisiones.porcentaje 	= c.porcentaje;
							    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, c.valor1);
						    			}						    			
					    		});
					    		
					    		/*
if (i == 1)
					    		{
					    				comisiones.porcentaje 	= 15;
					    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, 3);
					    				
					    		}		
					    		else if (i == 2)
					    		{
					    				comisiones.porcentaje 	= 14;
					    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, 4);
					    				//comisiones.totalGral 		= sumaConComision;
					    		}
					    		else if (i == 3)
					    		{
					    				comisiones.porcentaje 	= 13;
					    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, 5);
					    				//comisiones.totalGral 		= sumaConComision;
					    		}
					    		else if (i == 4)
					    		{
					    				comisiones.porcentaje 	= 9;
					    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, 6);
					    				//comisiones.totalGral 		= sumaConComision;
					    		}
					    		else if (i == 5)
					    		{
					    				comisiones.porcentaje 	= 7;
					    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, 7);
					    				//comisiones.totalGral 		= sumaConComision;
					    		}
*/
					    		
					    		comisiones.totalGral 				= sumaConComision;
					    		comisiones.comision 				= '$ ' + Number(parseFloat(sumaBonificacion * (comisiones.porcentaje/100)).toFixed(2));
					    		comisiones.totalConComision = '$ ' + Number(parseFloat(sumaConComision).toFixed(2)).format(2);
					    		comisiones.totalSinComision	= '$ ' + Number(sumaSinComision).format(2);
					    		comisiones.seguro						= '$ ' + Number(objeto.seguro).format(2);
					    		comisiones.cargosMoratorios = '$ ' + Number(parseFloat(cargosMoratorios).toFixed(2));
					    		
					    		comisiones.aPagar 					= '$ ' + Number(parseFloat(sumaConComision + sumaSinComision + objeto.seguro + cargosMoratorios 
					    																													 - (sumaBonificacion * (comisiones.porcentaje/100) )).toFixed(2)).format(2);
					    		
					    		comisiones.porcentaje				= comisiones.porcentaje + '%';
									
					    		datos.comisiones.push(comisiones);
				    	}  		  	
				    	
			    }
			    else
			    {
				    	datos.fechaLimitePago	= new Date(rc.fechaInicial.getFullYear(), mes, 21);
				    	
				    	for (i = 1; i <= 5 ; i++)
				    	{	
					    		var comisiones = {};
					    		
					    		_.each(arregloComisiones, function(c){
						    			if (c.numero == i + 1)
						    			{
							    				comisiones.porcentaje 	= c.porcentaje;
							    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, c.valor2);
						    			}						    			
					    		});
					    		
					    		/*

					    		if (i == 1)
					    		{
					    				comisiones.porcentaje 	= 15;
					    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, 18);
					    				
					    		}		
					    		else if (i == 2)
					    		{
					    				comisiones.porcentaje 	= 14;
					    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, 19);
					    				//comisiones.totalGral 		= sumaConComision;
					    		}
					    		else if (i == 3)
					    		{
					    				comisiones.porcentaje 	= 13;
					    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, 20);
					    				//comisiones.totalGral 		= sumaConComision;
					    		}
					    		else if (i == 4)
					    		{
					    				comisiones.porcentaje 	= 9;
					    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, 21);
					    				//comisiones.totalGral 		= sumaConComision;
					    		}
					    		else if (i == 5)
					    		{
					    				comisiones.porcentaje 	= 7;
					    				comisiones.diaDepositar = new Date(rc.fechaInicial.getFullYear(),mes, 22);
					    				//comisiones.totalGral 		= sumaConComision;
					    		}
*/
					    		
					    		comisiones.totalGral 				= sumaConComision;
					    		comisiones.comision 				= '$ ' + Number(parseFloat(sumaBonificacion * (comisiones.porcentaje/100))).format(2);
					    		comisiones.totalConComision = '$ ' + Number(parseFloat(sumaConComision).toFixed(2)).format(2);
					    		comisiones.totalSinComision	= '$ ' + Number(sumaSinComision).format(2);
					    		comisiones.seguro						= '$ ' + Number(objeto.seguro).format(2);
					    		comisiones.cargosMoratorios = '$ ' + Number(parseFloat(cargosMoratorios).toFixed(2)).format(2);
 					    		
					    		comisiones.aPagar 					= '$ ' + Number(parseFloat(sumaConComision + sumaSinComision + objeto.seguro + cargosMoratorios 
					    																													 - (sumaBonificacion * (comisiones.porcentaje/100) )).toFixed(2)).format(2);
					    		
					    		comisiones.porcentaje				= comisiones.porcentaje + '%';
									
									
					    		datos.comisiones.push(comisiones);
				    	} 
				    	
			    }
			    
					loading(true);
					Meteor.call('report', {
			      templateNombre: "EstadoCuentaDistribuidor",
			      reportNombre: objeto.cliente.profile.numeroCliente,
			      type: 'pdf',  
			      datos: datos,
				    }, function(err, file) {
				      if(!err){
								loading(false);
								$("#modalVerListado").modal('hide');
				        downloadFile(file);
				        
				      }else{
				        toastr.warning("Error al generar el reporte");
				      }
				  });		
        }
    });
  };
    
  this.checkValue1 = function() 
  {
    expect(element(by.repeater('credito in rc.historialDelCredito').row(0).column('credito')).getAttribute('class')).
      toMatch(/odd/);
    expect(element(by.repeater('credito in rc.historialDelCredito').row(1).column('credito')).getAttribute('class')).
      toMatch(/even/);
  };
  
  this.imprimirVales = function(objeto)
  {
			
      //console.log(objeto);
      
      var dia  = rc.fechaInicial.getDate();
      var mes  = rc.fechaInicial.getMonth();
      var anio = rc.fechaInicial.getFullYear();
      
      //console.log("DisT:", objeto.distribuidor._id);
      //console.log("Fecha:", dia, mes, anio);
      
      var url = $state.href("anon.ticketValesDistribuidor", { distribuidor_id: objeto.distribuidor._id, dia: dia, mes: mes, anio: anio }, { newTab: true });
		  window.open(url, '_blank');
      
      
      /*

      
      function currency(value, decimals, separators) {
			    decimals = decimals >= 0 ? parseInt(decimals, 0) : 2;
			    separators = separators || ['.', "'", ','];
			    var number = (parseFloat(value) || 0).toFixed(decimals);
			    if (number.length <= (4 + decimals))
			        return number.replace('.', separators[separators.length - 1]);
			    var parts = number.split(/[-.]/);
			    value = parts[parts.length > 1 ? parts.length - 2 : 0];
			    var result = value.substr(value.length - 3, 3) + (parts.length > 1 ?
			        separators[separators.length - 1] + parts[parts.length - 1] : '');
			    var start = value.length - 6;
			    var idx = 0;
			    while (start > -3) {
			        result = (start > 0 ? value.substr(start, 3) : value.substr(0, 3 + start))
			            + separators[idx] + result;
			        idx = (++idx) % 2;
			        start -= 3;
			    }
			    return (parts.length == 3 ? '-' : '') + result;
			}
			
			var vales = objeto.planPagos;
			
			
			if (vales != undefined)
			{
					_.each(vales, function(pago){
						
		        var fecha = new Date();
						var n = fecha.getDate();
						var mes = fecha.getMonth();
					
						var fechaPago = pago.fechaLimite;
						var nfp = fechaPago.getDate();
						var mesfp = fechaPago.getMonth();
						
						var comision = 0;
						
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
								}	
						}
		        
		        pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);
		        
		        var cre = Creditos.findOne({_id: pago.credito_id});
		        
		        //getBeneficiario
		        
		        //pago.beneficiario =  cre.beneficiario;
					
		        var user = Meteor.users.findOne(cre.cliente_id);
		        pago.distribuidor = user.profile.nombreCompleto;
		        
		        pago.saldo = Number(parseFloat(pago.importeRegular - pago.bonificacion).toFixed(2));
		        
		        if (pago.descripcion == "Recibo")
		        		rc.subtotal +=  pago.importeRegular;
		        else if (pago.descripcion == "Cargo Moratorio")
		        {
		        		rc.cargosMoratorios +=  pago.importeRegular;
		        		//console.log("Entro: CM", pago)
		        }
		        pago.folio = cre.folio;
		        
		       	var fecha = new Date();
					 	pago.fecha = fecha.getDate()+'/'+(fecha.getMonth()+1)+'/'+fecha.getFullYear();
					 	
					 	var fechaLimite = new Date(pago.fechaLimite);
		       	pago.fechaV = fechaLimite.getDate()+'/'+(fechaLimite.getMonth()+1)+'/'+ fechaLimite.getFullYear();
					 	
		       	pago.importe = currency(pago.importeRegular, 2, [',', "'", '.']);
		       	pago.noPago = pago.numeroPago; 
		        
		        pago.saldoNuevo = currency(Number(parseFloat(cre.saldoActual - pago.importeRegular).toFixed(2)), 2, [',', "'", '.']);
		        
		        
		        				      								
		      });
					
			}		
			var datos = {};
			datos.vales = vales;
			
			loading(true);
			Meteor.call('report', {
	      templateNombre: 'vales',
	      reportNombre: 'valesOut',
	      type: 'pdf',  
	      datos: datos,
		    }, function(err, file) {
		      if(!err){
		        downloadFile(file);
		      }else{
		        toastr.warning("Error al generar el reporte");
		      }
		      loading(false);
		  });
		  
	
*/
  }

  function round(value, decimals) {
		  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	} 
};