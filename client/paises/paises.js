angular.module("creditoMio")
	.controller("PaisesCtrl", PaisesCtrl);
function PaisesCtrl($scope, $meteor, $reactive, $state, toastr) {

	$reactive(this).attach($scope);
	this.action = true;
	this.nuevo = true;
	this.objeto = {};

	this.subscribe('paises', () => {
		return [{

		}]
	});

	this.helpers({
		paises: () => {
			return Paises.find({}, { sort: { nombre: 1 } });
		}
	});

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
		console.log(objeto);
		objeto.estatus = true;
		objeto.usuarioInserto = Meteor.userId();
		Paises.insert(objeto);
		toastr.success('Guardado correctamente.');
		this.objeto = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();

	};

	this.editar = function (id) {
		this.objeto = Paises.findOne({ _id: id });
		this.action = false;
		$('.collapse').collapse('show');
		this.nuevo = false;
	};

	this.actualizar = function (objeto, form) {
		if (form.$invalid) {
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var idTemp = objeto._id;
		delete objeto._id;
		objeto.usuarioActualizo = Meteor.userId();
		Paises.update({ _id: idTemp }, { $set: objeto });
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
	};

	this.cambiarEstatus = function (id) {
		var objeto = Paises.findOne({ _id: id });
		if (objeto.estatus == true)
			objeto.estatus = false;
		else
			objeto.estatus = true;

		Paises.update({ _id: id }, { $set: { estatus: objeto.estatus } });
	};
};