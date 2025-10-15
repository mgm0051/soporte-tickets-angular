import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("identificador", ["identificador"], { unique: true })
@Entity("parametros_costes", { schema: "sicnova" })
export class ParametrosCostes {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("text", { name: "identificador", unique: true })
  identificador: string;

  @Column("text", { name: "nombre" })
  nombre: string;

  @Column("decimal", { name: "datos", nullable: true, precision: 10, scale: 6 })
  datos: string | null;

  @Column("int", { name: "datosEntero", nullable: true })
  datosEntero: number | null;
}
