angular.module("creditoMio")
.controller("EntregarCreditoCtrl", EntregarCreditoCtrl);
 function EntregarCreditoCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams){
 	
 	let rc = $reactive(this).attach($scope);
	window.rc=rc
	this.suma =0;
	this.objeto = {};
	this.subscribe('tiposIngreso',()=>{
		return [{
			estatus : true
		}]
	});
	this.subscribe('cajas',()=>{
		return [{_id: Meteor.user() != undefined ? Meteor.user().profile.caja_id : ""}]
	});
	this.subscribe('creditos',()=>{
		return [{_id : $stateParams.credito_id}]
	});
	this.subscribe('cuentas',()=>{
		return [{estatus : 1}]
	});

	this.helpers({

		tiposIngreso : () => {
			var tipos = TiposIngreso.find().fetch();
			_.each(tipos,(tipo)=>{
				rc.objeto.caja =rc.objeto.caja? rc.objeto.caja :{};
				rc.objeto.caja[tipo._id] = rc.objeto.caja[tipo._id]? rc.objeto.caja[tipo._id] :{};
				rc.objeto.caja[tipo._id].saldo = rc.objeto.caja[tipo._id].saldo? rc.objeto.caja[tipo._id].saldo :0;
			});
			return tipos;
		},
		caja : () => {
			return Cajas.findOne(Meteor.user() != undefined ? Meteor.user().profile.caja_id : "")
		},
		cuentas : () => {
			var cuentas = Cuentas.find().fetch();
			_.each(cuentas,(cuenta)=>{
				rc.objeto.cuenta =rc.objeto.cuenta? rc.objeto.cuenta :{};
				rc.objeto.cuenta[cuenta._id] = rc.objeto.cuenta[cuenta._id]? rc.objeto.cuenta[cuenta._id] :{};
				rc.objeto.cuenta[cuenta._id].saldo = rc.objeto.cuenta[cuenta._id].saldo? rc.objeto.cuenta[cuenta._id].saldo :0;
			});
			return cuentas;
		},
		credito : () => {
			console.log($stateParams.credito_id)
			return Creditos.findOne({_id:$stateParams.credito_id});
		}

	});
	this.calcular = function(){
		if(!this.objeto)
			return 0;
		rc.suma = 0;
		_.each(this.objeto.cuenta,function(cuenta){ 
			if(cuenta && cuenta.saldo && cuenta.saldo>0)
				rc.suma+= cuenta.saldo;
		})
		_.each(this.objeto.caja,function(caja){ 
			if(caja && caja.saldo && caja.saldo>0)
				rc.suma+= caja.saldo;
		})
	}
	this.guardar = function (){
			//console.log(rc.objeto)
			if(form.$invalid || rc.suma != rc.credito.capitalSolicitado){
						toastr.error('Error al actualizar los datos.');
						return;
			}
			Meteor.call ("entregarCredito",rc.objeto,$stateParams.credito_id,function(error,result){
		
				if(error){
					console.log(error);
					toastr.error('Error al guardar los datos.');
					return
				}
				toastr.success('Operacion Realizada.');
				$state.go("root.clienteDetalle",{objeto_id : rc.credito.cliente_id});
				rc.objeto = {}; 
				$('.collapse').collapse('hide');
				rc.nuevo = true;
				form.$setPristine();
				form.$setUntouched();
			});	
	}


};