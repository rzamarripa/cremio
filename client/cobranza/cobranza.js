angular.module("creditoMio")
.controller("CobranzaCtrl", CobranzaCtrl);
 function CobranzaCtrl($scope, $meteor, $reactive, $state, toastr){
  
  let rc = $reactive(this).attach($scope);
  window.rc = rc;
    
  this.fechaInicial = new Date();
  this.fechaInicial.setHours(0,0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,0,0,0);
  
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
  
  this.estadoCivilSeleccionado = "";
  this.valorOrdenar = "Folio";

  rc.colonia =""
  

  this.subscribe("tiposCredito", ()=>{
    return [{}]
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
  
  

  this.subscribe('notas',()=>{
    return [{cliente_id:this.getReactively("cliente_id"),}]
  });

  this.subscribe("planPagos", ()=>{
    return [{credito_id : this.getReactively("credito_id") }]
  });

/*
  this.subscribe('personas', () => {
    return [{ }];
  });
*/
  this.subscribe('creditos', () => {
    return [{cliente_id : rc.getReactively("cliente_id")}];
  });

/*
  this.subscribe('pagos', () => {
    return [{ }];
  });  
  
  this.subscribe('sucursales', () => {
    return [{ }];
  });
*/
  
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

    planPagos : () => {
      var planes = PlanPagos.find({multada:1});
      var obj = planes.length
      // _.each(planes,function(plan){
      //   plan.fechaLimite = moment(plan.fechaLimite).format("DD-MM-YYYY")
      // });

      return planes;
    },
    planPagosViejo : () => {
    
      pagos = PlanPagos.find({},{sort : {numeroPago : 1,descripcion:-1}}).fetch();

      _.each(pagos, function(pay){

         pay.credito = Creditos.findOne(pay.credito_id);
     });

       return pagos
    },
    historialDelCredito : () => {
      
      arreglo = [];
      var saldoPago = 0;
      var saldoActual = 0; 
      rc.saldo =0;  
      var credito = this.credito  
      rc.saldoMultas=0;

      _.each(rc.getReactively("planPagosViejo"), function(planPago){
        if(planPago.descripcion=="Recibo")
          rc.saldo+=planPago.cargo;
        if(planPago.descripcion=="Cargo Moratorio")
          rc.saldoMultas+=planPago.importeRegular;
      });
      
      _.each(rc.getReactively("planPagosViejo"), function(planPago, index, key){

        
        if(planPago.descripcion=="Cargo Moratorio")
          rc.saldo+=planPago.cargo
        
        fechaini= planPago.fechaPago? planPago.fechaPago:planPago.fechaLimite
        
        //console.log(fechaini,planPago.fechaPago,planPago.fechaLimite)
        
        arreglo.push({saldo:rc.saldo,
          numeroPago : planPago.numeroPago,
          cantidad : credito.numeroPagos,
          fechaSolicito : credito.fechaSolicito,
          fecha : fechaini,
          pago : 0, 
          cargo : planPago.cargo,
          movimiento : planPago.movimiento,
          planPago_id : planPago._id,
          credito_id : planPago.credito_id,
          descripcion : planPago.descripcion,
          importe : planPago.importeRegular,
          pagos : planPago.pagos,
          _id: planPago._id
          // saldoActualizado : planPago.cargo - planPago[key+1].pago
         });
          
        
        if(planPago.pagos.length>0)
          _.each(planPago.pagos,function (pago) {
            //console.log(pago,"pago")
            rc.saldo-=pago.totalPago
            arreglo.push({saldo:rc.saldo,
              numeroPago : planPago.numeroPago,
              cantidad : credito.numeroPagos,
              fechaSolicito : credito.fechaSolicito,
              fecha : pago.fechaPago,
              pago : pago.totalPago, 
              cargo : 0,
              movimiento : planPago.descripcion=="Cargo Moratorio"? "Abono de Multa":"Abono",
              planPago_id : planPago._id,
              credito_id : planPago.credito_id,
              descripcion : planPago.descripcion=="Cargo Moratorio"? "Abono de Multa":"Abono",
              importe : planPago.importeRegular,
              pagos : planPago.pagos,
             
             // item.proximoPago = objeto[key+1].fechaLimite
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
      

      //console.log("el ARREGLO del helper historial",arreglo)
      return arreglo;
    },

    pagosVencidos : () => {
      _.each(rc.getReactively("planPagos"),function(plan){});
      return rc.planPagos.length

    },

    historialCredito : () => {
      var creditos = [];
      rc.clientes_id = _.pluck(rc.cobranza,"cliente._id")
      
        
    
        return creditos
      
    },
    cobranza :() =>{
		  
		  this.fechaInicial = rc.getReactively("fechaInicial");
		  this.fechaInicial.setHours(0,0,0,0);
	    this.fechaFinal = new Date(this.fechaInicial.getTime());
	    this.fechaFinal.setHours(23,59,59,999);
	    FI = this.fechaInicial;
	    FF = this.fechaFinal;
	    rc.verRecibos = true;
	    
	    Meteor.call('getCobranza', FI, FF, 1, Meteor.user().profile.sucursal_id, function(error, result) {           
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
                //console.log(result,"resullltt")
	              
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
      Creditos.find({cliente_id: rc.getReactively("cliente_id")}).fetch()
      objeto.historialCreditos = Creditos.find({cliente_id: rc.getReactively("cliente_id"), estatus: {$in: [4,5]}}).fetch()

      rc.credito_id = objeto.credito._id;
      //console.log("Objeto: ",objeto)
      rc.historial = objeto

    }
  
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
	this.guardarNotaCobranza=function(nota){
			//console.log(nota);			
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
  this.guardarNotaCliente=function(nota){
      //console.log(nota);
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
  this.guardarNotaCuenta=function(nota){
      //console.log(nota);      
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
  

  this.download = function(objeto) 
  {
    //console.log("entro:", objeto);
    objeto.credito.saldoActualizado = rc.historialCredito.saldo
    objeto.credito.avales = rc.avales;
    objeto.credito.pagosVencidos = rc.pagosVencidos;



    Meteor.call('getcartaRecordatorio', objeto, function(error, response) {
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
      
    //console.log("entro:", objeto);
    objeto.credito.saldoActualizado = rc.historialCredito.saldo
    objeto.credito.avales = rc.avales;
    objeto.credito.pagosVencidos = rc.pagosVencidos;


    Meteor.call('getcartaUrgente', objeto, function(error, response) {
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

              dlnk.download = "URGENTE.docx"; 
              dlnk.href = url;
              dlnk.click();       
              window.URL.revokeObjectURL(url);
  
       }
    });

    
  };

  this.downloadCartaCertificado= function(objeto) 
  {
      
    console.log("entro:", objeto);
    objeto.credito.saldoActualizado = rc.historialCredito.saldo
    objeto.credito.avales = rc.avales;

    Meteor.call('getcartaCertificado', objeto, function(error, response) {

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
		
    _.each(objeto,function(item, key){
      if (item.imprimir) {
        item.cliente.profile.colonia = Colonias.findOne(item.cliente.profile.colonia_id)
        item.colonia = item.cliente.profile.colonia.nombre
        item.calle = item.cliente.profile.calle
        item.cliente.profile.estado = Estados.findOne(item.cliente.profile.estado_id)
        item.estado = item.cliente.profile.estado.nombre
        item.cliente.profile.municipio = Municipios.findOne(item.cliente.profile.municipio_id)
        item.municipio = item.cliente.profile.municipio.nombre
        item.nombreCompleto = item.cliente.profile.nombreCompleto
        item.numeroCliente = item.cliente.profile.folio
        item.planPagoNumero = item.numeroPago
        item.no = item.cliente.profile.numero
        item.nombreCompleto = item.cliente.profile.nombreCompleto
        item.telefono = item.cliente.profile.telefono
        item.celular = item.cliente.profile.celular
        item.telefonoOficina = item.cliente.profile.telefonoOficina
        item.cantidadPagos = item.credito.numeroPagos
        item.telefono = item.cliente.profile.particular
        item.celular = item.cliente.profile.celular
        item.telefonoOficina = item.cliente.profile.telefonoOficina
        item.folioCredito = item.credito.folio
        item.saldo = item.credito.saldoActual

          
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


    Meteor.call('getRecibos', toPrint, function(error, response) {     
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

           dlnk.download = "RECIBOS.docx"; 
          dlnk.href = url;
          dlnk.click();       
          window.URL.revokeObjectURL(url);
   
      }
    
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
    

	  _.each(lista,function(item){
	      if (item.imprimir) {
	      item.folioCredito = item.credito.folio
	      item.nombreCompleto = item.cliente.profile.nombreCompleto
	      toPrint.push(item);
	    };

    });

    console.log(lista,"lista")

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

  };

  this.imprimirHistorial= function(objeto,cliente,credito) 
  {
		//console.log("Cliente:", cliente);
		
    /*
var sumaCargos = 0
    var sumaAbonos = 0
    var popo = 0
    objeto.objetoFinal = objeto[objeto.length - 1];
      _.each(objeto,function(item){

        if (item.movimiento == "Cargo Moratorio") {
          sumaCargos += item.importe
          sumaAbonos += item.pago

        }
        if (item.movimiento == "Abono") {
          sumaAbonos += item.pago

        }
      
        // suma += item.capitalSolicitado
        // sumaSol += item.adeudoInicial
        popo = objeto.objetoFinal.saldo
        item.ultimoSaldo =  popo
     
      });

       _.each(objeto,function(item){
       item.sumaCargos = sumaCargos
       item.sumaAbonos = sumaAbonos
        
    });
    _.each(objeto,function(item){
	    //console.log(item,"item")
      cliente.cliente = cliente.profile.nombreCompleto
      cliente.clienteSucursal = Sucursales.findOne(cliente.profile.sucursal_id)
      cliente.sucursal = cliente.clienteSucursal.nombre
      cliente.fechaCreacion = cliente.profile.fechaCreacion
      cliente.sexo = cliente.profile.sexo
      //cliente.clienteNacionalidad = Nacionalidades.findOne(cliente.profile.nacionalidad_id)
      cliente.nacionalidad = cliente.profile.nacionalidadCliente.nombre
      //cliente.estadoCivilCliente = EstadoCivil.findOne(cliente.profile.estadoCivil_id)
      cliente.estadoCivil = cliente.profile.estadoCivilCliente.nombre
      cliente.fechaNa = cliente.profile.fechaNacimiento
      cliente.lugarNacimiento = cliente.profile.lugarNacimiento
      if (cliente.profile.lugarNacimiento) {
        cliente.lugarNacimiento = cliente.profile.lugarNacimiento
      }
      //cliente.ocupacionCliente = Ocupaciones.findOne(cliente.profile.ocupacion_id)
      cliente.ocupacion = cliente.profile.ocupacionCliente.nombre
      item.foto = cliente.profile.foto
      cliente.foto = cliente.profile.foto
      

    });
    console.log(objeto,"objeto")
    console.log(credito,"credito")
  
  
 
    var toPrint = [];
*/
    
    cliente = rc.cliente.profile;
    //console.log("toshtta japon",cliente)

    var sumaCargos = 0
    var sumaAbonos = 0
    var popo = 0
    objeto.objetoFinal = objeto[objeto.length - 1];
     _.each(objeto,function(item){

        if (item.movimiento == "Cargo Moratorio") {
          sumaCargos += item.importe
          sumaAbonos += item.pago

        }
        if (item.movimiento == "Abono") {
          sumaAbonos += item.pago

        }
      
        //suma += item.capitalSolicitado
        //sumaSol += item.adeudoInicial
        popo = objeto.objetoFinal.saldo
        item.ultimoSaldo =  popo
     
      });

       _.each(objeto,function(item){
       item.sumaCargos = sumaCargos
       item.sumaAbonos = sumaAbonos
        
    });


    Meteor.call('imprimirHistorial', objeto, cliente,credito, function(error, response) {     
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

          dlnk.download = "HISTORIALCREDITICIO.docx"; 
          dlnk.href = url;
          dlnk.click();       
          window.URL.revokeObjectURL(url);
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