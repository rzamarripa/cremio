angular
.module("creditoMio")
.controller("ImportarClientesCtrl", ImportarClientesCtrl);
function ImportarClientesCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	
  rc.action = true;
  rc.clientes = {};
  
  rc.arreglo = [];

	this.guardar = function()
	{	
			if (rc.clientes.CLIENTES.length == 0){
					 toastr.error('Error al guardar los datos.');
		       return;
		  }
		  
		  for (var i=0; i<rc.clientes.CLIENTES.length;i++)
		  {
			  	var objeto = {};
			  	
			  	objeto.profile = {};
			  	
/*
					
					objeto.profile.apellidoPaterno 		= "";
					objeto.profile.apellidoMaterno 		= "";
					objeto.profile.nombre							= "";
					objeto.profile.nombreCompleto			= "";
					objeto.profile.fecha 							= "";
					objeto.profile.hora								= "";
					objeto.profile.libro		 					= "";
					objeto.profile.foja		 						= "";
					objeto.profile.noDeActa 					= "";
					objeto.profile.fechaNacimiento 		= "";
					objeto.profile.lugarNacimiento		= "";
					objeto.profile.hijoNatural				= "";
					objeto.profile.padre							= "";
					objeto.profile.madre							= "";
					objeto.profile.abueloPaterno	  	= "";
					objeto.profile.abuelaPaterno	  	= "";
					objeto.profile.abueloMaterno	  	= "";
					objeto.profile.abuelaMaterno	  	= "";
					objeto.profile.padrino				  	= "";
					objeto.profile.madrina				  	= "";
 					objeto.profile.registroCivil	  	= "";
 					objeto.profile.lugar					  	= "";
 					objeto.profile.esHijo					  	= "";
 					objeto.profile.fechaRegistro 			= "";
 					objeto.profile.lugarParroquia			= "";
 					objeto.profile.sacerdoteBautizo 	= "";
					objeto.profile.parroco				 		= "";
								
*/
					/////////////////////////////////////////////////////////////////			
					objeto.profile.nombre							= rc.clientes.CLIENTES[i].Nombre;
					objeto.profile.apellidoPaterno 		= rc.clientes.CLIENTES[i].ApellidoPaterno;
					objeto.profile.apellidoMaterno 		= rc.clientes.CLIENTES[i].ApellidoMaterno;
					var nombre 												= objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
		      var apPaterno 										= objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
		      var apMaterno 										= objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";

		      objeto.profile.nombreCompleto 		= nombre + apPaterno + apMaterno;
					objeto.profile.numeroCliente			= rc.clientes.CLIENTES[i].Clave;
					
					objeto.profile.estatus 						= true;
		      objeto.profile.documentos 				=	[];
		      objeto.profile.foto 							= "";
		      objeto.profile.usuarioInserto 		= Meteor.userId();
		      //Ojo estas son las de Rubidia
		      
/*
		      objeto.profile.sucursal_id 				= "wgcBFFrpbJYS5myt5";
		      objeto.profile.pais_id						= "bswfJQCAuB7z44Nd2";
					objeto.profile.estado_id 					= "RES4FAv8EzKnPsTaQ";
*/
					

					objeto.profile.sucursal_id 				= "gYBgCCEZmiHNn7FkJ";
		      objeto.profile.pais_id						= "Anoby4iZzzqi9Zwdu";
					objeto.profile.estado_id 					= "ons8MhAoq2n6GwFsB";
					
		      objeto.profile.fechaCreacion 			= new Date();
		      objeto.profile.referenciasPersonales = [];
					
					objeto.profile.fechaNacimiento		= new Date(rc.clientes.CLIENTES[i].FechaNacimiento);
					objeto.profile.calle		 					= rc.clientes.CLIENTES[i].domCalle;
 						
					objeto.profile.calle		 					= rc.clientes.CLIENTES[i].domCalle;
					objeto.profile.numero		 					= rc.clientes.CLIENTES[i].domNumeroExterior;
					objeto.profile.renta		 					= rc.clientes.CLIENTES[i].domRenta == 1 ? true: false;
					objeto.profile.rentaMes	 					= rc.clientes.CLIENTES[i].domImporteRenta;
					objeto.profile.senasParticulares	= rc.clientes.CLIENTES[i].domParticulares;
					objeto.profile.tiempoResidencia		= rc.clientes.CLIENTES[i].domTiempo;
					objeto.profile.codigoPostal				= rc.clientes.CLIENTES[i].domCP;
					objeto.profile.particular					= rc.clientes.CLIENTES[i].telParticular;
					objeto.profile.celular	 					= rc.clientes.CLIENTES[i].telCelular;
					objeto.profile.telefonoAlternativo= rc.clientes.CLIENTES[i].telOtros;
					objeto.profile.duenoAlternativo		= rc.clientes.CLIENTES[i].telOtrosReferencia;
					objeto.profile.correo		 					= rc.clientes.CLIENTES[i].CorreoElectronico;
					


					objeto.profile.ingresosPersonales	= Number(rc.clientes.CLIENTES[i].IngresosPropios);
					objeto.profile.ingresosConyuge		= Number(rc.clientes.CLIENTES[i].IngresosConyuge);
					objeto.profile.otrosIngresos			= Number(rc.clientes.CLIENTES[i].IngresosOtros);
					objeto.profile.gastosFijos				= Number(rc.clientes.CLIENTES[i].GastosFijos);
					objeto.profile.gastosEventuales		= Number(rc.clientes.CLIENTES[i].GastosEventuales);
					
					objeto.profile.totalIngresos 			= Number(objeto.profile.ingresosPersonales == "" ? 0 : objeto.profile.ingresosPersonales) + 
                                         			Number(objeto.profile.ingresosConyuge == "" ? 0 		: objeto.profile.ingresosConyuge) + 
																				 			Number(objeto.profile.otrosIngresos == "" ? 0 			: objeto.profile.otrosIngresos);
      
					objeto.profile.totalGastos 				= Number(objeto.profile.gastosFijos == "" ? 0 		  : objeto.profile.gastosFijos) + 
                                       				Number(objeto.profile.gastosEventuales == "" ? 0 : objeto.profile.gastosEventuales);
      
					objeto.profile.resultadoNeto 			= Number(objeto.profile.totalIngresos) - Number(objeto.profile.totalGastos);
					
					
					//info Conyuge
					objeto.profile.nombreConyuge			= rc.clientes.CLIENTES[i].Conyuge;	
					objeto.profile.celularConyuge			= rc.clientes.CLIENTES[i].ConyugeTelefono;
					
					//info Trabajo
					objeto.profile.telefonoEmpresa		= rc.clientes.CLIENTES[i].traTelefono;	
					objeto.profile.jefeInmediato			= rc.clientes.CLIENTES[i].traJefe;
					objeto.profile.tiempoLaborando  	= rc.clientes.CLIENTES[i].traAntiguedad;
					objeto.profile.departamento				= rc.clientes.CLIENTES[i].traDepartamento;
					objeto.profile.celularConyuge			= rc.clientes.CLIENTES[i].traJefe;
					

					 Meteor.call('createUsuario', objeto, "Cliente", function(e,r){
		          if (r)
		          {
			          	console.log("OK");
		          }
		          if (e)
		          {
			           	//console.log(e);
			          
		          }
		      });
						
					
					rc.clientes.CLIENTES.splice(i, 1);
					i--;

									
		  }	  
		  
		  rc.clientes = {};

	};
			
	var X = XLSX;
	
	function to_json(workbook) {
		var result = {};
		workbook.SheetNames.forEach(function(sheetName) {
			var roa = X.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
			if(roa.length > 0){
				result[sheetName] = roa;
			}
		});
		return result;
	}
		
	function process_wb(wb) {
		loading(true);
		var output = {};
		output = JSON.stringify(to_json(wb), 2, 2);				
		rc.clientes = JSON.parse(output);
		$scope.$apply();
		loading(false);
	}
	
	var xlf = document.getElementById('xlf');
	
	function handleFile(e) {
		
		var files = e.target.files;
		var f = files[0];
		{
			var reader = new FileReader();
			var name = f.name;
			reader.onload = function(e) {
				var data = e.target.result;
				var wb;
				wb = X.read(data, {type: 'binary'});
				process_wb(wb);
			};
			reader.readAsBinaryString(f);
		}
	}
	
	if(xlf.addEventListener) xlf.addEventListener('change', handleFile, false);
	
	
};



