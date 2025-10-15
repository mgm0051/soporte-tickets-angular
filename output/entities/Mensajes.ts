import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("mensajes_usuario_ibfk", ["usuarioId"], {})
@Index("mensajes_tickets_ibfk", ["ticketsId"], {})
@Entity("mensajes", { schema: "sicnova" })
export class Mensajes {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("text", { name: "texto" })
  texto: string;

  @Column("text", { name: "imagenUrl" })
  imagenUrl: string;

  @Column("set", { name: "estado", enum: ["leido", "no leido"] })
  estado: ("leido" | "no leido")[];

  @Column("datetime", { name: "fecha_inicio" })
  fechaInicio: Date;

  @Column("datetime", { name: "fecha_actualizada" })
  fechaActualizada: Date;

  @Column("int", { name: "ticketsId", nullable: true })
  ticketsId: number | null;

  @Column("int", { name: "usuarioId", nullable: true })
  usuarioId: number | null;
}
