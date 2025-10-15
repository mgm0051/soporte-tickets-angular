import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UsuarioRole } from "./UsuarioRole";

@Entity("roles", { schema: "sicnova" })
export class Roles {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("text", { name: "nombre" })
  nombre: string;

  @OneToMany(() => UsuarioRole, (usuarioRole) => usuarioRole.roles)
  usuarioRoles: UsuarioRole[];
}
