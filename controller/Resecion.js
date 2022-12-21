const {response} = require('express')
const { pool } = require('../database/connection')
const fetch  = require('node-fetch')

const  GetRooms =async(req, res=response) =>{

    const {id} = req.params   
    
    try {

        const  query = await  pool.query("SELECT ID as id, ID_Tipo_habitaciones, ID_Tipo_estados, Numero as title FROM Habitaciones WHERE ID_Hotel = ?", [id])

       
        
       /* id: 116,
    ID_Tipo_habitaciones: 1,
    ID_Tipo_estados: 1,
    title: '71'
*/
        res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {

        res.status(401).json({
            ok:false,
            msg:"comuniquese con el administrador"
        })
    }
}

const validateAvaible =async(req,res=response) => {

    const  {desde,hasta,habitaciones,disponibilidad,id_estados_habitaciones,ID_Canal,Adultos,Ninos,ID_Talla_mascota,Infantes,Noches,Observacion,huespe,valor,ID_Tipo_Forma_pago,abono,valor_habitacion,Tipo_persona} = req.body

    const date1 = new Date(desde)
    const date2 = new  Date(hasta)
 
    try {

        if(date1 >date2){
            return  res.status(201).json({
                msg:"no puede ser mayor de la fecha",
                ok:false,
            })
        }
        //reservas
        let desdeSinHora = desde.split(' ', 1);
        let hastaSinHora = hasta.split(' ', 1);

        //const reservation = await pool.query("SELECT Reservas.ID_Habitaciones,  Reservas.ID, Reservas.Codigo_reserva FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones =? AND Reservas.Fecha_inicio BETWEEN ? AND ? OR Reservas.Fecha_final BETWEEN ? AND ?",[habitaciones, desde, hasta, desde, hasta])
        const reservation = await pool.query("SELECT * FROM Lista_Fechas_Reservada INNER JOIN Habitaciones ON Lista_Fechas_Reservada.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = ? AND Lista_Fechas_Reservada.Date > ? AND  Lista_Fechas_Reservada.Date <= ? GROUP BY Lista_Fechas_Reservada.ID_Habitaciones",[habitaciones, desdeSinHora, hastaSinHora])
        
        //disponibilidad
        const avaible =  await pool.query("SELECT ID  FROM Habitaciones WHERE ID_Tipo_habitaciones = ? ",[habitaciones]) 

        let result1 = avaible.map(index => {
            return index.ID
        })

        if(avaible.length > reservation.length ){

            /*const ray = []

            for(let i =0;i<avaible.length;i++){
                for(let e =0;e<avaible.length;e++){
                    if( avaible[i]?.ID  != reservation[i]?.ID_Habitaciones){
                        ray.push(avaible[i].ID)
                    }else{
                    
                    }
                }
            }

            var unique = ray.filter((x, i) => ray.indexOf(x) === i);
            console.log(unique);

            let id_disponible = Math.min(...ray);
            */

            var n1 = 2000;
            var n2 = 1000;
            var numero = Math.floor(Math.random()*(n1 -(n2 -1))) + n2
            
            let id_disponible = disponibilidad

            if (reservation.length == 0 ) {
                id_disponible = id_disponible
            }

            const data ={
                    ID_Usuarios:1,
                    ID_Habitaciones: parseInt(id_disponible.toString()),
                    ID_Talla_mascota:ID_Talla_mascota,
                    Codigo_reserva:numero,
                    Adultos:Adultos,
                    Ninos:Ninos,
                    Infantes:Infantes,
                    Fecha_inicio: desde,  
                    Fecha_final: hasta,
                    Noches:Noches,
                    Descuento:0,
                    ID_Canal:ID_Canal,
                    ID_Tipo_Estados_Habitaciones:id_estados_habitaciones,
                    Observacion:Observacion,
                 
                }
            
            var prueba=  desde.split(" ",1).toString()
            var pruebaone=  hasta.split(" ",1).toString()
            
            var fechaInicio = new Date(prueba)
            var fechaFin = new Date(pruebaone) 

            const dateOne  = {
                ID_Habitaciones: parseInt(id_disponible.toString()),
                Date:prueba,
                Proceso: 0
            }

            await pool.query('INSERT INTO Lista_Fechas_Reservada set ?', dateOne)

            fechaInicio.setDate(fechaInicio.getDate() + 1)
                        
            while(fechaFin.getTime() > fechaInicio.getTime()){
                let fecha;
                
                fechaInicio.setDate(fechaInicio.getDate() + 1);
                
                    fecha  = {
                        ID_Habitaciones: parseInt(id_disponible.toString()),
                        Date:fechaInicio.getFullYear() + '/' + (fechaInicio.getMonth() + 1) + '/' + fechaInicio.getDate(),
                        Proceso: 1
                    }
              
                await pool.query('INSERT INTO Lista_Fechas_Reservada set ?', fecha)

            }

            const dateTwo  = {
                ID_Habitaciones: parseInt(id_disponible.toString()),
                Date:pruebaone,
                Proceso: -0
            }

            await pool.query('INSERT INTO Lista_Fechas_Reservada set ?', dateTwo)
        

            const newReservation = {
                ID_Tipo_estados:2
            }

            await  pool.query("UPDATE Habitaciones set ? WHERE ID = ?",[newReservation,data.ID_Habitaciones])

            const  to = await pool.query('INSERT INTO Reservas set ?', data)
    
            const query1 = await  pool.query("SELECT MAX(ID) as max FROM Reservas")

            const result = query1.map(index=>{
                return index.max
            })  

           for(let i =0;i<huespe?.length;i++){
             
               const date ={
                ID_Reserva:parseInt(result.toString()),
                ID_Tipo_documento:huespe[i]?.Tipo_documento,   
                Num_documento:huespe[i]?.Num_documento,   
                Nombre:huespe[i]?.Nombre,
                Apellido:huespe[i]?.Apellido,
                Fecha_nacimiento:huespe[i]?.Fecha_nacimiento,
                Celular:huespe[i]?.Celular,
                Correo:huespe[i]?.Correo,
                Ciudad:huespe[i]?.Ciudad,
                ID_Prefijo:huespe[i]?.Nacionalidad,
                Tipo_persona
            }

            const huep ={
                ID_Reserva:parseInt(result.toString()),
                ID_Tipo_genero:1,
                Num_documento:huespe[i]?.Num_documento,   
                Nombre:huespe[i]?.Nombre,
                Apellido:huespe[i]?.Apellido,
                Fecha_nacimiento:huespe[i]?.Fecha_nacimiento,
                Celular:huespe[i]?.Celular,
                Correo:huespe[i]?.Correo,
                Ciudad:huespe[i]?.Ciudad,
                ID_Prefijo:huespe[i]?.Nacionalidad,
            }
    
            const toone = pool.query('INSERT INTO  web_checking set ?',date) 

            const totwo = pool.query('INSERT INTO  Huespedes  set ?',huep) 

           }

            //https://codesandbox.io/s/add-remove-dynamic-input-fields-ho226?file=/src/App.js:1830-2096
           
            const pay ={
                ID_Reserva:parseInt(result.toString()),
                ID_Motivo:1,
                ID_Tipo_Forma_pago,
                Valor:valor,
                Abono:abono,
                Valor_habitacion:valor_habitacion
            }
            
            const tothre = pool.query('INSERT INTO  Pagos  set ?',pay) 
            
            return res.status(201).json({
                msg:"aceptado",
                ok:true
            })

        }else{
            return res.status(401).json({
                ok:false
            })
        }

    } catch (error) {
        console.log(error);
        res.status(401).json({
            ok:false,
            msg:"comuniquese con el administrador "
        })
    } 
}

const insertReservaRecepcion =async(req,res=response) => {
    
    try {

        return res.status(201).json({
            ok:true
        })
    
    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}

const getTypePet =async(req,res=response) =>{

    try {

        const query = await pool.query("SELECT ID, Talla as nombre FROM Talla_mascota")

        res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {
        res.status(201).json({
            ok:false
        })
    }
}

const getReserva =async(req,res=response) =>{

    try {

        const response =  await pool.query("SELECT  Reservas.ID_Tipo_Estados_Habitaciones ,Habitaciones.Numero, Reservas.ID, Reservas.ID_Habitaciones, Reservas.Codigo_reserva, Reservas.Fecha_inicio, Reservas.Fecha_final, Habitaciones.ID_Tipo_estados FROM Reservas INNER JOIN Habitaciones ON Habitaciones.ID = Reservas.ID_Habitaciones WHERE Habitaciones.ID_Hotel = 4")

        const query = []

       for(let i = 0;i<response.length; i++){
        const web_checking =  await pool.query("SELECT ID, ID_Reserva, ID_Tipo_documento, Num_documento, Nombre, Apellido, Fecha_nacimiento, Celular, Correo, Ciudad, Foto_documento_adelante, Foto_documento_atras,Pasaporte,Firma FROM web_checking WHERE ID_Reserva =?",[response[i].ID])
        
        
        
        web_checking.forEach(element => {
           query.push({
                Title: `${response[i].Numero} ${element.Nombre} ${element.Apellido}` ,
                ID:response[i].ID,
                ID_Habitaciones:response[i].ID_Habitaciones,
                Codigo_reserva:response[i].Codigo_reserva,
                Fecha_inicio:response[i].Fecha_inicio,
                Fecha_final:response[i].Fecha_final,
                ID_Tipo_estados:response[i].ID_Tipo_Estados_Habitaciones,
                Nombre:element.Nombre,
                Document:element.Num_documento
            })
        })
       }


        return  res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {
        res.status(201).json({
            ok:false
        })
    }
}

const PruebaGet =(req,res=response) =>{

    try {
        const prueba  = query.pool ("SELECT ID, Codigo_reserva FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = 2 AND Habitaciones.ID_Tipo_estados == 1 AND Reservas.Fecha_inicio >= 2022-10-9 AND Reservas.Fecha_final <= 2022-10-16")
        
        return res.status(201).json({
            ok:true
        })

    } catch (error) {
        res.status(201).json({
            ok:false
        })
    }
}

const GetCanales =async(req,res=response) =>{

    try {

        const query = await  pool.query("SELECT * FROM Canales")
        
        res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {
        
        res.status(201).json({
            ok:false
        })
    }

}

/*const avaibleRecection =async(req,res=response) =>{

    
    
    const  {desde,hasta,habitaciones} = req.body

    const date1 = new Date(desde)
    const date2 = new  Date(hasta)

    var prueba=  desde.split(" ",1).toString()
    var pruebaone=  hasta.split(" ",1).toString()
    
    var fechaInicio = new Date(prueba)
    var fechaFin = new Date(pruebaone)
    
    const fecha_final = []
                
    while(fechaFin.getTime() >= fechaInicio.getTime()){
        fechaInicio.setDate(fechaInicio.getDate() + 1);
           fecha_final.push(fechaInicio.getFullYear() + '/' + (fechaInicio.getMonth() + 1) + '/' + fechaInicio.getDate())

    }

    

    try {

        if(date1 >date2){
            return  res.status(201).json({
                msg:"no puede ser mayor de la fecha",
                ok:false,
            })
        }
        //reservas
        let desdeSinHora = desde.split(' ', 1);
        let hastaSinHora = hasta.split(' ', 1);


       const reservation = await pool.query("SELECT ID_Habitaciones FROM Lista_Fechas_Reservada INNER JOIN Habitaciones ON Lista_Fechas_Reservada.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = ? AND Lista_Fechas_Reservada.Date >= ?  AND  Lista_Fechas_Reservada.Date <= ? AND Proceso = 1  GROUP BY Lista_Fechas_Reservada.ID_Habitaciones",[habitaciones, desdeSinHora, hastaSinHora])
       const reservatioone = await pool.query("SELECT ID_Habitaciones FROM Reservas WHERE Reservas.Fecha_inicio >= ? AND Reservas.Fecha_final <= ?",[desde, hasta])
       
       //const totalValue = fecha_final?.length==2 ? reservatioone :reservation

        //disponibilidad
        const avaible =  await pool.query("SELECT ID  FROM Habitaciones WHERE ID_Tipo_habitaciones = ? ",[habitaciones]) 

        const avaibleList =[]
        
        let listHabitacionesOcupadas = new Array();
        if ( reservation.length > 0 || reservatioone.length > 0 ) {
             
            reservation.forEach( dato => {
                listHabitacionesOcupadas.push(dato);
            });

            reservatioone.forEach(dato => {
                if ( listHabitacionesOcupadas.indexOf(dato) == -1) {
                    listHabitacionesOcupadas.push(dato);
                }
            });
            
        } 

        if(avaible.length > reservation.length ){

            const ray = []

            for(let i =0;i<avaible.length;i++){
                for(let e =0;e<avaible.length;e++){
                    if( avaible[i]?.ID  != listHabitacionesOcupadas[i]?.ID_Habitaciones){
                        ray.push(avaible[i].ID)
                    }else{
                    
                    }
                }
            }

            ray.filter((x, i) =>{
                if(ray.indexOf(x) === i){
                    avaibleList.push(x)
                }
            });
            
        }

 
        const queryDefinid = []
        
        for(let i = 0;i<avaibleList.length;i++){
          const totalHabiatacion =  await pool.query("SELECT * FROM `Habitaciones` WHERE ID = ?",[avaibleList[i]])

          totalHabiatacion.forEach(element =>{
                queryDefinid.push({
                    ID:element.ID,
                    ID_Hotel:element.ID_Hotel,
                    ID_Tipo_habitaciones:element.ID_Tipo_habitaciones,
                    ID_Tipo_estados:element.ID_Tipo_estados,
                    Numero:element.Numero
                })
          })

        }
    


        if(avaibleList.length ==0){
          return  res.status(401).json({
                ok:false,
                msg:"no se encontro nada"
            })
        }

         res.status(201).json({
                ok:true,
                queryDefinid
            })
        
    } catch (error) {
        console.log(error)

        res.status(401).json({
            ok:false
        })
    }
}

*/
const roomAvaible =async(req,res= Response) => {

    const  {desde,hasta,habitaciones} = req.body
    const date1 = new Date(desde)
    const date2 = new  Date(hasta)

    try {

        if(date1 >date2){
            return  res.status(201).json({
                msg:"no puede ser mayor de la fecha",
                ok:false,
            })
        }
        //reservas
        let desdeSinHora = desde.split(' ', 1);
        let hastaSinHora = hasta.split(' ', 1);


       const reservation = await pool.query("SELECT ID_Habitaciones FROM Lista_Fechas_Reservada INNER JOIN Habitaciones ON Lista_Fechas_Reservada.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = ? AND Lista_Fechas_Reservada.Date >= ?  AND  Lista_Fechas_Reservada.Date <= ? AND Proceso = 1  GROUP BY Lista_Fechas_Reservada.ID_Habitaciones",[habitaciones, desdeSinHora, hastaSinHora])
       const reservatioone = await pool.query("SELECT ID_Habitaciones FROM Reservas WHERE Reservas.Fecha_inicio >= ? AND Reservas.Fecha_final <= ?",[desde, hasta])
       
       //const totalValue = fecha_final?.length==2 ? reservatioone :reservation

        //disponibilidad
        const avaible =  await pool.query("SELECT ID,Numero  FROM Habitaciones WHERE ID_Tipo_habitaciones = ? ",[habitaciones]) 

        const queryDefinid =[]

        const queryDefiniOne =[]
        
        let listHabitacionesOcupadas = new Array();
        if ( reservation.length > 0 || reservatioone.length > 0 ) {
             
            reservation.forEach( dato => {
                listHabitacionesOcupadas.push(dato);
            });

            reservatioone.forEach(dato => {
                if ( listHabitacionesOcupadas.indexOf(dato) == -1) {
                    listHabitacionesOcupadas.push(dato);
                }
            });
            
        }  

        

        if(avaible.length > reservation.length ){

            for(let i =0;i<avaible.length;i++){
                let acum  = new Array()
                for(let e =0;e<avaible.length;e++){
                    if( avaible[i]?.ID  != listHabitacionesOcupadas[i]?.ID_Habitaciones){
                        acum.push(avaible[i])
                    }
                }

                acum.filter((x, i) =>{
                if(acum.indexOf(x) === i){
                    queryDefinid.push(x)
                }
            });  
            
           
            }

           for(let i =0;i<avaible.length;i++){
                let asum  = new Array()
                for(let e =0;e<avaible.length;e++){
                    if( listHabitacionesOcupadas[i]?.ID  != listHabitacionesOcupadas[i]?.ID_Habitaciones){
                        asum.push(avaible[i])
                    }
                }

                asum.filter((x, i) =>{
                if(asum.indexOf(x) === i){
                    queryDefiniOne.push(x)
                }
            });  
            
           
            }

        }

  /*for( var i=queryDefinid.length - 1; i>=0; i--){
            for( var j=0; j<queryDefiniOne.length; j++){
                if(queryDefinid[i] && (queryDefinid[i].ID === queryDefiniOne[j].ID)){
                    queryDefinid.splice(i, 1);
                }
            }
        }

      
    */   

   
        res.status(201).json({
            ok:true,
            queryDefinid
        })

    } catch (e) {
        res.status(201).json({
            ok:false
        })
    }

}

const getDetailReservation =async(req, res=response) =>{

    const {id} = req.params
    
    try {   

        const query = await pool.query("SELECT Reservas.Observacion , Canales.Nombre as Canales_Nombre, web_checking.Tipo_persona as tipo_persona, web_checking.ID as id_persona, Reservas.ID_Habitaciones, Habitaciones.ID_Tipo_habitaciones, Habitaciones.Numero, Talla_mascota.Talla, Reservas.Codigo_reserva, Reservas.Adultos, Reservas.Ninos, Reservas.Infantes, Reservas.Fecha_inicio, Reservas.Fecha_final, Reservas.Noches, Reservas.Descuento, Reservas.Placa, web_checking.ID_Tipo_documento, web_checking.Num_documento, web_checking.Nombre, web_checking.Apellido, web_checking.Fecha_nacimiento, web_checking.Celular, web_checking.Correo, web_checking.Ciudad, Tipo_Forma_pago.Nombre as forma_pago, Pagos.Valor as valor_pago, Pagos.Valor_habitacion as valor_habitacion , Pagos.Abono as valor_abono, Prefijo_number.nombre as nacionalidad  FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Talla_mascota ON Reservas.ID_Talla_mascota = Talla_mascota.ID INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.ID INNER JOIN Canales ON Canales.id= Reservas.ID_Canal INNER JOIN Pagos on Reservas.ID = Pagos.ID_Reserva INNER  join Tipo_Forma_pago on Pagos.ID_Tipo_Forma_pago = Tipo_Forma_pago.ID INNER  JOIN  Prefijo_number on web_checking.ID_Prefijo = Prefijo_number.ID  WHERE Reservas.ID   =?",[id])
        
        if(query.length ==0){
            return  res.status(201).json({
                ok:false,
                msg:"no se encontro ninguna informacion"
            })
        }

        return res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {
        return res.status(401).json({
            ok:false,
            msg:"comunicase con el administrador"
        })
    }
}

const postCleanlineRooms =(req, res=response) =>{

    
}

const getCountry = async(req, res=response) =>{

    const query = await pool.query("SELECT * FROM  Prefijo_number")

    res.status(201).json({
        ok:true,
        query
    })
}


const updateDetailReservation =async(req, res=response) =>{

    const { id } = req.params;

    const data = req.body;
    console.log(data)
    try {

        await pool.query("UPDATE web_checking set ? WHERE ID_Reserva = ?", [data, id]);
       res.status(201).json({
            ok:true
       })
        
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }

}

const updateDetailPagos =async(req, res=response) =>{

    const { id } = req.params;

    const data = req.body

    try {

        await pool.query("UPDATE Pagos set ? WHERE ID_Reserva = ?", [data, id]);

       res.status(201).json({
            ok:true
       })
        
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }

}

const getdetailhuespedes =async(req, res=response) =>{

    const { id } = req.params;

    try {
        const link = await pool.query("SELECT web_checking.id as id_persona, web_checking.Nombre as nombre , web_checking.Apellido, web_checking.ID_Tipo_documento ,web_checking.Num_documento, web_checking.Fecha_nacimiento, web_checking.Correo ,web_checking.Celular, Prefijo_number.nombre as nacionalidad FROM `web_checking` INNER join Prefijo_number on web_checking.ID_Prefijo = Prefijo_number.ID WHERE web_checking.ID  =?", [id]);

       res.status(201).json({
            ok:true,
            link
       })
        
    } catch (error) {
        res.status(401).json({
            ok:false,
            msg:"comuniquese"
        })
    }

}


const postdetailUpdate =async(req, res=response) =>{

    const { id } = req.params;
    const data = req.body

    console.log(data)

    try {
        await pool.query("UPDATE web_checking set ? WHERE ID = ?", [data, id]);
        res.status(201).json({
            ok:true
       })
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }
}

module.exports ={GetRooms,
                validateAvaible,
                insertReservaRecepcion,
                getTypePet
                ,getReserva,
                PruebaGet,
                GetCanales,
                roomAvaible,
                getDetailReservation,
                postCleanlineRooms,        
                getCountry,
                updateDetailReservation,
                updateDetailPagos,
                getdetailhuespedes,
                postdetailUpdate
            }