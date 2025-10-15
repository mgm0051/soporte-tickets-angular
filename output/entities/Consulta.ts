import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuario } from "./Usuario";

@Entity("consulta", { schema: "sicnova" })
export class Consulta {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("text", { name: "nombre" })
  nombre: string;

  @ManyToMany(() => Usuario, (usuario) => usuario.consultas)
  @JoinTable({
    name: "usuario_consulta",
    joinColumns: [{ name: "consultaId", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "usuarioId", referencedColumnName: "id" }],
    schema: "sicnova",
  })
  usuarios: Usuario[];
}
