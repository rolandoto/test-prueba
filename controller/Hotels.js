const {response, json, query} = require('express');
const { pool } = require('../database/connection');

function calcularNoches(desde, hasta) {
  const FechaDesde = new Date(desde);
  const FechaHasta = new Date(hasta);
  // Asegúrate de que ambas fechas son válidas
  if (isNaN(FechaDesde) || isNaN(FechaHasta)) {
    throw new Error('Fechas inválidas');
  }
  // Calcula la diferencia en milisegundos
  const diferenciaTiempo = FechaHasta - FechaDesde;
  // Convierte la diferencia de milisegundos a días
  const diferenciaDias = diferenciaTiempo / (1000 * 60 * 60 * 24);
  // Calcula las noches, que es la diferencia en días menos 1
  const noches = Math.ceil(diferenciaDias);

  return noches;
}

const SearchHotels =async(req, res = response) =>{

          const {id,desde,hasta,counPeople} = req.body
          const desdeFecha  = `${desde} 15:00:00`
          const hastaFecha  = `${hasta} 13:00:00`
          const nights = calcularNoches(desde, hasta);
          const FechaDesde = new Date(desde);
          const FechaHasta = new Date(hasta);


          if (FechaDesde >= FechaHasta) {
            return res.status(401).json({
              ok: false,
              error: 'La fecha hasta debe ser mayor que la fecha desde'
            });
          }

            const query = await pool.query(
              "SELECT rooms.id as idTipoHabitacion,rooms.description, rooms.name as nombre,rooms.price as precio,rooms.price_people as precio_persona,rooms.people as persona,rooms.max_people as max_persona, Habitaciones.ID as id, Habitaciones.ID_Tipo_habitaciones, Habitaciones.ID_Tipo_estados, Habitaciones.Numero as title, ID_estado_habitacion, MAX(RoomOcasionales.Time_ingreso) as Time_ingreso, MAX(RoomOcasionales.Time_salida) as Time_salida, RoomOcasionales.Fecha,rooms_image.url FROM Habitaciones LEFT JOIN RoomOcasionales ON RoomOcasionales.ID_habitacion = Habitaciones.ID AND RoomOcasionales.Fecha = CURDATE() INNER JOIN rooms_image on  rooms_image.id_rooms = Habitaciones.ID_Tipo_habitaciones INNER  JOIN  rooms on  rooms.id  = Habitaciones.ID_Tipo_habitaciones  WHERE Habitaciones.ID_Hotel=? GROUP BY Habitaciones.id;",
              [id]
            )


            const queryOne =   query.map((element) => {
          
              const roomObject = {
                title: `${element.nombre}`,
                description:  element.description,
                id: element.id,
                ID_Tipo_estados: element.ID_Tipo_estados,
                ID_Tipo_habitaciones: element.idTipoHabitacion,
                ID_estado_habiatcion: element.ID_estado_habitacion,
                Time_ingreso: element.Time_ingreso,
                Time_salida: element.Time_salida,
                Fecha: element.Fecha,
                Price:element.precio *nights,
                Price_nigth:element.precio,
                prici_people:element.precio_persona,
                person:element.persona,
                max_people:element.max_persona,
                room_image:element.url,
                nights:nights,
                start:desde,
                end:hasta
              };
            return roomObject
        })

        async function getAvailableRooms(pool, flattenedRooms) {
        const test = await Promise.all(
          flattenedRooms.map(async (room) => {
          
            const resultado= await pool.query(
              "SELECT  (SELECT COUNT(*)  FROM Reservas  WHERE   Reservas.ID_Habitaciones = ?  AND Reservas.ID_Tipo_Estados_Habitaciones != 6  AND Reservas.ID_Tipo_Estados_Habitaciones != 7   AND ( (Fecha_inicio <= ? AND Fecha_final >= ?)  OR   (Fecha_inicio <= ? AND Fecha_final >= ?)    OR   (Fecha_inicio >= ? AND Fecha_final <= ?) ) ) AS Num_Reservas, Habitaciones.ID AS id_room FROM  Habitaciones WHERE  Habitaciones.ID = ?;",
              [room.id, desdeFecha, desdeFecha, hastaFecha, hastaFecha, desdeFecha, hastaFecha,room.id]
            );

            return resultado.map((element) => {
              if (element.Num_Reservas === 0 && element.ID_estado_habitacion !==2 ) {
                if(room.person == counPeople){
                    const roomObject = {
                      ID_Room:element.id_room,
                      ID: room.id,
                      title: room.title,
                      description: room.description,
                      Price: room.Price,
                      Price_nigth:room.Price_nigth,
                      prici_people: room.prici_people,
                      person: room.person,
                      max_people: room.max_people,
                      room_image: room.room_image,
                      ID_Tipo_habitaciones: room.ID_Tipo_habitaciones,
                      nights:room.nights,
                      start:room.start,
                      end:room.end
                    };
                    return roomObject;
                  }
                }
              return null;
            });
          })
        );      
        return test.flat().filter((item) => item !== null);
        }

        const availableRooms = await getAvailableRooms(pool, queryOne, desdeFecha, hastaFecha);

        const groupedRooms = availableRooms.reduce((acc, room) => {
          if (!acc.has(room.ID_Tipo_habitaciones)) {
            acc.set(  room.ID_Tipo_habitaciones, { cantidad: 0,
                                                ID:room.ID,
                                                Room:[],
                                                idTipoHabitacion:room.ID_Tipo_habitaciones,
                                                title: room.title,
                                                description:room.description,
                                                Price:room.Price ,
                                                person:room.person,
                                                max_people:room.max_people,
                                                room_image:room.room_image,
                                                ID_Room:room.ID_Room,
                                                nights:room.nights,
                                                start:room.start,
                                                end:room.end  ,
                                                Price_nigth:room.Price_nigth
                                              });
          }
          const tipo = acc.get(room.ID_Tipo_habitaciones);
          tipo.cantidad += 1;
          tipo.Room.push(room.ID_Room);
          return acc;
        }, new Map());

        const groupedRoomsArray = Array.from(groupedRooms, ([ID_Tipo_habitaciones, data]) => ({ ID_Tipo_habitaciones, ...data }));
          groupedRoomsArray.sort(function(a, b){return a.Price - b.Price});

       

          if(availableRooms.length ==0){
          return res.status(401).json({
              ok:false
          })
        }
        res.status(201).json({
        ok:true,
        availableRooms:groupedRoomsArray
        })

}


const HotelCreateWebSite =async(req, res = response) =>{

  const {cart,name,apellido,email,city,country,fecha} = req.body

  try {
    
    var n1 = 20000;
    var n2 = 10000;
    var numero = Math.floor(Math.random() * (n1 - (n2 - 1))) + n2;



    for (const room of cart) {
      const data = {
        ID_Usuarios: 1,
        ID_Habitaciones: room.roomByID,
        ID_Talla_mascota: 3,
        Codigo_reserva: numero,
        Adultos: 1,
        Ninos: 1,
        Infantes: 0,
        Fecha_inicio: `${room.start} 15:00:00`,
        Fecha_final:  `${room.end} 13:00:00`,
        Noches: room.nights,
        Descuento: 0,
        ID_Canal: 3,
        ID_Tipo_Estados_Habitaciones: 0,
        Observacion: "Creado por la pagina web ",
      };

      await pool.query("INSERT INTO Reservas set ?", data);
   
      const queryResult = await pool.query(
        "SELECT MAX(ID) as max FROM Reservas"
      );
      const result = queryResult[0].max;

      const date = {
        ID_Reserva: parseInt(result.toString()),
        ID_Tipo_documento:1,
        Num_documento: "000",
        Nombre: name,
        Apellido: apellido,
        Fecha_nacimiento: room.start,
        Celular: "3000",
        Correo: email,
        Ciudad: city,
        ID_Prefijo: country,
        Tipo_persona: "persona",
        Firma: 0,
        Iva: 2,
        ID_facturacion:""
      };

       pool.query(
        "INSERT INTO  web_checking set ?",
        date,
        (q_err, q_res) => {
          if (q_err)
            return res.status(401).json({
              ok: false,
            });
        }
      );

      const huep = {
        ID_Reserva: parseInt(result.toString()),
        ID_Tipo_documento:1,
        ID_Tipo_genero: 1,
        Num_documento:"000",
        Nombre: name,
        Apellido:apellido,
        Fecha_nacimiento:room.start,
        Celular:"33123",
        Correo: email,
        Ciudad:city,
        ID_Prefijo: country,
      };
      pool.query(
        "INSERT INTO  Huespedes  set ?",
        huep,
        (q_err, q_res) => {
          if (q_err)
            return res.status(401).json({
              ok: false,
              msg: "error de web huespedes",
            });
        }
      );


      const pay = {
        ID_Reserva: parseInt(result.toString()),
        ID_Motivo: 1,
        ID_Tipo_Forma_pago:4,
        Valor: room.Price,
        Abono:  room.Price,
        Valor_habitacion: room.Price,
        valor_dia_habitacion: room.Price_nigth,
        pago_valid: 1,
      };

     pool.query("INSERT INTO  Pagos  set ?", pay);

     const dataPayAbono = {
      ID_Reserva: parseInt(result.toString()),
      Abono: room.Price,
      Fecha_pago: fecha,
      Tipo_forma_pago: 4,
      Nombre_recepcion: "pagina web",
    };
   pool.query(
      "INSERT INTO  Pago_abono  set ?",
      dataPayAbono
    );

  }
  

    return res.status(201).json({
        ok:true
      })

  } catch (error) {
      return res.status(401).json({
        ok:false
      })
  }
  
}


module.exports = {SearchHotels,
                HotelCreateWebSite}