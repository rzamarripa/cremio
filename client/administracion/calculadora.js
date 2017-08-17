angular
.module("creditoMio")
.controller("calculadoraCtrl", calculadoraCtrl);
function calculadoraCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	
	this.tablaAmort = false;
	this.fechaActual = new Date();
	
	this.planPagos = [];
	this.credito = {};
	this.pago = {};

	rc.total = ""
  		
	this.subscribe("tiposCredito", ()=>{
		return [{ estatus : true, sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
	});
	
	this.helpers({
		tiposCredito : () => {
			return TiposCredito.find();
		},
	});
	
	  
  this.generarPlanPagos = function(credito, form){

		if(form.$invalid){
			toastr.error('Error para generar el simulador del plan de pagos, llene todos los campos.');
			return;
		}
		
		//Validar la tasa
		var usuario = Meteor.users.findOne();
		var tasa = Number(rc.credito.tasa);
		if ((tasa < 9 || tasa > 10) && (usuario.roles[0] == "Cajero" || usuario.roles[0] == "Verificador"))
		{
				toastr.warning("La tasa no es valida para este tipo de usuario");
				return;
		}
		
		rc.planPagos = [];
		this.tablaAmort = true;
			
		if(rc.credito.requiereVerificacion == true)
			rc.credito.estatus = 0;
		else
			rc.credito.estatus = 1;
			
		var _credito = {
			cliente								: this.credito.nombre,
			tipoCredito_id 			  : this.credito.tipoCredito_id,
			fechaSolicito 			  : new Date(),
			duracionMeses 			  : this.credito.duracionMeses,
			capitalSolicitado 	  : this.credito.capitalSolicitado,
			adeudoInicial 			  : this.credito.capitalSolicitado,
			saldoActual 				  : this.credito.capitalSolicitado,
			periodoPago 				  : this.credito.periodoPago,
			fechaPrimerAbono 		  : this.credito.fechaPrimerAbono,
			multasPendientes 		  : 0.00,
			saldoMultas 				  : 0.00,
			saldoRecibo 				  : 0.00,
			estatus 						  : 1,
			requiereVerificacion	: this.credito.requiereVerificacion,
			sucursal_id 					: Meteor.user().profile.sucursal_id,
			fechaVerificacion			: this.credito.fechaVerificacion,
			turno									: this.credito.turno,
			tasa									: this.credito.tasa,
			conSeguro 						: this.credito.conSeguro,
			seguro								: this.credito.seguro,
		};

		Meteor.call("generarPlanPagos",_credito,rc.cliente,function(error,result){
		
			if(error){
				console.log(error);
				toastr.error('Error al calcular el nuevo plan de pagos.');
			}
			else{
				
				_.each(result,function (pago) {
					
					var pag = pago
					var pa = _.toArray(pag);
					var all = pa[pa.length - 1]
					rc.total = all

					rc.planPagos.push(pago)
					$scope.$apply();
				});
				
				var total = rc.total;
				_.each(rc.planPagos,function (pago) {
					
					pago.liquidar = total;  						
					total -= Number(parseFloat(pago.importeRegular).toFixed(2));
								
					$scope.$apply();
				});
				
			}
				
		})

		
		return rc.planPagos;
	}
	
		

/*
  this.borrarBotonImprimir= function()
	{
		var printButton = document.getElementById("printpagebutton");
		 printButton.style.visibility = 'hidden';
		 window.print()
		 printButton.style.visibility = 'visible';
		
	};

	this.imprecion = function(print){

		  var printContents = document.getElementById(print).innerHTML;
		  var popupWin = window.open('', '_blank', 'width=300,height=300');
		  popupWin.document.open();
		  popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
		  popupWin.document.close();
		 // setTimeout(function(){popupWin.print();},1000);

  };
*/

  this.imprimirCredito = function(objeto,credito,avales,garantias){


			var pag = objeto
			var pa = _.toArray(pag);
			var all = pa[pa.length - 1]
			//console.log(all,"all")
			rc.total = all

		  Meteor.call('getCreditoReporte', objeto,credito,avales,all, function(error, response) {

	   if(error)
	   {
	    console.log('ERROR :', error);
	    return;
	   }
	   else
	   {
		 				function b64toBlob(b64Data, contentType, sliceSize) {
							  contentType = contentType || '';
							  sliceSize = sliceSize || 512;
							
							  var byteCharacters = atob(b64Data);
							  var byteArrays = [];
							
							  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
							    var slice = byteCharacters.slice(offset, offset + sliceSize);
							
							    var byteNumbers = new Array(slice.length);
							    for (var i = 0; i < slice.length; i++) {
							      byteNumbers[i] = slice.charCodeAt(i);
							    }
							
							    var byteArray = new Uint8Array(byteNumbers);
							
							    byteArrays.push(byteArray);
							  }
							    
							  var blob = new Blob(byteArrays, {type: contentType});
							  return blob;
						}
						
						var blob = b64toBlob(response, "application/docx");
					  var url = window.URL.createObjectURL(blob);
					  
					  //console.log(url);
					  var dlnk = document.getElementById('dwnldLnk');

				    dlnk.download = "ReporteCredito.docx"; 
						dlnk.href = url;
						dlnk.click();		    
					  window.URL.revokeObjectURL(url);


	   }
		});

	};
		
	

};