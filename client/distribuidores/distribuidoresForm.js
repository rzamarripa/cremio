angular.module("creditoMio")
.controller("DistribuidoresCtrl", DistribuidoresCtrl);
 function DistribuidoresCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams){
 	
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
	rc.pic = "";
  var fotillo = ""
	
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
	
/*
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
*/
	this.subscribe('estados',()=>{

		if (this.getReactively("pais_id") !=  "")
		{
				console.log("Cambio pais:", this.pais_id);		
				return [{pais_id: this.getReactively("pais_id"), estatus: true}];
				
		}		

		else 
				return [{estatus: true}];

	});


	this.subscribe('municipios',()=>{
		if (this.getReactively("estado_id") !=  "")
		{	
				console.log("Cambio Estado");
				return [{estado_id: this.getReactively("estado_id"), estatus: true}];
				
		}		

		else 
				return [{estatus: true}];	

	});

	

	this.subscribe('ciudades',()=>{
    if (this.getReactively("municipio_id") !=  "")
    {
				console.log("Cambio Muni");
				return [{municipio_id: this.getReactively("municipio_id"), estatus: true}];
				
		}		

		else 
				return [{estatus: true}];

	});

	this.subscribe('colonias',()=>{
		if (this.getReactively("ciudad_id") !=  "")
				return [{ciudad_id: this.getReactively("ciudad_id"), estatus: true}];

		else 
				return [{estatus: true}];

	});	
	
	if($stateParams.objeto_id != undefined){
		this.action = false;
		rc.objeto_id = $stateParams.objeto_id
		this.subscribe('supervisor', () => {
			return [{
				id : $stateParams.objeto_id
			}];
		},{onReady:()=>{
			var objeto = Meteor.users.findOne({_id : this.getReactively("objeto_id")});
			console.log(objeto,rc.objeto_id)
			rc.objeto=objeto;
			$scope.$apply()
			rc.empresa = Empresas.findOne({_id : this.getReactively("empresa_id")});
		}});
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
			objeto.profile.foto = rc.pic;
			objeto.profile.estatus = true;
			objeto.profile.usuarioInserto = Meteor.userId();
			objeto.profile.sucursal_id = Meteor.user().profile.sucursal_id;
			objeto.profile.fechaCreacion = new Date();
			var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
			var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
			var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
			objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;
			//console.log(objeto.profile.nombreCompleto);
			Meteor.call('createUsuario', objeto, "Supervisor");
			toastr.success('Guardado correctamente.');
			this.usuario = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
			form.$setUntouched();
			$state.go('root.supervisoresLista');
		
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
				 });
					
	};


	this.actualizar = function(objeto,form)
	{
			if(form.$invalid){
				toastr.error('Error al actualizar los datos.');
				return;
			}
			var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
			var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
			var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
			objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;
			if (rc.pic != ""){
				objeto.profile.foto = rc.pic
			}
			else{
				objeto.profile.foto = rc.objeto.profile.foto
			}		
			delete objeto.profile.repeatPassword;
			Meteor.call('updateUsuario', objeto, "Supervisor");
			toastr.success('Actualizado correctamente.');
			//$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
			form.$setUntouched();
			$state.go('root.supervisoresLista');
			
			
			
			
		
	};
	this.tomarFoto = function(objeto){
			console.log(objeto)
		    $meteor.getPicture().then(function(data){
			fotillo = data
			rc.pic = fotillo
			//objeto.profile.fotografia = this.objeto.profile.fotografia;
		});
  };

};


	