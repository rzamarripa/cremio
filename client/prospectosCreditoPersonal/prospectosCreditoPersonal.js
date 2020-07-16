angular.module("creditoMio")
  .controller("prospectosCreditoPersonalFormCtrl", prospectosCreditoPersonalFormCtrl);
function prospectosCreditoPersonalFormCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {

  let rc = $reactive(this).attach($scope);
  window.rc = rc;

  this.cambiarContrasena = true;
  this.action = true;
  this.actionReferencia = true;
  this.nuevo = true;
  this.actionAval = true;

  this.nuevoEmpresa = true;

  this.objeto = {};
  this.objeto.profile = {};
  this.ocupacion = {};
  this.objeto.profile.empresa_id = "";
  this.empresa = {};
  this.empresa.colonia_id = "";

  this.objeto_id = ""
  rc.pic = "";
  rc.otrafoto = ""
  rc.folio = "";
  rc.imagen = "";
  $(".js-example-basic-single").select2();

  this.pais_id = "";
  this.estado_id = "";
  this.municipio_id = "";
  this.ciudad_id = "";
  this.empresa_id = "";

  this.con = 0;
  this.num = 0;
  this.referenciasPersonales = [];
  this.referenciaPersonal = {};
  this.avales = [];

  this.buscar = {};
  this.buscar.nombre = "";
  this.buscar.coloniaNombre = "";
  this.buscar.coloniaNombreEmpresa = "";
  this.buscar.empresaNombre = "";
  this.buscando = false;
  this.buscandoColonia = false;
  this.buscandoColoniaEmpresa = false;
  this.buscandoEmpresa = false;

  var fotillo = ""
  //this.pic = {};
  this.imagenes = [];

  rc.documents = [];

  this.estadoCivil = "";
  this.empresaSeleccionada = "";

  rc.estadoCivilSeleccionado = {};

  rc.colonia = {};
  rc.coloniaEmpresa = {};
  rc.empresa = {};
  rc.aval = {};

  this.subscribe('buscarAvales', () => {
    if (this.getReactively("buscar.nombre").length > 3) {
      this.buscando = true;
      return [{
        options: { limit: 20 },
        where: {
          nombreCompleto: this.getReactively('buscar.nombre')
        }
      }];
    }
    else if (this.getReactively("buscar.nombre").length == 0)
      this.buscando = false;
  });

  this.subscribe('buscarReferenciasPersonales', () => {
    if (this.getReactively("buscar.nombre").length > 3) {
      this.buscando = true;
      return [{
        options: { limit: 10 },
        where: {
          nombreCompleto: this.getReactively('buscar.nombre')
        }
      }];
    }
    else if (this.getReactively("buscar.nombre").length == 0)
      this.buscando = false;
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

  this.subscribe('buscarColonias', () => {
    if (this.getReactively("buscar.coloniaNombreEmpresa").length > 3) {
      this.buscandoColoniaEmpresa = true;
      return [{
        options: { limit: 10 },
        where: {
          ciudad_id: this.getReactively("empresa.ciudad_id"),
          nombre: this.getReactively('buscar.coloniaNombreEmpresa')
        }
      }];
    }
    else if (this.getReactively("buscar.coloniaNombreEmpresa").length == 0)
      this.buscandoColoniaEmpresa = false;
  });

  this.subscribe('buscarEmpresas', () => {
    if (this.getReactively("buscar.empresaNombre").length > 3) {
      this.buscandoEmpresa = true;
      return [{
        options: { limit: 10 },
        where: {
          nombre: this.getReactively('buscar.empresaNombre')
        }
      }];
    }
    else if (this.getReactively("buscar.empresaNombre").length == 0)
      this.buscandoEmpresa = false;
  });

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

  this.subscribe('personas', () => {
    return [{ rol: "Cliente" }]
  });

  this.subscribe('estados', () => {

    if (this.getReactively("objeto.profile.pais_id") != undefined)
      return [{ pais_id: this.getReactively("objeto.profile.pais_id"), estatus: true }];
  });

  this.subscribe('estados', () => {
    if (this.getReactively("empresa.pais_id") != undefined)
      return [{ pais_id: this.getReactively("empresa.pais_id"), estatus: true }];
  });

  this.subscribe('municipios', () => {
    if (this.getReactively("objeto.profile.estado_id") != undefined)
      return [{ estado_id: this.getReactively("objeto.profile.estado_id"), estatus: true }];
  });

  this.subscribe('municipios', () => {
    if (this.getReactively("empresa.estado_id") != undefined)
      return [{ estado_id: this.getReactively("empresa.estado_id"), estatus: true }];
  });

  this.subscribe('ciudades', () => {
    if (this.getReactively("objeto.profile.municipio_id") != undefined)
      return [{ municipio_id: this.getReactively("objeto.profile.municipio_id"), estatus: true }];
  });

  this.subscribe('ciudades', () => {
    if (this.getReactively("empresa.municipio_id") != undefined)
      return [{ municipio_id: this.getReactively("empresa.municipio_id"), estatus: true }];
  });

  this.subscribe('colonias', () => {
    if (this.getReactively("objeto.profile.colonia_id") != undefined)
      return [{ _id: this.getReactively("objeto.profile.colonia_id") }]
  });

  this.subscribe('colonias', () => {
    if (this.getReactively("empresa.colonia_id") != undefined)
      return [{ _id: this.getReactively("empresa.colonia_id") }]
  });

  //Condición del Parametro

  if ($stateParams.objeto_id != undefined) {

    rc.action = false;
    rc.objeto_id = $stateParams.objeto_id;

    loading(true);
    Meteor.call('getProspectoCreditoPersonal', rc.objeto_id, function (error, result) {
      if (result) {
        rc.objeto = result;
        rc.objeto.confirmpassword = "sinpassword";
        rc.objeto.password = "sinpassword";

        var estadoCivilSeleccionado = EstadoCivil.findOne(rc.objeto.profile.estadoCivil_id);

        if (estadoCivilSeleccionado)
          rc.estadoCivilSeleccionado = estadoCivilSeleccionado;


        Meteor.call('getReferenciaPersonales', rc.objeto.profile.referenciasPersonales_ids, rc.objeto._id, function (error, result) {
          if (result) {
            rc.referenciasPersonales = result;
            $scope.$apply();
          }
        });

        //getdocumentos
        Meteor.call('getDocumentosClientes', rc.objeto_id, function (error, result) {
          if (result) {
            //ir por los documentos
            rc.documents = result;
            $scope.$apply();
          }
        });

        //getEmpresa
        Meteor.call('getEmpresa', rc.objeto.profile.empresa_id, function (error, result) {
          if (result) {
            //ir por los documentos
            rc.empresa = result;
            $scope.$apply();
          }
        });

        //rc.documents = rc.objeto.profile.documentos;
        loading(false);
      }
    });

  }
  else if ($stateParams.objeto_id != undefined && $stateParams.tipo == 'Aval') {

    rc.action = true;
    var objeto = {};
    objeto._id = $stateParams.objeto_id;	//es El aval
    Meteor.call('getAvalCompleto', objeto, function (error, result) {
      if (result) {
        rc.pic = result.profile.foto;
        rc.objeto = result;
        $scope.$apply();
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
    estadosEmpresa: () => {
      return Estados.find({ pais_id: this.getReactively("empresa.pais_id"), estatus: true });
    },
    municipios: () => {
      return Municipios.find({ estado_id: this.getReactively("objeto.profile.estado_id"), estatus: true });
    },
    municipiosEmpresa: () => {
      return Municipios.find({ estado_id: this.getReactively("empresa.estado_id"), estatus: true });
    },
    ciudades: () => {
      return Ciudades.find({ municipio_id: this.getReactively("objeto.profile.municipio_id"), estatus: true });
    },
    ciudadesEmpresa: () => {

      return Ciudades.find({ municipio_id: this.getReactively("empresa.municipio_id"), estatus: true });
    },

    colonias: () => {
      return Colonias.find({
        ciudad_id: this.getReactively("objeto.profile.ciudad_id"),
        nombre: { '$regex': '.*' + this.getReactively('buscar.coloniaNombre') || '' + '.*', '$options': 'i' }
      });
    },
    coloniasEmpresa: () => {
      return Colonias.find({
        ciudad_id: this.getReactively("empresa.ciudad_id"),
        nombre: { '$regex': '.*' + this.getReactively('buscar.coloniaNombreEmpresa') || '' + '.*', '$options': 'i' }
      });
    },
    empresas: () => {
      return Empresas.find();
    },
    documentos: () => {
      return Documentos.find();
    },

    imagenesDocs: () => {
      var imagen = rc.imagenes;
      _.each(rc.getReactively("imagenes"), function (imagen) {
        imagen.archivo = rc.imagen;

      });
      return imagen
    },

    referenciasPersonalesHelper: () => {
      var rp = ReferenciasPersonales.find({
        nombreCompleto: { '$regex': '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options': 'i' }
      }, { sort: { "nombreCompleto": 1 } }).fetch();
      return rp;
    },
    ultimoCliente: () => {
      return Personas.find({}, { sort: { folio: -1 }, limit: 1 });
    },
    empresa: () => {
      return Empresas.findOne(rc.objeto.profile.empresa_id)
    },
    col: () => {
      rc.colonia = Colonias.findOne({ _id: this.getReactively("objeto.profile.colonia_id") });
    },
    colE: () => {
      rc.coloniaEmpresa = Colonias.findOne({ _id: this.getReactively("empresa.colonia_id") });
    },
    edoCivil: () => {
      rc.estadoCivilSeleccionado = EstadoCivil.findOne(rc.objeto.profile.estadoCivil_id);
    },
    avalesHelper: () => {
      var aval = Avales.find({
        "profile.nombreCompleto": { '$regex': '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options': 'i' }
      }, { sort: { "nombreCompleto": 1 } }).fetch();
      return aval;
    },
  });

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

  this.cambiarPaisEmpresa = function () {
    this.empresa.estado_id = "";
    this.empresa.municipio_id = "";
    this.empresa.ciudad_id = "";
    this.empresa.colonia_id = "";
    rc.coloniaEmpresa = {};

  };

  this.cambiarEstadoEmpresa = function () {
    this.empresa.municipio_id = "";
    this.empresa.ciudad_id = "";
    this.empresa.colonia_id = "";
    rc.coloniaEmpresa = {};
  };

  this.cambiarMunicipioEmpresa = function () {
    this.empresa.ciudad_id = "";
    this.empresa.colonia_id = "";
    rc.coloniaEmpresa = {};
  };

  this.cambiarCiudadEmpresa = function () {
    this.empresa.colonia_id = "";
    rc.coloniaEmpresa = {};
  };

  this.tomarFoto = function (objeto) {
    //console.log(objeto)
    $meteor.getPicture().then(function (data, error) {
      console.log("ERROR:", error);

      rc.fotillo = data
      rc.pic = rc.fotillo
      //objeto.profile.fotografia = this.objeto.profile.fotografia;
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

    if (this.action) {
      objeto.password = Math.random().toString(36).substring(2, 7);

    }

    objeto.profile.estatus = true;
    objeto.profile.documentos = rc.documents;

    objeto.profile.usuarioInserto = Meteor.userId();
    objeto.profile.sucursal_id = Meteor.user().profile.sucursal_id;
    objeto.profile.fechaCreacion = new Date();
    objeto.profile.referenciasPersonales = angular.copy(this.referenciasPersonales);
    var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
    var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
    var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
    objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;

    loading(true);
    Meteor.call('actualizarProspectosCreditosPersonalesDistribuidores', objeto, this.referenciasPersonales, "Cliente Crédito Personal", this.cambiarContrasena, function (error, result) {

      if (result) {
        loading(false);
        toastr.success('Actualizado correctamente.');
        this.nuevo = true;
        $state.go('root.panelProspectosCreditosPersonalesDestribuidores');

      }
    });

    // //Valdiar si existe el nombreCompleto
    // Meteor.call('validarCliente', objeto.profile.nombreCompleto, function (err, res) {
    //   if (res) {
    //     toastr.error('El nombre del Cliente ya existe.');
    //     return;
    //   }
    //   else (!res)
    //   {
    //     loading(true);
    //     Meteor.call('createUsuario', objeto, "Cliente", function (e, r) {
    //       if (r) {
    //         loading(false);
    //         toastr.success('Guardado correctamente.');
    //         this.usuario = {};
    //         $('.collapse').collapse('hide');
    //         this.nuevo = true;
    //         form.$setPristine();
    //         form.$setUntouched();
    //         $state.go('root.clienteDetalle', { 'objeto_id': r });
    //       }
    //     });

    //   }
    // });

  };

  this.actualizarForm = function (objeto, form) {
    if (form.$invalid) {
      toastr.error('Error al actualizar los datos.');
      return;
    }

    var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
    var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
    var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
    objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;

    delete objeto.profile.repeatPassword;

    _.each(objeto.profile.documentos, function (d) {
      delete d.$$hashKey;
    })

    _.each(objeto.profile.avales_ids, function (a) {
      delete a.$$hashKey;
    });

    _.each(this.referenciasPersonales, function (d) {
      delete d.$$hashKey;
    })

    _.each(objeto.profile.referenciasPersonales_ids, function (rp) {
      delete rp.$$hashKey;
    });

    loading(true);
    Meteor.call('actualizarProspectosCreditosPersonalesDistribuidores', objeto, this.referenciasPersonales, "Cliente Crédito Personal", this.cambiarContrasena, function (error, result) {

      if (result) {
        loading(false);
        toastr.success('Actualizado correctamente.');
        this.nuevo = true;
        $state.go('root.panelProspectosCreditosPersonalesDestribuidores');

      }
    });

  };

  this.guardarEmpresa = function (empresa, objeto, form) {
    if (form.$invalid) {
      toastr.error('Error al guardar los datos.');
      return;
    }
    empresa.estatus = true;
    empresa.usuarioInserto = Meteor.userId();
    //objeto.profile.foto = this.objeto.profile.foto;

    Empresas.insert(empresa, function (error, result) {
      if (error) {
        console.log("error: ", error);
      }
      if (result) {
        objeto.profile.empresa_id = result;
        toastr.success('Guardado correctamente.');
        this.empresa = {};

        Meteor.call('getEmpresa', rc.objeto.profile.empresa_id, function (error, response) {
          if (result) {
            rc.empresa = response;
            $scope.$apply();
          }
        });


        //$('.collapse').collapse('hide');
        /*
this.nuevo = true;
        form.$setPristine();
        form.$setUntouched();
*/
        $("[data-dismiss=modal]").trigger({ type: "click" });
      }
    });
  };

  this.actualizarEmpresa = function (empresa, objeto, form) {
    if (form.$invalid) {
      toastr.error('Error al guardar los datos.');
      return;
    }
    empresa.estatus = true;
    empresa.usuarioActualizo = Meteor.userId();

    //console.log(empresa._id)
    var tempId = empresa._id;
    delete empresa._id;

    Empresas.update({ _id: tempId }, { $set: empresa }, function (error, result) {
      if (error) {
        console.log("error: ", error);
      }
      if (result) {
        objeto.profile.empresa_id = tempId;
        toastr.success('Actualizado correctamente.');
        this.empresa = {};
        $('.collapse').collapse('hide');
        this.nuevo = true;
        form.$setPristine();
        form.$setUntouched();
        $("[data-dismiss=modal]").trigger({ type: "click" });

      }
    });
  };


  this.guardarOcupacion = function (ocupacion, objeto, form) {
    if (form.$invalid) {
      toastr.error('Error al guardar los datos.');
      return;
    }
    ocupacion.estatus = true;
    ocupacion.usuarioInserto = Meteor.userId();
    //objeto.profile.foto = this.objeto.profile.foto;

    Ocupaciones.insert(ocupacion, function (error, result) {
      if (error) {
        console.log("error: ", error);
      }
      if (result) {
        objeto.profile.ocupacion_id = result;
        toastr.success('Guardado correctamente.');
        this.ocupacion = {};
        $('.collapse').collapse('hide');
        this.nuevo = true;
        form.$setPristine();
        form.$setUntouched();
        $("[data-dismiss=modal]").trigger({ type: "click" });

      }
    });
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  this.AgregarReferencia = function (a) {

    this.referenciaPersonal.nombre = a.nombre;
    this.referenciaPersonal.apellidoPaterno = a.apellidoPaterno;
    this.referenciaPersonal.apellidoMaterno = a.apellidoMaterno;
    this.referenciaPersonal.direccion = a.direccion;
    this.referenciaPersonal.telefono = a.telefono;
    this.referenciaPersonal.celular = a.celular;
    this.referenciaPersonal.ciudad = a.ciudad;
    this.referenciaPersonal.estado = a.estado;
    this.referenciaPersonal.tiempoConocerlo = a.tiempoConocerlo;
    this.referenciaPersonal.nombreCompleto = a.nombreCompleto;

    this.referenciaPersonal._id = a._id;

    //console.log(this.referenciaPersonal);
    this.buscar.nombre = "";
  };

  this.insertarReferencia = function () {
    //Validar que no venga vacio
    if (this.referenciaPersonal.nombre == undefined || this.referenciaPersonal.apellidoPaterno == undefined || this.referenciaPersonal.parentesco == undefined || this.referenciaPersonal.tiempoConocerlo == undefined || this.referenciaPersonal.parentesco == "" || this.referenciaPersonal.tiempoConocerlo == "") {
      toastr.warning('Favor de completar los datos en referencias personales.');
      return;
    }

    this.referenciaPersonal.num = this.referenciasPersonales.length + 1;
    this.referenciaPersonal.estatus = "N";
    this.referenciasPersonales.push(this.referenciaPersonal);
    this.referenciaPersonal = {};
  };

  this.actualizarReferencia = function (p) {
    p.num = this.num;
    _.each(this.referenciasPersonales, function (rp) {
      if (rp.num == p.num) {
        rp.nombre = p.nombre;
        rp.apellidoPaterno = p.apellidoPaterno;
        rp.apellidoMaterno = p.apellidoMaterno;
        rp.direccion = p.direccion;
        rp.telefono = p.telefono;
        rp.celular = p.celular;
        rp.ciudad = p.ciudad;
        rp.estado = p.estado;
        rp.parentesco = p.parentesco;
        rp.tiempoConocerlo = p.tiempoConocerlo;
        if (rp.estatus == "G")
          rp.estatus = "A";
      }
    });

    this.referenciaPersonal = {};
    this.num = 0;
    rc.actionReferencia = true;
  };

  this.cancelarReferencia = function () {
    this.referenciaPersonal = {};
    this.num = -1;
    rc.actionReferencia = true;
  };

  this.borrarReferencia = function () {
    this.referenciaPersonal.nombre = "";
    this.referenciaPersonal.apellidoPaterno = "";
    this.referenciaPersonal.apellidoMaterno = "";
    this.referenciaPersonal.direccion = "";
    this.referenciaPersonal.telefono = "";
    this.referenciaPersonal.celular = "";
    this.referenciaPersonal.ciudad = "";
    this.referenciaPersonal.estado = "";
    this.referenciaPersonal.parentesco = "";
    this.referenciaPersonal.tiempoConocerlo = "";
    delete this.referenciaPersonal["_id"];
  };

  this.quitarReferencia = function (ref) {
    var numero = ref.num;
    var rp = this.referenciasPersonales;
    customConfirm('¿Estás seguro de  quitar la referencia ' + ref.nombreCompleto + '?', function () {

      var pos = functiontofindIndexByKeyValue(rp, "num", numero);
      rp.splice(pos, 1);
      if (rp.length == 0) this.con = 0;
      functiontoOrginiceNum(rp, "num");
      this.referenciasPersonales = rp;

      pos = functiontofindIndexByKeyValue(rc.objeto.profile.referenciasPersonales_ids, "num", numero);
      rc.objeto.profile.referenciasPersonales_ids.splice(pos, 1);
      functiontoOrginiceNum(rc.objeto.profile.referenciasPersonales_ids, "num");

      //Eliminar del arreglo en la bd 
      Meteor.call('updateReferenciasPersonales', rc.objeto._id, rc.objeto.profile.numeroCliente, this.referenciasPersonales, function (error, result) {
        if (result) {
          $scope.$apply();
        }
      });

    });
  };

  this.editarReferencia = function (p) {
    this.referenciaPersonal.nombre = p.nombre;
    this.referenciaPersonal.apellidoPaterno = p.apellidoPaterno;
    this.referenciaPersonal.apellidoMaterno = p.apellidoMaterno;
    this.referenciaPersonal.direccion = p.direccion;
    this.referenciaPersonal.telefono = p.telefono;
    this.referenciaPersonal.celular = p.celular;
    this.referenciaPersonal.parentesco = p.parentesco;
    this.referenciaPersonal.tiempoConocerlo = p.tiempoConocerlo;
    this.referenciaPersonal.ciudad = p.ciudad;
    this.referenciaPersonal.estado = p.estado;

    this.num = p.num;
    this.actionReferencia = false;
  };

  this.guardarReferenciaPersonal = function (referenciaPersonal, form4) {
    if (form4.$invalid) {
      toastr.error('Error al guardar los datos.');
      return;
    }

    referenciaPersonal.usuarioInserto = Meteor.userId();
    referenciaPersonal.nombreCompleto = referenciaPersonal.nombre + " " +
      referenciaPersonal.apellidoPaterno +
      (referenciaPersonal.apellidoMaterno == undefined ? "" : " " + referenciaPersonal.apellidoMaterno);

    referenciaPersonal.clientes = [];
    this.referenciaPersonal._id = ReferenciasPersonales.insert(referenciaPersonal);

    $("#modalreferenciaPersonal").modal('hide');
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  this.borrarDoc = function ($index) {
    rc.documents.splice($index, 1);
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

  this.AlmacenaImagen = function (imagen) {
    rc.objeto.profile.foto = imagen;
    toastr.success("Foto Cargada...");
  }

  $(document).ready(function () {

    const imageFileToBase64 = require('image-file-to-base64-exif');

    const maxWidth = 200;
    const maxHeight = 180;
    const quality = 0.8;

    var fileDisplayArea1 = document.getElementById('fileDisplayArea1');
    //var fotoArea = document.getElementById('fotoArea');

    var fileInput1 = document.getElementById('fileInput1');

    var foto = document.getElementById('foto');

    //var fileDisplayArea1 = document.getElementById('fileDisplayArea1');
    //JavaScript para agregar la Foto

    fileInput1.addEventListener('change', function (e) {
      var file = fileInput1.files[0];
      var imageType = /image.*/;

      if (file.type.match(imageType)) {

        if (file.size <= 2048000) {

          var reader = new FileReader();
          reader.onload = function (e) {

            rc.imagen = reader.result;

            var img = new Image();
            img.src = rc.imagen;
            img.width = 800;
            img.height = 600;

            fileDisplayArea1.appendChild(img);

          }
          reader.readAsDataURL(file);
        } else {
          toastr.error("Error la Imagen supera los 2 MB");
          return;
        }
      } else {
        //fileDisplayArea1.innerHTML = "File not supported!";
      }
    });

    foto.addEventListener('change', function (e) {
      var file = foto.files[0];
      var imageType = /image.*/;

      if (file.type.match(imageType)) {

        var reader = new FileReader();

        reader.onload = function (e) {

          imageFileToBase64(foto.files[0], maxWidth, maxHeight, quality)
            .then(addThumbnail)
        }
        reader.readAsDataURL(file);
      } else {
        fotoArea.innerHTML = "Archivo no sportado!";
      }
    });


    function addThumbnail(base64) {

      /*
fotoArea.innerHTML = ""; 
      var img = new Image();
      img.src = base64;
      img.width = 200;
      img.height= 180;
      fotoArea.appendChild(img);
*/

      rc.AlmacenaImagen(base64);
    }

  });

  this.agregarImagen = function () {


    var fileDisplayArea1 = document.getElementById('fileDisplayArea1');
    while (fileDisplayArea1.firstChild) {
      fileDisplayArea1.removeChild(fileDisplayArea1.firstChild);
    }
    $("#modalDocumentoImagen").modal('show');
  }

  this.agregarDoc = function (doc, imagen) {

    if (imagen == false) {
      toastr.error("Ninguna imagen agregada");

    }
    else {
      loading(true);
      Meteor.call('setDocumentosCliente', rc.objeto_id, this.documento_id, imagen, function (error, result) {
        if (result) {
          //ir por los documentos
          rc.documents = result;
          $scope.$apply();
          loading(false);
        }
      });
    }

    $("#modalDocumentoImagen").modal('hide');

  };

  this.actDoc = function (doc, imagen) {

    Meteor.call('getDocs', doc, function (error, result) {
      if (result) {
        rc.objeto.profile.documentos.push({ imagen: imagen, nombre: result.nombre });
        $scope.$apply();
      }

    });

    $("#modalDocumentoImagen").modal('hide');
    //console.log(imagen,"programador estrella");
  }


  this.getDocumentos = function (documento_id) {

    //console.log(documento_id);
    rc.documento = Documentos.findOne(documento_id);
    //rc.nota.unidad = Unidades.findOne(rc.nota.unidad_id);
  };

  this.mostrarModal = function (id) {
    Meteor.call('getDocumentoCliente', id, function (error, result) {
      if (result) {
        var imagen = '<img class="img-responsive" src="' + result + '" style="margin:auto;">';
        $('#imagenDiv').empty().append(imagen);
        $("#myModal").modal('show');
      }
    });
  };

  this.borrarDoc = function (id) {
    customConfirm('¿Estás seguro Eliminar el documento?', function () {

      Meteor.call('borrarDocumentoCliente', rc.objeto_id, id, function (error, result) {
        if (result) {
          rc.documents = result;
          $scope.$apply();
        }
      });

    });
  };

  this.imprimirDoc = function (id) {

    Meteor.call('getDocumentoCliente', id, function (error, result) {
      if (result) {
        console.log(result);
        Meteor.call('imprimirImagenDocumento', result, function (error, response) {
          if (error) {
            console.log('ERROR :', error);
            return;
          }
          else {
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

              var blob = new Blob(byteArrays, { type: contentType });
              return blob;
            }

            var blob = b64toBlob(response, "application/docx");
            var url = window.URL.createObjectURL(blob);

            //console.log(url);
            var dlnk = document.getElementById('dwnldLnk');

            dlnk.download = "imagenDocumento.docx";
            dlnk.href = url;
            dlnk.click();
            window.URL.revokeObjectURL(url);

          }
        });
      }
    });
  }

  this.seleccionEstadoCivil = function (estadoCivil) {
    //console.log(estadoCivil);     

  }

  this.calcularTotales = function () {


    rc.objeto.profile.totalIngresos = Number(rc.objeto.profile.ingresosPersonales == "" ? 0 : rc.objeto.profile.ingresosPersonales) +
      Number(rc.objeto.profile.ingresosConyuge == "" ? 0 : rc.objeto.profile.ingresosConyuge) +
      Number(rc.objeto.profile.otrosIngresos == "" ? 0 : rc.objeto.profile.otrosIngresos);

    rc.objeto.profile.totalGastos = Number(rc.objeto.profile.gastosFijos == "" ? 0 : rc.objeto.profile.gastosFijos) +
      Number(rc.objeto.profile.gastosEventuales == "" ? 0 : rc.objeto.profile.gastosEventuales);

    rc.objeto.profile.resultadoNeto = Number(rc.objeto.profile.totalIngresos) - Number(rc.objeto.profile.totalGastos);

  };

  this.seleccionarEstadoCivil = function (estadoCivil_id) {
    this.estadoCivilSeleccionado = EstadoCivil.findOne(estadoCivil_id);
  }

  this.cambiarPassword = function () {

    this.cambiarContrasena = !this.cambiarContrasena;
  }

  this.getOcupaciones = function (ocupacion_id) {
    rc.ocupacionSeleccionado = Ocupaciones.findOne(ocupacion_id);
  };

  this.getColonias = function (colonia_id) {
    rc.coloniaSeleccionado = Colonias.findOne(colonia_id);
  };

  this.agregarColonia = function (colonia) {
    rc.colonia = colonia;
    rc.objeto.profile.colonia_id = colonia._id;
    rc.buscar.coloniaNombre = "";
  };

  this.agregarColoniaEmpresa = function (colonia) {
    rc.coloniaEmpresa = colonia;
    rc.empresa.colonia_id = colonia._id;
    rc.buscar.coloniaNombreEmpresa = "";
  };

  this.agregarEmpresa = function (empresa) {
    rc.empresa = empresa;
    rc.objeto.profile.empresa_id = empresa._id;
    rc.buscar.empresaNombre = "";
  };

  this.createEmpresa = function () {
    this.empresa = {};
    this.nuevoEmpresa = true;
  }

  this.getEmpresa = function (empresa_id) {
    //rc.empresa = Empresas.findOne(empresa_id);
    //this.nuevoEmpresa = false;

    Meteor.call('getEmpresa', empresa_id, function (error, response) {
      if (error) {
        console.log('ERROR :', error);
        return;
      }
      else if (response) {
        rc.empresa = response;
        this.nuevoEmpresa = false;
        $scope.$apply();
      }
    });

  };


  // this.insertarAval = function () {
  //   if (rc.aval.nombre == undefined || rc.aval.parentesco == undefined || rc.aval.tiempoConocerlo == undefined || rc.aval.parentesco == "" || rc.aval.tiempoConocerlo == "") {
  //     toastr.warning("Favor de agregar al datos del Aval, Parentesco y Tiempo de Conocerlo...");
  //     return;
  //   }

  //   rc.aval.num = this.avales.length + 1;
  //   rc.aval.estatus = "N";
  //   this.avales.push(rc.aval);

  //   rc.aval = {};
  // };


  this.refreshColonias = function (colonia) {

  }


  this.insertarAval = function () {
    if (rc.aval.nombre == undefined || rc.aval.parentesco == undefined || rc.aval.tiempoConocerlo == undefined || rc.aval.parentesco == "" || rc.aval.tiempoConocerlo == "") {
      toastr.warning("Favor de agregar al datos del Aval, Parentesco y Tiempo de Conocerlo...");
      return;
    }

    rc.aval.num = this.avales.length + 1;
    rc.aval.estatus = "N";
    if (rc.objeto._id) {
      rc.objeto.profile.avales_ids.push(rc.aval);
    } else {
      this.avales.push(rc.aval);
    }


    rc.aval = {};
  };

  this.AgregarAval = function (a) {


    rc.aval.nombre = a.profile.nombre;
    rc.aval.apellidoPaterno = a.profile.apellidoPaterno;
    rc.aval.apellidoMaterno = a.profile.apellidoMaterno;

    Meteor.call('getAval', a._id, function (error, result) {
      if (result) {
        rc.aval.ocupacion = result.ocupacion;
        rc.aval.calle = result.calle;
        rc.aval.numero = result.numero;
        rc.aval.codigoPostal = result.codigoPostal;
        rc.aval.estadoCivil = result.estadoCivil;
        rc.aval.empresa = result.empresa.nombre;
        rc.aval.direccionEmpresa = result.empresa.calle + " Num:" + result.empresa.numero + " CP:" + result.empresa.codigoPostal;
        rc.aval.puesto = result.puesto;
        rc.aval.tiempoLaborando = result.tiempoLaborando;
        rc.aval.foto = result.foto;
        $scope.$apply();
      }
    });

    this.buscar.nombre = ""
    rc.aval._id = a._id;

  };
  this.verAval = function (a) {
    //console.log(a,"aval p")
    $("#modalAval").modal('show');
    rc.aval.nombre = a.nombre;
    if (a.apellidoPaterno == undefined) {
      a.apellidoPaterno = ""
    }
    if (a.apellidoMaterno == undefined) {
      a.apellidoMaterno = ""
    }
    rc.aval.nombreCompleto = a.nombre + " " + a.apellidoPaterno + " " + a.apellidoMaterno
    rc.aval.estadoCivil = a.estadoCivil;
    rc.aval.ocupacion = a.ocupacion;
    rc.aval.calle = a.calle;
    rc.aval.numero = a.numero;
    rc.aval.codigoPostal = a.codigoPostal;
    rc.aval.empresa = a.empresa;
    rc.aval.puesto = a.puesto;
    rc.aval.tiempoLaborando = a.tiempoLaborando;
    rc.aval.direccionEmpresa = a.direccionEmpresa;
    rc.aval.parentesco = a.parentesco;
    rc.aval.tiempoConocerlo = a.tiempoConocerlo;
    rc.aval.foto = a.foto

  };

  this.quitarAval = function (numero) {
    pos = functiontofindIndexByKeyValue(this.avales, "num", numero);
    if (rc.objeto._id) {
      rc.objeto.profile.avales_ids.splice(pos, 1);
    } else {
      this.avales.splice(pos, 1);
    }
    if (this.avales.length == 0) {
      this.con = 0;
      functiontoOrginiceNum(rc.avales, "num");
    }
    if (rc.objeto.profile.avales_ids == 0) {
      functiontoOrginiceNum(rc.rc.objeto.profile.avales_ids, "num");
      this.con = 0;

    }



  };

  this.editarAval = function (a) {

    rc.aval.nombre = a.nombre;
    rc.aval.apellidoPaterno = a.apellidoPaterno;
    rc.aval.apellidoMaterno = a.apellidoMaterno;
    rc.aval.estadoCivil = a.estadoCivil;
    rc.aval.estadoCivil_id = a.estadoCivil_id;

    rc.aval.ocupacion = a.ocupacion;
    rc.aval.ocupacion_id = a.ocupacion_id;

    rc.aval.calle = a.calle;
    rc.aval.numero = a.numero;
    rc.aval.codigoPostal = a.codigoPostal;
    rc.aval.empresa = a.empresa;
    rc.aval.calleEmpresa = a.calleEmpresa;
    rc.aval.numeroEmpresa = a.numeroEmpresa;
    rc.aval.codigoPostalEmpresa = a.codigoPostalEmpresa;
    rc.aval.puesto = a.puesto;
    rc.aval.tiempoLaborando = a.tiempoLaborando;
    rc.aval.direccionEmpresa = a.direccionEmpresa;
    rc.aval.parentesco = a.parentesco;
    rc.aval.tiempoConocerlo = a.tiempoConocerlo;

    this.num = a.num;
    this.actionAval = false;
  };


};