
Meteor.methods({
  getcertificacionPatrimonial: function () {
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
		var produccion = "/home/cremio/archivos/";
		
		/*
		var opts = {}
			opts.centered = false;
			opts.getImage=function(tagValue, tagName) {
					var binaryData =  fs.readFileSync(tagValue,'binary');
					return binaryData;
		}
		
		opts.getSize=function(img,tagValue, tagName) {
		    return [80,80];
		}
		
		var imageModule=new ImageModule(opts);
		*/
		
		var content = fs
    							.readFileSync(produccion+"certificacionPatrimonial.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
								//.attachModule(imageModule)
								
		
		var fecha = new Date();
		var f = fecha;
		f = fecha.getDate()+'-'+(fecha.getMonth()+1)+'-'+fecha.getFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
		
		doc.setData({	fecha: new Date(), 
									nombreCompleto: "Nombre de Prueba", 
									direccion: "Domicilio de Prueba", 
									ciudad: "Culiacán Rosales",
									estado: "Sinaloa",
									pais: "México",
									saldo: 5000
								});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"certifiacionPatrimonialSalida.docx",buf);

		
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"certifiacionPatrimonialSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },  
  imprimirDocumentos : (idCredito)=>{
		
		const formatCurrency = require('format-currency');
		
		var creditoAprobado = Creditos.findOne({_id: idCredito});
		
		var letras = NumeroALetras(creditoAprobado.capitalSolicitado);		
		//console.log(letras);

		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = meteor_root+"/web.browser/app/plantillas/";
		//var produccion = "/home/cremio/archivos/";		
		
		
		//Ir por los datos del cliente
		var cliente = Meteor.users.findOne({_id: creditoAprobado.cliente_id});
		//console.log("Cliente:", cliente);
		
		var nacionalidad = Nacionalidades.findOne({_id: cliente.profile.nacionalidad_id});
		var colonia			 = Colonias.findOne({_id: cliente.profile.colonia_id});
		var ciudad			 = Ciudades.findOne({_id: cliente.profile.ciudad_id});
		var estado			 = Estados.findOne({_id: cliente.profile.estado_id});
		
		//Ir por los datos del Avales
		
		var aval = Personas.findOne({_id: creditoAprobado.avales_ids[0]});
		
		//Ir por lo datos de la tabla de amortización

		var pp = PlanPagos.find({credito_id: creditoAprobado._id}).fetch();
		
		var Monto = creditoAprobado.adeudoInicial;
		var importe = 0;
		_.each(pp,function (planPago) {
				
				planPago.monto = formatCurrency(Monto);
				planPago.fecha = planPago.fechaLimite.getDate() +"-"+ (planPago.fechaLimite.getMonth()+1) +"-"+ planPago.fechaLimite.getFullYear();
				planPago.importe = formatCurrency(planPago.capital + planPago.interes + planPago.seguro + planPago.iva);
				
				Monto -= planPago.importe;
				
		});
		
		
		var content = fs
    							.readFileSync(produccion+"documentos.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
								
		
		var fecha = new Date();
		var f = fecha;
		f = fecha.getDate()+'-'+(fecha.getMonth()+1)+'-'+fecha.getFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
		
		//console.log(aval);
		if (aval == undefined)
		{
				aval = {};
				aval.nombreCompleto = "";
				aval.direccion = "";	
		}
		
		doc.setData({	nombreCliente					: cliente.profile.nombreCompleto.toUpperCase(), 
									calleCliente					: cliente.profile.calle.toUpperCase(),
									numeroCliente					: cliente.profile.numero,
									telefonoCliente				: cliente.profile.telefono,
									correoCliente					: cliente.profile.correo,
									codigoPostalCliente		: cliente.profile.codigoPostal,
									coloniaCliente				: colonia.nombre,
									ciudadCliente					: ciudad.nombre,
									estadoCliente					: estado.nombre,
									nacionalidadCliente		: nacionalidad.nombre, 
									nombreAval						: aval.nombreCompleto.toUpperCase(),
									direccionAval					: aval.direccion.toUpperCase(),
									
										
									cantidad							:	creditoAprobado.capitalSolicitado,
									letra									:	letras,
									periodoPago						: creditoAprobado.periodoPago,
									total									: formatCurrency(creditoAprobado.adeudoInicial),
													
									pp
								});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"documentosSalida.docx",buf);

		
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"documentosSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');

		
			
			
			
	},	
  
});

function Unidades(num){

    switch(num)
    {
        case 1: return "UN";
        case 2: return "DOS";
        case 3: return "TRES";
        case 4: return "CUATRO";
        case 5: return "CINCO";
        case 6: return "SEIS";
        case 7: return "SIETE";
        case 8: return "OCHO";
        case 9: return "NUEVE";
    }

    return "";
}//Unidades()

function Decenas(num){

    decena = Math.floor(num/10);
    unidad = num - (decena * 10);

    switch(decena)
    {
        case 1:
            switch(unidad)
            {
                case 0: return "DIEZ";
                case 1: return "ONCE";
                case 2: return "DOCE";
                case 3: return "TRECE";
                case 4: return "CATORCE";
                case 5: return "QUINCE";
                default: return "DIECI" + Unidades(unidad);
            }
        case 2:
            switch(unidad)
            {
                case 0: return "VEINTE";
                default: return "VEINTI" + Unidades(unidad);
            }
        case 3: return DecenasY("TREINTA", unidad);
        case 4: return DecenasY("CUARENTA", unidad);
        case 5: return DecenasY("CINCUENTA", unidad);
        case 6: return DecenasY("SESENTA", unidad);
        case 7: return DecenasY("SETENTA", unidad);
        case 8: return DecenasY("OCHENTA", unidad);
        case 9: return DecenasY("NOVENTA", unidad);
        case 0: return Unidades(unidad);
    }
}//Unidades()

function DecenasY(strSin, numUnidades) {
    if (numUnidades > 0)
    return strSin + " Y " + Unidades(numUnidades)

    return strSin;
}//DecenasY()

function Centenas(num) {
    centenas = Math.floor(num / 100);
    decenas = num - (centenas * 100);

    switch(centenas)
    {
        case 1:
            if (decenas > 0)
                return "CIENTO " + Decenas(decenas);
            return "CIEN";
        case 2: return "DOSCIENTOS " + Decenas(decenas);
        case 3: return "TRESCIENTOS " + Decenas(decenas);
        case 4: return "CUATROCIENTOS " + Decenas(decenas);
        case 5: return "QUINIENTOS " + Decenas(decenas);
        case 6: return "SEISCIENTOS " + Decenas(decenas);
        case 7: return "SETECIENTOS " + Decenas(decenas);
        case 8: return "OCHOCIENTOS " + Decenas(decenas);
        case 9: return "NOVECIENTOS " + Decenas(decenas);
    }

    return Decenas(decenas);
}//Centenas()

function Seccion(num, divisor, strSingular, strPlural) {
    cientos = Math.floor(num / divisor)
    resto = num - (cientos * divisor)

    letras = "";

    if (cientos > 0)
        if (cientos > 1)
            letras = Centenas(cientos) + " " + strPlural;
        else
            letras = strSingular;

    if (resto > 0)
        letras += "";

    return letras;
}//Seccion()

function Miles(num) {
    divisor = 1000;
    cientos = Math.floor(num / divisor)
    resto = num - (cientos * divisor)

    strMiles = Seccion(num, divisor, "UN MIL", "MIL");
    strCentenas = Centenas(resto);

    if(strMiles == "")
        return strCentenas;

    return strMiles + " " + strCentenas;
}//Miles()

function Millones(num) {
    divisor = 1000000;
    cientos = Math.floor(num / divisor)
    resto = num - (cientos * divisor)

    strMillones = Seccion(num, divisor, "UN MILLON DE", "MILLONES DE");
    strMiles = Miles(resto);

    if(strMillones == "")
        return strMiles;

    return strMillones + " " + strMiles;
}//Millones()

function NumeroALetras(num) {
    var data = {
        numero: num,
        enteros: Math.floor(num),
        centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
        letrasCentavos: "",
        letrasMonedaPlural: 'PESOS',//"PESOS", 'Dólares', 'Bolívares', 'etcs'
        letrasMonedaSingular: 'PESOS', //"PESO", 'Dólar', 'Bolivar', 'etc'

        letrasMonedaCentavoPlural: "CENTAVOS",
        letrasMonedaCentavoSingular: "CENTAVO"
    };

    if (data.centavos > 0) {
        data.letrasCentavos = "CON " + (function (){
            if (data.centavos == 1)
                return Millones(data.centavos) + " " + data.letrasMonedaCentavoSingular;
            else
                return Millones(data.centavos) + " " + data.letrasMonedaCentavoPlural;
            })();
    };

    if(data.enteros == 0)
        return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;
    if (data.enteros == 1)
        return Millones(data.enteros) + " " + data.letrasMonedaSingular + " " + data.letrasCentavos;
    else
        return Millones(data.enteros) + " " + data.letrasMonedaPlural + " " + data.letrasCentavos;
}

