angular
.module("creditoMio")
.controller("VerPlanPagosCtrl", VerPlanPagosCtrl);
function VerPlanPagosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	this.action = false;
	this.fechaActual = new Date();
	console.log($stateParams)
	window.rc = rc;
	
  this.subscribe("planPagos", ()=>{
		return [{ credito_id : $stateParams.credito_id }]
	});
	
	this.subscribe("tiposCredito", ()=>{
		return [{ estatus : true, sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
	});
	
	this.subscribe('cliente', () => {
		return [{ id : $stateParams.cliente_id }];
	});
	
	this.helpers({
		cliente : () => {
			return Meteor.users.findOne({roles : ["Cliente"]});
		},
		planPagos : () => {
			return PlanPagos.find();
		},
		tiposCredito : () => {
			return TiposCredito.find();
		}
	});
	  
  this.guardar = function(convenio,form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
		convenio.estatus = 0;
		convenio.campus_id = Meteor.user().profile.campus_id;
		convenio.usuarioInserto = Meteor.userId();
		convenio.cliente_id = rc.objeto._id;
		PlanPlagos.insert({});
		toastr.success('Guardado correctamente.');
		this.escuela = {}; 
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
		
	};
	
	this.editar = function(pago)
	{
	    this.pago = pago;
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.cambiarEstatus = function(pago, estatus, tipoMov){
		var res = confirm("Está seguro que quiere " + tipoMov + " el pago?");
		if(res == true){
			PlanPagos.update(pago._id, { $set : {estatus : estatus}});
			toastr.success('Cancelado correctamente.');
		}
	}
	
	this.actualizar = function(pago,form)
	{
		if(form.$invalid){
      toastr.error('Error al actualizar los datos.');
      return;
	  }
		var idTemp = pago._id;
		delete pago._id;		
		pago.usuarioActualizo = Meteor.userId(); 
		pago.convenio = 1;
		PlanPagos.update({_id:idTemp},{$set:pago});
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
	
	this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "masculino")
				return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
		}else{
			return foto;
		}
	}
	
	this.modificacionMasiva = function(modificacion, form){
		if(form.$invalid){
      toastr.error('Error al hacer la modificación masiva, por favor revise el llenado del formulario.');
      return;
	  }
	  var pagosPendientes = PlanPagos.find({ semana : { $gte : modificacion.semanaInicial, $lte : modificacion.semanaFinal }, anio : modificacion.anio, estatus : { $ne :  1}}).fetch();
	  
	  _.each(pagosPendientes, function(pago){
		  PlanPagos.update({_id : pago._id},
		  		{ $set : { modificada : true, pagoTiempo : 0, importeRegular : modificacion.importeRegular, importe : modificacion.importeRegular, importeRecargo : modificacion.recargo, importeDescuento : modificacion.descuento, descripcion : modificacion.descripcion}});
	  })
	  toastr.success('Se modificaron correctamente los ' + pagosPendientes.length + ' pagos');
	  this.modificacion = {};
	  $('#collapseMasiva').collapse('hide');
	  this.nuevoMasivo = !this.nuevoMasivo;
	}
	
	this.getFocus = function(){
	  document.getElementById('buscar').focus();
  }; 
  
  this.planPagosSemana =function () {
	  if(form.$invalid){
      toastr.error('Error al calcular el nuevo plan de pagos, llene todos los campos.');
      return;
	  }
	  rc.planPagos = [];
		var dia = 1;
		console.log("original",this.credito.fechaInicial)
		var mfecha = moment(this.credito.fechaInicial);
		console.log("moment", mfecha);
		//mfecha = mfecha.day(dia);
		console.log("day", mfecha);
		var inicio = mfecha.toDate();
		console.log("inicio", inicio);
		
		console.log("1 month", mfecha);
		var plan = [];
		for (var i = 0; i < this.credito.totalPagos; i++) {
			var importeParcial = this.credito.importeRegular / this.credito.totalPagos;
			var pago = {
				semana 			    		: mfecha.isoWeek(),
				fechaLimite 			  : new Date(mfecha.toDate().getTime()),
				diaSemana						: mfecha.weekday(),
				tipoPlan 		    		: 'Mensual',
				numeroPago 	        : i + 1,
				importeRegular      : importeParcial,
				importeRecargo      : (this.credito.importeRecargo / this.credito.totalPagos),
				diasRecargo         : this.credito.diasRecargo,
				cliente_id					: this.cliente._id,
				fechaPago           : undefined,
				semanaPago          : undefined,
				diaPago             : undefined,
				pago                : 0,
				estatus             : 0,
				tiempoPago          : 0,
				modificada          : false,
				mes									: mfecha.get('month') + 1,
				anio								: mfecha.get('year')
			}
			
			rc.planPagos.push(angular.copy(pago));

			var siguienteMes = moment(mfecha).add(1, 'M');
			var finalSiguienteMes = moment(siguienteMes).endOf('month');
			
			if(mfecha.date() != siguienteMes.date() && siguienteMes.isSame(finalSiguienteMes.format('YYYY-MM-DD'))) {
			    siguienteMes = siguienteMes.add(1, 'd');
			}
			
			mfecha = siguienteMes;
		}

		return plan;
	}
	
	this.generarCredito = function(){
		console.log(this.credito);
		var credito = {
			cliente_id : this.cliente._id,
			tipoCredito_id : this.credito.tipoCredito_id,
			fechaSolicito : new Date(),
			capitalSolicitado : this.credito.importeRegular,
			adeudoInicial : this.credito.importeRegular,
			saldoActual : this.credito.importeRegular,
			multasPendientes : 0,
			saldoMultas : 0.00,
			saldoRecibo : 0.00,
			estatus : 1
		};
		Meteor.apply('generarCredito', [this.cliente._id, credito, this.planPagos], function(error, result){
		  if(result == "hecho"){
			  toastr.success('Se crearon correctamente los ' + rc.planPagos.length + ' pagos');
			  rc.planPagos = [];
			  $state.go("root.clienteDetalle",{objeto_id : rc.cliente._id});
		  }
	    $scope.$apply();
	  });
	}
	
	this.calcularRecargos = function(){
		if(this.credito.tipoCredito_id != undefined && this.credito.importeRegular > 0){
			var tipoCredito = TiposCredito.findOne(rc.credito.tipoCredito_id);
			if(tipoCredito != undefined){
				if(rc.credito.importeRegular <= tipoCredito.montoMaximo){
					console.log(tipoCredito);
					rc.credito.importeRecargo = (tipoCredito.tasa / 100) * rc.credito.importeRegular;
				}else{
					toastr.warning('El límite para este tipo de crédito es de ' + tipoCredito.montoMaximo);
					rc.credito.importeRegular = tipoCredito.montoMaximo;
				}
			}			
		}
	}
};