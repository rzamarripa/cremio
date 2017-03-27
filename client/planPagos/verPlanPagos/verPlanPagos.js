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

	this.subscribe('personas', () => {
		return [{ }];
	});


	this.helpers({

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
		  			
		  			
		  		})
	  		}
			return clientes;
		},
		planPagos : () => {
			return PlanPagos.find({},{sort : {numeroPago : 1,descripcion:-1}});
		},
		tiposCredito : () => {
			return TiposCredito.find();
		},
		planPagosViejo : () => {
			
			rc.credito_id = $stateParams.credito_id;
			var fechaActual = moment();
			var pagos = PlanPagos.find({},{sort : {numeroPago : 1,descripcion:-1}}).fetch();

			var credito =Creditos.findOne({_id : $stateParams.credito_id});
		

			return pagos
		},
		creditos : () => {
			var creditos = Creditos.find($stateParams.credito_id).fetch();
			if(creditos != undefined){
				rc.creditos_id = _.pluck(creditos, "cliente_id");
				_.each(creditos, function(credito){
					credito.planPagos = PlanPagos.find({credito_id : credito._id},{sort : {numeroPago : -1}}).fetch();
			  			credito.nombreTipoCredito = TiposCredito.findOne(credito.tipoCredito_id)
				})
			}


			if (creditos) {
		  		_.each(creditos, function(credito){

		  			_.each(credito.avales_ids, function(aval){
		  			  credito.aval = Personas.findOne(aval)
					
					});		  			
		  			
		  		})
	  		}
			return creditos;
		},
		pagos : () =>{
			return Pagos.find().fetch()
		},
		notas : () => {
			return Notas.find().fetch();
		},
	});
	  
 
	
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
	
	
	
	this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "Masculino")
				return "img/badmenprofile.png";
			else if(sexo === "Femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
		}else{
			return foto;
		}
	}
	

  
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
	



	this.seleccionarPago = function(pago)
	{ 
		console.log(pago);
 		pago.pagoSeleccionado = !pago.pagoSeleccionado;
		pago.estatus = 0;	
		rc.pago.totalPago = 0;

		_.each(rc.planPagosViejo, function(p){
			if(p.pagoSeleccionado != undefined){
				if(p.pagoSeleccionado == true){
					rc.pago.totalPago += p.importeRegular;	
				}	
			}
		});
	}

	this.guardarPago = function(pago,credito)
	{

		var seleccionadosId=[];
		_.each(rc.planPagosViejo,function(p){
			if(p.pagoSeleccionado)
				seleccionadosId.push(p._id)

		});

		Meteor.call("pagoParcialCredito",seleccionadosId,pago.pagar,pago.totalPago,function(error,success){
			if(success!="OK")
				toastr.error('Error al guardar.');
		});
		
       
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