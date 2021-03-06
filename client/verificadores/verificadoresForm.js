angular.module("creditoMio")
	.controller("VerificadoresFormCtrl", VerificadoresFormCtrl);
function VerificadoresFormCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {

	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	this.action = true;
	this.nuevo = true;
	this.objeto = {};
	this.objeto.profile = {};
	this.objeto.profile.empresa_id = "";
	this.empresa = {};
	this.objeto_id = ""

	rc.pic = "";
	var fotillo = ""
	this.pais_id = "";
	this.estado_id = "";
	this.municipio_id = "";
	this.ciudad_id = "";
	this.empresa_id = "";

	this.cambiarContrasena = false;
	this.buscar = {};
	this.buscar.coloniaNombre = "";
	rc.colonia = {};
	this.buscandoColonia = false;


	this.subscribe('estadoCivil', () => {
		return [{ estatus: true }]
	});

	this.subscribe('nacionalidades', () => {
		return [{ estatus: true }]
	});

	this.subscribe('ocupaciones', () => {
		return [{ estatus: true }]
	});

	this.subscribe('paises', () => {
		return [{ estatus: true }]
	});

	this.subscribe('estados', () => {
		if (this.getReactively("objeto.profile.pais_id") != undefined)
			return [{ pais_id: this.getReactively("objeto.profile.pais_id"), estatus: true }];
	});

	this.subscribe('municipios', () => {
		if (this.getReactively("objeto.profile.estado_id") != undefined)
			return [{ estado_id: this.getReactively("objeto.profile.estado_id"), estatus: true }];
	});

	this.subscribe('ciudades', () => {
		if (this.getReactively("objeto.profile.municipio_id") != undefined)
			return [{ municipio_id: this.getReactively("objeto.profile.municipio_id"), estatus: true }];
	});

	this.subscribe('colonias', () => {
		if (this.getReactively("objeto.profile.colonia_id") != undefined)
			return [{ _id: this.getReactively("objeto.profile.colonia_id") }]
	});

	this.subscribe('buscarColonias', () => {
		if (this.getReactively("buscar.coloniaNombre").length > 3) {
			this.buscandoColonia = true;
			return [{
				options: { limit: 10 },
				where: {
					ciudad_id: this.getReactively("objeto.profile.ciudad_id"),
					nombre: this.getReactively('buscar.coloniaNombre')
				}
			}];
		}
		else if (this.getReactively("buscar.coloniaNombre").length == 0)
			this.buscandoColonia = false;
	});



	if ($stateParams.objeto_id != undefined) {
		this.action = false;
		this.cambiarContrasena = true;
		rc.objeto_id = $stateParams.objeto_id
		this.subscribe('verificadores', () => {
			return [{
				_id: $stateParams.objeto_id
			}];
		}, {
			onReady: () => {
				var objeto = Meteor.users.findOne({ _id: this.getReactively("objeto_id") });
				rc.objeto = objeto;
				rc.objeto.confirmpassword = "sinpassword";
				rc.objeto.password = "sinpassword";
				$scope.$apply()

			}
		});
	}

	this.helpers({
		estadosCiviles: () => {
			return EstadoCivil.find();
		},
		nacionalidades: () => {
			return Nacionalidades.find();
		},
		ocupaciones: () => {
			return Ocupaciones.find();
		},
		paises: () => {
			return Paises.find();
		},
		estados: () => {
			return Estados.find({ pais_id: this.getReactively("objeto.profile.pais_id"), estatus: true });
		},
		municipios: () => {
			return Municipios.find({ estado_id: this.getReactively("objeto.profile.estado_id"), estatus: true });
		},
		ciudades: () => {
			return Ciudades.find({ municipio_id: this.getReactively("objeto.profile.municipio_id"), estatus: true });
		},
		colonias: () => {
			return Colonias.find({
				ciudad_id: this.getReactively("objeto.profile.ciudad_id"),
				nombre: { '$regex': '.*' + this.getReactively('buscar.coloniaNombre') || '' + '.*', '$options': 'i' }
			});
		},
		col: () => {
			rc.colonia = Colonias.findOne({ _id: this.getReactively("objeto.profile.colonia_id") });
		},
	});


	this.tomarFoto = function (objeto) {
		$meteor.getPicture().then(function (data) {
			rc.fotillo = data
			rc.pic = fotillo

		});
	};

	this.Nuevo = function () {
		this.action = true;
		this.nuevo = !this.nuevo;
		this.objeto = {};
	};


	this.guardar = function (objeto, form) {
		if (form.$invalid) {
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
		Meteor.call('createUsuario', objeto, "Verificador");
		toastr.success('Guardado correctamente.');
		//console.log("objeto", objeto)
		this.usuario = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		$state.go('root.verificadoresLista');
	};

	this.actualizar = function (objeto, form) {


		if (form.$invalid) {
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
		var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
		var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
		objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;

		if (rc.pic != "") {
			objeto.profile.foto = rc.pic
		}
		else {
			objeto.profile.foto = rc.objeto.profile.foto
		}


		delete objeto.profile.repeatPassword;
		Meteor.call('updateUsuario', objeto, null, "Verificador", this.cambiarContrasena);
		toastr.success('Actualizado correctamente.');
		//$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		$state.go('root.verificadoresLista');



	};

	this.tomarFoto = function (objeto) {
		$meteor.getPicture().then(function (data) {
			rc.fotillo = data
			rc.pic = rc.fotillo
			//objeto.profile.fotografia = this.objeto.profile.fotografia;
		});
	};

	this.agregarColonia = function (colonia) {
		rc.colonia = colonia;
		rc.objeto.profile.colonia_id = colonia._id;
		rc.buscar.coloniaNombre = "";
	};

	this.cambiarPassword = function () {
		this.cambiarContrasena = !this.cambiarContrasena;
	}

	this.cambiarPaisObjeto = function () {
		this.objeto.profile.estado_id = "";
		this.objeto.profile.municipio_id = "";
		this.objeto.profile.ciudad_id = "";
		this.objeto.profile.colonia_id = "";
		rc.colonia = {};

	};
	this.cambiarEstadoObjeto = function () {
		this.objeto.profile.municipio_id = "";
		this.objeto.profile.ciudad_id = "";
		this.objeto.profile.colonia_id = "";
		rc.colonia = {};
	};
	this.cambiarMunicipioObjeto = function () {
		this.objeto.profile.ciudad_id = "";
		this.objeto.profile.colonia_id = "";
		rc.colonia = {};
	};
	this.cambiarCiudadObjeto = function () {
		this.objeto.profile.colonia_id = "";
		rc.colonia = {};
	};


};