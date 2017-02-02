angular.module("creditoMio")
.controller("ClientesFormCtrl", ClientesFormCtrl);
 function ClientesFormCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams){
 	
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.objeto.profile = {};
  this.objeto.profile.empresa_id = "";
  this.empresa = {}; 
  this.objeto_id = ""
  
  this.pais_id = "";
  this.estado_id = "";
  this.municipio_id = "";
  this.ciudad_id = "";
  this.empresa_id = "";
  
  this.con = 0;
  this.num = 0;
  this.referenciasPersonales = [];
  this.parentezco = {};
  
	this.subscribe('empresas',()=>{
		return [{estatus: true}]
	});
	
	this.subscribe('estadoCivil',()=>{
		return [{estatus: true}]
	});
	
	this.subscribe('nacionalidades',()=>{
		return [{estatus: true}]
	});
	
	this.subscribe('ocupaciones',()=>{
		return [{estatus: true}]
	});
	
	this.subscribe('paises',()=>{
		return [{estatus: true}]
	});
	
	this.subscribe('estados',()=>{
		return [{pais_id: this.getReactively("pais_id"), estatus: true}]		
	});
	
	this.subscribe('municipios',()=>{
		return [{estado_id: this.getReactively("estado_id"), estatus: true}]				
	});
	
	this.subscribe('ciudades',()=>{
    return [{municipio_id: this.getReactively("municipio_id"), estatus: true}]
	
	});
	
	this.subscribe('colonias',()=>{
		return [{ciudad_id: this.getReactively("ciudad_id"), estatus: true}]
	});
	
	if($stateParams.objeto_id != undefined){
		this.action = false;
		rc.objeto_id = $stateParams.objeto_id
		this.subscribe('cliente', () => {
			return [{
				id : $stateParams.objeto_id
			}];
		});
	}
	 
	this.helpers({
	  estadosCiviles : () => {
		  return EstadoCivil.find();
	  },
	  nacionalidades : () => {
		  return Nacionalidades.find();
	  },
	  ocupaciones : () => {
		  return Ocupaciones.find();
	  },
	  paises : () => {
		  return Paises.find();
	  },
	  estados : () => {
		  return Estados.find();
	  },
	  municipios : () => {
		  return Municipios.find();
	  },
	  ciudades : () => {
		  return Ciudades.find();
	  },
	  colonias : () => {
		  return Colonias.find();
	  },
	  empresas : () => {
		  return Empresas.find();
	  },
	  objeto : () => {
		  var objeto = Meteor.users.findOne({_id : this.getReactively("objeto_id")});
		  rc.empresa = Empresas.findOne({_id : this.getReactively("empresa_id")});
		  return objeto;
	  }
  }); 
  
  this.Nuevo = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.objeto = {};		
  };
  
  this.cambiarPaisObjeto = function() {this.pais_id = this.getReactively("objeto.profile.pais_id");};
  this.cambiarEstadoObjeto = function() {this.estado_id = this.getReactively("objeto.profile.estado_id");};
  this.cambiarMunicipioObjeto = function() {this.municipio_id = this.getReactively("objeto.profile.municipio_id");};
  this.cambiarCiudadObjeto = function() {this.ciudad_id = this.getReactively("objeto.profile.ciudad_id");};
  
  this.cambiarPaisEmpresa = function() {this.pais_id = this.getReactively("empresa.pais_id");};
  this.cambiarEstadoEmpresa = function() {this.estado_id = this.getReactively("empresa.estado_id");};
  this.cambiarMunicipioEmpresa = function() {this.municipio_id = this.getReactively("empresa.municipio_id");};
  this.cambiarCiudadEmpresa = function() {this.ciudad_id = this.getReactively("empresa.ciudad_id");};
  

  this.guardar = function(objeto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			
			objeto.profile.estatus = true;
			objeto.profile.usuarioInserto = Meteor.userId();
			objeto.profile.sucursal_id = Meteor.user().profile.sucursal_id;
			objeto.profile.fechaCreacion = new Date();
			objeto.profile.referenciasPersonales = angular.copy(this.referenciasPersonales);
			var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
			var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
			var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
			objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;
			console.log(objeto.profile.nombreCompleto);
			Meteor.call('createUsuario', objeto, "Cliente");
			toastr.success('Guardado correctamente.');
			this.usuario = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
			$state.go('root.clientesLista');
		
	};
	
	this.actualizar = function(objeto,form){

		console.log(objeto);
		
	
/*
		var objetoTemp = Meteor.users.findOne({_id : objeto._id});
		this.objeto.password = objetoTemp.password;
		this.objeto.repeatPassword = objetoTemp.password;
		console.log(this.objeto.password)
		//document.getElementById("contra").value = this.objeto.password;
		console.log(form);
		if(form.$invalid){
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
		var apPaterno = objeto.profile.apPaterno != undefined ? objeto.profile.apPaterno + " " : "";
		var apMaterno = objeto.profile.apMaterno != undefined ? objeto.profile.apMaterno : "";
		objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		delete objeto.profile.repeatPassword;
		Meteor.call('updateGerenteVenta', rc.objeto, "Cliente");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		$state.go('root.clientes');
*/
	};
	
	this.guardarEmpresa = function(empresa, objeto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			empresa.estatus = true;
			empresa.usuarioInserto = Meteor.userId();
			
			
			Empresas.insert(empresa, function(error, result)
															 {
																	if (error){
																		console.log("error: ",error);
																	}
																	if (result)
																	{
																			objeto.profile.empresa_id = result;
																			toastr.success('Guardado correctamente.');
																			this.empresa = {}; 
																			$('.collapse').collapse('hide');
																			this.nuevo = true;
																			form.$setPristine();
																	    form.$setUntouched();
																	    $("[data-dismiss=modal]").trigger({ type: "click" });
																	    
																	}
															 }
											);
					
	};
	
	this.actualizar = function(objeto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
		  
		  /*
			var idTemp = objeto._id;
			delete objeto._id;		
			objeto.usuarioActualizo = Meteor.userId(); 
			objeto.fechaUltimaModificación = new Date();
			Documentos.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
      
      */
	};
	
	
	this.insertarReferencia = function()
	{
			/*
			//Validar que no venga vacio
			if (this.mes==null) 
			{
				toastr.error('Seleccionar Mes.');
				return;
			}	
			//validar que vengan mes y cantidad
			if (this.mes.nombre == null || this.mes.cantidad == null) 
			{
				toastr.error('Seleccionar Mes y Cantidad');
				return;
			}	
			
			*/
			
			//incremeneto
			this.con = this.con + 1;
			this.parentezco.num = this.con;
			
			this.referenciasPersonales.push(this.parentezco);	
			this.parentezco={};
	};
	
	this.actualizarReferencia = function(p)
	{
			p.num = this.num;
			console.log(p);
			console.log(this.referenciasPersonales);
			console.log(this.num);
			_.each(this.referenciasPersonales, function(rp){
							if (rp.num == p.num)
							{
									console.log("entro");
									rp.nombre = p.nombre;
									rp.apellidoPaterno = p.apellidoPaterno;
									rp.apellidoMaterno = p.apellidoMaterno;			
									rp.parentezco = p.parentezco;
									rp.direccion = p.direccion;
									rp.telefono = p.telefono;
									rp.tiempo = p.tiempo;
							}
			})
			
			this.parentezco={};
			this.num=0;
			this.action = true;
	};
	
	this.cancelarReferencia = function()
	{
			this.parentezco={};
			this.num = -1;
			this.action = true;
	};
	
	this.quitarReferencia = function(numero)
	{
			pos = functiontofindIndexByKeyValue(this.referenciasPersonales, "num", numero);
	    this.referenciasPersonales.splice(pos, 1);
	    if (this.referenciasPersonales.length == 0) this.con = 0;
	    //reorganiza el consecutivo     
	    functiontoOrginiceNum(this.referenciasPersonales, "num");
	};
	
	this.editarReferencia = function(p)
	{
			this.parentezco.nombre = p.nombre;
			this.parentezco.apellidoPaterno = p.apellidoPaterno;
			this.parentezco.apellidoMaterno = p.apellidoMaterno;			
			this.parentezco.parentezco = p.parentezco;
			this.parentezco.direccion = p.direccion;
			this.parentezco.telefono = p.telefono;
			this.parentezco.tiempo = p.tiempo;
			
			this.num = p.num;
	    this.action = false;
	};
	
	//busca un elemento en el arreglo
	function functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
	    for (var i = 0; i < arraytosearch.length; i++) {
	    	if (arraytosearch[i][key] == valuetosearch) {
				return i;
			}
	    
	  }
	    return null;
  };
    
    //Obtener el mayor
	function functiontoOrginiceNum(arraytosearch, key) {
		var mayor = 0;
	    for (var i = 0; i < arraytosearch.length; i++) {
	    	arraytosearch[i][key] = i + 1;	
	    }
  };


};