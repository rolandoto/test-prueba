const {response} = require('express')
const { pool } = require('../database/connection')
const fetch  = require('node-fetch')

const  GetRooms =async(req, res=response) =>{

    const {id} = req.params   
    
    try {

        const  query = await  pool.query("SELECT ID as id, ID_Tipo_habitaciones, ID_Tipo_estados, Numero as title FROM Habitaciones WHERE ID_Hotel = ?", [id])

     

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

    const  {desde,hasta,habitaciones,disponibilidad} = req.body
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

            let id_disponible = disponibilidad

            if (reservation.length == 0 ) {
                id_disponible = id_disponible
            }

          
            const data ={
                    ID_Usuarios:1,
                    ID_Habitaciones: parseInt(id_disponible.toString()),
                    ID_Talla_mascota:2,
                    Codigo_reserva:12334,
                    Adultos:2,
                    Ninos:1,
                    Infantes:1,
                    Fecha_inicio: desde,  
                    Fecha_final: hasta,
                    Noches:2,
                    Descuento:0,
                    ID_Canal:2
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
                Proceso: 0
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

            const date ={
                ID_Reserva:parseInt(result.toString()),
                ID_Tipo_documento:5,
                Num_documento:"12013542",
                Nombre:"Rolando",
                Apellido:"Guerrero",
                Fecha_nacimiento:"2020-09-16",
                Celular:"3202720874",
                Correo:"rolando22_@outlook.com",
                Ciudad:"medellin"
            }
    
            const toone = pool.query('INSERT INTO  web_checking set ?',date) 
            //https://codesandbox.io/s/add-remove-dynamic-input-fields-ho226?file=/src/App.js:1830-2096
            const huep ={
                ID_Reserva:parseInt(result.toString()),
                ID_Tipo_genero:1,
                ID_Tipo_documento:5,
                Num_documento:"1043668080",
                Nombre:"rolando",
                Apellido:"guerrro",
                Celular:"3202720874",
                Correo:"rolando22_@outlook.co   m",
                Fecha_nacimiento:"2020-09-16",
                Ciudad:"Medellin"
            }
    
            const totwo = pool.query('INSERT INTO  Huespedes  set ?',huep) 
            
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

        const response =  await pool.query("SELECT  Habitaciones.Numero, Reservas.ID, Reservas.ID_Habitaciones, Reservas.Codigo_reserva, Reservas.Fecha_inicio, Reservas.Fecha_final, Habitaciones.ID_Tipo_estados FROM Reservas INNER JOIN Habitaciones ON Habitaciones.ID = Reservas.ID_Habitaciones WHERE Habitaciones.ID_Hotel = 2")

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
                ID_Tipo_estados:response[i].ID_Tipo_estados
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
        console.log(prueba)
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

        const query = await pool.query("SELECT Canales.Nombre as Canales_Nombre,  Reservas.ID, Reservas.ID_Habitaciones, Habitaciones.ID_Tipo_habitaciones, Habitaciones.Numero, Talla_mascota.Talla, Reservas.Codigo_reserva, Reservas.Adultos, Reservas.Ninos, Reservas.Infantes, Reservas.Fecha_inicio, Reservas.Fecha_final, Reservas.Noches, Reservas.Descuento, Reservas.Placa, web_checking.ID_Tipo_documento, web_checking.Num_documento, web_checking.Nombre, web_checking.Apellido, web_checking.Fecha_nacimiento, web_checking.Celular, web_checking.Correo, web_checking.Ciudad FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Talla_mascota ON Reservas.ID_Talla_mascota = Talla_mascota.ID INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.ID  INNER JOIN Canales  ON Canales.id= Reservas.ID_Canal   WHERE Reservas.ID =?",[id])

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
module.exports ={GetRooms,
                validateAvaible,
                insertReservaRecepcion,
                getTypePet
                ,getReserva,
                PruebaGet,
                GetCanales,
                roomAvaible,
                getDetailReservation         
            }