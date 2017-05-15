angular.module("creditoMio")
.controller("ClientesFormCtrl", ClientesFormCtrl);
 function ClientesFormCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams){
 	
  let rc = $reactive(this).attach($scope);
  window.rc = rc;
  
  this.action = true;
  this.actionReferencia = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.objeto.profile = {};
  this.objeto.profile.empresa_id = "";
  this.empresa = {}; 
  this.objeto_id = ""
  rc.pic = "";
  
  this.pais_id = "";
  this.estado_id = "";
  this.municipio_id = "";
  this.ciudad_id = "";
  this.empresa_id = "";
  
  this.con = 0;
  this.num = 0;
  this.referenciasPersonales = [];
  this.parentezco = {};
  
  this.buscar = {};
	this.buscar.nombre = "";
	this.buscando = false;
	var fotillo = ""
	this.pic = {};
	this.imagenes = []
	
	this.estadoCivil = "";
	this.estadoCivilSeleccionado = {};
	  

  this.subscribe('buscarPersonas', () => {
		if(this.getReactively("buscar.nombre").length > 3){
			this.buscando = true;
			return [{
		    options : { limit: 10 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre')
				} 		   
	    }];
		}
		else if (this.getReactively("buscar.nombre").length  == 0 )
			this.buscando = false;
  });

  

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

	this.subscribe('documentos',()=>{
		return [{estatus: true}]
	});
	
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
	
	//Condición del Parametro

	if($stateParams.objeto_id != undefined){
			rc.action = false;
			rc.objeto_id = $stateParams.objeto_id
			this.subscribe('cliente', () => {
				return [{
					id : $stateParams.objeto_id
				}];
			});
	}

	 
	this.helpers({
	  estadosCiviles : () => {
		  //if (this.getReactively("objeto") && rc.objeto != undefined && objeto.estadoCivil_id != undefined)
		  //	 rc.estadoCivilSeleccionado = EstadoCivil.findOne(objeto.estadoCivil_id);
		  
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
	  documentos : () => {
		  return Documentos.find();
	  },
	   imagenesDocs : () => {
	   	var imagen = rc.imagenes
	   	_.each(rc.getReactively("imagenes"),function(imagen){
	   		imagen.archivo = rc.objeto.profile.foto

	   	});


		  return imagen
	  },
	  objetoEitar : () => {
		  var objeto = Meteor.users.findOne({_id : this.getReactively("objeto_id")});
		  rc.empresa = Empresas.findOne({_id : this.getReactively("empresa_id")});
		  
		  
		  if (objeto != undefined)
		  {
			  	this.referenciasPersonales = [];
				  if ($stateParams.objeto_id != undefined)
					{
							_.each(objeto.profile.referenciasPersonales_ids,function(referenciaPersonal_id){
										Meteor.call('getPersona', referenciaPersonal_id, $stateParams.objeto_id, function(error, result){						
													if (result)
													{
															//Recorrer las relaciones 
															//console.log(result);
															rc.referenciasPersonales.push({buscarPersona_id	: referenciaPersonal_id,
																														 nombre						: result.nombre,
																														 apellidoPaterno	: result.apellidoPaterno,
																														 apellidoMaterno	: result.apellidoMaterno,
																														 parentezco				: result.parentezco,
																														 direccion				: result.direccion,
																														 telefono					: result.telefono,
																														 tiempo						: result.tiempo,
																														 num							: result.num,
																														 cliente					: result.cliente,
																														 cliente_id				: result.cliente_id,
																														 tipoPersona			: result.tipoPersona,
																														 estatus					: result.estatus
															});
															$scope.$apply();		
													}
										});	
					  	});			
							
					}
					
					
					
					rc.objeto = objeto;
					//eturn objeto;
			}  
	  },
	  personasTipos : () => {
			var personas = Personas.find({
		  	"nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' }
			}, { sort : {"nombreCompleto" : 1 }}).fetch();
			return personas;
		},	
  }); 


this.tomarFoto = function(objeto){
			console.log(objeto)
		    $meteor.getPicture().then(function(data){
			fotillo = data
			rc.pic = fotillo
			//objeto.profile.fotografia = this.objeto.profile.fotografia;
		});
    };



  
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
  this.cambiarColoniaEmpresa = function() {this.colonia_id = this.getReactively("empresa.colonia_id");};


  this.guardar = function(objeto,form)
	{
			console.log(objeto);
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			
			objeto.profile.estatus = true;
			objeto.profile.archivo = rc.imagenes
			objeto.profile.foto = fotillo;
			objeto.profile.usuarioInserto = Meteor.userId();
			objeto.profile.sucursal_id = Meteor.user().profile.sucursal_id;
			objeto.profile.fechaCreacion = new Date();
			objeto.profile.referenciasPersonales = angular.copy(this.referenciasPersonales);
			var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
			var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
			var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
			objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;
			
			Meteor.call('createUsuario', objeto, "Cliente", function(e,r){
					if (r)
					{
							toastr.success('Guardado correctamente.');
							this.usuario = {};
							$('.collapse').collapse('hide');
							this.nuevo = true;
							form.$setPristine();
					    form.$setUntouched();
							$state.go('root.clienteDetalle', { 'objeto_id':r});
					}
			});
			
		
	};
	
	this.actualizarForm = function(objeto,form){


		if(form.$invalid){
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
		var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
		var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
		objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		delete objeto.profile.repeatPassword;
		Meteor.call('updateGerenteVenta', rc.objeto, this.referenciasPersonales, "Cliente");
		toastr.success('Actualizado correctamente.');
		//$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		$state.go('root.clientesLista');
		//console.log(objeto,"Final");

	};
	
	this.guardarEmpresa = function(empresa, objeto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			empresa.estatus = true;
			empresa.usuarioInserto = Meteor.userId();
			//objeto.profile.foto = this.objeto.profile.foto;
			
			
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
		
	this.AgregarCliente = function(a){

		this.objeto = {}; 
		this.objeto.profile = {};
		
		this.objeto.profile.nombre = a.nombre;
		this.objeto.profile.apellidoPaterno = a.apellidoPaterno;
		this.objeto.profile.apellidoMaterno = a.apellidoMaterno;
		this.objeto.profile.direccion = a.direccion;
		this.objeto.profile.persona_id = a._id;

		this.buscar.nombre = "";
	};
	
	this.AgregarReferencia = function(a){
		this.parentezco.nombre = a.nombre;
		this.parentezco.apellidoPaterno = a.apellidoPaterno;
		this.parentezco.apellidoMaterno = a.apellidoMaterno;
		this.parentezco.direccion = a.direccion;
		this.parentezco.parentezco = a.parentezco;
		this.parentezco.tiempoConocerlo = a.tiempoConocerlo;
		this.parentezco.persona_id = a._id;
		this.buscar.nombre = "";
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
			//console.log(this.referenciasPersonales.length);
			
			//incremeneto
			//this.con = this.con + 1;
			
			//console.log(this.parentezco);
			
			
			this.parentezco.num = this.referenciasPersonales.length + 1;
			
			this.referenciasPersonales.push(this.parentezco);	
			this.parentezco={};
	};
	
	this.actualizarReferencia = function(p)
	{
			p.num = this.num;
			
			_.each(this.referenciasPersonales, function(rp){
							if (rp.num == p.num)
							{
									rp.nombre = p.nombre;
									rp.apellidoPaterno = p.apellidoPaterno;
									rp.apellidoMaterno = p.apellidoMaterno;			
									rp.parentezco = p.parentezco;
									rp.direccion = p.direccion;
									rp.telefono = p.telefono;
									rp.tiempo = p.tiempo;
							}
			});
			
			this.parentezco={};
			this.num=0;
			rc.actionReferencia = true;
	};
	
	this.cancelarReferencia = function()
	{
			this.parentezco={};
			this.num = -1;
			rc.actionReferencia = true;
	};
	
	this.borrarReferencia = function()
	{
			this.parentezco.nombre = "";
			this.parentezco.apellidoPaterno = "";
			this.parentezco.apellidoMaterno = "";
			this.parentezco.direccion = "";
			this.parentezco.parentezco = "";
			this.parentezco.tiempoConocerlo = "";
			delete this.parentezco["persona_id"];

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
	    this.actionReferencia = false;
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

  this.almacenaImagen = function(imagen)
	{
		if (this.objeto)
			this.objeto.profile.foto = imagen;
		    this.imagenes.push({archivo:imagen})
		    console.log(this.imagenes)

						
	}


  $(document).ready( function() {
		

			$(".Mselect2").select2();
					
			var fileInput1 = document.getElementById('fileInput1');
			var fileDisplayArea1 = document.getElementById('fileDisplayArea1');
			
			
			//JavaScript para agregar la Foto
			fileInput1.addEventListener('change', function(e) {
				var file = fileInput1.files[0];
				var imageType = /image.*/;
	
				if (file.type.match(imageType)) {
					
					if (file.size <= 512000)
					{
						
						var reader = new FileReader();
		
						reader.onload = function(e) {
							fileDisplayArea1.innerHTML = "";
		
							var img = new Image();
							
							
							img.src = reader.result;
							img.width =200;
							img.height=200;
		
							rc.almacenaImagen(reader.result);
							//this.folio.imagen1 = reader.result;
							
							fileDisplayArea1.appendChild(img);
							//console.log(fileDisplayArea1);
						}
						reader.readAsDataURL(file);			
					}else {
						toastr.error("Error la Imagen supera los 512 KB");
						return;
					}
					
				} else {
					fileDisplayArea1.innerHTML = "File not supported!";
				}
			});		
	    });


  this.getDocumentos= function(documento_id)
	{
	
		console.log(documento_id);
		rc.documento = Documentos.findOne(documento_id);
		//rc.nota.unidad = Unidades.findOne(rc.nota.unidad_id);
	};

	  this.mostrarModal= function()
	{
		$("#myModal").modal();
	};

	this.seleccionEstadoCivil = function(estadoCivil)
	{
			console.log(estadoCivil);			

	}
	
	this.calcularTotales = function()
	{
			
						
			rc.objeto.profile.totalIngresos = Number(rc.objeto.profile.ingresosPersonales == "" ? 0 :rc.objeto.profile.ingresosPersonales) + 
																			  Number(rc.objeto.profile.ingresosConyuge == "" ? 0 :rc.objeto.profile.ingresosConyuge) + 
																			  Number(rc.objeto.profile.otrosIngresos == "" ? 0 : rc.objeto.profile.otrosIngresos);
			
			rc.objeto.profile.totalGastos = Number(rc.objeto.profile.gastosFijos == "" ? 0 :rc.objeto.profile.gastosFijos) + 
																			Number(rc.objeto.profile.gastosEventuales == "" ? 0 :rc.objeto.profile.gastosEventuales);
			
			rc.objeto.profile.resultadoNeto = Number(rc.objeto.profile.totalIngresos) - Number(rc.objeto.profile.totalGastos);
			
	};

	this.seleccionarEstadoCivil = function(estadoCivil_id)
	{
			this.estadoCivilSeleccionado = EstadoCivil.findOne(estadoCivil_id);	
	}
};