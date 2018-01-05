angular
.module("creditoMio")
.controller("TicketTraspasoCtrl", TicketTraspasoCtrl);
function TicketTraspasoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	rc.traspaso = {};
	rc.caja = {};	
	rc.cliente = {};
	rc.credito = {};
	rc.sucursal = {};
	rc.cajero = {};
	rc.tipoIngreso = {};
	
	window.rc = rc;
	

	this.subscribe('traspasos',()=>{
		console.log($stateParams.pago_id)
		return [{
			_id : $stateParams.pago_id
		}]
	},
	{
		onReady: function () {
			
			
			rc.traspaso = Traspasos.findOne($stateParams.pago_id);
			
			if (rc.traspaso.tipo == "CuentaCaja")
			{
					rc.traspaso.tipoTraspaso = "TRANSFERENCIA DE FONDO A VENTANILLA";
					Meteor.call('getUsuario', rc.traspaso.elaboro_id ,function(err, res){
						rc.traspaso.elaboro = res.nombreCompleto;
					});
					Meteor.call('getUsuario', rc.traspaso.recibio_id ,function(err, res){
						rc.traspaso.recibio = res.nombreCompleto;
					});
					
					rc.subscribe('cuenta',()=>{
						return[{
							_id : rc.traspaso.origen_id ? rc.traspaso.origen_id : ""
						}]
					},
					{
						onReady: function () {
							var cuenta = Cuentas.findOne(rc.traspaso.origen_id);
							rc.traspaso.origen = cuenta.nombre ? cuenta.nombre : "";
						}
					});
					
					rc.subscribe('cajas',()=>{
						return[{
							_id : rc.traspaso.destino_id ? rc.traspaso.destino_id : ""
						}]
					},
					{
						onReady: function () {
							var caja = Cajas.findOne(rc.traspaso.destino_id);
							rc.traspaso.destino = caja.nombre ? caja.nombre : "";
						}
					});
			}
			else if (rc.traspaso.tipo == "CajaCuenta")
			{
					rc.traspaso.tipoTraspaso = "TRANSFERENCIA DE VENTANILLA A FONDO";
					
					Meteor.call('getUsuario', rc.traspaso.elaboro_id ,function(err, res){
						rc.traspaso.elaboro = res.nombreCompleto;
					});
					Meteor.call('getUsuario', rc.traspaso.recibio_id ,function(err, res){
						rc.traspaso.recibio = res.nombreCompleto;
					});
					
					rc.subscribe('cajas',()=>{
						return[{
							_id : rc.traspaso.origen_id ? rc.traspaso.origen_id : ""
						}]
					},
					{
						onReady: function () {
							var caja = Cajas.findOne(rc.traspaso.origen_id);
							rc.traspaso.origen = caja.nombre ? caja.nombre : "";
						}
					});
					
					rc.subscribe('cuenta',()=>{
						return[{
							_id : rc.traspaso.destino_id ? rc.traspaso.destino_id : ""
						}]
					},
					{
						onReady: function () {
							var cuenta = Cuentas.findOne(rc.traspaso.destino_id);
							rc.traspaso.destino = cuenta.nombre ? cuenta.nombre : "";
						}
					});
					
				
			}
			else if (rc.traspaso.tipo == "CajaCaja")
			{
					rc.traspaso.tipoTraspaso = "TRANSFERENCIA DE VENTANILLA A VENTANILLA";
					
					Meteor.call('getUsuario', rc.traspaso.createdBy ,function(err, res){
						rc.traspaso.elaboro = res.nombreCompleto;
					});
/*
					Meteor.call('getUsuario', rc.traspaso.recibio_id ,function(err, res){
						rc.traspaso.recibio = res.nombreCompleto;
					});
*/
					
					rc.subscribe('cajas',()=>{
						return[{
							_id : rc.traspaso.origen_id ? rc.traspaso.origen_id : ""
						}]
					},
					{
						onReady: function () {
							var caja = Cajas.findOne(rc.traspaso.origen_id);
							rc.traspaso.origen = caja.nombre ? caja.nombre : "";
						}
					});
					
					
					rc.subscribe('cajas',()=>{
						return[{
							_id : rc.traspaso.destino_id ? rc.traspaso.destino_id : ""
						}]
					},
					{
						onReady: function () {
							var caja = Cajas.findOne(rc.traspaso.destino_id);
							rc.traspaso.destino = caja.nombre ? caja.nombre : "";
						}
					});
					
					
					
					
			}
			
			
			
			
			//console.log(rc.pago.totalPago);
			
			function Unidades(num){

		        switch(num)
		        {
		            case 1: return 'UN';
		            case 2: return 'DOS';
		            case 3: return 'TRES';
		            case 4: return 'CUATRO';
		            case 5: return 'CINCO';
		            case 6: return 'SEIS';
		            case 7: return 'SIETE';
		            case 8: return 'OCHO';
		            case 9: return 'NUEVE';
		        }
		
		        return '';
		    
    }//Unidades()
			function Decenas(num){
			
			        let decena = Math.floor(num/10);
			        let unidad = num - (decena * 10);
			
			        switch(decena)
			        {
			            case 1:
			                switch(unidad)
			                {
			                    case 0: return 'DIEZ';
			                    case 1: return 'ONCE';
			                    case 2: return 'DOCE';
			                    case 3: return 'TRECE';
			                    case 4: return 'CATORCE';
			                    case 5: return 'QUINCE';
			                    default: return 'DIECI' + Unidades(unidad);
			                }
			            case 2:
			                switch(unidad)
			                {
			                    case 0: return 'VEINTE';
			                    default: return 'VEINTI' + Unidades(unidad);
			                }
			            case 3: return DecenasY('TREINTA', unidad);
			            case 4: return DecenasY('CUARENTA', unidad);
			            case 5: return DecenasY('CINCUENTA', unidad);
			            case 6: return DecenasY('SESENTA', unidad);
			            case 7: return DecenasY('SETENTA', unidad);
			            case 8: return DecenasY('OCHENTA', unidad);
			            case 9: return DecenasY('NOVENTA', unidad);
			            case 0: return Unidades(unidad);
			        }
			    }//Unidades()
		  function DecenasY(strSin, numUnidades) {
		      if (numUnidades > 0)
		          return strSin + ' Y ' + Unidades(numUnidades)
		
		      return strSin;
		  }//DecenasY()
		  function Centenas(num) {
			        let centenas = Math.floor(num / 100);
			        let decenas = num - (centenas * 100);
			
			        switch(centenas)
			        {
			            case 1:
			                if (decenas > 0)
			                    return 'CIENTO ' + Decenas(decenas);
			                return 'CIEN';
			            case 2: return 'DOSCIENTOS ' + Decenas(decenas);
			            case 3: return 'TRESCIENTOS ' + Decenas(decenas);
			            case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
			            case 5: return 'QUINIENTOS ' + Decenas(decenas);
			            case 6: return 'SEISCIENTOS ' + Decenas(decenas);
			            case 7: return 'SETECIENTOS ' + Decenas(decenas);
			            case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
			            case 9: return 'NOVECIENTOS ' + Decenas(decenas);
			        }
			
			        return Decenas(decenas);
			    }//Centenas()
		  function Seccion(num, divisor, strSingular, strPlural) {
		      let cientos = Math.floor(num / divisor)
		      let resto = num - (cientos * divisor)
		
		      let letras = '';
		
		      if (cientos > 0)
		          if (cientos > 1)
		              letras = Centenas(cientos) + ' ' + strPlural;
		          else
		              letras = strSingular;
		
		      if (resto > 0)
		          letras += '';
		
		      return letras;
		  }//Seccion()
		  function Miles(num) {
		      let divisor = 1000;
		      let cientos = Math.floor(num / divisor)
		      let resto = num - (cientos * divisor)
		
		      let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
		      let strCentenas = Centenas(resto);
		
		      if(strMiles == '')
		          return strCentenas;
		
		      return strMiles + ' ' + strCentenas;
		  }//Miles()
		  function Millones(num) {
		      let divisor = 1000000;
		      let cientos = Math.floor(num / divisor)
		      let resto = num - (cientos * divisor)
		
		      let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
		      let strMiles = Miles(resto);
		
		      if(strMillones == '')
		          return strMiles;
		
		      return strMillones + ' ' + strMiles;
		  }//Millones()
			function NumeroALetras(num, currency) {
		      currency = currency || {};
		      let data = {
		          numero: num,
		          enteros: Math.floor(num),
		          centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
		          letrasCentavos: '',
		          letrasMonedaPlural: currency.plural || '',//'PESOS', 'Dólares', 'Bolívares', 'etcs'
		          letrasMonedaSingular: currency.singular || '', //'PESO', 'Dólar', 'Bolivar', 'etc'
		          letrasMonedaCentavoPlural: currency.centPlural || '',
		          letrasMonedaCentavoSingular: currency.centSingular || ''
		
		      };
		
		      if (data.centavos > 0) {
		          data.letrasCentavos = 'CON ' + (function () {
		                  if (data.centavos == 1)
		                      return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular;
		                  else
		                      return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural;
		              })();
		      };
		
		      if(data.enteros == 0)
		          return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
		      if (data.enteros == 1)
		          return Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
		      else
		          return Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
		  };	
			
			
			var valores = (rc.traspaso.importe).toString().split('.');
						
			rc.traspaso.centavos = valores[1];
			console.log(rc.traspaso.centavos)
			if (rc.traspaso.centavos == undefined)
					rc.traspaso.centavos = "00";
			
			console.log(rc.traspaso.centavos)
			rc.traspaso.letra = NumeroALetras(valores[0]);
		
		
			rc.subscribe('sucursales',()=>{
				return[{
					_id: rc.traspaso.sucursal_id? rc.traspaso.sucursal_id:""
				}]
			},
			{
				onReady:()=>{
					rc.sucursal = Sucursales.findOne(rc.traspaso.sucursal_id);
					rc.sucursal = rc.sucursal? rc.sucursal:{};
				}
			});
		}
	});

	this.borrarBotonImprimir= function()
	{
		var printButton = document.getElementById("printpagebutton");
	 	printButton.style.visibility = 'hidden';
	 	window.print()
	 	printButton.style.visibility = 'visible';
	};
	
	

	
	
};