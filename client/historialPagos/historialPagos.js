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
	this.notaCredito = {};
	this.pago = {};
	this.pago.totalPago = 0;
	//this.creditos = [];
	this.creditos_id = []

	this.total = 0;
	this.notaCre = true;

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
			pagos = PlanPagos.find({},{sort : {numeroPago : 1,descripcion:-1}}).fetch();

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
			var saldo =0;	
			var credito = this.credito	


			
			_.each(rc.getReactively("planPagosViejo"), function(planPago, index){

				if(index==0){
					try{ 
						saldo = credito.numeroPagos*planPago.cargo;
						
					} 
					catch(ex){
						console.log(ex); 
						console.log("aqui",planPago);
						saldo=0
					}
				}
				
				arreglo.push({saldo:saldo,
					numeroPago : planPago.numeroPago,
					cantidad : credito.numeroPagos,
					fechaSolicito : credito.fechaSolicito,
					fecha : planPago.fechaPago,
					pago : planPago.importeRegular, 
					cargo : planPago.cargo,
					movimiento : planPago.movimiento,
					planPago_id : planPago._id,
					credito_id : planPago.credito_id,
					descripcion : planPago.descripcion,
					importe : planPago.importeRegular,
					pagos : planPago.pagos
			  	});
					
				if(planPago.descripcion=="Multa")
					saldo+=planPago.importeRegular
				
				console.log(saldo)
			});
			

			console.log("el ARREGLO del helper historial",arreglo)
			return arreglo;
		}
	});
	  

	

	

	
	
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