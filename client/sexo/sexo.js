angular.module("creditoMio")
	.controller("SexoCtrl", SexoCtrl);
function SexoCtrl($scope, $meteor, $reactive, $state, toastr) {

	$reactive(this).attach($scope);
	this.action = true;
	this.nuevo = true;
	this.objeto = {};

	this.subscribe('sexo', () => {
		return [{

		}]
	});

	this.helpers({
		sexo: () => {
			return Sexo.find();
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
		objeto.estatus = true;
		objeto.usuarioInserto = Meteor.userId();
		Sexo.insert(objeto);
		toastr.success('Guardado correctamente.');
		this.objeto = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();

	};

	this.editar = function (id) {
		this.objeto = Sexo.findOne({ _id: id });
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
		Sexo.update({ _id: idTemp }, { $set: objeto });
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
	};

	this.cambiarEstatus = function (id) {
		var objeto = Sexo.findOne({ _id: id });
		if (objeto.estatus == true)
			objeto.estatus = false;
		else
			objeto.estatus = true;

		Sexo.update({ _id: id }, { $set: { estatus: objeto.estatus } });
	};
};