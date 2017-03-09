Meteor.methods({
		getcartaRecordatorio: function (objeto) {
		
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = meteor_root+"/web.browser/app/plantillas/";
		//var produccion = "/home/isde/archivos/";
				 
		
		
		var content = fs
    							.readFileSync(produccion+"RECORDATORIOS.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
		var fecha = new Date();
		var f = fecha;
		f = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
		
		doc.setData({	nombreCompleto: objeto.cliente.profile.nombreCompleto, 
									calle: 					objeto.cliente.profile.calle,
									numero: 				objeto.cliente.profile.numero,
									colonia: 				objeto.cliente.profile.colonia,
									codigoPostal: 	objeto.cliente.profile.codigoPostal,
									ciudad: 				objeto.cliente.profile.ciudad,
									estado: 				objeto.cliente.profile.estado,
									pais: 					objeto.cliente.profile.pais,
									folio: 					objeto.credito.folio,
									saldoTotal: 		objeto.credito.saldoTotal,
									pagosVencidos: 	objeto.credito.pagosVencidos,
									letra: 					objeto.credito.letra,
									fechaEmision: 	fecha});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"RECORDATORIOSSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"RECORDATORIOSSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },
	
});