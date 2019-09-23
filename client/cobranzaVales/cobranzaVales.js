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
  rc.buscar.nombreCompleto = "";
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

  rc.totalVales 							= 0;
  rc.totalCreditosPersonales	= 0;
  rc.totalCargosMoratorios 		= 0;

  rc.seleccionadoVales 							= 0;
  rc.seleccionadoCreditosPersonales = 0;
  rc.seleccionadoCargosMoratorios		= 0;

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

	/////////////////////////////////////
	rc.arregloCortes	   	= [];
	rc.planPagosCortes	 	= [];
	rc.creditoCortes			= [];
	rc.creditoPCortes			= [];
	rc.pagosCortes				= [];
	
	rc.selected_numero 	 	= 0;
	
	rc.banV								= false;
	rc.selected_numeroV 	= 0;
	
	rc.banC					 			= false;
	rc.selected_numeroC 	= 0; 
	
	rc.banCP					 		= false;
	rc.selected_numeroCP 	= 0; 
	
	rc.banP					 			= false;
	rc.selected_numeroP 	= 0; 
	
	rc.seleccionCredito_id = "";
	
	/////////////////////////////////////

  this.subscribe("tiposCredito", ()=>{
    return [{}]
  });
  
  this.subscribe('pagos',()=>{
		return [{ _id : { $in : rc.getReactively("pagos_ids")}}];
	});
  
  this.subscribe("estadoCivil", ()=>{
    return [{estatus : true}]
  });
  
  this.subscribe("diasInhabiles", ()=>{
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
/*

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
  
*/
  this.subscribe('tiposIngreso',()=>{
		return [{}] 
	});

  this.subscribe('notas',()=>{
    return [{cliente_id:this.getReactively("cliente_id"),}]
  });

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
    historialCredito : () => {
      var creditos = [];
      rc.clientes_id = _.pluck(rc.cobranza,"cliente._id")
      return creditos
      
    },
    cobranza :() =>{
		  
		  var fecha = rc.getReactively("fechaInicial");
		  if (fecha != undefined)
		  {
		  	
		  	//Revisar dia inhabil para buscar la próximo Fecha
		  	verificarDiaInhabil = function(fecha){
						var diaFecha = fecha.isoWeekday();
						var diaInhabiles = DiasInhabiles.find({tipo: "DIA", estatus: true}).fetch();
						var ban = false;
						_.each(diaInhabiles, function(dia){
								if (Number(dia.dia) === diaFecha)
								{
									 ban = true;	
									 return ban;							 
								}	 
						})
						var fechaBuscar = new Date(fecha);
						
						var fechaInhabil = DiasInhabiles.findOne({tipo: "FECHA", fecha: fechaBuscar, estatus: true});
						if (fechaInhabil != undefined)
						{
							 ban = true;
							 return ban;	
						}
						return ban;
				};
		  	
				var n = fecha.getDate();
				var fechaLimite = "";
				
				if (n >= 22)
				{
						fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,1,0,0,0,0);		
				}
				else if (n < 7) 
				{
						fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),1,0,0,0,0);
				}
				else if (n >= 7 && n < 22)		
				{
						fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),16,0,0,0,0);
				}
								
				var validaFecha = true;
			  var fechaValidar = moment(fechaLimite);
			  while(validaFecha)
			  {		
						validaFecha = verificarDiaInhabil(fechaValidar);
						if (validaFecha == true)
									fechaValidar = fechaValidar.add(1, 'days');					 
			  }
			  			  
			  fechaLimite = new Date(fechaValidar);
			  fechaLimite.setHours(0,0,0,0);

		    this.fechaFinal = new Date(fechaLimite.getTime());
		    this.fechaFinal.setHours(23,59,59,999);

		    FI = fechaLimite;
		    FF = this.fechaFinal;
		    rc.verRecibos = true;
		    
		    //console.log(FI);
		    //console.log(FF);
		    
		    loading(true);
		    Meteor.call('getCobranzaVales', FI, FF, 1, Meteor.user().profile.sucursal_id, function(error, result) {           
		          if (result)
		          {
		              rc.cobranza = result;
		              rc.totalVales 							= 0;
									rc.totalCreditosPersonales	= 0;
									rc.totalCargosMoratorios 		= 0;
									
		              _.each(rc.cobranza,function(c){                    
		                    rc.totalVales 							+= c.importe;
												rc.totalCreditosPersonales	+= c.importeCreditoP;
												rc.totalCargosMoratorios 		+= c.cargosMoratorios;
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
    
  /*
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
          
      } 
      else if (op == 1) //Día
      {
	      	var fecha = rc.getReactively("fechaInicial");
					var n = fecha.getDate();
					var fechaLimite = "";
					
					if (n >= 22)
					{
							fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,1,0,0,0,0);		
					}
					else if (n < 7) 
					{
							fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),1,0,0,0,0);
					}
					else if (n >= 7 && n < 22)		
					{
							fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),16,0,0,0,0);
					}
									
					var validaFecha = true;
				  var fechaValidar = moment(fechaLimite);
				  while(validaFecha)
				  {		
							validaFecha = verificarDiaInhabil(fechaValidar);
							if (validaFecha == true)
										fechaValidar = fechaValidar.add(1, 'days');					 
				  }
				  			  
				  fechaLimite = new Date(fechaValidar);
				  fechaLimite.setHours(0,0,0,0);
	
			    this.fechaFinal = new Date(fechaLimite.getTime());
			    this.fechaFinal.setHours(23,59,59,999);
	
			    FI = fechaLimite;
			    FF = this.fechaFinal;
			    rc.verRecibos = true;
					
					if (n < 15) 
					{
							fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth(),30,0,0,0,0);
					}
					else //if (n >= 5 && n < 20)		
					{
							fechaLimite = new Date(fecha.getFullYear(),fecha.getMonth() + 1,15,0,0,0,0);
					}
					

					
					fechaLimite.setHours(0,0,0,0);
				  
			    this.fechaFinal = new Date(fechaLimite.getTime());
			    this.fechaFinal.setHours(23,59,59,999);
			    FI = fechaLimite;
			    FF = this.fechaFinal;	      
          
          
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
            
      loading(true);
      Meteor.call('getCobranzaVales', FI, FF, op, Meteor.user().profile.sucursal_id, function(error, result) {           
          if (result)
          {
              
              rc.cobranza = result;
              rc.totalVales 							= 0;
							rc.totalCreditosPersonales	= 0;
							rc.totalCargosMoratorios 		= 0;
							
              _.each(rc.cobranza,function(c){                    
                    rc.totalVales 							+= c.importe;
										rc.totalCreditosPersonales	+= c.importeCreditoP;
										rc.totalCargosMoratorios 		+= c.cargosMoratorios;
              });

              $scope.$apply();
              loading(false);
          }
      }); 
      
      
  }
*/
  
  //----------------------------------------
  
  this.selCredito=function(objeto, num)
  {
			
			//console.log("distr:", objeto);
			
			rc.planPagos = objeto.planPagos;
			
			rc.arregloCortes = _.toArray(objeto.arreglo);
			//console.log(rc.arregloCortes);
			
			//ordenar ArregloCortes
			rc.arregloCortes.sort(function (a, b) {
			  if (a.numeroCorte < b.numeroCorte) {
			    return 1;
			  }
			  if (a.numeroCorte > b.numeroCorte) {
			    return -1;
			  }
			  // a must be equal to b
			  return 0;
			});

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
				                  	//console.log("R:", result)
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
  
  this.isSelected=function(objeto){
    this.sumarSeleccionados();
      return this.selected_numero===objeto;
  };
  
	//----------------------------------------
  this.getPagos = function(objeto)
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
			
			Meteor.call ("getCreditos", objeto.cliente._id, function(error,result){
	
					if (error)
					{
						console.log(error);
						toastr.error('Error al obtener pagos: ', error.details);
						loading(false);
						return;
					}
					if (result)
					{
						var cre = result;
						 
						if(cre != undefined)
						{
							var arregloCreditos = {};
							var arregloVales 		= {};
							
							rc.creditos_id = _.pluck(cre, "_id");
							
							_.each(cre, function(c){						
									
									if (c.tipo == "vale")
									{
									
												Meteor.call('getBeneficiario', c.beneficiario_id, function(error, result) {           
										          if (result)
										          {
										          		c.beneficiario = result;
										          		$scope.$apply();
															}
												});
																		
												var mes = c.fechaEntrega != undefined ? c.fechaEntrega.getMonth(): 0;
												var numeroCorte = 0;
												
												if (c.fechaEntrega.getDate() >= 7 && c.fechaEntrega.getDate() <= 21) 
												{	
														numeroCorte = (mes + 1) * 2 - 1;									
														var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes, 07)
														var fechaCorteFin		 = new Date(c.fechaEntrega.getFullYear(), mes, 21);	
												}	 
												else if (c.fechaEntrega.getDate() > 0 && c.fechaEntrega.getDate() < 7)	
												{
														if (mes == 0)
																numeroCorte = 0;
														else
																numeroCorte = (mes + 1) * 2 - 2;
														
														var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes - 1, 22);	
														var fechaCorteFin 	 = new Date(c.fechaEntrega.getFullYear(), mes, 06);
												}
												else if (c.fechaEntrega.getDate() > 21)
												{
														if (mes == 11)
																numeroCorte = 0;
														else
																numeroCorte = (mes + 1) * 2 - 1 + 1;
						
														var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes, 22);	
														var fechaCorteFin 	 = new Date(c.fechaEntrega.getFullYear(), mes + 1, 06);
												}
												//console.log("nCorte:", numeroCorte);
												
												if (arregloVales[numeroCorte] == undefined )
												{
														arregloVales[numeroCorte] = {};
														arregloVales[numeroCorte].numeroCorte 				= numeroCorte;	
														arregloVales[numeroCorte].fechaCorteInicio 	= fechaCorteInicio;
														arregloVales[numeroCorte].fechaCorteFin 			= fechaCorteFin;
														arregloVales[numeroCorte].capitalSolicitado 	=	c.capitalSolicitado;
														arregloVales[numeroCorte].adeudoInicial 			=	c.adeudoInicial;
														arregloVales[numeroCorte].saldoActual 				=	c.saldoActual;
														arregloVales[numeroCorte].cargosMoratorios 	=	c.saldoMultas;
														
														arregloVales[numeroCorte].creditosHistorial 	= [];
														arregloVales[numeroCorte].creditosHistorial.push(c);
						
												}
												else
												{
						
														arregloVales[numeroCorte].capitalSolicitado 	+=	Number(parseFloat(c.capitalSolicitado).toFixed(2));
														arregloVales[numeroCorte].adeudoInicial 			+=	Number(parseFloat(c.adeudoInicial).toFixed(2));
														arregloVales[numeroCorte].saldoActual 				+=	Number(parseFloat(c.saldoActual).toFixed(2));
														arregloVales[numeroCorte].cargosMoratorios 	+=	Number(parseFloat(c.saldoMultas).toFixed(2));
														
														arregloVales[numeroCorte].creditosHistorial.push(c);
												}
									}			
									else
									{
																		
												var mes = c.fechaEntrega != undefined ? c.fechaEntrega.getMonth(): 0;
												var numeroCorte = 0;
												
												if (c.fechaEntrega.getDate() >= 7 && c.fechaEntrega.getDate() <= 21) 
												{	
														numeroCorte = (mes + 1) * 2 - 1;									
														var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes, 07)
														var fechaCorteFin		 = new Date(c.fechaEntrega.getFullYear(), mes, 21);	
												}	 
												else if (c.fechaEntrega.getDate() > 0 && c.fechaEntrega.getDate() < 7)	
												{
														if (mes == 0)
																numeroCorte = 0;
														else
																numeroCorte = (mes + 1) * 2 - 2;
														
														var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes - 1, 22);	
														var fechaCorteFin 	 = new Date(c.fechaEntrega.getFullYear(), mes, 06);
												}
												else if (c.fechaEntrega.getDate() > 21)
												{
														if (mes == 11)
																numeroCorte = 0;
														else
																numeroCorte = (mes + 1) * 2 - 1 + 1;
						
														var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes, 22);	
														var fechaCorteFin 	 = new Date(c.fechaEntrega.getFullYear(), mes + 1, 06);
												}
												
												if (arregloCreditos[numeroCorte] == undefined )
												{
														arregloCreditos[numeroCorte] = {};
														arregloCreditos[numeroCorte].numeroCorte 				= numeroCorte;	
														arregloCreditos[numeroCorte].fechaCorteInicio 	= fechaCorteInicio;
														arregloCreditos[numeroCorte].fechaCorteFin 			= fechaCorteFin;
														arregloCreditos[numeroCorte].capitalSolicitado 	=	c.capitalSolicitado;
														arregloCreditos[numeroCorte].adeudoInicial 			=	c.adeudoInicial;
														arregloCreditos[numeroCorte].saldoActual 				=	c.saldoActual;
														arregloCreditos[numeroCorte].cargosMoratorios 	=	c.saldoMultas;
						
														arregloCreditos[numeroCorte].creditosHistorial 	= [];
														arregloCreditos[numeroCorte].creditosHistorial.push(c);
						
												}
												else
												{
						
														arregloCreditos[numeroCorte].capitalSolicitado 	+=	Number(parseFloat(c.capitalSolicitado).toFixed(2));
														arregloCreditos[numeroCorte].adeudoInicial 			+=	Number(parseFloat(c.adeudoInicial).toFixed(2));
														arregloCreditos[numeroCorte].saldoActual 				+=	Number(parseFloat(c.saldoActual).toFixed(2));
														arregloCreditos[numeroCorte].cargosMoratorios 	+=	Number(parseFloat(c.saldoMultas).toFixed(2));
						
														arregloCreditos[numeroCorte].creditosHistorial.push(c);
												}
									}
									
									/*

									Meteor.call('getBeneficiario', c.beneficiario_id, function(error, result) {           
							          if (result)
							          {
							          		c.beneficiario = result;
							          		$scope.$apply();
												}
									});
									
									//console.log(c.fechaEntrega);
									var mes = c.fechaEntrega != undefined ? c.fechaEntrega.getMonth(): 0;
									//Meterlo al arregloCortes
									var numeroCorte = 0;
									if (c.fechaEntrega.getDate() >= 7 && c.fechaEntrega.getDate() <= 21) 
									{	
											numeroCorte = (mes + 1) * 2 - 1;									
											var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes - 1, 07)
											var fechaCorteFin		 = new Date(c.fechaEntrega.getFullYear(), mes, 21);	
											
									}	 
									else if (c.fechaEntrega.getDate() > 0 && c.fechaEntrega.getDate() < 7)	
									{
											if (mes == 0)
													numeroCorte = 0;
											else
													numeroCorte = (mes + 1) * 2 - 2;
											var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes - 1, 22);	
											var fechaCorteFin 	 = new Date(c.fechaEntrega.getFullYear(), mes, 06);
									}
									else if (c.fechaEntrega.getDate() > 21)
									{
											if (mes == 11)
													numeroCorte = 0;
											else
													numeroCorte = (mes + 1) * 2 - 1 + 1;
											var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes, 22);	
											var fechaCorteFin 	 = new Date(c.fechaEntrega.getFullYear(), mes + 1, 06);
									}
									
									
									if (arregloCreditos[numeroCorte] == undefined )
									{
											arregloCreditos[numeroCorte] = {};
											arregloCreditos[numeroCorte].numeroCorte 				= numeroCorte;	
											arregloCreditos[numeroCorte].beneficiario 			= c.beneficiario;	
											arregloCreditos[numeroCorte].fechaCorteInicio 	= fechaCorteInicio;
											arregloCreditos[numeroCorte].fechaCorteFin 			= fechaCorteFin;
											arregloCreditos[numeroCorte].capitalSolicitado 	=	c.capitalSolicitado;
											arregloCreditos[numeroCorte].adeudoInicial 			=	c.adeudoInicial;
											arregloCreditos[numeroCorte].saldoActual 				=	c.saldoActual;
											arregloCreditos[numeroCorte].cargosMoratorios 	=	c.saldoMultas;
			
											arregloCreditos[numeroCorte].creditosHistorial 	= [];
											arregloCreditos[numeroCorte].creditosHistorial.push(c);
			
									}
									else
									{
			
											arregloCreditos[numeroCorte].capitalSolicitado 	+=	Number(parseFloat(c.capitalSolicitado).toFixed(2));
											arregloCreditos[numeroCorte].adeudoInicial 			+=	Number(parseFloat(c.adeudoInicial).toFixed(2));
											arregloCreditos[numeroCorte].saldoActual 				+=	Number(parseFloat(c.saldoActual).toFixed(2));
											arregloCreditos[numeroCorte].cargosMoratorios 	+=	Number(parseFloat(c.saldoMultas).toFixed(2));
			
											arregloCreditos[numeroCorte].creditosHistorial.push(c);
									}
*/
									
							});
							
							rc.creditoCortes 	= _.toArray(arregloVales);
							rc.creditoPCortes = _.toArray(arregloCreditos);
							
							//rc.creditoCortes = _.toArray(arregloCreditos);
							
							//Ordena el arreglo
							rc.creditoCortes.sort(function (a, b) {
							  if (a.numeroCorte < b.numeroCorte) {
							    return 1;
							  }
							  if (a.numeroCorte > b.numeroCorte) {
							    return -1;
							  }
							  // a must be equal to b
							  return 0;
							});
						 
						 
						 $scope.$apply();
						 loading(false);							
					}
					}	
			});


  }
  
  this.verPagos= function(pago) {
	  
		rc.pagoPlanPago = pago.planPagos;		
		rc.pago					= pago;
		//console.log(pago);
		var arreglo = {};
		//Meterlo al arregloCortes
		_.each(pago.planPagos, function(pp)
		{
		
				var numeroCorte = 0;
				if (pp.fechaLimite.getDate() >= 16)
				{	
						numeroCorte = pp.fechaLimite.getMonth() * 2;									
						var fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() -1, 22);
						var fechaCorteFin		 = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth(), 06);	
						
				}	 
				else	
				{
						var m = pp.fechaLimite.getMonth();
						if (m == 0)
						{
								numeroCorte = 12 * 2 - 1;							
								var fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), 11, 07);	
								var fechaCorteFin 	 = new Date(pp.fechaLimite.getFullYear(), 11, 21);
						}
						else
						{
								numeroCorte = pp.fechaLimite.getMonth() * 2 - 1;							
								var fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 07);	
								var fechaCorteFin 	 = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 21);
						}
/*
						numeroCorte = pp.fechaLimite.getMonth() * 2 - 1;
						var fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() -1, 07);	
						var fechaCorteFin 	 = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() -1, 21);
*/
				}
				
				if (arreglo[numeroCorte] == undefined )
				{
						arreglo[numeroCorte] = {};
						arreglo[numeroCorte].numeroCorte 			= numeroCorte;	
						arreglo[numeroCorte].fechaCorteInicio = fechaCorteInicio;
						arreglo[numeroCorte].fechaCorteFin 		= fechaCorteFin;
						arreglo[numeroCorte].fechaPago	 			= pp.fechaLimite;
						arreglo[numeroCorte].importe 					=	0;
						arreglo[numeroCorte].cargosMoratorios =	0;
						
						if (pp.descripcion == 'Recibo')
							 arreglo[numeroCorte].importe 				 = pp.totalPago;
						else
							 arreglo[numeroCorte].cargosMoratorios = pp.totalPago;
		
						arreglo[numeroCorte].bonificacion 		   = Number(pp.bonificacion);
						
						//arreglo[numeroCorte].fechaCorte = fechaCorte;
						arreglo[numeroCorte].planPagos 	= [];
						arreglo[numeroCorte].planPagos.push(pp);
				}
				else
				{
						if (pp.descripcion == 'Recibo')
							 arreglo[numeroCorte].importe 				 += pp.totalPago;
						else
							 arreglo[numeroCorte].cargosMoratorios += pp.totalPago;
		
						arreglo[numeroCorte].bonificacion 			 += Number(pp.bonificacion);
						arreglo[numeroCorte].planPagos.push(pp);
				}
		
		});
		
		rc.pagosCortes = _.toArray(arreglo);
		
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
			if (rc.cobranza != undefined)
			{
					rc.seleccionadoVales 							= 0;
				  rc.seleccionadoCreditosPersonales = 0;
				  rc.seleccionadoCargosMoratorios		= 0;
					_.each(rc.cobranza,function(c){
							if (c.imprimir == true)
							{
									rc.seleccionadoVales 							+= c.importe;
									rc.seleccionadoCreditosPersonales	+= c.importeCreditoP;
									rc.seleccionadoCargosMoratorios 	+= c.cargosMoratorios;
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
	
  /*
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
    
    });
    rc.recibo = [];
    
  };
*/

  this.cerrarModal= function() {
    rc.mostrarModal = false

  };
   
  this.funcionOrdenar = function() {
    
      if (this.valorOrdenar == "Nombre")
          return ['nombreCompleto'];
      if (this.valorOrdenar == "Numero")
          return ['numero'];    
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

  this.imprimirHistorial = function(objeto,cliente,credito) 
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
  
  this.imprimirEstadoCuenta = function(objeto) 
  {
		//console.log(objeto);    
    Meteor.call('getPeople',objeto.distribuidor._id, function(error, result)
    {                     
        if (result)
        {
	        
	        //console.log(objeto);
	        
	        Number.prototype.format = function(n, x) {
					    var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
					    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
					};
	        	        
					var fecha = rc.getReactively("fechaInicial");
					var fechaCorteInicio = "";
					var fechaCorteFin 	= "";
										
					var mes = fecha != undefined ? fecha.getMonth(): 0;
					var numeroCorte = 0;
					if (fecha.getDate() >= 7 && fecha.getDate() <= 21) 
					{	
							numeroCorte = (mes + 1) * 2 - 2;	
							fechaCorteInicio = new Date(fecha.getFullYear(), mes - 1, 22)
							fechaCorteFin		 = new Date(fecha.getFullYear(), mes, 06);									
					}	 
					else if (fecha.getDate() > 0 && fecha.getDate() < 7)	
					{
							if (mes == 0)
									numeroCorte = 0;
							else
									numeroCorte = (mes + 1) * 2 - 3;
							fechaCorteInicio = new Date(fecha.getFullYear(), mes - 1, 07);	
							fechaCorteFin 	 = new Date(fecha.getFullYear(), mes - 1, 21);
					}
					else if (fecha.getDate() > 21)
					{
							if (mes == 11)
									numeroCorte = 0;
							else
									numeroCorte = (mes + 1) * 2 - 1;
							
							fechaCorteInicio = new Date(fecha.getFullYear(), mes, 07);	
							fechaCorteFin 	 = new Date(fecha.getFullYear(), mes, 21);
					}
					
					
          objeto.cliente = result;
          
          var datos = {};
			    var sumaCargos = 0;
			    var sumaAbonos = 0;
			    var sumaAbonosCM = 0;
			    
			    datos.fechaCorteInicio		= fechaCorteInicio;
			    datos.fechaCorteFin				= fechaCorteFin;
			    datos.numeroCorte					= numeroCorte;
					
					datos.distribuidor 				= objeto.cliente.profile.nombreCompleto;
					datos.numeroDistribuidor 	= objeto.cliente.profile.numeroCliente;
					datos.direccion 					= objeto.cliente.profile.calle + 
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
			    
			    datos.valesAlCorte 		= 0;//objeto.planPagos.length;
			    datos.nuevosVales 		= 0;
			    datos.valesUltimoPago	= 0;
			    
			    datos.fechaCreacion 	= objeto.cliente.profile.fechaCreacion;
			    
			    var sumaConComision  		= 0;
			    var sumaSinComision  		= 0;
			    var sumaBonificacion  	= 0;
			    var cargosMoratorios 		= 0;
			    var creditosPersonales 	= 0;

			    //console.log(objeto);
			    
			    _.each(objeto.planPagos, function(pp){
				    	var pago = {};
				    	

							if (pp.beneficiario != "CRÉDITO PERSONAL" && pp.movimiento != "Cargo Moratorio")
							{
									 
						    	pago.beneficiario 			= pp.beneficiario;
						    	pago.folio							= pp.folio;
						    	pago.fechaLimite				= pp.fechaLimite;
						    	pago.numeroPagos				= pp.numeroPago.toString() + "-" + pp.numeroPagos.toString();
						    	
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
									
									if (pp.fechaLimite >= fechaCorteFin)
									{
											datos.valesAlCorte++;
								    	if (pp.numeroPago == 1)
									    		datos.nuevosVales ++;
								    	if (pp.numeroPago == pp.numeroPagos)	 	
								    			datos.valesUltimoPago++;
											
											datos.prestamos				 += Number(parseFloat(pp.adeudoInicial).toFixed(2));
								    	datos.saldoAnterior		 += Number(parseFloat(pp.saldoActual).toFixed(2));
								    	datos.pagoVigente			 += Number(parseFloat(pp.importeRegular).toFixed(2));
								    	datos.saldoActual			 += Number(parseFloat(pp.saldoActual - pp.importeRegular).toFixed(2));
								    	datos.planPagos.push(pago);
									}
										 
							}
							else if (pp.movimiento == "Cargo Moratorio")
							{
									cargosMoratorios += pp.importeRegular;
							}
							else if (pp.beneficiario == "CRÉDITO PERSONAL")
							{
									creditosPersonales+= Number(parseFloat(pp.importeRegular).toFixed(2));
							}
			    });
			   
			    datos.aLiberar						= '$' + Number(datos.aLiberar).format(2);
			    datos.prestamos					  = '$' + Number(datos.prestamos).format(2);
		    	datos.saldoAnterior			  = '$' + Number(datos.saldoAnterior).format(2);
		    	datos.pagoVigente				  = '$' + Number(datos.pagoVigente).format(2);
		    	datos.saldoActual				  = '$' + Number(datos.saldoActual).format(2);
		    	
		    	//datos.creditosPersonales	= '$' + Number(creditosPersonales).format(2);
		    				    
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
					    		
					    		comisiones.totalGral 					= sumaConComision;
					    		comisiones.comision 					= Number(parseFloat(sumaBonificacion * (comisiones.porcentaje/100)).toFixed(2));
					    		comisiones.comision 					= '$ ' + Number(comisiones.comision).format(2);
					    		comisiones.totalConComision 	= '$ ' + Number(parseFloat(sumaConComision).toFixed(2)).format(2);
					    		comisiones.totalSinComision		= '$ ' + Number(sumaSinComision).format(2);
					    		comisiones.seguro							= '$ ' + Number(objeto.seguro).format(2);
					    		comisiones.cargosMoratorios 	= '$ ' + Number(parseFloat(cargosMoratorios).toFixed(2));
					    		comisiones.creditosPersonales	= '$' + Number(creditosPersonales).format(2);
					    		
					    		
					    		comisiones.aPagar 					= '$ ' + Number(parseFloat(sumaConComision + sumaSinComision + objeto.seguro + cargosMoratorios + creditosPersonales
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
					    		
					    		comisiones.totalGral 					= sumaConComision;
					    		comisiones.comision 					= Number(parseFloat(sumaBonificacion * (comisiones.porcentaje/100)));
					    		comisiones.comision 					= '$ ' + Number(comisiones.comision).format(2);
					    		comisiones.totalConComision 	= '$ ' + Number(parseFloat(sumaConComision).toFixed(2)).format(2);
					    		comisiones.totalSinComision		= '$ ' + Number(sumaSinComision).format(2);
					    		comisiones.seguro							= '$ ' + Number(objeto.seguro).format(2);
					    		comisiones.cargosMoratorios 	= '$ ' + Number(parseFloat(cargosMoratorios).toFixed(2)).format(2);
					    		comisiones.creditosPersonales	= '$' + Number(creditosPersonales).format(2);
 					    		
					    		comisiones.aPagar 						= '$ ' + Number(parseFloat(sumaConComision + sumaSinComision + objeto.seguro + cargosMoratorios + creditosPersonales
					    																													 - (sumaBonificacion * (comisiones.porcentaje/100) )).toFixed(2)).format(2);
					    		
					    		comisiones.porcentaje					= comisiones.porcentaje + '%';
									
									
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
				        loading(false);
				      }
				  });		
        }
    });
  };
  
  this.imprimirCargosMoratorios = function(objeto) 
  {
	  	console.log(objeto);
	  	return;
	  	
	    Meteor.call('getPeople',objeto.distribuidor._id, function(error, result)
	    {                     
	        if (result)
	        {
		        
		        //console.log(objeto);
		        
		        Number.prototype.format = function(n, x) {
						    var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
						    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
						};
		        	        
						var fecha = rc.getReactively("fechaInicial");
						var fechaCorteInicio = "";
						var fechaCorteFin 	= "";
											
						var mes = fecha != undefined ? fecha.getMonth(): 0;
						var numeroCorte = 0;
						if (fecha.getDate() >= 7 && fecha.getDate() <= 21) 
						{	
								numeroCorte = (mes + 1) * 2 - 2;	
								fechaCorteInicio = new Date(fecha.getFullYear(), mes - 1, 22)
								fechaCorteFin		 = new Date(fecha.getFullYear(), mes, 06);									
						}	 
						else if (fecha.getDate() > 0 && fecha.getDate() < 7)	
						{
								if (mes == 0)
										numeroCorte = 0;
								else
										numeroCorte = (mes + 1) * 2 - 3;
								fechaCorteInicio = new Date(fecha.getFullYear(), mes - 1, 07);	
								fechaCorteFin 	 = new Date(fecha.getFullYear(), mes - 1, 21);
						}
						else if (fecha.getDate() > 21)
						{
								if (mes == 11)
										numeroCorte = 0;
								else
										numeroCorte = (mes + 1) * 2 - 1;
								
								fechaCorteInicio = new Date(fecha.getFullYear(), mes, 07);	
								fechaCorteFin 	 = new Date(fecha.getFullYear(), mes, 21);
						}
						
	          objeto.cliente = result;
	          
	          var datos = {};
				    var sumaCargos = 0;
				    var sumaAbonos = 0;
				    var sumaAbonosCM = 0;
				    
				    datos.fechaCorteInicio		= fechaCorteInicio;
				    datos.fechaCorteFin				= fechaCorteFin;
				    datos.numeroCorte					= numeroCorte;
						
						datos.distribuidor 				= objeto.cliente.profile.nombreCompleto;
						datos.numeroDistribuidor 	= objeto.cliente.profile.numeroCliente;
						datos.direccion 					= objeto.cliente.profile.calle + 
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
				    
				    datos.valesAlCorte 		= 0;//objeto.planPagos.length;
				    datos.nuevosVales 		= 0;
				    datos.valesUltimoPago	= 0;
				    
				    datos.fechaCreacion 	= objeto.cliente.profile.fechaCreacion;
				    
				    var sumaConComision  		= 0;
				    var sumaSinComision  		= 0;
				    var sumaBonificacion  	= 0;
				    var cargosMoratorios 		= 0;
				    var creditosPersonales 	= 0;
				    
				    
				    _.each(objeto.planPagos, function(pp){
					    	var pago = {};
					    	
	
								if (pp.beneficiario != "CRÉDITO PERSONAL" && pp.movimiento != "Cargo Moratorio")
								{
										 
										
							    	pago.beneficiario 			= pp.beneficiario;
							    	pago.folio							= pp.folio;
							    	pago.fechaLimite				= pp.fechaLimite;
							    	pago.numeroPagos				= pp.numeroPago.toString() + "-" + pp.numeroPagos.toString();
							    	
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
										
										if (pp.fechaLimite >= fechaCorteFin)
										{
												datos.valesAlCorte++;
									    	if (pp.numeroPago == 1)
										    		datos.nuevosVales ++;
									    	if (pp.numeroPago == pp.numeroPagos)	 	
									    			datos.valesUltimoPago++;
												
												datos.prestamos				 += Number(parseFloat(pp.adeudoInicial).toFixed(2));
									    	datos.saldoAnterior		 += Number(parseFloat(pp.saldoActual).toFixed(2));
									    	datos.pagoVigente			 += Number(parseFloat(pp.importeRegular).toFixed(2));
									    	datos.saldoActual			 += Number(parseFloat(pp.saldoActual - pp.importeRegular).toFixed(2));
									    	datos.planPagos.push(pago);
										}
											 
								}
								else if (pp.movimiento == "Cargo Moratorio")
								{
										cargosMoratorios += pp.importeRegular;
								}
								else if (pp.beneficiario == "CRÉDITO PERSONAL")
								{
										creditosPersonales+= Number(parseFloat(pp.importeRegular).toFixed(2));
								}
				    });
				   
				    datos.aLiberar						= '$' + Number(datos.aLiberar).format(2);
				    datos.prestamos					  = '$' + Number(datos.prestamos).format(2);
			    	datos.saldoAnterior			  = '$' + Number(datos.saldoAnterior).format(2);
			    	datos.pagoVigente				  = '$' + Number(datos.pagoVigente).format(2);
			    	datos.saldoActual				  = '$' + Number(datos.saldoActual).format(2);
			    	
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
						    		
						    		comisiones.totalGral 					= sumaConComision;
						    		comisiones.comision 					= Number(parseFloat(sumaBonificacion * (comisiones.porcentaje/100)).toFixed(2));
						    		comisiones.comision 					= '$ ' + Number(comisiones.comision).format(2);
						    		comisiones.totalConComision 	= '$ ' + Number(parseFloat(sumaConComision).toFixed(2)).format(2);
						    		comisiones.totalSinComision		= '$ ' + Number(sumaSinComision).format(2);
						    		comisiones.seguro							= '$ ' + Number(objeto.seguro).format(2);
						    		comisiones.cargosMoratorios 	= '$ ' + Number(parseFloat(cargosMoratorios).toFixed(2));
						    		comisiones.creditosPersonales	= '$' + Number(creditosPersonales).format(2);
						    		
						    		
						    		comisiones.aPagar 					= '$ ' + Number(parseFloat(sumaConComision + sumaSinComision + objeto.seguro + cargosMoratorios + creditosPersonales
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
						    		
						    		comisiones.totalGral 					= sumaConComision;
						    		comisiones.comision 					= Number(parseFloat(sumaBonificacion * (comisiones.porcentaje/100)));
						    		comisiones.comision 					= '$ ' + Number(comisiones.comision).format(2);
						    		comisiones.totalConComision 	= '$ ' + Number(parseFloat(sumaConComision).toFixed(2)).format(2);
						    		comisiones.totalSinComision		= '$ ' + Number(sumaSinComision).format(2);
						    		comisiones.seguro							= '$ ' + Number(objeto.seguro).format(2);
						    		comisiones.cargosMoratorios 	= '$ ' + Number(parseFloat(cargosMoratorios).toFixed(2)).format(2);
						    		comisiones.creditosPersonales	= '$' + Number(creditosPersonales).format(2);
	 					    		
						    		comisiones.aPagar 						= '$ ' + Number(parseFloat(sumaConComision + sumaSinComision + objeto.seguro + cargosMoratorios 
						    																													 - (sumaBonificacion * (comisiones.porcentaje/100) )).toFixed(2)).format(2);
						    		
						    		comisiones.porcentaje					= comisiones.porcentaje + '%';
										
										
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
			
			var numCorteMayor = 0;
			var fechaPago = "";
			_.each(objeto.arreglo, function(corte){
					if (corte.numeroCorte >  numCorteMayor)
					{
							fechaPago = corte.fechaPago;
							numCorteMayor = corte.numeroCorte;
					}	
			});
			
			//var fechaPago = objeto.arreglo[objeto.arreglo.length - 1].fechaPago;
			
			//console.log(numCorteMayor);
			//console.log(fechaPago);
			//console.log(objeto);
			
			//return;
			
							
      var dia  = rc.fechaInicial.getDate();
      var mes  = rc.fechaInicial.getMonth();
      var anio = rc.fechaInicial.getFullYear();
      
      var diaC  = fechaPago.getDate();
      var mesC  = fechaPago.getMonth() + 1;
      var anioC = fechaPago.getFullYear();
      
      //console.log("DisT:", objeto.distribuidor._id);
      //console.log("Fecha:", dia, mes, anio);
      
      
      //return;
      
      var url = $state.href("anon.ticketValesDistribuidor", { distribuidor_id: objeto.distribuidor._id, dia: dia, mes: mes, anio: anio, diaC: diaC, mesC: mesC, anioC: anioC }, { newTab: true });
		  window.open(url, '_blank');
      
  }

	this.selCorte=function(objeto, num)
  {			
			rc.banV = !rc.banV;
			rc.selected_numeroV = num;
  };
  
  this.isSelectedCorte=function(objeto){
    return rc.selected_numeroV===objeto;
  };  
  
  this.selCorteCredito=function(objeto, num)
  {			
			rc.banC = !rc.banC;
			rc.selected_numeroC = num;
  };
  
  this.isSelectedCredito=function(objeto){
    return rc.selected_numeroC === objeto;
  };
  
  this.selCorteCreditoP=function(objeto, num)
  {			
			rc.banCP = !rc.banCP;
			rc.selected_numeroCP = num;
  };
 
  this.isSelectedCreditoP=function(objeto){
    return rc.selected_numeroCP === objeto;
  };
	
	this.selCortePagos=function(objeto, num)
  {			
			rc.banP = !rc.banP;
			rc.selected_numeroP = num;
  };
  
  this.isSelectedPago=function(objeto){
    return rc.selected_numeroP === objeto;
  };

	this.imprimirPagare = function(id){		
			//Imprimir Pagare
			var url = $state.href("anon.ticketPagare", { credito_id: id }, { newTab: true });
			window.open(url, '_blank');
	};
	
	this.imprimirAmortizacion = function(id){
			//Imprimir Tabla Amortización
			var url = $state.href("anon.ticketAmortizacion", { credito_id: id }, { newTab: true });
			window.open(url, '_blank');
	};
	
	this.imprimirVale = function(id){		
			//Imprimir Vale
			var url = $state.href("anon.ticketEntregaVale", { credito_id: id }, { newTab: true });
			window.open(url, '_blank');		
	};
	
	this.imprimirRecibosVales = function(){		
			//Imprimir Recibos de Vales
			
			Number.prototype.format = function(n, x) {
			    var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
			    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
			};
			
			var datos = {};
			datos.items = [];
			
			_.each(rc.cobranza, function(c){
				
				if (c.cargosMoratorios > 0 )
				{		
							
						_.each(c.arreglo, function(corte){
								var objeto = {};
									
								objeto.nombreCompleto			= c.nombreCompleto;	
								objeto.numeroCliente			= c.distribuidor.profile.numeroCliente;
								objeto.calle							= c.distribuidor.profile.calle;
								objeto.no									= c.distribuidor.profile.numero;
								objeto.colonia						= c.distribuidor.profile.colonia;
								objeto.municipio					= c.distribuidor.profile.municipio;
								objeto.estado							= c.distribuidor.profile.estado;
								objeto.telefono						= c.distribuidor.profile.particular;
								objeto.celular						= c.distribuidor.profile.celular;
								objeto.telefonoOficina		= c.distribuidor.profile.telefonoOficina;
								
								objeto.importe						= '$' + Number(corte.importe + corte.seguro).format(2);
								objeto.numeroCorte 				= corte.numeroCorte;
								objeto.fechaCorteInicio  	= corte.fechaCorteInicio; 
								objeto.fechaCorteFin	  	= corte.fechaCorteFin; 
								
								//objeto.importe						= corte.importe;
								//objeto.seguro							= corte.seguro;
								//console.log(corte);

								datos.items.push(objeto);

						});
				}	
			});
			
			loading(true);
			Meteor.call('report', {
	      templateNombre: "RecibosVales",
	      reportNombre: "RecibosValesOut",
	      type: 'pdf',  
	      datos: datos,
		    }, function(err, file) {
		      if(!err){
						loading(false);
		        downloadFile(file);
		      }else{
		        toastr.warning("Error al generar el reporte");
		        loading(false);
		      }
		  });		
			
			//console.log(datos);
			
	};
	
  function round(value, decimals) {
		  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	} 
};