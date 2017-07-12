Meteor.methods({
  crearCaja: function(caja) {
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
    caja.estadoCaja = "Cerrada";
    var cajaid = Cajas.insert(caja)
    if (usuario.profile.caja_id)
      Cajas.update({ _id: cajavieja._id }, { $set: { usuario_id: "" } });
    Meteor.users.update({ _id: caja.usuario_id }, { $set: { 'profile.caja_id': cajaid } })
    return cajaid;
  },

  actualizarCaja: function(caja) {
    var user = Meteor.user();
    if (user.roles[0] != "Gerente")
      throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');

    var usuario = Meteor.users.findOne(caja.usuario_id)

    if (caja.estadoCaja == "Abierta")
      throw new Meteor.Error(500, 'Error 500: Conflicto', 'Caja Abierta');

    var cajavieja;

    var oldcaja = Cajas.findOne(caja._id);
    var usuarioViejo = oldcaja.usuario_id;

    if (usuario.profile.caja_id) {
      cajavieja = Cajas.findOne(usuario.profile.caja_id);
      if (cajavieja.estadoCaja == "Abierta")
        throw new Meteor.Error(500, 'Error 500: Conflicto', 'Caja Abierta');
    }
    caja.sucursal_id = user.profile.sucursal_id;
    //caja.createdBy = user._id;
    //caja.createdAt = new Date();
    caja.updated = true;
    caja.updatedAt = new Date();
    caja.updatedBy = user._id;
    //caja.estatus = true;
    //caja.estadoCaja = "Cerrado";


    var cajaid = caja._id;
    delete caja._id
    Cajas.update({ _id: cajaid }, { $set: caja })

    if (usuario.profile.caja_id)
      Cajas.update({ _id: cajavieja._id }, { $set: { usuario_id: "" } })
    if (usuarioViejo)
      Meteor.users.update({ _id: usuarioViejo }, { $set: { 'profile.caja_id': "" } })

    Meteor.users.update({ _id: caja.usuario_id }, { $set: { 'profile.caja_id': cajaid } })

    return "200";
  },
  traspasoCajaCuenta: function(origen_id, destino_id, cantidad) {

    var origen = Cajas.findOne(origen_id);
    var destino = Cuentas.findOne(destino_id);

    var user = Meteor.user();

    if (user.roles[0] != "Gerente")
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
      updated: false
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
      estatus: 1
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
      estatus: 1
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

    return "200";
  },
  traspasoCajaCaja: function(origen_id, destino_id, cantidad, cuenta) {

    var origen = Cajas.findOne(origen_id);
    var destino = Cajas.findOne(destino_id);

    var user = Meteor.user();

    if (user.roles[0] != "Gerente")
      throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');
    if (!destino || !origen || !origen.cuenta || !origen.cuenta[cuenta] || origen.cuenta[cuenta].saldo < cantidad || cantidad <= 0)
      throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');
    origen.cuenta[cuenta].saldo -= cantidad;
    destino.cuenta[cuenta].saldo += cantidad;

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
      updated: false
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
      estatus: 1
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
      estatus: 1
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

    return "200";
  },
  abrirCaja: function(caja) {
    caja.estadoCaja = "Abierta";
    var cajaid = caja._id;
    var user = Meteor.user()
    _.each(caja.cuenta, function(cuenta, cuentaid) {
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
    delete caja._id
    caja.updated = true;
    caja.updatedAt = new Date();
    caja.ultimaApertura = new Date();
    caja.updatedBy = user._id;
    Cajas.update({ _id: cajaid }, { $set: caja });

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
    _.each(movimientos, function(mov) {
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
	
		console.log(cajeroId);
    var user = Meteor.users.findOne({_id: cajeroId});
    console.log("User:", user);
    
		var caja = Cajas.findOne({_id: cajaId});
    console.log("Caja:", caja);
    
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
      movimientosCuentas:  [],
      movimientosCaja: []
    };
    _.each(caja.cuenta, function(cuenta, cuentaid) {
      objeto.cuenta[cuentaid] = {
        montoRegistrado: cuenta.saldo,
        montoCaputado: montos[cuentaid].saldo,
        diferencia: montos[cuentaid].saldo - cuenta.saldo
      }
      cuenta.saldo = 0;
    });
    var corteid = CortesCaja.insert(objeto);
    _.each(montos, function(monto, cuentaid) {
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

  },
  getHistorialCajas: (fechaInicio, fechaFin, sucursal_id) => {
    var movimientosCajas = MovimientosCajas.find({ sucursal_id: sucursal_id, origen: "Apertura de Caja", createdAt: { $gte: fechaInicio, $lte: fechaFin }, estatus: 3 }).fetch();
    var res = {};
    _.each(movimientosCajas, function(mc) {
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
		console.log(caja_id);
    var agrupados = {};
    var total = 0;
    var pagos = Pagos.find({ estatus: { $ne: 0 } }).fetch();
    if (pagos.length) {
      _.each(pagos, function(pago) {
        pago.tipoIngreso = TiposIngreso.findOne(pago.tipoIngreso_id);
        if (agrupados[pago.tipoIngreso.nombre] == undefined) {
          agrupados[pago.tipoIngreso.nombre] = 0;
        }
        agrupados[pago.tipoIngreso.nombre] += pago.totalPago;
        total += pago.totalPago;
      });
    }
    res.totalResumen = total;
    res.pagos = agrupados;
    res.movimientosCaja = MovimientosCajas.find({
      $and: [{ caja_id: caja_id },
        { createdAt: { $gte: fechaInicio, $lte: fechaFin } },
        // {origen: {$ne: 'Apertura de Caja'}}
      ]
    }).fetch();
    _.each(res.movimientosCaja, function(mov) {
      mov.cuenta = TiposIngreso.findOne(mov.cuenta_id);
      //mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta.tipoIngreso_id);
      mov.pago = Pagos.findOne(mov.origen_id);
      if (mov.pago) {
        mov.multas = 0;
        mov.capital = 0;
        mov.intereses = 0;
        mov.iva = 0;
        mov.seguro = 0;
        _.each(mov.pago.planPagos, function(plan) {
          if (plan.descripcion = "Multa") {
            mov.multas += plan.totalPago;
          }
          mov.capital += plan.pagoCapital;
          mov.intereses += plan.pagoInteres;
          mov.iva += plan.pagoIva;
          mov.seguro += plan.pagoSeguro;
        });
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
  getResumen: (caja_id, fechaInicio, fechaFin) => {
    fechaInicio = new Date(fechaInicio);
    var filtroFechas = { $gte: fechaInicio };
    if (fechaFin) {
      filtroFechas.$lte = fechaFin
    }
    //Ingresos por forma de pago
    var ingresosAgrupados = {};
    var totalIngresos = 0;
    var movs = MovimientosCajas.find({ caja_id: caja_id, $or:[ {tipoMovimiento: 'Pago'}, {origen: 'Cancelación de pago'}], createdAt: filtroFechas }).fetch();
    if (movs.length) {
      _.each(movs, function(mov) {
        mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);
        if (ingresosAgrupados[mov.tipoIngreso.nombre] == undefined) {
          ingresosAgrupados[mov.tipoIngreso.nombre] = 0;
        }
        ingresosAgrupados[mov.tipoIngreso.nombre] += mov.monto;
        totalIngresos += mov.monto;
      });
    };
    //Entrega de Creditos
    var creditosAgrupados = {};
    var totalCreditos = 0;
    var creditosEntregados = 0;
    var movs = MovimientosCajas.find({ caja_id: caja_id, $or:[ {tipoMovimiento: 'Retiro'}, {origen: 'Cancelación de retiro'}], createdAt: filtroFechas }).fetch();
    if (movs.length) {
      _.each(movs, function(mov) {
        mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);
        if (creditosAgrupados[mov.tipoIngreso.nombre] == undefined) {
          creditosAgrupados[mov.tipoIngreso.nombre] = 0;
        }
        creditosAgrupados[mov.tipoIngreso.nombre] += (mov.monto*-1);
        totalCreditos += mov.monto;
        creditosEntregados++;
      });
    };
    totalCreditos = totalCreditos*-1;
    //Tranferencias a ventanilla
    var transAVentanillaAgrupados = {};
    var totalTransAVentanilla = 0;
    var movs = MovimientosCajas.find({ caja_id: caja_id, tipoMovimiento: 'Ingreso Por Traspaso', createdAt: filtroFechas }).fetch();
    if (movs.length) {
      _.each(movs, function(mov) {
        mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);
        if(mov.tipoIngreso.nombre == 'EFECTIVO'){
        	totalTransAVentanilla += mov.monto;
        }
      });
    };
    //Retiros de Ventanilla
    var transDeVentanillaAgrupados = {};
    var totalTransDeVentanilla = 0;
    var movs = MovimientosCajas.find({ caja_id: caja_id, tipoMovimiento: 'Retiro Por Traspaso', createdAt: filtroFechas }).fetch();
    if (movs.length) {
      _.each(movs, function(mov) {
        mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);
        if(mov.tipoIngreso.nombre == 'EFECTIVO'){
        	totalTransDeVentanilla += mov.monto;
        }
      });
    };
    //Efectivo en Caja
    var caja = Cajas.findOne(caja_id);
    var totalEnCaja = 0;
    _.each(caja.cuenta, function(cuenta, key){
    	cuenta.tipoIngreso = TiposIngreso.findOne(key);
    	if(cuenta.tipoIngreso.nombre == 'EFECTIVO'){
    		totalEnCaja = cuenta.saldo;
    	}
    });
    return 	{
	    				ingresosAgrupados: ingresosAgrupados,
	    				totalIngresos: totalIngresos,
	    				creditosAgrupados: creditosAgrupados,
							totalCreditos: totalCreditos,
							creditosEntregados: creditosEntregados,
							totalTransAVentanilla: totalTransAVentanilla,
							totalTransDeVentanilla: totalTransDeVentanilla,
							totalEnCaja
						};
    //var agrupados = {};
    // var pagos = Pagos.find({ caja_id: caja_id, estatus: { $ne: 0 }, fechaPago: filtroFechas }).fetch();
    // _.each(pagos, function(pago) {
    //   pago.tipoIngreso = TiposIngreso.findOne(pago.tipoIngreso_id);
    //   if (agrupados[pago.tipoIngreso.nombre] == undefined) {
    //     agrupados[pago.tipoIngreso.nombre] = 0;
    //   }
    //   agrupados[pago.tipoIngreso.nombre] += pago.totalPago;
    // });
    
    // var caja = Cajas.findOne(caja_id);
    // var entregados = {};
    // var movimientos = MovimientosCajas.find({ monto: { $ne: 0 }, origen: 'Entrega de Credito', createdAt: filtroFechas }).fetch();
    // entregados.cantidad = 0;
    // entregados.total = 0;
    // entregados.agrupados = {};
    // _.each(movimientos, function(mov) {
    //   entregados.total += (mov.monto * -1);
    //   entregados.cantidad++;
    //   mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);
    //   if (entregados.agrupados[mov.tipoIngreso.nombre] == undefined) {
    //     entregados.agrupados[mov.tipoIngreso.nombre] = 0
    //   };
    //   entregados.agrupados[mov.tipoIngreso.nombre] += (mov.monto * -1);
    // });
    // caja.cajero = Meteor.users.findOne(caja.usuario_id);
    // return { resumen: agrupados, caja: caja, entregados: entregados, caja: caja };
  }
});
