const {response, json, query} = require('express');
const { pool } = require('../database/connection');

const SearchHotels =async(req, res = response) =>{

  const {id,desde,hasta} = req.body

  const desdeFecha  = `${desde} 15:00:00`
  const hastaFecha  = `${hasta} 13:00:00`

  const FechaDesde = new Date(desde);
  const FechaHasta = new Date(hasta);

  if (FechaDesde >= FechaHasta) {
    return res.status(401).json({
      ok: false,
      error: 'La fecha hasta debe ser mayor que la fecha desde'
    });
  }

    const query = await pool.query(
      "SELECT rooms.id as idTipoHabitacion, rooms.name as nombre,rooms.price as precio,rooms.price_people as precio_persona,rooms.people as persona,rooms.max_people as max_persona, Habitaciones.ID as id, Habitaciones.ID_Tipo_habitaciones, Habitaciones.ID_Tipo_estados, Habitaciones.Numero as title, ID_estado_habitacion, MAX(RoomOcasionales.Time_ingreso) as Time_ingreso, MAX(RoomOcasionales.Time_salida) as Time_salida, RoomOcasionales.Fecha,rooms_image.url FROM Habitaciones LEFT JOIN RoomOcasionales ON RoomOcasionales.ID_habitacion = Habitaciones.ID AND RoomOcasionales.Fecha = CURDATE() INNER JOIN rooms_image on  rooms_image.id_rooms = Habitaciones.ID_Tipo_habitaciones INNER  JOIN  rooms on  rooms.id  = Habitaciones.ID_Tipo_habitaciones  WHERE Habitaciones.ID_Hotel=? GROUP BY Habitaciones.id;",
      [id]
    )
    const queryOne =   query.map((element) => {
      const roomObject = {
        title: `${element.nombre}`,
        id: element.id,
        ID_Tipo_estados: element.ID_Tipo_estados,
        ID_Tipo_habitaciones: element.idTipoHabitacion,
        ID_estado_habiatcion: element.ID_estado_habitacion,
        Time_ingreso: element.Time_ingreso,
        Time_salida: element.Time_salida,
        Fecha: element.Fecha,
        Price:element.precio,
        prici_people:element.precio_persona,
        person:element.persona,
        max_people:element.max_persona,
        room_image:element.url
      };
    return roomObject
})

async function getAvailableRooms(pool, flattenedRooms) {
const test = await Promise.all(
  flattenedRooms.map(async (room) => {
    const resultado = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas, Reservas.id, Habitaciones.ID_estado_habitacion ,Habitaciones.ID as ID_ROOM FROM Reservas INNER JOIN Habitaciones on Habitaciones.ID = Reservas.ID_Habitaciones WHERE ID_Habitaciones = ? AND  Reservas.ID_Tipo_Estados_Habitaciones !=6 and Reservas.ID_Tipo_Estados_Habitaciones !=6  AND  ((Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio >= ? AND Fecha_final <= ?))  ",
      [room.id, desdeFecha, desdeFecha, hastaFecha, hastaFecha, desdeFecha, hastaFecha]
    );
    return resultado.map((element) => {
      if (element.Num_Reservas === 0 && element.ID_estado_habitacion !==2 ) {
        const roomObject = {
          ID_Room:element.ID_ROOM,
          ID: room.id,
          title: room.title,
          Price: room.Price,
          prici_people: room.prici_people,
          person: room.person,
          max_people: room.max_people,
          room_image: room.room_image,
          ID_Tipo_habitaciones: room.ID_Tipo_habitaciones
        };
        return roomObject;
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
                                         rooms: [],
                                         title: room.title,
                                         Price:room.Price ,
                                         person:room.person,
                                         max_people:room.max_people,
                                         room_image:room.room_image,
                                         ID_Room:room.ID_Room});
  }
  const tipo = acc.get(room.ID_Tipo_habitaciones);
  tipo.cantidad += 1;
  return acc;
}, new Map());

const groupedRoomsArray = Array.from(groupedRooms, ([ID_Tipo_habitaciones, data]) => ({ ID_Tipo_habitaciones, ...data }));


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


module.exports = {SearchHotels}