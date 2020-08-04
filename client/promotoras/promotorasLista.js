angular.module("creditoMio")
	.controller("PromotorasListaCtrl", PromotorasListaCtrl);
function PromotorasListaCtrl($scope, $meteor, $reactive, $state, toastr) {

	let rc = $reactive(this).attach($scope);
	this.action = true;
	this.nuevo = true;
	this.objeto = {};
	this.buscar = {};
	this.buscar.nombre = "";
	window.rc = rc;

	/*
		this.subscribe('buscarPromotoras', () => {
		  
			if(this.getReactively("buscar.nombre").length > 4){
				return [{
					options : { limit: 20 },
					where : { 
						nombreCompleto : this.getReactively('buscar.nombre')
					} 		   
				}];
			}
		});
	*/

	this.subscribe('sucursales', () => {
		return [{}]
	},
		{
			onReady: function () {
				rc.sucursales = Sucursales.find({ estatus: true }).fetch();
				rc.sucursal_id = Sucursales.findOne(Meteor.user().profile.sucursal_id)._id;
			}
		});

	this.subscribe('promotoras', () => {
		return [{
			"profile.sucursal_id": Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
			roles: "Promotora"
		}];
	});


	this.helpers({
		promotoras: () => {
			return Meteor.users.find({
				"profile.sucursal_id": Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
				roles: "Promotora"
			});
		},
	});


	this.cambiarEstatus = function (id) {
		var objeto = Meteor.users.findOne({ _id: id });
		if (objeto.profile.estatus == true)
			objeto.profile.estatus = false;
		else
			objeto.profile.estatus = true;

		Meteor.call('cambiaEstatusUsuario', id, objeto.profile.estatus, function (error, response) {

			if (error) {
				console.log('ERROR :', error);
				return;
			}

		});

	};


};