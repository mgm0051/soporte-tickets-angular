import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("tickets_usuario_ibfk", ["usuarioId"], {})
@Index("tickets_consulta_ibfk", ["consultaId"], {})
@Entity("tickets", { schema: "sicnova" })
export class Tickets {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "ref" })
  ref: number;

  @Column("enum", {
    name: "estado",
    nullable: true,
    enum: ["open", "close", "in progress"],
    default: () => "'open'",
  })
  estado: "open" | "close" | "in progress" | null;

  @Column("text", { name: "titulo" })
  titulo: string;

  @Column("text", { name: "descripcion" })
  descripcion: string;

  @Column("text", { name: "imagenUrl" })
  imagenUrl: string;

  @Column("datetime", { name: "fecha_inicio" })
  fechaInicio: Date;

  @Column("int", { name: "usuarioId", nullable: true })
  usuarioId: number | null;

  @Column("int", { name: "consultaId", nullable: true })
  consultaId: number | null;

  @Column("datetime", { name: "fecha_actualizada" })
  fechaActualizada: Date;
}
