angular.module("creditoMio")
  .controller("CajasActivasCtrl", CajasActivasCtrl);

function CajasActivasCtrl($scope, $meteor, $reactive, $state, toastr) {

  let rc = $reactive(this).attach($scope);
  window.rc = rc;
  this.action = true;
  this.nuevo = true;
  this.objeto = {};
  this.buscar = {};
  this.caja = {_id: 0};
  this.pagos_id = [];
  this.cajasInactivas = [];
  this.fechaInicio = moment().subtract(1,'month').startOf('month').toDate();
  this.fechaFin = moment().subtract(1,'month').endOf('month').toDate();
  this.subscribe('cajas', () => {
    return [{ sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", estadoCaja: "Abierta" }]
  });
  this.subscribe('tiposIngreso', () => {
    return [{}]
  });
  this.subscribe('allCajeros', () => {
    return [{}]
  });
  this.subscribe('cuentas', () => {
    return [{}]
  });
  this.subscribe('pagos', () => {
    return [{_id: { $in: this.getReactively('pagos_id')}}]
  });
  this.subscribe('movimientosCaja', () => {
    return [{
      $and: [{ caja_id: this.getReactively('caja._id') },
      			  {
        $or: [
          { estatus: 1 },
          { estatus: 2 }
        ]
      }]
    }]
  });

  this.helpers({
    cajas: () => {
    	var cajas = Cajas.find().fetch();

      return Cajas.find();
    },
    pagos: () => {
      var pagos = Pagos.find({estatus: {$ne: 0}}).fetch();
      if (pagos.length) {
        _.each(pagos, function(pago) {
          pago.tipoIngreso = rc.tiposIngreso[pago.tipoIngreso_id].nombre;
        });
      }
      return pagos;
    },
    tiposIngreso: () => {
      var obj = {};
      var tiposIngreso = TiposIngreso.find().fetch();
      _.each(tiposIngreso, function(ti) {
        obj[ti._id] = ti;
      });
      return obj;
    },
    cajeros: () => {
      return Meteor.users.find({ roles: ["Cajero"] });
    },
    movimientosCaja: () => {
      var ret = [];
      if(rc.getReactively('caja._id')){
	      var movimientos = MovimientosCajas.find({caja_id:rc.caja._id}).fetch();
	      var cj = Cajas.findOne(rc.caja._id);
	      var pagos_id = [];
	      _.each(movimientos, function(mov) {
	      	if(mov.origen == "Pago de Cliente"){
	      		pagos_id.push(mov.origen_id);
	      	}
	        var d = {};
	        d.createdAt = mov.createdAt;
	        d.tipoMovimiento = mov.tipoMovimiento;
	        d.origen = mov.origen;
	        c = Cuentas.findOne(cj.cuenta[mov.cuenta_id].cuenta_id);
	        d.cuenta = c.nombre;
	        d.monto = mov.monto;
	        //d.pago_id = mov.origen_id;
	        d.pago = Pagos.findOne(mov.origen_id);
	        ret.push(d)
	      });
	      rc.pagos_id = pagos_id;
    	}
      return ret
    }
  });

  this.getCajero = (objeto) => {
    c = Meteor.users.findOne(objeto.usuario_id)
    if (c && c.profile && c.profile.nombreCompleto)
      return c.profile.nombreCompleto
    return ""
  }

  this.verCaja = function(caja, cajaInactiva) {
  	if(cajaInactiva){
  		Meteor.apply('getCajaInactivaDetalle', [caja.caja._id, caja.createdAt, caja.corte.createdAt], function(err, result){
  			rc.cajaInactiva = result;
  			rc.cajaInactiva.caja = {nombre: caja.caja.nombre, fechaApertura: caja.createdAt, fechaCierre: caja.corte.createdAt}
  			$scope.$apply();
  			$('#cajaInactiva').modal('show');
  		});
  	}else{
  		rc.caja = caja;
  		$('#cajaActiva').modal('show');
  	}
  }

  this.cancelarPago = function(pago) {
  	customConfirm('Estás seguro de cancelar el pago '+pago.folioPago+'?', function(){
	    _.each(pago.planPagos, function(plan) {
	      PlanPagos.update(plan.planPago_id, { $set: { estatus: 0 }, $inc: { importeRegular: plan.totalPago, pago: -plan.totalPago } });
	    });
	    var movimiento_id = MovimientosCajas.insert({
	    	tipoMovimiento : "Cancelación",
				origen : "Cancelación de pago",
				origen_id : pago._id,
				monto : pago.totalPago,
				cuenta_id : pago.tipoIngreso_id,
				caja_id : pago.caja_id,
				sucursal_id : pago.sucursalPago_id,
				createdAt : new Date(),
				createdBy : Meteor.userId(),
				updated : false,
				estatus : 1
	    });
	    Pagos.update(pago._id, { $set: { estatus: 0, cancelacion_movimientoCaja_id: movimiento_id } });
	  })
  }

  this.getHistorialCajas = function(fechaInicio, fechaFin){
  	fechaInicio = moment(fechaInicio).startOf('day').toDate();
  	fechaFin = moment(fechaFin).endOf('day').toDate();
  	Meteor.apply('getHistorialCajas', [fechaInicio, fechaFin, Meteor.user().profile.sucursal_id], function(err, result){
  		if(err){
  			toastr.warning('Error al consultar los datos');
  		}else{
  			rc.cajasInactivas = result;
  			$scope.$apply();
  		}
  	});
  }
  // Meteor.call("movimientosCaja",$stateParams,function(error,result){
  // 	rc.movimientosCaja=result 
  // 	$scope.$apply()
  // });

  // this.getMontos=(objeto)=>{
  // 	var r = '<table class="table table-bordered"> <tbody>';
  // 	for(i in objeto.cuenta){
  // 		r+="<tr>"
  // 		try{
  // 			c=Cuentas.findOne(objeto.cuenta[i].cuenta_id)

  // 			r+="<td>"+c.nombre+"</td>";
  // 			r+='<td class="text-right">'+ ((objeto.cuenta[i].saldo+"").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"))+"</td>";
  // 		}catch(e){

  // 		}
  // 		r+="</tr>"
  // 	}
  // 	r+="</tbody></table>"
  // 	return r;
  // }
};
