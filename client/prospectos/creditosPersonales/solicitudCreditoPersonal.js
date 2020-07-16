angular
  .module('creditoMio')
  .controller('SolicitudCreditoPersonalFormCtrl', SolicitudCreditoPersonalFormCtrl);

function SolicitudCreditoPersonalFormCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {

  rc = $reactive(this).attach($scope);
  window.rc = rc;

  rc.objeto = {};
  rc.objeto.profile = {};
  rc.objeto.profile.otraPropiedad = "no";
  rc.objeto.profile.tipoVivienda = "propia";
  rc.action = "";

  rc.ocupacion = {};
  rc.objeto.profile.empresa_id = "";
  rc.empresa = {};
  rc.empresa.colonia_id = "";

  rc.buscar = {};
  rc.buscar.coloniaNombre = "";
  rc.buscar.coloniaNombreEmpresa = "";
  rc.buscandoColonia = false;
  rc.buscandoColoniaEmpresa = false;

  rc.empresa = {};
  rc.colonia = {};
  rc.colonia.nombre = "";


  //Subscripciones
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

  this.subscribe('documentos', () => {
    return [{ estatus: true }]
  });

  this.subscribe('estados', () => {
    return [{ estatus: true }];
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


  //-------------------------------------

  if ($stateParams.id != undefined) {
    rc.action = true; //
    this.subscribe('solicitudesClientes', () => {
      return [{ _id: $stateParams.id }];
    })
  }
  else
    rc.action = false; //

  this.helpers({
    objeto: () => {
      var objeto = SolicitudesClientes.findOne({ _id: $stateParams.id });

      if (objeto != undefined) {
        
        rc.colonia.nombre = objeto.profile.colonia;
        return objeto;
      }
      else {
        rc.objeto = {};
        rc.objeto.profile = {};
        rc.objeto.profile.otraPropiedad = "no";
        rc.objeto.profile.tipoVivienda = "propia";
        rc.action = "";
      }
      return;
    },
    estadosCiviles: () => {
      return EstadoCivil.find();
    },
    nacionalidades: () => {
      return Nacionalidades.find();
    },
    ocupaciones: () => {
      return Ocupaciones.find({}, { sort: { "nombre": 1 } });
    },
    estados: () => {
      return Estados.find({ estatus: true }, { sort: { "nombre": 1 } });
    },
    municipios: () => {
      return Municipios.find({ estado_id: this.getReactively("objeto.profile.estado_id"), estatus: true }, { sort: { "nombre": 1 } });
    },
    ciudades: () => {
      return Ciudades.find({ municipio_id: this.getReactively("objeto.profile.municipio_id"), estatus: true }, { sort: { "nombre": 1 } });
    },
    colonias: () => {
      return Colonias.find({
        ciudad_id: this.getReactively("objeto.profile.ciudad_id"),
        nombre: { '$regex': '.*' + this.getReactively('buscar.coloniaNombre') || '' + '.*', '$options': 'i' }
      });
    },
  })

  this.guardar = function (objeto, form) {

    if (form.$invalid) {
      toastr.error('Error al enviar los datos.');
      return;
    }

    objeto.profile.fechaCreacion = new Date();
    objeto.profile.estatus = 2; //1.- Sin Asignar , 2.- Asignado a una sucursal, 3.- Ya es prospecto, 
    objeto.profile.origen = "Sistema";
    objeto.profile.sucursal_id = Meteor.user().profile.sucursal_id;

    var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre.trim() + " " : "";
    var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno.trim() + " " : "";
    var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno.trim() : "";
    objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;

    objeto.profile.pais_id = "bswfJQCAuB7z44Nd2";

    objeto.profile.estado = Estados.findOne(objeto.profile.estado_id).nombre;
    objeto.profile.municipio = Municipios.findOne(objeto.profile.municipio_id).nombre;
    objeto.profile.ciudad = Ciudades.findOne(objeto.profile.ciudad_id).nombre;
    objeto.profile.colonia = Colonias.findOne(objeto.profile.colonia_id).nombre;

    objeto.profile.nacionalidad = Nacionalidades.findOne(objeto.profile.nacionalidad_id).nombre;
    objeto.profile.estadoCivil = EstadoCivil.findOne(objeto.profile.estadoCivil_id).nombre;
    objeto.profile.ocupacion = Ocupaciones.findOne(objeto.profile.ocupacion_id).nombre;

    Meteor.call('guardarSolicitudCreditoPersonal', objeto, function (e, r) {
      if (r) {
        toastr.success('Guardado correctamente.');
        $state.go('root.panelSolicitudesCD');
      }
    });

  };

  this.actualizar = function (objeto, form) {

    if (form.$invalid) {
      toastr.error('Error al enviar los datos.');
      return;
    }

    objeto.profile.fechaActualizacion = new Date();
    objeto.profile.usuarioActualizo = Meteor.userId();

    var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre.trim() + " " : "";
    var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno.trim() + " " : "";
    var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno.trim() : "";
    objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;

    Meteor.call('actualizarSolicitudCreditoPersonal', objeto, function (e, r) {
      if (r) {
        toastr.success('Actualizado correctamente.');
        $state.go('root.panelSolicitudesCD');
      }
    });

  };

  this.regresar = function () {
    $state.go('anon.home');
  }

  this.calcularTotales = function () {


    rc.objeto.profile.totalIngresos = Number(rc.objeto.profile.ingresosPersonales == "" ? 0 : rc.objeto.profile.ingresosPersonales) +
      Number(rc.objeto.profile.ingresosConyuge == "" ? 0 : rc.objeto.profile.ingresosConyuge) +
      Number(rc.objeto.profile.otrosIngresos == "" ? 0 : rc.objeto.profile.otrosIngresos);

    rc.objeto.profile.totalGastos = Number(rc.objeto.profile.gastosFijos == "" ? 0 : rc.objeto.profile.gastosFijos) +
      Number(rc.objeto.profile.gastosEventuales == "" ? 0 : rc.objeto.profile.gastosEventuales);

    rc.objeto.profile.resultadoNeto = Number(rc.objeto.profile.totalIngresos) - Number(rc.objeto.profile.totalGastos);

  };

  $('form').on('focus', 'input[type=number]', function (e) {
    $(this).on('wheel.disableScroll', function (e) {
      e.preventDefault()
    })
  })
  $('form').on('blur', 'input[type=number]', function (e) {
    $(this).off('wheel.disableScroll')
  })


  this.seleccionarEstadoCivil = function (estadoCivil_id) {
    this.estadoCivilSeleccionado = EstadoCivil.findOne(estadoCivil_id);
  }

  this.agregarColonia = function (colonia) {
    rc.colonia = colonia;
    rc.objeto.profile.colonia_id = colonia._id;
    rc.buscar.coloniaNombre = "";
  };

}