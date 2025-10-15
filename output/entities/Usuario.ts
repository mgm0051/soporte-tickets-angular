import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Consulta } from "./Consulta";

@Entity("usuario", { schema: "sicnova" })
export class Usuario {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("text", { name: "nombre" })
  nombre: string;

  @Column("text", { name: "email" })
  email: string;

  @Column("text", { name: "contacto" })
  contacto: string;

  @Column("text", { name: "password" })
  password: string;

  @Column("text", { name: "imagenPerfilurl" })
  imagenPerfilurl: string;

  @Column("bit", { name: "isban" })
  isban: boolean;

  @ManyToMany(() => Consulta, (consulta) => consulta.usuarios)
  consultas: Consulta[];
}
