Meteor.methods({
  crearCaja: function (caja) {
    var user = Meteor.user();
    if (user.roles[0] != "Gerente")
      throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');
    var usuario = Meteor.users.findOne(caja.usuario_id)
    if (usuario.profile.caja_id) {
      var cajavieja = Cajas.findOne(usuario.profile.caja_id);
      if (cajavieja.estadoCaja == "Abierta")
        throw new Meteor.Error(500, 'Error 500: Conflicto', 'El usuario tiene una Caja Abierta');
    }

    caja.sucursal_id = user.profile.sucursal_id;
    caja.createdBy = user._id;
    caja.createdAt = new Date();
    caja.updated = false;
    caja.estatus = true;
    caja.folioCaja = 0;
    caja.estadoCaja = "Cerrada";
    var cajaid = Cajas.insert(caja)
    if (usuario.profile.caja_id)
      Cajas.update({ _id: cajavieja._id }, { $set: { usuario_id: "" } });

    Meteor.users.update({ _id: caja.usuario_id }, { $set: { 'profile.caja_id': cajaid } })

    return cajaid;
  },
  actualizarCaja: function (caja) {

    var user = Meteor.user();
    if (user.roles[0] != "Gerente")
      throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');

    //var usuario = Meteor.users.findOne(caja.usuario_id)

    if (caja.estadoCaja == "Abierta")
      throw new Meteor.Error(500, 'Error 500: Conflicto', 'Caja Abierta');

    //Usuario nuevo caja.usuario_id

    var oldcaja = Cajas.findOne(caja._id);
    var usuarioViejo = oldcaja.usuario_id;

    if (usuarioViejo != "")
      Meteor.users.update({ _id: usuarioViejo }, { $set: { 'profile.caja_id': "" } })

    var cajaAnterior = Cajas.findOne({ usuario_id: caja.usuario_id });
    if (cajaAnterior != undefined)
      Cajas.update({ _id: cajaAnterior._id }, { $set: { usuario_id: "" } })

    caja.sucursal_id = user.profile.sucursal_id;
    caja.updated = true;
    caja.updatedAt = new Date();
    caja.updatedBy = user._id;

    var cajaid = caja._id;
    delete caja._id
    Cajas.update({ _id: cajaid }, { $set: caja })

    Meteor.users.update({ _id: caja.usuario_id }, { $set: { 'profile.caja_id': cajaid } })

    return "200";
  },
  traspasoCajaCuenta: function (origen_id, destino_id, cantidad) {

    var origen = Cajas.findOne(origen_id);
    var destino = Cuentas.findOne(destino_id);

    var user = Meteor.user();

    if (user.roles[0] != "Gerente" && user.roles[0] != "Supervisor")
      throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');
    var cta = Cuentas.findOne(destino_id);
    var cuenta = undefined
    if (cta && cta.tipoIngreso_id)
      cuenta = cta.tipoIngreso_id
    if (!destino || !origen || !origen.cuenta || !cuenta ||
      !origen.cuenta[cuenta] || origen.cuenta[cuenta].saldo < cantidad || cantidad <= 0)
      throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');

    origen.cuenta[cuenta].saldo -= cantidad;
    destino.saldo += cantidad;

    origen.cuenta[cuenta].saldo = Number(parseFloat(origen.cuenta[cuenta].saldo).toFixed(2));
    destino.saldo = Number(parseFloat(destino.saldo).toFixed(2));

    var objeto = {
      origen_id: origen._id,
      destino_id: destino._id,
      tipoCuenta_id: cuenta,
      importe: cantidad,
      tipo: "CajaCuenta",
      estatus: 1,
      createdBy: user._id,
      createdAt: new Date(),
      sucursal_id: user.profile.sucursal_id,
      updated: false,
      elaboro_id: Meteor.userId(),
      recibio_id: origen.usuario_id
    }

    var traspaso_id = Traspasos.insert(objeto);

    var movimientoOrigen = {
      tipoMovimiento: "Retiro Por Traspaso",
      origen: "Traspaso Caja Cuenta",
      origen_id: traspaso_id,
      caja_id: origen._id,
      cuenta_id: cuenta,
      monto: cantidad * -1,
      sucursal_id: user.profile.sucursal_id,
      createdAt: new Date(),
      createdBy: user._id,
      updated: false,
      estatus: 1,
      elaboro_id: Meteor.userId(),
      recibio_id: origen.usuario_id
    }
    var movimientoDestino = {
      tipoMovimiento: "Ingreso Por Traspaso",
      origen: "Traspaso Caja Cuenta",
      origen_id: traspaso_id,
      caja_id: origen._id,
      cuenta_id: destino_id,
      monto: cantidad,
      sucursal_id: user.profile.sucursal_id,
      createdAt: new Date(),
      createdBy: user._id,
      updated: false,
      estatus: 1,
      elaboro_id: Meteor.userId(),
      recibio_id: origen.usuario_id
    }
    MovimientosCajas.insert(movimientoOrigen);
    MovimientosCuenta.insert(movimientoDestino);

    var origenid = origen._id;
    var destinoid = destino._id;

    origen.updated = true;
    origen.updatedBy = user._id;
    origen.updatedAt = new Date();

    destino.updated = true;
    destino.updatedBy = user._id;
    destino.updatedAt = new Date();

    Cajas.update({ _id: origenid }, { $set: origen });
    Cuentas.update({ _id: destinoid }, { $set: destino });

    return traspaso_id;
  },
  traspasoCajaCaja: function (origen_id, destino_id, cantidad, cuenta) {

    var origen = Cajas.findOne(origen_id);
    var destino = Cajas.findOne(destino_id);

    var user = Meteor.user();

    if (user.roles[0] != "Gerente" && user.roles[0] != "Supervisor")
      throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');
    if (!destino || !origen || !origen.cuenta || !origen.cuenta[cuenta] || origen.cuenta[cuenta].saldo < cantidad || cantidad <= 0)
      throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');

    origen.cuenta[cuenta].saldo -= cantidad;
    destino.cuenta[cuenta].saldo += cantidad;

    origen.cuenta[cuenta].saldo = Number(parseFloat(origen.cuenta[cuenta].saldo).toFixed(2));
    destino.cuenta[cuenta].saldo = Number(parseFloat(destino.cuenta[cuenta].saldo).toFixed(2));

    var objeto = {
      origen_id: origen._id,
      destino_id: destino._id,
      tipoCuenta_id: cuenta,
      importe: cantidad,
      tipo: "CajaCaja",
      estatus: 1,
      createdBy: user._id,
      createdAt: new Date(),
      sucursal_id: user.profile.sucursal_id,
      updated: false,
      usuarioOrigen_id: origen.usuario_id,
      usuarioDestino_id: destino.usuario_id
    }

    var traspaso_id = Traspasos.insert(objeto);

    var movimientoOrigen = {
      tipoMovimiento: "Retiro Por Traspaso",
      origen: "Traspaso Entre Cajas",
      origen_id: traspaso_id,
      caja_id: origen._id,
      cuenta_id: cuenta,
      monto: cantidad * -1,
      sucursal_id: user.profile.sucursal_id,
      createdAt: new Date(),
      createdBy: user._id,
      updated: false,
      estatus: 1,
      usuarioOrigen_id: origen.usuario_id,
      usuarioDestino_id: destino.usuario_id
    }
    var movimientoDestino = {
      tipoMovimiento: "Ingreso Por Traspaso",
      origen: "Traspaso Entre Cajas",
      origen_id: traspaso_id,
      caja_id: destino._id,
      cuenta_id: cuenta,
      monto: cantidad,
      sucursal_id: user.profile.sucursal_id,
      createdAt: new Date(),
      createdBy: user._id,
      updated: false,
      estatus: 1,
      usuarioOrigen_id: origen.usuario_id,
      usuarioDestino_id: destino.usuario_id
    }

    MovimientosCajas.insert(movimientoOrigen)
    MovimientosCajas.insert(movimientoDestino)

    var origenid = origen._id;
    var destinoid = destino._id;

    origen.updated = true;
    origen.updatedBy = user._id;
    origen.updatedAt = new Date();

    destino.updated = true;
    destino.updatedBy = user._id;
    destino.updatedAt = new Date();

    Cajas.update({ _id: origenid }, { $set: origen });
    Cajas.update({ _id: destinoid }, { $set: destino });

    return traspaso_id;
  },
  abrirCaja: function (caja) {

    if (caja.usuario_id == "")
      throw new Meteor.Error(500, 'Al abrir ventanilla, No tiene asignado un Cajero', ' ');


    if (caja.estadoCaja == "Abierta")
      throw new Meteor.Error(500, 'La Caja ya esta abierta', ' ');


    caja.estadoCaja = "Abierta";
    var cajaid = caja._id;
    var user = Meteor.user();

    delete caja._id
    caja.folioCaja += 1;
    caja.updated = true;
    caja.updatedAt = new Date();
    caja.ultimaApertura = new Date();
    caja.updatedBy = user._id;
    Cajas.update({ _id: cajaid }, { $set: caja });

    _.each(caja.cuenta, function (cuenta, cuentaid) {
      var movimiento = {
        tipoMovimiento: "Saldo Inicial",
        origen: "Apertura de Caja",
        origen_id: cajaid,
        caja_id: cajaid,
        cuenta_id: cuentaid,
        monto: cuenta.saldo,
        sucursal_id: user.profile.sucursal_id,
        createdAt: new Date(),
        createdBy: user._id,
        updated: false,
        estatus: 1
      }
      MovimientosCajas.insert(movimiento);
    })

    return "200"
  },
  movimientosCaja: (caja) => {
    var ret = [];
    var movimientos = MovimientosCajas.find({
      $and: [{ caja_id: caja.caja_id }, {
        $or: [
          { estatus: 1 },
          { estatus: 2 }
        ]
      }]
    }).fetch();
    var cj = Cajas.findOne(caja.caja_id);
    _.each(movimientos, function (mov) {
      var d = {};
      d.createdAt = mov.createdAt;
      d.tipoMovimiento = mov.tipoMovimiento;
      d.origen = mov.origen;
      c = Cuentas.findOne(cj.cuenta[mov.cuenta_id].cuenta_id);
      d.cuenta = c.nombre;
      d.monto = mov.monto
      ret.push(d)
    })
    return ret
  },
  corteCaja: (montos, cajeroId, cajaId) => {

    //console.log(cajeroId);
    var user = Meteor.users.findOne({ _id: cajeroId });
    //console.log("User:", user);

    var caja = Cajas.findOne({ _id: cajaId });
    //console.log("Caja:", caja);    
    caja.updated = true;
    caja.updatedAt = new Date();
    caja.updatedBy = user._id;
    caja.estadoCaja = "Cerrada";
    var objeto = {
      cuenta: {},
      caja_id: caja._id,
      createdAt: new Date(),
      createdBy: user._id,
      updated: false,
      estatus: 1,
      sucursal_id: user.profile.sucursal_id,
      movimientosCuentas: [],
      movimientosCaja: []
    };
    _.each(caja.cuenta, function (cuenta, cuentaid) {
      objeto.cuenta[cuentaid] = {
        montoRegistrado: Number(parseFloat(cuenta.saldo).toFixed(2)),
        montoCaputado: Number(parseFloat(montos[cuentaid].saldo).toFixed(2)),
        diferencia: Number(parseFloat(montos[cuentaid].saldo - cuenta.saldo).toFixed(2))
      }
      cuenta.saldo = 0;
    });
    var corteid = CortesCaja.insert(objeto);
    _.each(montos, function (monto, cuentaid) {
      var cuenta = Cuentas.findOne(monto.cuenta_id);
      cuenta.sucursal_id = user.profile.sucursal_id;
      cuenta.updatedBy = user._id;
      cuenta.updatedAt = new Date();
      cuenta.updated = true;
      cuenta.estatus = 1;
      cuenta.saldo = cuenta.saldo + monto.saldo
      var cuentaid = cuenta._id;
      delete cuenta._id
      Cuentas.update({ _id: cuentaid }, { $set: cuenta });

      var movimiento = {
        tipoMovimiento: "DEPOSITO",
        origen: "Corte de Caja",
        origen_id: corteid,
        monto: monto.saldo,
        cuenta_id: cuentaid,
        sucursal_id: user.profile.sucursal_id,
        createdAt: new Date(),
        createdBy: user._id,
        updated: false,
        estatus: 1
      }

      var movimientoid = MovimientosCuenta.insert(movimiento);
      objeto.movimientosCuentas.push(movimientoid);
      //caja.cuenta[cuentaid].saldo=0;
    });

    var where = {
      $and: [{ caja_id: cajaId }, {
        $or: [
          { estatus: 1 },
          { estatus: 2 }
        ]
      }]
    };

    var movimientos = MovimientosCajas.find(where).fetch();
    _.each(movimientos, (movimiento) => {
      MovimientosCajas.update({ _id: movimiento._id }, { $set: { corteCaja_id: corteid, estatus: 3 } })
      objeto.movimientosCaja.push(movimiento._id)
    });
    try {
      caja.cortesCaja.push(corteid)
    } catch (ex) {
      caja.cortesCaja = [corteid];
    }

    delete caja._id;
    Cajas.update({ _id: cajaId }, { $set: caja });

    delete objeto._id
    CortesCaja.update({ _id: corteid }, { $set: objeto });

    return corteid;

  },
  getHistorialCajas: (fechaInicio, fechaFin, sucursal_id) => {
    var movimientosCajas = MovimientosCajas.find({ sucursal_id: sucursal_id, origen: "Apertura de Caja", createdAt: { $gte: fechaInicio, $lte: fechaFin }, estatus: 3 }).fetch();
    var res = {};
    _.each(movimientosCajas, function (mc) {
      if (!res[mc.corteCaja_id]) {
        mc.caja = Cajas.findOne(mc.caja_id);
        mc.cuenta = Cuentas.findOne(mc.cuenta_id);
        mc.corte = CortesCaja.findOne(mc.corteCaja_id);
        res[mc.corteCaja_id] = mc;
      }
    });
    return _.toArray(res);
  },
  getCajaInactivaDetalle: (caja_id, fechaInicio, fechaFin) => {
    var res = {};
    res.pagos = Pagos.find({ caja_id: caja_id, fechaPago: { $gte: fechaInicio, $lte: fechaFin } }).fetch();
    var agrupados = {};
    var total = 0;
    var pagos = Pagos.find({ estatus: { $ne: 0 } }).fetch();
    if (pagos.length) {
      _.each(pagos, function (pago) {
        pago.tipoIngreso = TiposIngreso.findOne(pago.tipoIngreso_id);
        if (pago.tipoIngreso != undefined) {
          if (agrupados[pago.tipoIngreso.nombre] == undefined) {
            agrupados[pago.tipoIngreso.nombre] = 0;
          }
          agrupados[pago.tipoIngreso.nombre] += pago.totalPago;
          total += pago.totalPago;
        }
      });
    }
    res.totalResumen = total;
    res.pagos = agrupados;
    res.movimientosCaja = MovimientosCajas.find({
      $and: [{ caja_id: caja_id },
      { createdAt: { $gte: fechaInicio, $lte: fechaFin } },
        // {origen: {$ne: 'Apertura de Caja'}}
      ]
    }, { sort: { createdAt: -1 } }).fetch();
    _.each(res.movimientosCaja, function (mov) {
      mov.cuenta = TiposIngreso.findOne(mov.cuenta_id);
      //mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta.tipoIngreso_id);
      mov.pago = Pagos.findOne(mov.origen_id);
      if (mov.pago) {
        mov.multas = 0;
        mov.capital = 0;
        mov.intereses = 0;
        mov.iva = 0;
        mov.seguro = 0;

        _.each(mov.pago.planPagos, function (plan) {
          if (plan.descripcion == "Cargo Moratorio") {
            mov.multas += plan.totalPago;
          }
          mov.capital += plan.pagoCapital;
          mov.intereses += plan.pagoInteres;
          mov.iva += plan.pagoIva;
          mov.seguro += plan.pagoSeguro;
        });
      }
    });

    res.traspasos = Traspasos.find({ $or: [{ origen_id: caja_id }, { destino_id: caja_id }], createdAt: { $gte: fechaInicio, $lte: fechaFin } }).fetch();

    _.each(res.traspasos, function (traspaso) {
      if (traspaso.tipo == "CuentaCaja") {
        traspaso.origen = Cuentas.findOne(traspaso.origen_id);
        traspaso.destino = Cajas.findOne(traspaso.destino_id);
      } else if (traspaso.tipo == "CajaCaja") {
        traspaso.origen = Cajas.findOne(traspaso.origen_id);
        traspaso.destino = Cajas.findOne(traspaso.destino_id);
      } else {
        traspaso.origen = Cajas.findOne(traspaso.origen_id);
        traspaso.destino = Cuentas.findOne(traspaso.destino_id);
      }
    });

    return res
  },
  datosCliente: (usuario_id) => {
    var cliente = Meteor.users.findOne(usuario_id);
    cliente.profile.pais = Paises.findOne(cliente.profile.pais_id);
    cliente.profile.estado = Estados.findOne(cliente.profile.estado_id);
    cliente.profile.municipio = Municipios.findOne(cliente.profile.municipio_id);
    cliente.profile.ciudad = Ciudades.findOne(cliente.profile.ciudad_id)
    cliente.profile.colonia = Colonias.findOne(cliente.profile.colonia);
    return cliente
  },
  datosClienteTicket: (usuario_id) => {
    var cliente = Meteor.users.findOne({ _id: usuario_id }, {
      fields: {
        "profile.nombreCompleto": 1,
        "profile.numeroCliente": 1,
        "profile.calle": 1,
        "profile.numero": 1,
        "profile.colonia_id": 1,
        "profile.municipio_id": 1,
        "profile.estado_id": 1,
      }
    });




    //cliente.profile.pais = Paises.findOne(cliente.profile.pais_id);
    cliente.profile.estado = Estados.findOne(cliente.profile.estado_id);
    cliente.profile.municipio = Municipios.findOne(cliente.profile.municipio_id);
    cliente.profile.ciudad = Ciudades.findOne(cliente.profile.ciudad_id)
    cliente.profile.colonia = Colonias.findOne(cliente.profile.colonia);
    return cliente
  },
  getResumen: (caja_id, fechaInicio, fechaFin) => {
    fechaInicio = new Date(fechaInicio);
    var filtroFechas = { $gte: fechaInicio };
    if (fechaFin) {
      filtroFechas.$lte = fechaFin
    }
    //Ingresos por forma de pago
    var ingresosAgrupados = {};
    var totalIngresos = 0;
    //console.log(filtroFechas)
    //console.log(caja_id)
    var movs = MovimientosCajas.find({ caja_id: caja_id, $or: [{ tipoMovimiento: 'Pago' }, { origen: 'Cancelación de pago' }], createdAt: filtroFechas }).fetch();
    if (movs.length) {
      _.each(movs, function (mov) {
        mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);
        if (ingresosAgrupados[mov.tipoIngreso.nombre] == undefined) {
          ingresosAgrupados[mov.tipoIngreso.nombre] = 0;
        }
        ingresosAgrupados[mov.tipoIngreso.nombre] += mov.monto;
        totalIngresos += mov.monto;
      });
    };

    //console.log(ingresosAgrupados);

    //Entrega de Creditos
    var creditosAgrupados = {};
    var valesAgrupados = {};
    var comisionesAgrupados = {};

    var totalCreditos = 0;
    var creditosEntregados = 0;
    var totalComisionesPromotoras = 0;

    var comisionesPromotoras = 0;
    var totalVales = 0;
    var valesEntregados = 0;

    var movs = MovimientosCajas.find({ caja_id: caja_id, $or: [{ tipoMovimiento: 'Pago Comisión Promotora' }, { origen: 'Cancelación de Pago a Promotora' }], createdAt: filtroFechas }).fetch();
    if (movs.length) {
      _.each(movs, function (mov) {
        mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);
        if (comisionesAgrupados[mov.tipoIngreso.nombre] == undefined) {
          comisionesAgrupados[mov.tipoIngreso.nombre] = 0;
        }
        comisionesAgrupados[mov.tipoIngreso.nombre] += mov.monto;
        totalComisionesPromotoras += mov.monto;

        if (mov.origen == 'Cancelación de Pago a Promotora')
          comisionesPromotoras--;
        else if (mov.origen == 'Pago a Promotora')
          comisionesPromotoras++;

      });
    };

    var movs = MovimientosCajas.find({ caja_id: caja_id, $or: [{ tipoMovimiento: 'Retiro' }, { origen: 'Cancelación de Ent. de Crédito' }, { origen: 'Cancelación de Ent. de Vale' }], createdAt: filtroFechas }).fetch();
    //var cuentas = Cuentas.find({estatus: 1}).fetch();

    if (movs.length) {
      _.each(movs, function (mov) {
        mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);
        if (creditosAgrupados[mov.tipoIngreso.nombre] == undefined) {
          creditosAgrupados[mov.tipoIngreso.nombre] = 0;
        }

        if (valesAgrupados[mov.tipoIngreso.nombre] == undefined) {
          valesAgrupados[mov.tipoIngreso.nombre] = 0;
        }

        if (mov.origen == 'Entrega de Crédito' || mov.origen == 'Entrega de Credito' || mov.origen == 'Cancelación de Ent. de Crédito') {
          creditosAgrupados[mov.tipoIngreso.nombre] += (mov.monto * -1);
          totalCreditos += mov.monto;
          //console.log(totalCreditos);
        }
        else if (mov.origen == 'Entrega de Vale' || mov.origen == 'Cancelación de Ent. de Vale') {
          valesAgrupados[mov.tipoIngreso.nombre] += (mov.monto * -1);
          totalVales += mov.monto;
        }

        if (mov.origen == 'Cancelación de Ent. de Crédito')
          creditosEntregados--;
        else if (mov.origen == 'Cancelación de Ent. de Vale')
          valesEntregados--;
        else if (mov.origen == 'Entrega de Crédito' || mov.origen == 'Entrega de Credito')
          creditosEntregados++;
        else if (mov.origen == 'Entrega de Vale')
          valesEntregados++;

      });
    };
    //console.log(totalCreditos);
    totalCreditos = totalCreditos * -1;
    totalVales = totalVales * -1;

    //Tranferencias a ventanilla
    var transAVentanillaAgrupados = {};
    var totalTransAVentanilla = 0;
    var movs = MovimientosCajas.find({ caja_id: caja_id, tipoMovimiento: 'Ingreso Por Traspaso', createdAt: filtroFechas }).fetch();
    if (movs.length) {
      _.each(movs, function (mov) {
        mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);
        var c = Cuentas.findOne({ tipoIngreso_id: mov.tipoIngreso._id });
        if (c.tipoCuenta == 'Consignia') {
          totalTransAVentanilla += mov.monto;
        }
      });
    };
    //Retiros de Ventanilla
    var transDeVentanillaAgrupados = {};
    var totalTransDeVentanilla = 0;
    var movs = MovimientosCajas.find({ caja_id: caja_id, tipoMovimiento: 'Retiro Por Traspaso', createdAt: filtroFechas }).fetch();
    if (movs.length) {
      _.each(movs, function (mov) {
        mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);
        var c = Cuentas.findOne({ tipoIngreso_id: mov.tipoIngreso._id });
        if (c.tipoCuenta == 'Consignia') {
          totalTransDeVentanilla += mov.monto;
        }
      });
    };

    //Efectivo en Caja
    var caja = Cajas.findOne(caja_id);
    var cajero = Meteor.users.findOne({ _id: caja.usuario_id }, { fields: { "profile.nombre": 1 } });

    var totalEnCaja = 0;
    _.each(caja.cuenta, function (cuenta, key) {
      cuenta.tipoIngreso = TiposIngreso.findOne(key);
      var c = Cuentas.findOne({ _id: cuenta.cuenta_id });
      if (c.tipoCuenta == 'Consignia') {
        totalEnCaja = cuenta.saldo;
      }
    });

    return {
      comisionesAgrupados: comisionesAgrupados,
      totalComisionesPromotoras: totalComisionesPromotoras,
      comisionesPromotoras: comisionesPromotoras,
      ingresosAgrupados: ingresosAgrupados,
      totalIngresos: totalIngresos,
      creditosAgrupados: creditosAgrupados,
      valesAgrupados: valesAgrupados,
      totalCreditos: totalCreditos,
      creditosEntregados: creditosEntregados,
      totalVales: totalVales,
      valesEntregados: valesEntregados,
      totalTransAVentanilla: totalTransAVentanilla,
      totalTransDeVentanilla: totalTransDeVentanilla,
      totalEnCaja,
      cajero,
      caja
    };
  },
  getCorte: (corte_id) => {

    //console.log(corte_id);

    var corte = CortesCaja.findOne({ _id: corte_id });

    var comisionesAgrupados = {};
    var totalComisionesPromotoras = 0;
    var comisionesPromotoras = 0;

    var aperturaVentanilla = {}
    var totalAperura = 0;

    var ingresosAgrupados = {};
    var totalIngresos = 0;

    var creditosAgrupados = {};
    var totalCreditos = 0;
    var creditosEntregados = 0;

    var valesAgrupados = {};
    var totalVales = 0;
    var valesEntregados = 0;

    var transAVentanillaAgrupados = {};
    var totalTransAVentanilla = 0;

    var transDeVentanillaAgrupados = {};
    var totalTransDeVentanilla = 0;

    var totalEnCaja = 0;

    _.each(corte.movimientosCaja, function (mcaja, id) {

      var movs = MovimientosCajas.findOne({ _id: mcaja });

      //console.log(movs);

      //Ingresos por forma de pago			
      if (movs.tipoMovimiento == 'Saldo Inicial') {
        //console.log(movs.cuenta_id);
        movs.tipoIngreso = TiposIngreso.findOne(movs.cuenta_id);
        //console.log(movs.tipoIngreso);
        var c = Cuentas.findOne({ tipoIngreso_id: movs.cuenta_id });
        if (c != undefined) {
          //console.log(c);
          if (c.tipoCuenta == 'Consignia') {
            totalAperura += movs.monto;
          }
          if (aperturaVentanilla[movs.tipoIngreso.nombre] == undefined) {
            aperturaVentanilla[movs.tipoIngreso.nombre] = 0;
          }
          aperturaVentanilla[movs.tipoIngreso.nombre] += movs.monto;

        }
      }
      //Ingresos por forma de pago			
      else if (movs.tipoMovimiento == 'Pago' || movs.origen == 'Cancelación de pago') {
        movs.tipoIngreso = TiposIngreso.findOne(movs.cuenta_id);
        if (ingresosAgrupados[movs.tipoIngreso.nombre] == undefined) {
          ingresosAgrupados[movs.tipoIngreso.nombre] = 0;
        }
        ingresosAgrupados[movs.tipoIngreso.nombre] += movs.monto;
        totalIngresos += movs.monto;
      }
      else if (movs.tipoMovimiento == 'Retiro' || movs.origen == 'Cancelación de Ent. de Crédito' || movs.origen == 'Cancelación de Ent. de Vale') {

        //console.log(movs);
        movs.tipoIngreso = TiposIngreso.findOne(movs.cuenta_id);
        if (creditosAgrupados[movs.tipoIngreso.nombre] == undefined) {
          creditosAgrupados[movs.tipoIngreso.nombre] = 0;
        }

        if (valesAgrupados[movs.tipoIngreso.nombre] == undefined) {
          valesAgrupados[movs.tipoIngreso.nombre] = 0;
        }

        if (movs.origen == 'Entrega de Crédito' || movs.origen == 'Entrega de Credito' || movs.origen == 'Cancelación de Ent. de Crédito') {
          creditosAgrupados[movs.tipoIngreso.nombre] += (movs.monto * -1);
          totalCreditos += movs.monto;
        }
        else if (movs.origen == 'Entrega de Vale' || movs.origen == 'Cancelación de Ent. de Vale') {
          valesAgrupados[movs.tipoIngreso.nombre] += (movs.monto * -1);
          totalVales += movs.monto;
        }

        if (movs.origen == 'Cancelación de Ent. de Crédito' || movs.origen == 'Entrega de Credito')
          creditosEntregados--;
        else if (movs.origen == 'Cancelación de Ent. de Vale')
          valesEntregados--;
        else if (movs.origen == 'Entrega de Crédito')
          creditosEntregados++;
        else if (movs.origen == 'Entrega de Vale')
          valesEntregados++;

        /*
creditosAgrupados[movs.tipoIngreso.nombre] += (movs.monto*-1);
          totalCreditos += movs.monto;
          if (movs.origen == 'Cancelación de Ent. de Crédito')
             creditosEntregados--;
          else	
             creditosEntregados++;	 
*/

      }
      else if (movs.tipoMovimiento == 'Ingreso Por Traspaso') {
        movs.tipoIngreso = TiposIngreso.findOne(movs.cuenta_id);
        var c = Cuentas.findOne({ tipoIngreso_id: movs.tipoIngreso._id });
        if (c.tipoCuenta == 'Consignia') {
          totalTransAVentanilla += movs.monto;
        }
      }
      else if (movs.tipoMovimiento == 'Retiro Por Traspaso') {
        movs.tipoIngreso = TiposIngreso.findOne(movs.cuenta_id);
        var c = Cuentas.findOne({ tipoIngreso_id: movs.tipoIngreso._id });
        if (c.tipoCuenta == 'Consignia') {
          totalTransDeVentanilla += movs.monto;
        }
      }
      else if (movs.tipoMovimiento == 'Pago Comisión Promotora' || movs.origen == 'Cancelación de Pago a Promotora') {
        movs.tipoIngreso = TiposIngreso.findOne(movs.cuenta_id);
        if (comisionesAgrupados[movs.tipoIngreso.nombre] == undefined) {
          comisionesAgrupados[movs.tipoIngreso.nombre] = 0;
        }
        comisionesAgrupados[movs.tipoIngreso.nombre] += movs.monto;
        totalComisionesPromotoras += movs.monto;

        if (movs.origen == 'Cancelación de Pago a Promotora')
          comisionesPromotoras--;
        else if (movs.origen == 'Pago a Promotora')
          comisionesPromotoras++;
      }

    })

    totalCreditos = totalCreditos * -1;
    totalVales = totalVales * -1;

    //Efectivo en Caja
    var caja = Cajas.findOne(corte.caja_id);
    var cajero = Meteor.users.findOne({ _id: caja.usuario_id }, { fields: { "profile.nombre": 1 } });

    _.each(corte.cuenta, function (cuenta, key) {
      cuenta.tipoIngreso = TiposIngreso.findOne(key);
      var c = Cuentas.findOne({ tipoIngreso_id: cuenta.tipoIngreso._id });
      if (c != undefined) {
        if (c.tipoCuenta == 'Consignia') {
          totalEnCaja = cuenta.montoCaputado;
        }
      }
    });

    return {
      comisionesAgrupados: comisionesAgrupados,
      totalComisionesPromotoras: totalComisionesPromotoras,
      comisionesPromotoras: comisionesPromotoras,
      ingresosAgrupados: ingresosAgrupados,
      aperturaVentanilla: aperturaVentanilla,
      totalIngresos: totalIngresos,
      creditosAgrupados: creditosAgrupados,
      valesAgrupados: valesAgrupados,
      totalCreditos: totalCreditos,
      creditosEntregados: creditosEntregados,
      totalVales: totalVales,
      valesEntregados: valesEntregados,
      totalTransAVentanilla: totalTransAVentanilla,
      totalTransDeVentanilla: totalTransDeVentanilla,
      totalAperura: totalAperura,
      totalEnCaja,
      cajero,
      caja
    };
  },
  tieneCajaAbierta: (cajero_id) => {
    var caja = Cajas.findOne({ usuario_id: cajero_id });

    if (caja == undefined)
      return false;

    if (caja.estadoCaja == "Abierta")
      return true;
    return false;
  },
});
