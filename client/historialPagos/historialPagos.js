angular
.module("creditoMio")
.controller("HistorialPagosCtrl", HistorialPagosCtrl);
function HistorialPagosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	this.action = false;
	this.fechaActual = new Date();
	console.log($stateParams)
	window.rc = rc;
	this.credito_id = "";

	this.credito = {};
	this.pago = {};
	this.pago.totalPago = 0;
	this.creditos = [];
	this.creditos_id = []

	this.total = 0;

	// this.informacionContacto = tr; 
	
 this.subscribe("planPagos", ()=>{
		return [{ credito_id : this.getReactively("credito_id") }]
	});
	
	this.subscribe("tiposCredito", ()=>{
		return [{ estatus : true, sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
	});
	
	this.subscribe('cliente', () => {
		return [{ _id : $stateParams.cliente_id }];
	});
	
	this.subscribe('creditos', () => {
		return [{ _id : $stateParams.credito_id}];
	});
	this.subscribe('pagos', () => {
		return [{estatus:1,credito_id : this.getReactively("credito_id") }];
	});

	
	this.helpers({
		cliente : () => {
			return Meteor.users.findOne({roles : ["Cliente"]});
		},
		planPagos : () => {
			return PlanPagos.find();
		},
		tiposCredito : () => {
			return TiposCredito.find();
		},
		planPagosViejo : () => {
			//var diferentes = c_ids.diff(p_ids)
		//	var fechaPago = moment(pago.fecha).add(-1, "days");

			rc.credito_id = $stateParams.credito_id;
			var fechaActual = moment();
			 pagos = PlanPagos.find({},{sort : {numeroPago : 1}}).fetch();

			 return pagos
		},
		pagos : () =>{
			return Pagos.find().fetch()
		},


		credito : () => {
			return Creditos.findOne({_id : $stateParams.credito_id})
		},
		creditos : () => {
			var creditos = Creditos.find($stateParams.credito_id).fetch();
			if(creditos != undefined){
				rc.creditos_id = _.pluck(creditos, "cliente_id");
				_.each(creditos, function(credito){
					credito.planPagos = PlanPagos.find({credito_id : credito._id},{sort : {numeroPago : 1}}).fetch();
			
			  			credito.nombreTipoCredito = TiposCredito.findOne(credito.tipoCredito_id)
			  			//producto.unidad = TiposCredito.findOne(producto.unidad_id)

			  				  				
				})
			}
			return creditos;
		},




		historial : () => {
			arreglo = [];
			var saldoPago = 0;
			var saldoActual = 0; 
						

			_.each(rc.getReactively("creditos"), function(credito){
				_.each(rc.getReactively("planPagosViejo"), function(planPago, index){
					var saldo = 0;
					//console.log(saldo)
				
			  				
			  					planPago.capitalSolicitado =  saldo;

			  				if(index == 0){
			  					//console.log("primero", index)
			  					saldo = credito.capitalSolicitado ;
			  				}else{
			  					console.log("más", index);
			  					saldo = saldoPago; 
			  					console.log("saldoPago", saldoPago);
			  				}

					arreglo.push({saldo:saldo , numeroPago : planPago.numeroPago,fechaSolicito : credito.fechaSolicito,
			  				fecha:planPago.fechaPago,pago:planPago.importeRegular, cargo:planPago.cargo,movimiento:"Recibo",
			  				planPago_id:planPago._id,credito_id:planPago.credito_id,descripcion:planPago.descripcion,importe:planPago.importeRegular,pagos:planPago.pagos
			  				 })
					
						var pagoSuma = 0;
			  				_.each(planPago.pagos, function(pago){
			  						var SumaPago = 0;
 
			  						console.log("pagosuma",pagoSuma)

			  						if (planPago.descripcion == "Multa") {
			  							console.log("entro aqui")
			  							_.each(planPago.pagos, function(pago){
			  								console.log("entro al each")
			  								pago.cargo += pago.totalPago
			  								pago.saldo = saldoPago


			  							}); 
			  							saldo = saldoPago + planPago.importe
			  							console.log("el saldo ya con la multa",saldo)
			  						}
			  						if (pago.planPago_id == planPago._id) {
			  						pagoSuma += pago.totalPago;
			  						SumaPago += pago.totalPago;
			  						saldoPago = (saldo - pagoSuma);
			  						if (pago.movimiento=="Abono") {
			  							pago.saldo = saldoPago

			  						}
			  					}
			  					if (saldoPago <= 0) {
			  						saldoPago = 0
			  					}
			  									  						
			  			
			  					 		_.each(arreglo, function(array){
										if (array.fecha == undefined) {
									  	    array.saldo = 0
									  	  
									  	    };

								  	    if (array.saldo <= 0) {
									  	    array.saldo = 0
									  	    };
									    if (array.descripcion == "Multa") {
									  	    array.movimiento = "Multa"
									  	      array.pago = array.importe
									  	      array.pagar = array.importe
									  	      //saldoPago = saldoPago + array.importe
									  	    
									  	    }

									  	     // if (array.planPago_id == planPago._id && array.descripcion == planPago.descripcion) {

									  	     // }
									  	if (array.cargo == undefined) {
									  	    array.cargo = 0;
									  	    }

							  					
									});

			  					});
			  				
			  				
						});
				credito.saldoActual = saldoPago
				//Creditos.update({_id:credito_id},{$set:pago});
				});

			
					_.union([arreglo]).sort;

			console.log("el ARREGLO del helper historial",arreglo)
			return arreglo;
		}
	});
	  
  this.guardar = function(convenio,form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
		convenio.estatus = 0;
		convenio.campus_id = Meteor.user().profile.campus_id;
		convenio.usuarioInserto = Meteor.userId();
		convenio.cliente_id = rc.objeto._id;
		PlanPlagos.insert({});
		toastr.success('Guardado correctamente.');
		this.escuela = {}; 
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
  		form.$setUntouched();
		
	};
	
	this.editar = function(pago)
	{
	    this.pago = pago;
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.cambiarEstatus = function(pago, estatus, tipoMov){
		var res = confirm("Está seguro que quiere " + tipoMov + " el pago?");
		if(res == true){
			PlanPagos.update(pago._id, { $set : {estatus : estatus}});
			toastr.success('Cancelado correctamente.');
		}
	}
	
	this.actualizar = function(pago,form)
	{
		if(form.$invalid){
      toastr.error('Error al actualizar los datos.');
      return;
	  }
		var idTemp = pago._id;
		delete pago._id;		
		pago.usuarioActualizo = Meteor.userId(); 
		pago.convenio = 1;
		PlanPagos.update({_id:idTemp},{$set:pago});
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
	
	this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "masculino")
				return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
		}else{
			return foto;
		}
	}
	
	this.modificacionMasiva = function(modificacion, form){
		if(form.$invalid){
      toastr.error('Error al hacer la modificación masiva, por favor revise el llenado del formulario.');
      return;
	  }
	  var pagosPendientes = PlanPagos.find({ semana : { $gte : modificacion.semanaInicial, $lte : modificacion.semanaFinal }, anio : modificacion.anio, estatus : { $ne :  1}}).fetch();
	  
	  _.each(pagosPendientes, function(pago){
		  PlanPagos.update({_id : pago._id},
		  		{ $set : { modificada : true, pagoTiempo : 0, importeRegular : modificacion.importeRegular, importe : modificacion.importeRegular, importeRecargo : modificacion.recargo, importeDescuento : modificacion.descuento, descripcion : modificacion.descripcion}});
	  })
	  toastr.success('Se modificaron correctamente los ' + pagosPendientes.length + ' pagos');
	  this.modificacion = {};
	  $('#collapseMasiva').collapse('hide');
	  this.nuevoMasivo = !this.nuevoMasivo;
	}
	
	this.getFocus = function(){
	  document.getElementById('buscar').focus();
  }; 
  
  this.planPagosSemana =function () {
	  if(form.$invalid){
      toastr.error('Error al calcular el nuevo plan de pagos, llene todos los campos.');
      return;
	  }
	  rc.planPagos = [];
		var dia = 1;
		console.log("original",this.credito.fechaInicial)
		var mfecha = moment(this.credito.fechaInicial);
		console.log("moment", mfecha);
		//mfecha = mfecha.day(dia);
		console.log("day", mfecha);
		var inicio = mfecha.toDate();
		console.log("inicio", inicio);
		
		console.log("1 month", mfecha);
		var plan = [];
		for (var i = 0; i < this.credito.totalPagos; i++) {
			var importeParcial = this.credito.importeRegular / this.credito.totalPagos;
			var pago = {
				semana 			    		: mfecha.isoWeek(),
				fechaLimite 			  : new Date(mfecha.toDate().getTime()),
				diaSemana						: mfecha.weekday(),
				tipoPlan 		    		: 'Mensual',
				numeroPago 	        : i + 1,
				importeRegular      : importeParcial,
				importeRecargo      : (this.credito.importeRecargo / this.credito.totalPagos),
				diasRecargo         : this.credito.diasRecargo,
				cliente_id					: this.cliente._id,
				fechaPago           : undefined,
				semanaPago          : undefined,
				diaPago             : undefined,
				pago                : 0,
				estatus             : 0,
				tiempoPago          : 0,
				modificada          : false,
				mes									: mfecha.get('month') + 1,
				anio								: mfecha.get('year')
			}
			
			rc.planPagos.push(angular.copy(pago));

			var siguienteMes = moment(mfecha).add(1, 'M');
			var finalSiguienteMes = moment(siguienteMes).endOf('month');
			
			if(mfecha.date() != siguienteMes.date() && siguienteMes.isSame(finalSiguienteMes.format('YYYY-MM-DD'))) {
			    siguienteMes = siguienteMes.add(1, 'd');
			}
			
			mfecha = siguienteMes;
		}

		return plan;
	}
	
	this.generarCredito = function(){
		console.log(this.credito);
		var credito = {
			cliente_id : this.cliente._id,
			tipoCredito_id : this.credito.tipoCredito_id,
			fechaSolicito : new Date(),
			capitalSolicitado : this.credito.importeRegular,
			adeudoInicial : this.credito.importeRegular,
			saldoActual : this.credito.importeRegular,
			multasPendientes : 0,
			saldoMultas : 0.00,
			saldoRecibo : 0.00,
			estatus : 1
		};
		Meteor.apply('generarCredito', [this.cliente._id, credito, this.planPagos], function(error, result){
		  if(result == "hecho"){
			  toastr.success('Se crearon correctamente los ' + rc.planPagos.length + ' pagos');
			  rc.planPagos = [];
			  $state.go("root.clienteDetalle",{objeto_id : rc.cliente._id});
		  }
	    $scope.$apply();
	  });
	}
	
	this.calcularRecargos = function(){
		if(this.credito.tipoCredito_id != undefined && this.credito.importeRegular > 0){
			var tipoCredito = TiposCredito.findOne(rc.credito.tipoCredito_id);
			if(tipoCredito != undefined){
				if(rc.credito.importeRegular <= tipoCredito.montoMaximo){
					console.log(tipoCredito);
					rc.credito.importeRecargo = (tipoCredito.tasa / 100) * rc.credito.importeRegular;
				}else{
					toastr.warning('El límite para este tipo de crédito es de ' + tipoCredito.montoMaximo);
					rc.credito.importeRegular = tipoCredito.montoMaximo;
				}
			}			
		}
	};



	this.seleccionarPago = function(pago)
	{ 
		console.log(pago);
 		pago.pagoSeleccionado = !pago.pagoSeleccionado;
		pago.estatus = 0;	
		rc.pago.totalPago = 0;
		//console.log(rc.planPagosViejo);
		_.each(rc.planPagosViejo, function(p){
			if(p.pagoSeleccionado != undefined){
				if(p.pagoSeleccionado == true){
					console.log("mas");
					console.log(p.pagoSeleccionado, p.numeroPago);
					rc.pago.totalPago += p.importeRegular;	
				}
				
			}
	
		});
		console.log("HELPER", rc.pago.totalPago)
	}

	this.guardarPago = function(pago,credito)
	{
		
		//console.log(pago)
		pago.fechaPago = new Date()
		pago.usuario_id = Meteor.userId()
		pago.sucursalPago_id = Meteor.user().profile.sucursal_id
		pago.estatus = true;
		var pago_id = Pagos.insert(pago);

		this.pago = {}

        _.each(rc.planPagosViejo, function(p){
                if(p.estatus != 1){
		        delete p.$$hashKey;

        	_.each(p, function(nota){
					delete nota.$$hashKey;
					});


	        	if (p.pagoSeleccionado == true) {
	        		//plan = PlanPagos.find({credito_id: p.credito_id,estatus:0})

	        		var idTemporal = p._id;
			        delete p._id;

			       // console.log("el id",plan)
			        var diaSemana = moment(new Date()).weekday();
					p.pago_id = pago_id
					p.cambio =  pago.pagar - pago.totalPago
					p.fechaPago = new Date()
					p.sucursalPago_id = Meteor.user().profile.sucursal_id
					p.usuarioCobro_id = Meteor.userId()
					p.diaPago = diaSemana;


					if (p.pagoSeleccionado == true) 
					{
						if (p.descripcion == "Multa") {
							console.log("entro aqui a la multa")
							planPago = PlanPagos.findOne({numeroPago:p.numeroPago,credito_id: p.credito_id})
							var idTemp = p._id;
	        				//delete planPago._id;
							//console.log("el id ",planPago)
							//console.log("idTemp ",idTemp)
							

							PlanPagos.update({_id:planPago._id},
								 { $set : { multa : 1}});

							p.estatus = 1
							if (p.descripcion == "Multa" && p.estatus == 1) {
								p.importeRegular = 0;
							}
							if (pago.pagar >= p.importeRegular) {
	 							p.importeRegular = 0
	 							p.estatus = 1

	 						}
							
							PlanPagos.insert(p);
							console.log("despues del insert y del update",p,rc.planPagosViejo)

						}else{
							console.log("entro al else")

							if (p.fechaLimite > p.fechaPago) 
							{
								console.log("0")
								p.tiempoPago = 0

							}else{
								console.log("1")
								p.tiempoPago = 1
							}
							p.importeRegular= (pago.totalPago - pago.pagar)	
							if (p.importeRegular == 0) {
						
								p.estatus = 1;
							}else{
								p.pagoSeleccionado = false; 
							}
							if (isNaN(p.importeRegular)) {
								p.importeRegular = 0;
	 						}
	 						if ( p.importeRegular < 0) {
	 							p.importeRegular = 0
	 							p.estatus = 1

	 						}

	 						PlanPagos.update({_id:idTemporal},{$set:p});


						}

					}	


				}
			
		        		
	        }

		         
        })	
       
	};

	

	this.mostrarPagos = function(id){
		console.log(id)
		this.credito_id = id;
	};

	this.download = function(participantes) 
  {
	  	
				
		$( "#certificacionPatrimonial" ).prop( "disabled", true );
		Meteor.call('getcertificacionPatrimonial', function(error, response) {
		   if(error)
		   {
		    console.log('ERROR :', error);
		    $( "#certificacionPatrimonial" ).prop( "disabled", false );
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
					    dlnk.download = "CertificacionPatrimonial.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);
						  $( "#certificacionPatrimonial" ).prop( "disabled", false );
  
		   }

		   this.tieneFoto = function(sexo, foto){
			if(foto === undefined){
				if(sexo === "masculino")
					return "img/badmenprofile.png";
				else if(sexo === "femenino"){
					return "img/badgirlprofile.png";
				}else{
					return "img/badprofile.png";
				}
			}else{
				return foto;
			}
	}
		});
	};

};