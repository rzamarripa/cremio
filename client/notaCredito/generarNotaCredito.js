angular
	.module('creditoMio')
	.controller('GenerarNotaCredito', GenerarNotaCredito);
 
function GenerarNotaCredito($scope, $meteor, $reactive, $state, toastr, $stateParams) {

	rc = $reactive(this).attach($scope);
	this.action = true;
	this.nuevo = true;	 
	this.objeto = {}; 
	this.fechaActual = new Date();
	window.rc = rc;
	
	this.subscribe("ocupaciones",()=>{
		return [{_id : this.getReactively("ocupacion_id"), estatus : true }]
	});
	
	this.subscribe('cliente', () => {
		return [{
			_id : $stateParams.objeto_id
		}];
	});
	this.subscribe('tiposNotasCredito',()=>{
		return [{}]
	});
			
	this.helpers({
		
		objeto : () => {
			var cli = Meteor.users.findOne({_id : $stateParams.objeto_id});
			if(cli){
				this.ocupacion_id = cli.profile.ocupacion_id;
				return cli;
			}		
		},
		ocupaciones : () => {
			if(this.getReactively("creditos")){
				this.creditos_id = _.pluck(rc.creditos, "_id");
			}
			return Ocupaciones.find();
		},
		tiposNotas : () => {
			return TiposNotasCredito.find({});
		}
		
	});
	

	this.guardar = function(objeto,form)
	{
			var tipo = this.objeto.roles;
											
			if(form.$invalid){
						toastr.error('Error al guardar los datos.');
						return;
			}
			//console.log(objeto);
			//console.log($stateParams.objeto_id);

			Meteor.call ("crearNotaDeCredito",$stateParams.objeto_id,objeto,function(error,result){
		
				if(error){
					console.log(error);
					toastr.error('Error al guardar los datos.');
					return
				}
				if (result)
				{								
						toastr.success('Actualizado correctamente.');
						if (tipo == "Distribuidor") {
							$state.go("root.distribuidoresDetalle",{objeto_id : $stateParams.objeto_id});
						}
						if (tipo == "Cliente") {
							$state.go("root.clienteDetalle",{objeto_id : $stateParams.objeto_id});
						}
						rc.objeto = {};						
				}
				
			});	
		
	};
	

	
}