angular
.module("creditoMio")
.controller("VerPlanPagosCtrl", VerPlanPagosCtrl);
function VerPlanPagosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	this.action = false;
	this.fechaActual = new Date();
	
	window.rc = rc;
	this.credito_id = "";

	this.credito = {};
	this.pago = {};
	this.pago.totalPago = 0;
	this.pago.totalito = 0
	this.creditos = [];
	this.creditos_id = []
	this.total = 0;
	
	//console.log($stateParams)

	// this.informacionContacto = tr; 
	
  this.subscribe("planPagos", ()=>{
		return [{ credito_id : this.getReactively("credito_id") }]
	});
	
	this.subscribe("tiposCredito", ()=>{
		return [{ estatus : true, sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
	});
	
	this.subscribe('cliente', () => {
		return [{ _id : $stateParams.objeto_id }];
	});
	
	this.subscribe('creditos', () => {
		return [{ _id : $stateParams.credito_id}];
	});
	this.subscribe('pagos', () => {
		return [{estatus:1  }];
	});
	this.subscribe('ocupaciones', () => {
		return [{estatus:true  }];
	});
	this.subscribe('nacionalidades', () => {
		return [{estatus:true  }];
	});
	this.subscribe('estadoCivil', () => {
		return [{estatus:true  }];
	});
	this.subscribe('estados', () => {
		return [{estatus:true  }];
	});
	this.subscribe('paises', () => {
		return [{estatus:true  }];
	});
	this.subscribe('empresas', () => {
		return [{estatus:true  }];
	});
	this.helpers({
		creditos : () => {
			return Creditos.findOne({_id : $stateParams.credito_id})
		},
		cliente : () => {

				var clientes = Meteor.users.findOne({roles : ["Cliente"]});
		  	if (clientes) {
		  		_.each(clientes, function(cliente){
		  			
		  			cliente.ocupacion = Ocupaciones.findOne(cliente.ocupacion_id)
		  			cliente.estadoCivil = EstadoCivil.findOne(cliente.estadoCivil_id)
		  			cliente.nacionalidad = Nacionalidades.findOne(cliente.nacionalidad_id)
		  			cliente.estado = Estados.findOne(cliente.estado_id)
		  			cliente.pais = Paises.findOne(cliente.pais_id)
		  			cliente.empresa = Empresas.findOne(cliente.empresa_id)
		  			cliente.municipio = Empresas.findOne(cliente.municipio_id)
		  			//cliente.municipio = Empresas.findOne(cliente.empresa.municipio_id)
		  		
		  				//cliente.empresa.municipio_id =  Empresas.findOne(cliente.empresa.municipio_id)


		  				//console.log("cliente",cliente)

		  			
		  	})
	  	}


			return clientes;
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
			 _.each(pagos, function(p){
			 	

			 	if (p.estatus == 0 && p.multa == 0 ) {
			 		//console.log("epaaaa")
			 	_.each(rc.creditos, function(c){
			 	//console.log(p)
			 	var fechaLimite = moment(p.fechaLimite);
			 	var dias = fechaActual.diff(fechaLimite, "days");
			 
			 	
			 	if (fechaActual > p.fechaLimite) {


			 		//console.log("dif ", fechaLimite, fechaActual)
			 		var multaCosto = 0;
			 		//console.log("los dias",dias)
			 		var multas = (dias/100) * c.capitalSolicitado 
			 		//console.log(c.capitalSolicitado)
			 		//console.log("las multas",multas)
			 		pagos.push({planPago_id:p._id,credito_id:p.credito_id,fechaLimite:p.fechaLimite,numeroPago:p.numeroPago, importeRegular:multas,
			 		descripcion:"Multa",estatus:0,multa:multaCosto,movimiento:"Multa"})
			 	}	
			 		
				});
			   }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			  if (p.estatus == 1  && p.tiempoPago == 1 && p.multa == 0  ) {
			  	_.each(rc.creditos, function(c){
			  	var multaCosto = 0;
			    var fechaLimite = moment(p.fechaLimite);
			  	//console.log("entro al segundo if",p)
			  	var fechaPago = moment(p.fechaPago);
			  	var diasMulta = fechaPago.diff(fechaLimite, "days");
			  	var multasVencidas = (diasMulta/100) * c.capitalSolicitado 
			  	//console.log(diasMulta)
			  	if (p.descripcion != "Multa") {
			  	pagos.push({credito_id:p.credito_id,fechaLimite:p.fechaLimite,numeroPago:p.numeroPago, importeRegular:multasVencidas,
			 		descripcion:"Multa",multa: 0,movimiento:"Multa"})
			  }


			  });
			}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			  if (p.estatus == 1 && p.multa == 0 && p.descripcion == "Multa" ) {
			  	//console.log("entro al if  3")
			 		
			  	planPago = PlanPagos.findOne({numeroPago:p.numeroPago,credito_id: p.credito_id})
				//console.log("planPagos",planPago)

				var fechaLimite = moment(p.fechaLimite);
				var hoy = new Date();
				ultimoPago = PlanPagos.findOne({numeroPago : p.numeroPago},{ sort : { fechaPago : -1 }});
				//console.log(ultimoPago)
			 	var fechaPago = moment(p.fechaPago);
			 	
			 	
			 	if (fechaActual > p.fechaLimite && planPago.multa == 1 && planPago.estatus == 0 && p.recargo != 1 ) {
			 		_.each(rc.creditos, function(c){

			 		//console.log("entro al if para la multa ")
			 
			 	
			 	var dias = fechaActual.diff(ultimoPago.fechaPago, "days");
			 	//console.log("oie papu estos son los dias",dias)

			  	var multaCosto = 0;
			  	
			  	var diasMulta = fechaActual.diff(ultimoPago.fechaPago, "days");
			  	var multasVencidas = (diasMulta/100) * c.capitalSolicitado 
			  	//console.log("tercer if",diasMulta)
			  	pagos.push({credito_id:p.credito_id,fechaLimite:hoy,numeroPago:p.numeroPago, importeRegular:multasVencidas,
			 		descripcion:"Multa",multa: 0,recargo:1,movimiento:"Multa"})
			 
			 	});
			   }

			  
			   // if (true) {}
			}


			//console.log(p,"eeee")
		});

		

//			pagos.sort(function(a,b) {return (a.numeroPago > b.numeroPago) ? 1 : ((b.numeroPago > a.numeroPago) ? -1 : 0);} );
			pagos.sort(fieldSorter(['numeroPago', 'descripcion']));
			//console.log("helpers",pagos)
			
			function fieldSorter(fields) {
			    return function (a, b) {
			        return fields
			            .map(function (o) {
			                var dir = 1;
			                if (o[0] === '-') {
			                   dir = -1;
			                   o=o.substring(1);
			                }
			                if (a[o] > b[o]) return dir;
			                if (a[o] < b[o]) return -(dir);
			                return 0;
			            })
			            .reduce(function firstNonZeroValue (p,n) {
			                return p ? p : n;
			            }, 0);
			    };
			}

			 return pagos
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
		pagos : () =>{
			return Pagos.find().fetch()
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
					//console.log("mas");
					//console.log(p.pagoSeleccionado, p.numeroPago);
					console.log("jaime puto",p)
					rc.pago.totalPago += p.importeRegular;	
					//var totalito = rc.pago.totalPago 

				}
				
			}
	
		});
		console.log("HELPER", rc.pago.totalPago)
	}

	this.guardarPago = function(pago,credito)
	{
		//rc.pago.totalPago = 0;
		var diaSemana = moment(new Date()).weekday();
		pago.fechaPago = new Date()
		pago.usuario_id = Meteor.userId()
		pago.sucursalPago_id = Meteor.user().profile.sucursal_id;
		pago.usuarioCobro_id = Meteor.userId()
		pago.diaPago = diaSemana;
		pago.estatus = 1;
		pago.planPagos=[];

		var remanente=pago.pagar;
		console.log("remanente!",remanente)

		var pago_id=undefined;
		pago_id = Pagos.insert(pago);

		_.each(rc.planPagosViejo, function(p){
			p.fechaPago = new Date()
			if(p.pagoSeleccionado && p.importeRegular<=remanente){
				console.log("kakakakak")

				var idTemporal = p._id;
				//Se Agrega el plan de pago al pago
				var npago={planPago_id:p._id,totalPago:p.importeRegular,estatus:1,fechaPago:pago.fechaPago, numeroPago : p.numeroPago,};
				pago.planPagos.push(npago);


//////////////////////   SI ES MULTA ////////////////////////////////////////////////////////////////////////////////////
				if(p.descripcion=="Multa"){
					console.log("entro multa",p)
					p.cargo = p.importeRegular
					planPago = PlanPagos.findOne({numeroPago:p.numeroPago,credito_id: p.credito_id})
					console.log("el plan pago relacionado",planPago)
					if (pago.pagar >= p.importeRegular) {
	 					p.importeRegular = 0
	 			
 				}

				if (p.importeRegular <= 0) {
					console.log("entro al if de la multa padre",)
					p.importeRegular = 0;
					p.fechaPago = pago.fechaPago;
					p.estatus = 1
					// p.pago_id = pago_id
					PlanPagos.update({_id:planPago._id},
				 	{ $set : { multa : 1}});

				}

				p.pagoSeleccionado=false;

				if (p.importeRegular <= 0) {
					if(!p.pagos) p.pagos=[];
					var npp={pago_id:pago_id,totalPago:pago.pagar,estatus:1,fechaPago:pago.fechaPago, numeroPago : p.numeroPago,
					movimiento:p.descripcion,cargo:0,planPago_id:p._id,	
				}
					p.pagos.push(npp);console.log("hace pago de multa")
					PlanPagos.insert(p);
				}
					console.log("multa pagada",p)
				}else{

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
				if ( p.importeRegular < 0) {
	 							p.importeRegular = 0
	 							p.estatus = 1

	 			}

				if (p.fechaLimite >= p.fechaPago) 
				{
					console.log("0")
					p.tiempoPago = 0

				}else{
					console.log("1")
					p.tiempoPago = 1
				}

				p.estatus=1
				//p.fechaPago = pago.fechaPago;
				p.pago_id = pago_id
				p.importeRegular= p.importeRegular - pago.pagar 
				
				//Se agrega el pago al plan de pagos
				if(!p.pagos) p.pagos=[];
				var npp={pago_id:pago_id,totalPago:pago.pagar,estatus:1,fechaPago:pago.fechaPago, numeroPago : p.numeroPago,
				movimiento:p.descripcion,cargo:0,planPago_id:p._id,	
				}
				p.pagos.push(npp);console.log("hace pago")


				delete p._id;
				p.pagoSeleccionado=false;
				PlanPagos.update({_id:idTemporal},{$set:p});
				p._id=idTemporal;
				remanente -= p.importeRegular;
			}
		}

			//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////

			else if(p.pagoSeleccionado && p.importeRegular>=remanente){
				console.log("valipito",p.importeRegular,remanente)


				p.importeRegular= p.importeRegular - pago.pagar 
				var idTemporal = p._id;
				var npago={planPago_id:p._id,totalPago:p.importeRegular,estatus:1,fechaPago:pago.fechaPago, numeroPago : p.numeroPago,};
				pago.planPagos.push(npago);



				p.pagoSeleccionado=false;
				if (p.fechaLimite >= p.fechaPago) 
				{
					console.log("0")
					p.tiempoPago = 0

				}else{
					console.log("1")
					p.tiempoPago = 1
				}

					if(p.descripcion=="Multa"){
					console.log("entro multa")
					p.cargo = p.importeRegular
					planPago = PlanPagos.findOne({numeroPago:p.numeroPago,credito_id: p.credito_id})
				//	console.log("el plan pago relacionado",planPago)



				if (p.importeRegular <= 0) {
					console.log("entro al if de la multa padre",)
					p.importeRegular = 0;
					p.fechaPago = pago.fechaPago;
					
					// p.pago_id = pago_id
					PlanPagos.update({_id:planPago._id},
				 	{ $set : { multa : 1}});
				
					//p.pagoSeleccionado=false;

				}

	

				if(!p.pagos) p.pagos=[];
				var npp={pago_id:pago_id,totalPago:pago.pagar,estatus:1,fechaPago:pago.fechaPago, numeroPago : p.numeroPago,
				movimiento:p.descripcion,cargo:0,planPago_id:p._id,	}
				p.pagos.push(npp);
				console.log("hace paguilllo de else")




				p.pagoSeleccionado=false;

				// if (p.importeRegular <= 0) {
				// 	p.estatus = 1
				// 	PlanPagos.insert(p);
				// }
				// 	console.log("multa pagada",p)
				}else{
					console.log("multa update",p)
					PlanPagos.update({_id:idTemporal},{$set:p});
				}
				delete p._id;
				PlanPagos.update({_id:idTemporal},{$set:p});


			}


		});

		delete pago._id;
		Pagos.update({_id:pago_id},{$set:pago});	
		rc.pago ={}
       
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
		});
	};
};