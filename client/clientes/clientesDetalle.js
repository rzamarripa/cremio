angular
	.module('creditoMio')
	.controller('ClientesDetalleCtrl', ClientesDetalleCtrl);
 
function ClientesDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
	
	this.fechaActual = new Date();
	this.creditos = [];
	this.creditos_id = [];
	rc.notaCuenta = []
	this.notaCobranza = {}
	this.masInfo = true;
	this.masInfoCredito = true;
	rc.cancelacion = {};
	rc.nota = {};
	window.rc = rc;
	
	this.subscribe("ocupaciones",()=>{
		return [{_id : this.getReactively("ocupacion_id"), estatus : true }]
	});
	
	this.subscribe('cliente', () => {
		return [{
			_id : $stateParams.objeto_id
		}];
	});
	
	this.subscribe('creditos', () => {
		return [{
			cliente_id : $stateParams.objeto_id
		}];
	});
	this.subscribe('notasCredito', () => {
		return [{
			cliente_id : $stateParams.objeto_id
		}];
	});
	
	this.subscribe('planPagos', () => {
		return [{
			cliente_id : $stateParams.objeto_id, credito_id : { $in : this.getCollectionReactively("creditos_id")}
		}];
	});
		 this.subscribe('notas',()=>{
		return [{cliente_id:this.getReactively("cliente_id"),respuesta:true}]
	});

	this.subscribe('tiposNotasCredito',()=>{
		return [{}]
	});
			
	this.helpers({
		creditos : () => {
			var creditos = Creditos.find({estatus:4}).fetch();
			if(creditos != undefined){
				rc.creditos_id = _.pluck(creditos, "cliente_id");
			}
			
			return creditos;
		},
		historialCreditos : () => {
			var creditos = Creditos.find({estatus:5}).fetch();
			if(creditos != undefined){
				rc.creditos_id = _.pluck(creditos, "cliente_id");
			}
			
			return creditos;
		},

		creditosAprobados : () =>{
			return Creditos.find({estatus:2});
		},
		creditosPendientes : () =>{
			return Creditos.find({estatus:1});
		},
		notasCredito : () =>{
			return NotasCredito.find({},{sort:{fecha:1}});
		},
		objeto : () => {
			var cli = Meteor.users.findOne({_id : $stateParams.objeto_id});
			_.each(cli, function(objeto){
				objeto.empresa = Empresas.findOne(objeto.empresa_id)

			});
			if(cli){
				this.ocupacion_id = cli.profile.ocupacion_id;
				return cli;
			}		
		},
		item : () =>{
			var kaka = rc.objeto
			return kaka
		},
		ocupaciones : () => {
			if(this.getReactively("creditos")){
				this.creditos_id = _.pluck(rc.creditos, "_id");
			}
			return Ocupaciones.find();
		},
		planPagos : () => {
			var planPagos = PlanPagos.find({},{sort : {numeroPago : 1, descripcion:-1}}).fetch();
			if(rc.getReactively("creditos") && rc.creditos.length > 0 && planPagos.length > 0){
				
				_.each(rc.getReactively("creditos"), function(credito){
					credito.planPagos = [];
					credito.pendientes = 0;
					credito.pagados = 0;
					credito.abonados = 0;
					credito.condonado = 0;
					credito.tiempoPago = 0;
					credito.pagos = 0;

					_.each(planPagos, function(pago){
						if(pago.descripcion=="Recibo"){
							credito.pagos +=pago.pago;
						}
						if(credito._id == pago.credito_id){
							credito.planPagos.push(pago);
							if(pago.estatus == 0){
								credito.pendientes++;
							}else if(pago.estatus == 1){
								credito.pagados++;
							}else if(pago.estatus == 2){
								credito.abonado++;
							}else if(pago.estatus == 3){
								credito.condonado++;
							}
							
							if(pago.multada == 1){
								credito.tiempoPago++;
							}
						}
					})
				})
			}
		},
		notaCuenta1: () => {
			var nota = Notas.find().fetch()
		

				return nota[nota.length - 1];
			
			
		},
		usuario: () => {
			return Meteor.users.findOne()
		},
		notaPerfil: () => {
			var nota = Notas.find({perfil : "perfil"}).fetch()
			return nota
		},
		
		
	});



	$(document).ready(function() {
    if (rc.getReactively("notaCuenta1") != undefined) {
    	console.log("entro al modal ",rc.notaCuenta1)

    	if (rc.notaCuenta1 != undefined) {
    		console.log("mostrara el modal ")
    	$("#myModal").modal(); 
    }

    }else{
    	console.log("no hay nota")
    }
});


	console.log("nota ",rc.notaCuenta1)
	this.actualizar = function(cliente,form){

		console.log(cliente);
		var clienteTemp = Meteor.users.findOne({_id : cliente._id});
		this.cliente.password = clienteTemp.password;
		this.cliente.repeatPassword = clienteTemp.password;
		console.log(this.cliente.password)
		//document.getElementById("contra").value = this.cliente.password;

		if(form.$invalid){
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var nombre = cliente.profile.nombre != undefined ? cliente.profile.nombre + " " : "";
		var apPaterno = cliente.profile.apPaterno != undefined ? cliente.profile.apPaterno + " " : "";
		var apMaterno = cliente.profile.apMaterno != undefined ? cliente.profile.apMaterno : "";
		cliente.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		delete cliente.profile.repeatPassword;
		Meteor.call('updateGerenteVenta', rc.cliente, "cliente");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		$state.go('root.clientes');
	};
	
	this.tomarFoto = function () {
		$meteor.getPicture().then(function(data){
			rc.cliente.profile.fotografia = data;
		});
	};
	
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
	
	this.masInformacion = function(){
		this.masInfo = !this.masInfo;
	}
	this.masInformacionCrdito = function(){
		this.masInfoCredito = !this.masInfoCredito;
	}
	this.getNombreTipoNotaCredito = function (tipo_id) {
		var tipo = TiposNotasCredito.findOne(tipo_id);
		return tipo? tipo.nombre:"";
	}
	this.obtenerEstatus = function(cobro){
		if(cobro.estatus == 1)
			return "bg-color-green txt-color-white";
	 	if(cobro.estatus == 5 || cobro.tmpestatus==5)
		 	return "bg-color-blue txt-color-white";
	 	else if(cobro.estatus == 3)
	 		return "bg-color-blueDark txt-color-white";
	 	else if(cobro.estatus == 2)
	 		return "bg-color-red txt-color-white";
	 	else if(cobro.estatus == 6)
	 		return "bg-color-greenLight txt-color-white";
	 	else if(cobro.tiempoPago == 1)
	 		return "bg-color-orange txt-color-white";
		
		return "";
		
	}


	// $(document).ready(function() {
	// 	if (rc.getReactively("nota") != undefined) {
	// 	    	//console.log("entro al modal ")
	// 	   if (rc.notaCuenta1.perfil != undefined) {
	// 	    		//console.log("mostrara el modal ")
	// 	    	$("#myModal").modal(); 
	// 	   	}
	// 	   	else
	// 	   	{
	// 	    	$("#myModal").modal('hide'); 
	// 			}
 //    }
	// });



	this.contestarNota = function(id){

		this.nota = Notas.findOne({_id:id});

		console.log(this.nota)
		
		if (rc.notaCobranza.respuestaNota != undefined) {
			console.log("entro")
			this.nota.respuestaNota = rc.notaCobranza.respuestaNota
			var idTemp = this.nota._id;
			delete this.nota._id;
			this.nota.respuesta = false
			Notas.update({_id:idTemp},{$set:this.nota});
			toastr.success('Comentario guardado.');
			$("#myModal").modal('hide');
		}else{
			toastr.error('Comentario vacio.');
		}


	};
	

/*
	this.imprimirDocumento = function(aprobado){
			Meteor.call('imprimirDocumentos', aprobado, function(error, response) {
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
					    dlnk.download = "Documentos.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);
		  
				   }
				});	
	};	
*/

	
	this.cancelarCredito = function(motivo){
			
			var cre = Creditos.findOne({folio : rc.cancelacion.folio});
			Creditos.update({_id : cre._id}, { $set : {estatus : 6, motivo: motivo}});
			toastr.success("El crédito se ha cancelado.")
			$("[data-dismiss=modal]").trigger({ type: "click" });			
		
	};
	
	
	this.cancelarSeleccion = function(aprobado){
			 rc.cancelacion.folio = aprobado.folio;
	};


	

	this.mostrarNotaCliente = function(){
		$("#modalCliente").modal();
		rc.nota = {};
		
	};

	this.guardarNota = function(objeto){
		console.log(objeto,"nota")
		objeto.perfil = "perfil"
		objeto.cliente_id = rc.objeto._id
		objeto.nombreCliente = rc.objeto.profile.nombreCompleto
		objeto.respuesta = true;
		Notas.insert(objeto);
		toastr.success('Nota guardada.');
		rc.nota = {};
		$("#modalCliente").modal('hide');

       		
	};
	this.verNota = function(){
		$("#notaPerfil").modal();

	}




	
	
}