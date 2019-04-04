angular.module("creditoMio")
.controller("CobranzaCtrl", CobranzaCtrl);
 function CobranzaCtrl($scope, $meteor, $reactive, $state, toastr){
  
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

  this.subscribe("planPagos", ()=>{
    return [{credito_id : this.getReactively("credito_id") }]
  });

  this.subscribe('creditos', () => {
    return [{cliente_id : rc.getReactively("cliente_id")}];
  });

  
  this.helpers({
    tiposCredito : () => {
      return TiposCredito.find();
    },
    notas : () => {
	    
	    var not = Notas.find({},{sort: {fecha: -1}}).fetch();
	    
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

    planPagos : () => {
      var planes = PlanPagos.find({multada:1});
      var obj = planes.length
      // _.each(planes,function(plan){
      //   plan.fechaLimite = moment(plan.fechaLimite).format("DD-MM-YYYY")
      // });

      return planes;
    },
    planPagosViejo : () => {
    
      pagos = PlanPagos.find({},{sort : { numeroPago	: 1, 
																				  fechaLimite	: 1, 
																				  descripcion	: -1}}).fetch();

      _.each(pagos, function(pay){

         pay.credito = Creditos.findOne(pay.credito_id);
			});

      return pagos
    },
    historialDelCredito : () => {
      
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

			_.each(rc.getReactively("planPagosViejo"), function(planPago){	
				if (planPago.descripcion == "Recibo")
					rc.saldo += Number(parseFloat(planPago.cargo).toFixed(2));
				
				if (planPago.descripcion == "Cargo Moratorio")
					rc.saldoMultas 	+= Number(planPago.importeRegular + planPago.pago);	
					
			});
			
			rc.pagos_ids = [];
			
			_.each(rc.getReactively("planPagosViejo"), function(planPago, index){
									
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
											cargo 						: planPago.descripcion == "Recibo"? planPago.importeRegular: cargoCM,
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
						if (pago.estatus != 3)
							rc.pagos_ids.push(pago.pago_id);
					});
					
					var pagos = Pagos.find({}).fetch();
					
					_.each(planPago.pagos,function (pago) {
						
						if (pago.estatus != 3)
						{
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
					  }	
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
			
      return arreglo;
    },

    pagosVencidos : () => {
      _.each(rc.getReactively("planPagos"),function(plan){});
      return rc.planPagos.length

    },

    historialCredito : () => {
      var creditos = [];
      rc.clientes_id = _.pluck(rc.cobranza,"cliente._id")
      return creditos;      
    },
    cobranza :() =>{
		  
		  this.fechaInicial = rc.getReactively("fechaInicial");
		  this.fechaInicial.setHours(0,0,0,0);
	    this.fechaFinal = new Date(this.fechaInicial.getTime());
	    this.fechaFinal.setHours(23,59,59,999);
	    FI = this.fechaInicial;
	    FF = this.fechaFinal;
	    rc.verRecibos = true;
	    
	    loading(true);
	    Meteor.call('getCobranza', FI, FF, 1, Meteor.user().profile.sucursal_id, function(error, result) {           
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

	              loading(false);
	              $scope.$apply();
	          }
	        
	    }); 

	    
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
          this.fechaInicial.setHours(0,0,0,0);
          this.fechaFinal = new Date(this.fechaInicial.getTime());
          this.fechaFinal.setHours(23,59,59,999);
          FI = this.fechaInicial;
          FF = this.fechaFinal;
          rc.verRecibos = true;
          
          //console.log("FI:", FI);
          //console.log("FF:", FF);
          
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
      
      //Meteor.call("actualizarMultas",function(err, res){console.log("Fue por multas:",res)});
      loading(true);
      Meteor.call('getCobranza', FI, FF, op, Meteor.user().profile.sucursal_id, function(error, result) {           
          if (result)
          {
              //console.log("Cobranza:",result);
              
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
			//console.log(objeto);		
      Meteor.call('getPeople',objeto.cliente._id, function(error, result){                     
          if (result)
          {

            objeto.cliente = result;
						
						//console.log("Objeto:", objeto);
						
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

  this.selCredito2=function(objeto)
  {

      //objeto.fechaEntrega = new Date();
      rc.cliente_id = objeto.cliente._id
      //console.log(rc.cliente_id)
      Creditos.find({cliente_id: rc.getReactively("cliente_id")}).fetch();
      
      objeto.historialCreditos = Creditos.find({cliente_id: rc.getReactively("cliente_id"), estatus: {$in: [4,5]}}, {sort : {fechaSolicito: -1}}).fetch()

      rc.credito_id = objeto.credito._id;
      //console.log("Objeto: ",objeto)
      rc.historial = objeto;

    }
  
  this.isSelected=function(objeto){
		
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
		rc.notaCobranza.cliente= objeto.cliente.profile.nombreCompleto;
		rc.notaCobranza.folioCredito = objeto.credito.folio;
		rc.notaCobranza.recibo = objeto.numeroPago;
	  rc.notaCobranza.cliente_id = objeto.cliente_id;
		rc.cobranza_id = objeto.credito._id;
		//console.log("rc.cobranza_id",rc.cobranza_id);
		$("#myModal").modal();


	}

	this.mostrarNotaCliente=function(objeto){
		//console.log("Nota de Cliente:",objeto);
		rc.notaCobranza.cliente = objeto.cliente.profile.nombreCompleto;
		rc.notaCobranza.folioCredito = objeto.credito.folio;
		rc.notaCobranza.recibo = objeto.numeroPago;
    rc.cobranza_id = objeto.credito_id;
    rc.notaCobranza.cliente_id = objeto.cliente_id;
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
    rc.notaCobranza.folioCredito = objeto.credito.folio 
    rc.notaCobranza.recibo= objeto.numeroPago
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

  this.verPagos= function(credito) {

    //console.log(credito,"el credito ")
    rc.credito = credito;
    rc.credito_id = credito._id;
    $("#modalpagos").modal();
    credito.pagos = Pagos.find({credito_id: rc.getReactively("credito_id")}).fetch()
    rc.mostrarModal = true

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
			Meteor.call('imprimirHistorial', objeto, cliente, credito, 'pdf', rc.saldoMultas, rc.abonosRecibos, rc.abonosCargorMoratorios, rc.saldoGeneral, rc.sumaNotaCredito, function(error, response) {
	
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
  };  

  this.checkValue1= function() 
  {
    expect(element(by.repeater('credito in rc.historialDelCredito').row(0).column('credito')).getAttribute('class')).
      toMatch(/odd/);
    expect(element(by.repeater('credito in rc.historialDelCredito').row(1).column('credito')).getAttribute('class')).
      toMatch(/even/);
  };

};